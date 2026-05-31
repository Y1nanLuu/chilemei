# 后端 AI 代理端点实现指南

## 概述

需要新增两个 API 端点，将原本前端直连的 DeepSeek 标签提取和豆包图片生成迁移至后端代理。

- **前端已修改完成**，调用 `POST /api/v1/ai/extract-tags` 和 `POST /api/v1/ai/generate-image`
- **后端需要新增** `chilemei/app/api/v1/ai.py` 路由模块，挂载到 `/api/v1/ai/` 路径下

---

## 1. 新增 AI 路由模块

**文件路径：** `chilemei/app/api/v1/ai.py`

```python
"""
AI 代理路由 —— 将前端请求转发至 DeepSeek / 豆包 API。
"""

import httpx
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional, List

from app.core.config import settings
from app.api.deps import get_current_user  # 根据项目实际的鉴权依赖调整

router = APIRouter(prefix="/ai", tags=["ai"])


# ── 请求模型 ──────────────────────────────────────────────

class ExtractTagsRequest(BaseModel):
    food_name: str = Field(..., min_length=1, max_length=100)
    location: Optional[str] = Field(None, max_length=200)
    review_text: Optional[str] = Field(None, max_length=500)
    sentiment: str = Field(..., pattern=r"^(like|dislike)$")
    rating_level: int = Field(..., ge=1, le=5)


class GenerateImageRequest(BaseModel):
    food_name: str = Field(..., min_length=1, max_length=100)
    location: Optional[str] = Field(None, max_length=200)
    review_text: Optional[str] = Field(None, max_length=500)
    source_image_url: Optional[str] = Field(None, max_length=2048)  # 有值 → 美化模式


# ── 响应模型 ──────────────────────────────────────────────

class FoodTagExtraction(BaseModel):
    taste_preferences: List[str] = []
    taboo_candidates: List[str] = []
    cuisines: List[str] = []
    ingredients: List[str] = []
    seasonings: List[str] = []
    cooking_methods: List[str] = []
    texture_tags: List[str] = []
    scenario_tags: List[str] = []
    recommendation_tags: List[str] = []
    chili_level: int = Field(0, ge=0, le=5)
    has_chili: bool = False
    has_sichuan_pepper: bool = False
    delicious_level: int = Field(3, ge=1, le=5)
    health_tags: List[str] = []
    summary: str = ""


class GenerateImageResponse(BaseModel):
    image_url: str


# ── 配置常量 ──────────────────────────────────────────────

DEEPSEEK_API_KEY = "sk-8295ccadb5334df984deb8740c624721"
DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"
DEEPSEEK_MODEL = "deepseek-v4-flash"

ARK_API_KEY = "ark-41df6df1-6438-496d-bb37-2d24e3310770-aff78"
ARK_URL = "https://ark.cn-beijing.volces.com/api/v3/images/generations"
ARK_MODEL = "doubao-seedream-4-0-250828"

FOOD_TAG_SYSTEM_PROMPT = (
    "你是美食记录应用的标签抽取器。请只输出 JSON，不要输出 Markdown 或解释。\n"
    "目标是从用户发布的食物名称、餐厅/地点、文字描述、喜欢/劝退、评分中抽取可用于口味画像、智能推荐、年度报告的数据。\n"
    "JSON 字段必须是：\n"
    "{\n"
    '  "taste_preferences": string[],\n'
    '  "taboo_candidates": string[],\n'
    '  "cuisines": string[],\n'
    '  "ingredients": string[],\n'
    '  "seasonings": string[],\n'
    '  "cooking_methods": string[],\n'
    '  "texture_tags": string[],\n'
    '  "scenario_tags": string[],\n'
    '  "recommendation_tags": string[],\n'
    '  "chili_level": number,\n'
    '  "has_chili": boolean,\n'
    '  "has_sichuan_pepper": boolean,\n'
    '  "delicious_level": number,\n'
    '  "health_tags": string[],\n'
    '  "summary": string\n'
    "}\n"
    "要求：数组每项为简短中文标签；taste_preferences 要能和口味画像里的偏爱口味呼应，"
    "如川菜、粤菜、面食、烧烤、甜口、酸辣、清淡、火锅；taboo_candidates 放可能影响忌口的"
    "食材或过敏源，如香菜、内脏、花生、海鲜、乳制品、葱姜蒜；chili_level 为 0-5；"
    "delicious_level 为 1-5，并结合评分和喜欢/劝退。未知字段用空数组或合理默认值。"
)


# ── 工具函数 ──────────────────────────────────────────────

def _build_user_content(food_name: str, location: str | None,
                        review_text: str | None, sentiment: str,
                        rating_level: int) -> str:
    lines = [
        f"食物名称：{food_name}",
    ]
    if location:
        lines.append(f"餐厅/地点：{location}")
    if review_text:
        lines.append(f"用户描述/评价：{review_text}")
    lines.append(f"心情：{'劝退/不喜欢' if sentiment == 'dislike' else '喜欢'}")
    lines.append(f"评分：{rating_level}/5")
    return "\n".join(lines)


def _parse_deepseek_json(content: str) -> dict:
    import re, json

    text = content.strip()

    # Try to extract from ```json ... ``` block
    m = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
    json_text = m.group(1) if m else text

    # Find first JSON object
    m = re.search(r"\{[\s\S]*\}", json_text)
    if not m:
        raise ValueError("DeepSeek 未返回有效标签 JSON")

    return json.loads(m.group(0))


def _normalize_food_tags(raw: dict) -> dict:
    """清洗 DeepSeek 返回的 JSON，确保字段类型正确。"""

    def _str_list(val, max_len=10):
        if not isinstance(val, list):
            return []
        return list(dict.fromkeys(
            s for s in (str(x).strip() for x in val) if s
        ))[:max_len]

    def _clamp(val, lo, hi, default):
        try:
            n = int(val)
            return lo if n < lo else hi if n > hi else n
        except (TypeError, ValueError):
            return default

    return {
        "taste_preferences": _str_list(raw.get("taste_preferences")),
        "taboo_candidates": _str_list(raw.get("taboo_candidates")),
        "cuisines": _str_list(raw.get("cuisines")),
        "ingredients": _str_list(raw.get("ingredients"), 16),
        "seasonings": _str_list(raw.get("seasonings"), 16),
        "cooking_methods": _str_list(raw.get("cooking_methods")),
        "texture_tags": _str_list(raw.get("texture_tags")),
        "scenario_tags": _str_list(raw.get("scenario_tags")),
        "recommendation_tags": _str_list(raw.get("recommendation_tags"), 16),
        "chili_level": _clamp(raw.get("chili_level"), 0, 5, 0),
        "has_chili": bool(raw.get("has_chili")),
        "has_sichuan_pepper": bool(raw.get("has_sichuan_pepper")),
        "delicious_level": _clamp(raw.get("delicious_level"), 1, 5, 3),
        "health_tags": _str_list(raw.get("health_tags")),
        "summary": str(raw.get("summary", "")).strip()[:80],
    }


def _build_seedream_prompt(food_name: str, location: str | None,
                           review_text: str | None, has_source_image: bool) -> str:
    parts = [f"美食名称：{food_name}"]
    if location:
        parts.append(f"餐厅或地点：{location}")
    if review_text:
        parts.append(f"用户描述：{review_text}")
    context = "；".join(parts)

    if has_source_image:
        return (
            f"{context}。请在保留原图主体、构图和真实食物特征的基础上，"
            "对这张美食照片进行精修、美化和轻度重绘：提升色泽、光线、质感、"
            "热气和酱汁细节，让食物看起来更有食欲；保持自然真实、适合社交平台分享，"
            "不要改变成完全不同的菜品，不要添加文字、水印或边框。"
        )

    return (
        f"{context}。请生成一张真实、有食欲的美食摄影图片："
        f"主体是{food_name}，自然餐厅光线，色泽饱满，质感真实，构图干净，"
        "浅景深，高级食物摄影风格，适合美食记录应用封面，不要文字、水印或边框。"
    )


# ── 端点实现 ──────────────────────────────────────────────

@router.post("/extract-tags", response_model=FoodTagExtraction)
async def extract_tags(
    body: ExtractTagsRequest,
    # current_user = Depends(get_current_user),
) -> FoodTagExtraction:
    """
    代理 DeepSeek Chat API 提取食物标签。

    前端 POST /api/v1/ai/extract-tags
    """
    user_content = _build_user_content(
        body.food_name, body.location, body.review_text,
        body.sentiment, body.rating_level,
    )

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            DEEPSEEK_URL,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            },
            json={
                "model": DEEPSEEK_MODEL,
                "messages": [
                    {"role": "system", "content": FOOD_TAG_SYSTEM_PROMPT},
                    {"role": "user", "content": user_content},
                ],
                "stream": False,
            },
        )

    if resp.status_code >= 300:
        detail = ""
        try:
            err = resp.json()
            detail = err.get("error", {}).get("message", "") or err.get("message", "")
        except Exception:
            detail = resp.text[:200]
        raise HTTPException(
            status_code=502,
            detail=f"DeepSeek 标签提取失败 ({resp.status_code})：{detail}",
        )

    data = resp.json()
    content = (data.get("choices") or [{}])[0].get("message", {}).get("content", "")

    if not content:
        raise HTTPException(status_code=502, detail="DeepSeek 未返回标签内容")

    try:
        parsed = _parse_deepseek_json(content)
    except (ValueError, json.JSONDecodeError) as e:
        raise HTTPException(status_code=502, detail=f"DeepSeek 标签 JSON 解析失败：{e}")

    return FoodTagExtraction(**_normalize_food_tags(parsed))


@router.post("/generate-image", response_model=GenerateImageResponse)
async def generate_image(
    body: GenerateImageRequest,
    # current_user = Depends(get_current_user),
) -> GenerateImageResponse:
    """
    代理豆包 ARK Seedream API 生成/美化美食图片。

    前端 POST /api/v1/ai/generate-image
    - 无 source_image_url → 纯文本生成新图片
    - 有 source_image_url → 基于原图美化精修
    """
    has_source = bool(body.source_image_url)
    prompt = _build_seedream_prompt(
        body.food_name, body.location, body.review_text, has_source,
    )

    payload = {
        "model": ARK_MODEL,
        "prompt": prompt,
        "sequential_image_generation": "disabled",
        "response_format": "url",
        "size": "2K",
        "stream": False,
        "watermark": True,
    }

    if has_source:
        payload["image"] = body.source_image_url

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            ARK_URL,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {ARK_API_KEY}",
            },
            json=payload,
        )

    if resp.status_code >= 300:
        detail = ""
        try:
            err = resp.json()
            detail = err.get("error", {}).get("message", "") or err.get("message", "")
        except Exception:
            detail = resp.text[:200]
        raise HTTPException(
            status_code=502,
            detail=f"豆包图片生成失败 ({resp.status_code})：{detail}",
        )

    data = resp.json()

    # 豆包返回格式：{ "data": [{ "url": "..." }] }
    image_url = ""
    for item in (data.get("data") or []):
        if item.get("url"):
            image_url = item["url"]
            break
    if not image_url:
        image_url = data.get("url", "")

    if not image_url:
        raise HTTPException(status_code=502, detail="豆包未返回图片地址")

    return GenerateImageResponse(image_url=image_url)
```

