import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np

plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei', 'Noto Sans CJK SC']
plt.rcParams['axes.unicode_minus'] = False

fig, ax = plt.subplots(1, 1, figsize=(18, 14))
ax.set_xlim(0, 18)
ax.set_ylim(0, 14)
ax.axis('off')
ax.set_facecolor('#f5f7fa')

def draw_rect(ax, x, y, w, h, text, color, fontsize=11, fontcolor='white', bold=True, alpha=0.92):
    box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.15",
                         facecolor=color, edgecolor='#cccccc', linewidth=1.2, alpha=alpha, zorder=3)
    ax.add_patch(box)
    weight = 'bold' if bold else 'normal'
    ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=fontsize,
            color=fontcolor, fontweight=weight, zorder=4)

def draw_node(ax, x, y, w, h, text, color, fontsize=10, fontcolor='#333333'):
    box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.1",
                         facecolor=color, edgecolor='#aaaaaa', linewidth=0.8, zorder=3)
    ax.add_patch(box)
    ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=fontsize,
            color=fontcolor, zorder=4)

def draw_arrow(ax, x1, y1, x2, y2, color='#666666', lw=1.5):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=lw,
                               connectionstyle='arc3,rad=0'), zorder=2)

def draw_dashed_box(ax, x, y, w, h, label, color, lw=1.5, ls='--'):
    rect = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.2",
                          facecolor='none', edgecolor=color, linewidth=lw, linestyle=ls, alpha=0.7, zorder=1)
    ax.add_patch(rect)
    if label:
        ax.text(x + 0.3, y + h - 0.3, label, fontsize=9, color=color, fontweight='bold', va='top', zorder=2)

# ============ Title ============
ax.text(9, 13.5, 'Chilemei（吃了没）系统软件架构图', ha='center', va='center',
        fontsize=20, fontweight='bold', color='#2c3e50')

# ============ Layers ============
# --- 前端展示层 (Presentation Layer) ---
draw_dashed_box(ax, 0.3, 10.0, 17.4, 3.2, '前端展示层 (Presentation Layer)', '#2196F3')

draw_rect(ax, 0.8, 10.4, 3.2, 2.2, '页面组件\n(Pages)', '#1976D2', 11)
draw_rect(ax, 4.5, 10.4, 3.2, 2.2, 'Taro + Vue3\n框架层', '#1E88E5', 11)
draw_rect(ax, 8.2, 10.4, 3.2, 2.2, 'NutUI\n组件库', '#42A5F5', 11)
draw_rect(ax, 11.9, 10.4, 3.2, 2.2, 'wx.cloud / Taro API\n(平台能力)', '#64B5F6', 11)
draw_rect(ax, 15.6, 10.4, 1.6, 2.2, 'SCSS\n样式', '#90CAF9', 10)

# --- 业务逻辑层 (Business Logic Layer) ---
draw_dashed_box(ax, 0.3, 6.0, 17.4, 3.2, '业务逻辑层 (Business Logic Layer)', '#FF9800')

draw_rect(ax, 0.8, 6.4, 3.5, 2.2, 'API 接口模块\n(src/api/)', '#F57C00', 11)
draw_rect(ax, 4.8, 6.4, 3.5, 2.2, '工具模块\n(src/utils/)', '#FB8C00', 11)
draw_rect(ax, 8.8, 6.4, 3.5, 2.2, '数据模型/类型\n(types.ts)', '#FF9800', 11)
draw_rect(ax, 12.8, 6.4, 3.5, 2.2, '状态管理\n(Reactive + Storage)', '#FFA726', 11)

# --- 后端服务层 (Backend Service Layer) ---
draw_dashed_box(ax, 0.3, 2.2, 17.4, 3.2, '后端服务层 (Backend Service Layer - FastAPI on CloudBase)', '#4CAF50')

