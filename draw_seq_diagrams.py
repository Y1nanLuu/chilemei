#!/usr/bin/env python3
"""
Generate UML sequence diagrams for Chilemei Section 3 — Dynamic Structure Design.
Uses matplotlib to draw clean UML-style sequence diagrams.
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, ArrowStyle
import matplotlib.patches as mpatches
import numpy as np

plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ─── Color palette ───
C_ACTOR    = '#F57C00'  # orange for actor / frontend
C_ROUTER   = '#1976D2'  # blue for API router
C_SERVICE  = '#388E3C'  # green for service / helper
C_MODEL    = '#7B1FA2'  # purple for model instance
C_DB       = '#E64A19'  # red for database/session
C_EXTERNAL = '#455A64'  # grey for external systems
C_LIFELINE = '#999999'
C_ARROW    = '#333333'
C_BG       = '#FAFBFC'

BOX_H = 0.55   # object box height
BOX_W_BASE = 2.2
FONT_SIZE = 7.5
MSG_FONT = 7

def box_w(text, min_w=1.8):
    """估算框宽度"""
    # 中文字符每个约 0.18 inch, 英文字符约 0.1 inch
    w = sum(0.18 if ord(c) > 127 else 0.1 for c in text)
    return max(min_w, w + 0.3)

def draw_seq_diagram(ax, title, objects, messages, actor_name='前端'):
    """
    objects: list of (name, color, x_pos)  — if x_pos None, auto-layout
    messages: list of (from_idx, to_idx, label, style)
              style: 'call' (solid ->), 'return' (dashed -->), 'create' (dashed --> to top of box)
    """
    n = len(objects) + 1  # +1 for actor
    total_w = (n) * 2.4 + 1.5
    ax.set_xlim(0, total_w)
    ax.set_ylim(0, 11.5)

    # Layout: actor on left, then objects
    positions = []
    x = 0.8
    # Actor
    positions.append(x)
    x += 2.4
    for obj in objects:
        positions.append(x)
        x += 2.4

    total_w = positions[-1] + 1.5
    ax.set_xlim(0, total_w)
    ax.set_ylim(0, 11.5)

    # Title
    ax.text(total_w/2, 11.1, title, ha='center', va='center',
            fontsize=11, fontweight='bold', color='#2c3e50')

    # Draw actor
    ax_pos = positions[0]
    # Actor stick figure
    head_y = 10.0
    ax.add_patch(plt.Circle((ax_pos, head_y + 0.15), 0.18, facecolor=C_ACTOR, edgecolor='white', linewidth=1.2, zorder=4))
    ax.plot([ax_pos, ax_pos], [head_y - 0.05, 9.3], color=C_ACTOR, linewidth=2.2, zorder=3)
    ax.plot([ax_pos - 0.3, ax_pos + 0.3], [head_y - 0.2, head_y - 0.2], color=C_ACTOR, linewidth=1.5, zorder=3)
    ax.plot([ax_pos, ax_pos - 0.25], [head_y - 0.05, head_y - 0.4], color=C_ACTOR, linewidth=1.5, zorder=3)
    ax.plot([ax_pos, ax_pos + 0.25], [head_y - 0.05, head_y - 0.4], color=C_ACTOR, linewidth=1.5, zorder=3)
    ax.text(ax_pos, 10.4, actor_name, ha='center', va='bottom', fontsize=8, fontweight='bold', color=C_ACTOR)
    # Actor lifeline
    ax.plot([ax_pos, ax_pos], [9.0, 2.0], color=C_LIFELINE, linewidth=1.2, linestyle='--', dashes=(5, 3), zorder=1)

    # Draw objects
    for i, obj in enumerate(objects):
        ox = positions[i + 1]
        name, color, _ = obj
        bw = box_w(name, BOX_W_BASE)
        box = FancyBboxPatch((ox - bw/2, 9.5), bw, BOX_H, boxstyle="round,pad=0.1",
                             facecolor=color, edgecolor='white', linewidth=1.2, alpha=0.92, zorder=4)
        ax.add_patch(box)
        ax.text(ox, 9.5 + BOX_H/2, name, ha='center', va='center',
                fontsize=FONT_SIZE, fontweight='bold', color='white', zorder=5)
        # Lifeline
        ax.plot([ox, ox], [9.5, 2.2], color=C_LIFELINE, linewidth=1.2, linestyle='--', dashes=(5, 3), zorder=1)

    # Draw messages
    msg_y = 8.4
    for msg in messages:
        from_idx, to_idx, label, style = msg
        from_x = positions[from_idx]
        to_x = positions[to_idx]
        direction = 1 if to_x > from_x else -1

        if style == 'create':
            # Arrow to top of object box
            target_y = 9.55
            color = '#555'
            ax.annotate('', xy=(to_x - direction * 0.15, target_y), xytext=(from_x + direction * 0.3, msg_y),
                       arrowprops=dict(arrowstyle='->', color=color, lw=1.4,
                                      connectionstyle='arc3,rad=0.15'), zorder=3)
            ax.text((from_x + to_x)/2, msg_y + 0.35, label, ha='center', va='bottom',
                   fontsize=MSG_FONT, color=color, style='italic')
        elif style == 'return':
            ax.annotate('', xy=(to_x, msg_y), xytext=(from_x, msg_y),
                       arrowprops=dict(arrowstyle='->', color='#888', lw=1.2,
                                      linestyle='dashed', connectionstyle='arc3,rad=-0.1'), zorder=2)
            ax.text((from_x + to_x)/2, msg_y + 0.15, label, ha='center', va='bottom',
                   fontsize=MSG_FONT, color='#888')
        else:  # 'call'
            ax.annotate('', xy=(to_x - direction * 0.08, msg_y), xytext=(from_x + direction * 0.08, msg_y),
                       arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.5,
                                      connectionstyle='arc3,rad=0'), zorder=3)
            ax.text((from_x + to_x)/2, msg_y + 0.18, label, ha='center', va='bottom',
                   fontsize=MSG_FONT, color=C_ARROW)

        # Activity bar on lifeline
        for idx in (from_idx, to_idx):
            px = positions[idx]
            if idx == 0:
                top = 9.0
            else:
                top = 9.5
            if msg_y < top:
                ax.fill_between([px - 0.08, px + 0.08], [msg_y, msg_y + 0.15],
                               color='#cccccc', alpha=0.7, zorder=2)

        msg_y -= 0.75  # vertical spacing

    ax.axis('off')

# ────────────────────────────────────────────────────────────────────
# Diagram 1: submitFoodRecord(payload)
# ────────────────────────────────────────────────────────────────────
fig, ax = plt.subplots(1, 1, figsize=(15, 9))
fig.patch.set_facecolor(C_BG)
ax.set_facecolor(C_BG)

objects_1 = [
    (':APIRouter\n(foods.py)', C_ROUTER, 0),
    (':get_current_user\n(deps.py)', '#6C3483', 0),
    (':get_db\n(deps.py)', '#6C3483', 0),
    (':Food (Model)', C_MODEL, 0),
    (':FoodRecord\n(Model)', C_MODEL, 0),
    (':SessionLocal\n(DB)', C_DB, 0),
]

messages_1 = [
    # (from, to, label, style)
    (0, 1, '1. POST /api/v1/foods\n   (payload)', 'call'),
    (1, 0, '2. JWT验证 → User对象', 'return'),
    (0, 2, '3. Depends(get_db)', 'call'),
    (2, 0, '4. db:Session', 'return'),
    (0, 3, '5. resolve_food_for_record\n   (db, food_id, food)', 'call'),
    (3, 0, '6. food:Food', 'return'),
    (0, 4, '7. FoodRecord(user_id,\n   food_id, sentiment,...)', 'create'),
    (0, 5, '8. db.add(food)\n   db.add(record)', 'call'),
    (0, 5, '9. db.commit()\n   db.refresh(record)', 'call'),
    (5, 0, '10. 持久化成功', 'return'),
    (0, 0, '11. serialize_record()\n    → FoodRecordResponse', 'call'),
]

draw_seq_diagram(ax, '图3-1  submitFoodRecord(payload) 时序交互图', objects_1, messages_1)
plt.tight_layout(pad=0.5)
plt.savefig('e:/Projects/chilemei/seq_submit_food_record.png', dpi=200, bbox_inches='tight', facecolor=C_BG)
plt.close()
print('seq_submit_food_record.png saved')

# ────────────────────────────────────────────────────────────────────
# Diagram 2: extractAiTags(options)
# ────────────────────────────────────────────────────────────────────
fig, ax = plt.subplots(1, 1, figsize=(15, 8))
fig.patch.set_facecolor(C_BG)
ax.set_facecolor(C_BG)

objects_2 = [
    (':APIRouter\n(ai.py)', C_ROUTER, 0),
    (':_build_user_\ncontent()', C_SERVICE, 0),
    (':httpx\nAsyncClient', '#0277BD', 0),
    ('DeepSeek\nAPI', C_EXTERNAL, 0),
]

messages_2 = [
    (0, 1, '1. POST /ai/extract-tags\n   {foodName, location, ...}', 'call'),
    (1, 0, '2. 拼接User Content', 'return'),
    (0, 2, '3. _resolve_deepseek_key()', 'call'),
    (0, 3, '4. httpx.post(DEEPSEEK_URL,\n   {model, messages})', 'call'),
    (3, 0, '5. choices[0].message.content', 'return'),
    (0, 1, '6. _parse_deepseek_json()\n   _normalize_food_tags()', 'call'),
    (1, 0, '7. FoodTagExtraction', 'return'),
]

draw_seq_diagram(ax, '图3-2  extractAiTags(options) 时序交互图', objects_2, messages_2)
plt.tight_layout(pad=0.5)
plt.savefig('e:/Projects/chilemei/seq_extract_tags.png', dpi=200, bbox_inches='tight', facecolor=C_BG)
plt.close()
print('seq_extract_tags.png saved')

# ────────────────────────────────────────────────────────────────────
# Diagram 3: getPersonalizedRecommendations()
# ────────────────────────────────────────────────────────────────────
fig, ax = plt.subplots(1, 1, figsize=(15, 9))
fig.patch.set_facecolor(C_BG)
ax.set_facecolor(C_BG)

objects_3 = [
    (':APIRouter\n(foods.py)', C_ROUTER, 0),
    (':get_current_user\n(deps.py)', '#6C3483', 0),
    (':build_recommendation\n_scores()', C_SERVICE, 0),
    (':SessionLocal\n(DB)', C_DB, 0),
    (':Food (Model)', C_MODEL, 0),
]

messages_3 = [
    (0, 1, '1. GET /foods/recommendations\n   /guess-you-like?limit=10', 'call'),
    (1, 0, '2. JWT → User对象\n   (含taste_preferences)', 'return'),
    (0, 2, '3. build_recommendation_\n   scores(db, user, weights)', 'call'),
    (2, 3, '4. stats_rows(FoodStat)\n   favorite_rows(UserFavorite)\n   rating_rows(FoodRecord)', 'call'),
    (3, 2, '5. 聚合数据', 'return'),
    (2, 4, '6. _candidate_foods(db,user)', 'call'),
    (4, 2, '7. foods[]', 'return'),
    (2, 0, '8. 计算5维评分(heat/taste/\n   freshness/preference/explore)', 'return'),
    (0, 0, '9. serialize_food_card()\n   → FoodRecommendationItem[]', 'call'),
]

draw_seq_diagram(ax, '图3-3  getPersonalizedRecommendations() 时序交互图', objects_3, messages_3)
plt.tight_layout(pad=0.5)
plt.savefig('e:/Projects/chilemei/seq_recommendations.png', dpi=200, bbox_inches='tight', facecolor=C_BG)
plt.close()
print('seq_recommendations.png saved')

# ────────────────────────────────────────────────────────────────────
# Diagram 4: getFoodRankings(period, scope)
# ────────────────────────────────────────────────────────────────────
fig, ax = plt.subplots(1, 1, figsize=(15, 8))
fig.patch.set_facecolor(C_BG)
ax.set_facecolor(C_BG)

objects_4 = [
    (':APIRouter\n(foods.py)', C_ROUTER, 0),
    (':get_current_user\n(deps.py)', '#6C3483', 0),
    (':SessionLocal\n(DB)', C_DB, 0),
]

messages_4 = [
    (0, 1, '1. GET /foods/rankings\n   ?period=daily&scope=global', 'call'),
    (1, 0, '2. User对象\n   (scope=mine时过滤)', 'return'),
    (0, 2, '3. db.query(Food, like/dislike\n   expr) + GROUP BY', 'call'),
    (2, 0, '4. rows[] (聚合结果)', 'return'),
    (0, 0, '5. 按like_count DESC排序\n   前3名渐变样式\n   → FoodRecommendationItem[]', 'call'),
]

draw_seq_diagram(ax, '图3-4  getFoodRankings(period, scope) 时序交互图', objects_4, messages_4)
plt.tight_layout(pad=0.5)
plt.savefig('e:/Projects/chilemei/seq_rankings.png', dpi=200, bbox_inches='tight', facecolor=C_BG)
plt.close()
print('seq_rankings.png saved')

# ────────────────────────────────────────────────────────────────────
# Diagram 5: wechatLogin(code)
# ────────────────────────────────────────────────────────────────────
fig, ax = plt.subplots(1, 1, figsize=(15, 9))
fig.patch.set_facecolor(C_BG)
ax.set_facecolor(C_BG)

objects_5 = [
    (':APIRouter\n(auth.py)', C_ROUTER, 0),
    (':httpx\nAsyncClient', '#0277BD', 0),
    ('微信\ncode2Session', C_EXTERNAL, 0),
    (':User (Model)', C_MODEL, 0),
    (':SessionLocal\n(DB)', C_DB, 0),
    (':create_access_\ntoken()', C_SERVICE, 0),
]

messages_5 = [
    (0, 1, '1. POST /auth/wechat-login\n   {code}', 'call'),
    (0, 2, '2. httpx.get(code2Session+\n   appid+secret+code)', 'call'),
    (2, 0, '3. {openid, unionid}', 'return'),
    (0, 3, '4. db.query(User).filter\n   (openid/unionid)', 'call'),
    (3, 0, '5. user | None', 'return'),
    (0, 3, '6. [非首次] 更新openid\n   [首次] User(nickname,...)', 'call'),
    (0, 4, '7. db.add(user)\n   db.commit()\n   db.refresh(user)', 'call'),
    (4, 0, '8. 持久化成功', 'return'),
    (0, 5, '9. create_access_token\n   (build_token_subject)', 'call'),
    (5, 0, '10. JWT Token', 'return'),
]

draw_seq_diagram(ax, '图3-5  wechatLogin(code) 时序交互图', objects_5, messages_5)
plt.tight_layout(pad=0.5)
plt.savefig('e:/Projects/chilemei/seq_wechat_login.png', dpi=200, bbox_inches='tight', facecolor=C_BG)
plt.close()
print('seq_wechat_login.png saved')

# ────────────────────────────────────────────────────────────────────
# Diagram 6: updateUserPreferences(payload)
# ────────────────────────────────────────────────────────────────────
fig, ax = plt.subplots(1, 1, figsize=(15, 8))
fig.patch.set_facecolor(C_BG)
ax.set_facecolor(C_BG)

objects_6 = [
    (':APIRouter\n(users.py)', C_ROUTER, 0),
    (':get_current_user\n(deps.py)', '#6C3483', 0),
    (':User (Model)', C_MODEL, 0),
    (':SessionLocal\n(DB)', C_DB, 0),
]

messages_6 = [
    (0, 1, '1. PUT /users/me/preferences\n   {taste, taboo, spicy}', 'call'),
    (1, 0, '2. JWT → current_user', 'return'),
    (0, 2, '3. setattr(taste_preferences,\n   taboo_list, spicy_level)', 'call'),
    (0, 3, '4. db.add(user)\n   db.commit()\n   db.refresh(user)', 'call'),
    (3, 0, '5. 持久化成功', 'return'),
    (0, 0, '6. serialize_user_\n   preferences()\n   → UserPreferenceProfile', 'call'),
]

draw_seq_diagram(ax, '图3-6  updateUserPreferences(payload) 时序交互图', objects_6, messages_6)
plt.tight_layout(pad=0.5)
plt.savefig('e:/Projects/chilemei/seq_preferences.png', dpi=200, bbox_inches='tight', facecolor=C_BG)
plt.close()
print('seq_preferences.png saved')

# ────────────────────────────────────────────────────────────────────
# Diagram 7: 优先级调度 (Team Leader)
# ────────────────────────────────────────────────────────────────────
fig, ax = plt.subplots(1, 1, figsize=(15, 8))
fig.patch.set_facecolor(C_BG)
ax.set_facecolor(C_BG)

objects_7 = [
    (':AppLauncher\n(app.ts)', C_ROUTER, 0),
    (':Scheduler\n(优先级队列)', '#E65100', 0),
    (':CloudInit\n(高优先级)', '#D32F2F', 0),
    (':TokenCheck\n(中优先级)', '#F9A825', 0),
    (':Prefetch\n(低优先级)', '#2E7D32', 0),
]

messages_7 = [
    (0, 1, '1. onLaunch()\n   启动调度器', 'call'),
    (1, 2, '2. dequeue(最高优先级)\n   调度CloudInit', 'call'),
    (2, 0, '3. wx.cloud.init()\n   云环境就绪', 'return'),
    (1, 3, '4. dequeue(次高优先级)\n   调度TokenCheck', 'call'),
    (3, 0, '5. getAccessToken()\n   hasAccessToken()', 'return'),
    (1, 4, '6. dequeue(低优先级)\n   调度Prefetch', 'call'),
    (4, 0, '7. 预下载packageFood\n   +packageUser分包', 'return'),
    (0, 0, '8. 启动完成→首页onShow', 'call'),
]

draw_seq_diagram(ax, '图3-7  开机请求-优先级调度 时序交互图（组长）', objects_7, messages_7)
plt.tight_layout(pad=0.5)
plt.savefig('e:/Projects/chilemei/seq_priority_sched.png', dpi=200, bbox_inches='tight', facecolor=C_BG)
plt.close()
print('seq_priority_sched.png saved')

# ────────────────────────────────────────────────────────────────────
# Diagram 8: 时间片轮询调度 (Team Leader)
# ────────────────────────────────────────────────────────────────────
fig, ax = plt.subplots(1, 1, figsize=(15, 8))
fig.patch.set_facecolor(C_BG)
ax.set_facecolor(C_BG)

objects_8 = [
    (':AppLauncher\n(app.ts)', C_ROUTER, 0),
    (':TimeSlice\nScheduler', '#00695C', 0),
    (':TaskA\nCloudInit', '#D32F2F', 0),
    (':TaskB\nTokenCheck', '#F9A825', 0),
    (':TaskC\nPrefetch', '#2E7D32', 0),
]

messages_8 = [
    (0, 1, '1. onLaunch()\n   时间片=100ms', 'call'),
    (1, 2, '2. 分配时间片→TaskA', 'call'),
    (2, 1, '3. 执行80ms 剩余\n   切出保存上下文', 'return'),
    (1, 3, '4. 分配时间片→TaskB', 'call'),
    (3, 1, '5. 执行50ms完成\n   释放时间片', 'return'),
    (1, 2, '6. 恢复TaskA上下文\n   分配时间片', 'call'),
    (2, 1, '7. 执行完成→释放', 'return'),
    (1, 4, '8. 分配时间片→TaskC', 'call'),
    (4, 1, '9. 执行90ms 剩余\n   切出保存', 'return'),
    (1, 4, '10. 再次分配→TaskC', 'call'),
    (4, 0, '11. 预下载完成', 'return'),
]

draw_seq_diagram(ax, '图3-8  开机请求-时间片轮询调度 时序交互图（组长）', objects_8, messages_8)
plt.tight_layout(pad=0.5)
plt.savefig('e:/Projects/chilemei/seq_round_robin.png', dpi=200, bbox_inches='tight', facecolor=C_BG)
plt.close()
print('seq_round_robin.png saved')

print('\nAll 8 sequence diagrams generated successfully.')