### 需要注意的适配点

1. **鉴权依赖**：代码中 `current_user = Depends(get_current_user)` 被注释掉了。请根据项目实际的鉴权中间件取消注释并调整导入路径。

2. **httpx**：需要 `pip install httpx`（如项目已有其他异步 HTTP 客户端可以替换）。

3. **HTTPException**：需要导入 `from fastapi import HTTPException`。

---

## 2. 注册路由

在 `chilemei/app/api/v1/__init__.py`（或主路由注册文件）中添加：

```python
from app.api.v1 import ai

# 在 app.include_router 区域添加：
app.include_router(ai.router, prefix=settings.API_V1_PREFIX)
# 这会挂载为 /api/v1/ai/extract-tags 和 /api/v1/ai/generate-image
```

如果项目使用自动发现路由，确认 `ai.py` 放在 `chilemei/app/api/v1/` 目录下即可。

---

## 3. API Key 管理（安全建议）

当前 API Key 硬编码在上述文件中。更安全的做法是放进环境变量：

**在 `settings.py` 或 `.env` 中添加：**

```
DEEPSEEK_API_KEY=sk-8295ccadb5334df984deb8740c624721
ARK_API_KEY=ark-41df6df1-6438-496d-bb37-2d24e3310770-aff78
```

然后在 `ai.py` 中改为：
```python
from app.core.config import settings
DEEPSEEK_API_KEY = settings.DEEPSEEK_API_KEY
ARK_API_KEY = settings.ARK_API_KEY
```

> **注意**：以上两个 Key 是从前端源码中提取的现有值，直接可用。

---

## 4. 数据流变更对比

### 改前（前端直连）：
```
前端 Taro.request() ──→ DeepSeek API
前端 Taro.request() ──→ 豆包 ARK API
```
→ API Key 暴露在客户端代码中

### 改后（后端代理）：
```
前端 request() ──→ 后端 /api/v1/ai/extract-tags ──→ DeepSeek API
前端 request() ──→ 后端 /api/v1/ai/generate-image ──→ 豆包 ARK API
```
→ API Key 仅在服务端，前端只携带 JWT token

---

## 5. 验证清单

- [ ] `POST /api/v1/ai/extract-tags` 返回 `FoodTagExtraction` JSON（15 个字段）
- [ ] `POST /api/v1/ai/generate-image`（无 source_image_url）返回 AI 生成的图片 URL
- [ ] `POST /api/v1/ai/generate-image`（有 source_image_url）返回 AI 美化后的图片 URL
- [ ] DeepSeek 超时 / 失败时返回 502，前端有 fallback 处理
- [ ] 豆包超时 / 失败时返回 502，前端有 fallback 处理
- [ ] 鉴权中间件正常工作（非登录用户无法调用）