draw_rect(ax, 0.8, 2.6, 2.8, 2.2, '认证服务\n/auth/', '#388E3C', 10)
draw_rect(ax, 4.0, 2.6, 2.8, 2.2, '美食记录服务\n/foods/', '#43A047', 10)
draw_rect(ax, 7.2, 2.6, 2.8, 2.2, '推荐服务\n/recommendations/', '#4CAF50', 10)
draw_rect(ax, 10.4, 2.6, 2.8, 2.2, '排行榜服务\n/rankings/', '#66BB6A', 10)
draw_rect(ax, 13.6, 2.6, 2.8, 2.2, '用户/报告服务\n/users/ /reports/', '#81C784', 10)

# --- 数据与基础设施层 (Data & Infrastructure) ---
draw_dashed_box(ax, 0.3, 0.2, 9.0, 1.7, '数据与基础设施层', '#9C27B0')
draw_rect(ax, 0.8, 0.5, 3.5, 0.9, 'MySQL (CloudBase DB)', '#7B1FA2', 9)
draw_rect(ax, 4.8, 0.5, 3.5, 0.9, 'CloudBase 云存储\n(media/)', '#9C27B0', 9)

draw_dashed_box(ax, 10.0, 0.2, 7.7, 1.7, '外部 AI 服务', '#E91E63')
draw_rect(ax, 10.5, 0.5, 3.2, 0.9, 'DeepSeek API\n(标签提取)', '#C2185B', 9)
draw_rect(ax, 14.2, 0.5, 3.2, 0.9, '豆包 ARK API\n(图片生成)', '#E91E63', 9)

# ============ Arrows (data flow) ============
# Presentation → Business Logic
draw_arrow(ax, 9, 10.0, 9, 9.2, '#2196F3', 2)
ax.text(12.2, 9.55, '用户交互 / 事件', fontsize=8, color='#2196F3', zorder=5)

# Business Logic → Backend
draw_arrow(ax, 9, 6.0, 9, 5.4, '#FF9800', 2)
ax.text(12.2, 5.65, 'HTTP API 调用\n(wx.cloud.callContainer)', fontsize=8, color='#FF9800', zorder=5)

# Backend → Data
draw_arrow(ax, 4.5, 2.2, 4.5, 1.9, '#4CAF50', 1.5)
draw_arrow(ax, 7.5, 2.2, 7.5, 1.9, '#4CAF50', 1.5)
ax.text(9.8, 1.95, 'SQL / 文件读写', fontsize=8, color='#4CAF50', zorder=5)

# Backend → AI
draw_arrow(ax, 14, 2.2, 14, 1.9, '#E91E63', 1.5)
ax.text(15.5, 1.95, 'HTTP 请求', fontsize=8, color='#E91E63', zorder=5)

# Return arrows (left side, light)
ax.annotate('', xy=(0.6, 10.8), xytext=(0.6, 8.8),
            arrowprops=dict(arrowstyle='->', color='#aaaaaa', lw=1.2, connectionstyle='arc3,rad=0'), zorder=1)
ax.text(0.1, 9.6, '响应\n返回', fontsize=7, color='#999999', ha='center', zorder=2)

# Legend
legend_ax = ax.inset_axes([13.0, 11.8, 4.5, 1.4])
legend_ax.axis('off')
legend_items = [
    ('■', '#1976D2', '前端组件'),
    ('■', '#F57C00', '前端逻辑'),
    ('■', '#388E3C', '后端服务'),
    ('■', '#7B1FA2', '数据库/存储'),
    ('■', '#E91E63', '外部服务'),
]
for i, (shape, color, label) in enumerate(legend_items):
    y = 1.1 - i * 0.25
    legend_ax.add_patch(plt.Rectangle((0.1, y-0.12), 0.35, 0.2, facecolor=color, edgecolor='#ccc', linewidth=0.5))
    legend_ax.text(0.6, y-0.02, label, fontsize=8, va='center', color='#333333')

plt.tight_layout(pad=1.5)
plt.savefig('e:/Projects/chilemei/architecture.png', dpi=150, bbox_inches='tight', facecolor='white')
print('Diagram saved to architecture.png')
