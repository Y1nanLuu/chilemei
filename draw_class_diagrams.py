#!/usr/bin/env python3
"""
Generate UML Class Diagrams for Chilemei Section 4 — Static Structure Design.
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
import matplotlib.patches as mpatches

plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ─── Colors ───
C_MODEL   = '#7B1FA2'
C_SCHEMA  = '#1976D2'
C_SERVICE = '#388E3C'
C_UTIL    = '#E65100'
C_BG      = '#FAFBFC'
C_BORDER  = '#555555'
FONT_S = 7.2
FONT_M = 8.5

def draw_class_box(ax, x, y, w, name, attrs, methods, color, stereotype=None):
    """Draw a UML class box with <<stereotype>>, attributes, methods."""
    # Calculate height
    lines = []
    if stereotype:
        lines.append(f'<<{stereotype}>>')
    lines.append(name)
    n_header = len(lines)
    n_attrs = len(attrs) if attrs else 0
    n_methods = len(methods) if methods else 0
    # Separator lines count as content lines (just thin lines)
    total_lines = n_header + n_attrs + n_methods
    # If we have both attrs and methods, add 2 separator gaps
    sep_count = 0
    if n_attrs > 0: sep_count += 1
    if n_methods > 0: sep_count += 1
    if n_attrs == 0 and n_methods == 0: sep_count = 0

    line_h = 0.21
    # Header area
    header_h = max(0.55, n_header * line_h + 0.25)
    attr_h = n_attrs * line_h + 0.15 if n_attrs > 0 else 0
    method_h = n_methods * line_h + 0.15 if n_methods > 0 else 0
    total_h = header_h + attr_h + method_h + sep_count * 0.12

    # Main background
    box = FancyBboxPatch((x, y - total_h), w, total_h,
                         boxstyle="round,pad=0.08", facecolor='white',
                         edgecolor=C_BORDER, linewidth=1.5, zorder=3)
    ax.add_patch(box)

    # Header background
    header_bg = FancyBboxPatch((x + 0.04, y - header_h + 0.04), w - 0.08, header_h - 0.08,
                               boxstyle="round,pad=0.04", facecolor=color,
                               edgecolor='none', linewidth=0, alpha=0.18, zorder=3)
    ax.add_patch(header_bg)

    cy = y - 0.18
    for line in lines:
        if line.startswith('<<'):
            ax.text(x + w/2, cy, line, ha='center', va='center',
                   fontsize=FONT_S, fontweight='normal', color=color, style='italic', zorder=4)
        else:
            ax.text(x + w/2, cy, line, ha='center', va='center',
                   fontsize=FONT_M, fontweight='bold', color=color, zorder=4)
        cy -= line_h

    # Separator after header
    if n_attrs > 0 or n_methods > 0:
        cy -= 0.06
        ax.plot([x + 0.12, x + w - 0.12], [cy, cy], color='#cccccc', linewidth=0.8, zorder=3)

    # Attributes
    if attrs:
        for attr in attrs:
            ax.text(x + 0.18, cy, attr, ha='left', va='center',
                   fontsize=FONT_S, color='#333333', zorder=4)
            cy -= line_h
        if n_methods > 0:
            cy -= 0.06
            ax.plot([x + 0.12, x + w - 0.12], [cy, cy], color='#cccccc', linewidth=0.8, zorder=3)

    # Methods
    if methods:
        for method in methods:
            ax.text(x + 0.18, cy, method, ha='left', va='center',
                   fontsize=FONT_S, color='#333333', zorder=4)
            cy -= line_h

    return total_h  # return height for positioning

def draw_association(ax, x1, y1, x2, y2, label='', style='solid'):
    ls = '-' if style == 'solid' else '--'
    color = '#555555'
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
               arrowprops=dict(arrowstyle='->', color=color, lw=1.3, ls=ls), zorder=1)
    if label:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        ax.text(mx + 0.15, my + 0.1, label, fontsize=6.5, color=color, zorder=2)


# ═══════════════════════════════════════════════════════════════
# Diagram 1: Auth Domain Class Diagram (UC_0101)
# ═══════════════════════════════════════════════════════════════
fig, ax = plt.subplots(1, 1, figsize=(18, 11))
fig.patch.set_facecolor(C_BG)
ax.set_facecolor(C_BG)
ax.set_xlim(0, 18)
ax.set_ylim(0, 11)

# Title
ax.text(9, 10.5, '图4-1  UC_0101 用户注册与登录 — 领域类图', ha='center', va='center',
        fontsize=14, fontweight='bold', color='#2c3e50')

# User model
user_h = draw_class_box(ax, 1.2, 9.5, 4.2,
    name='User (Model)',
    attrs=[
        '+ id: int (PK)',
        '+ wechat_openid: str?',
        '+ wechat_unionid: str?',
        '+ username: str?',
        '+ email: str?',
        '+ password_hash: str?',
        '+ nickname: str',
        '+ bio: str?',
        '+ avatar_url: str?',
        '+ gender: str?',
        '+ grade: str?',
        '+ campus: str?',
        '+ is_private: bool = False',
        '+ taste_preferences: JSON',
        '+ taboo_list: JSON',
        '+ spicy_level: int = 0',
        '+ is_active: bool = True',
        '+ created_at: datetime',
        '+ updated_at: datetime',
    ],
    methods=[],
    color=C_MODEL,
    stereotype='entity')

# WechatLoginRequest schema
draw_class_box(ax, 6.8, 9.5, 3.2,
    name='WechatLoginRequest',
    attrs=[
        '+ code: str',
    ],
    methods=[],
    color=C_SCHEMA,
    stereotype='schema')

# AuthUserInfo schema
draw_class_box(ax, 6.8, 7.3, 3.2,
    name='AuthUserInfo',
    attrs=[
        '+ id: int',
        '+ nickname: str',
        '+ avatar_url: str?',
        '+ is_new_user: bool',
    ],
    methods=[],
    color=C_SCHEMA,
    stereotype='schema')

# WechatLoginResponse schema
draw_class_box(ax, 6.8, 5.1, 3.2,
    name='WechatLoginResponse',
    attrs=[
        '+ access_token: str',
        '+ token_type: str',
        '+ user: AuthUserInfo',
    ],
    methods=[],
    color=C_SCHEMA,
    stereotype='schema')

# UserRegister schema
draw_class_box(ax, 11.5, 9.5, 3.0,
    name='UserRegister',
    attrs=[
        '+ username: str (3-50)',
        '+ email: EmailStr',
        '+ password: str (6-50)',
        '+ nickname: str (1-50)',
    ],
    methods=[],
    color=C_SCHEMA,
    stereotype='schema')

# TokenResponse schema
draw_class_box(ax, 11.5, 7.7, 3.0,
    name='TokenResponse',
    attrs=[
        '+ access_token: str',
        '+ token_type: str',
    ],
    methods=[],
    color=C_SCHEMA,
    stereotype='schema')

# create_access_token utility
draw_class_box(ax, 11.5, 5.8, 3.0,
    name='create_access_token()',
    attrs=[],
    methods=[
        '+ __call__(subject): str',
    ],
    color=C_UTIL,
    stereotype='utility')

# get_password_hash utility
draw_class_box(ax, 14.5, 3.8, 2.8,
    name='security.py',
    attrs=[],
    methods=[
        '+ create_access_token()',
        '+ get_password_hash(pwd)',
        '+ verify_password(pwd, hash)',
    ],
    color=C_UTIL,
    stereotype='utility')

# deps: get_current_user
draw_class_box(ax, 1.2, 6.8, 4.2,
    name='get_current_user (deps.py)',
    attrs=[],
    methods=[
        '+ __call__(db, token) → User',
        '  decode JWT → subject',
        '  query User by id/username',
        '  verify is_active',
    ],
    color=C_SERVICE,
    stereotype='dependency')

# wechat_login() controller
draw_class_box(ax, 1.2, 4.4, 4.2,
    name='wechat_login() (auth.py)',
    attrs=[],
    methods=[
        '+ POST /auth/wechat-login',
        '  → httpx: code2Session',
        '  → db.query User by openid',
        '  → [new] User(...) db.add()',
        '  → create_access_token()',
        '  → WechatLoginResponse',
    ],
    color=C_SERVICE,
    stereotype='controller')

# register() controller
draw_class_box(ax, 11.5, 2.8, 3.0,
    name='register() (auth.py)',
    attrs=[],
    methods=[
        '+ POST /auth/register',
        '  → User(payload)',
        '  → db.add() commit()',
        '  → create_access_token()',
        '  → TokenResponse',
    ],
    color=C_SERVICE,
    stereotype='controller')

# Associations
draw_association(ax, 5.4, 8.5, 6.8, 8.8, '«input»')
draw_association(ax, 5.4, 7.5, 6.8, 7.0, '«input»')
draw_association(ax, 8.2, 6.6, 11.5, 7.2, '«contains»')
draw_association(ax, 5.4, 5.5, 6.8, 5.5, '«output»')
draw_association(ax, 5.4, 4.2, 9.5, 5.8, '«calls»')
draw_association(ax, 14.5, 4.5, 14.5, 5.8)
draw_association(ax, 3.3, 6.8, 3.3, 9.0, '«queries»')
draw_association(ax, 5.4, 3.0, 11.5, 3.5, '«creates»')
draw_association(ax, 5.4, 3.0, 9.5, 5.0, '«uses»')

ax.axis('off')
plt.tight_layout(pad=0.5)
plt.savefig('e:/Projects/chilemei/class_auth_domain.png', dpi=200, bbox_inches='tight', facecolor=C_BG)
plt.close()
print('class_auth_domain.png saved')

# ═══════════════════════════════════════════════════════════════
# Diagram 2: Report Domain Class Diagram (UC_0401)
# ═══════════════════════════════════════════════════════════════
fig, ax = plt.subplots(1, 1, figsize=(16, 10))
fig.patch.set_facecolor(C_BG)
ax.set_facecolor(C_BG)
ax.set_xlim(0, 16)
ax.set_ylim(0, 10)

ax.text(8, 9.5, '图4-2  UC_0401 生成周期性报告 — 领域类图', ha='center', va='center',
        fontsize=14, fontweight='bold', color='#2c3e50')

# FoodRecord model
draw_class_box(ax, 0.8, 9.0, 4.0,
    name='FoodRecord (Model)',
    attrs=[
        '+ id: int (PK)',
        '+ user_id: int (FK→users)',
        '+ food_id: int (FK→food)',
        '+ sentiment: ReviewSentiment',
        '+ rating_level: int (1-5)',
        '+ review_text: str?',
        '+ image_filename: str?',
        '+ uploaded_at: datetime',
        '+ created_at: datetime',
        '+ updated_at: datetime',
    ],
    methods=[
        '+ food → Food (relationship)',
        '+ user → User (relationship)',
    ],
    color=C_MODEL,
    stereotype='entity')

# Food model (partial)
draw_class_box(ax, 5.8, 9.0, 3.6,
    name='Food (Model)',
    attrs=[
        '+ id: int (PK)',
        '+ name: str',
        '+ location: str',
        '+ price: Decimal',
        '+ image_dir: str?',
        '+ food_tags: JSON?',
        '+ created_at: datetime',
    ],
    methods=[
        '+ records → [FoodRecord]',
    ],
    color=C_MODEL,
    stereotype='entity')

# AnnualReportResponse schema
draw_class_box(ax, 0.8, 5.8, 4.0,
    name='AnnualReportResponse',
    attrs=[
        '+ year: int',
        '+ total_records: int',
        '+ total_spend: Decimal',
        '+ average_spend: Decimal',
        '+ total_like_records: int',
        '+ total_dislike_records: int',
        '+ top_foods: list[str]',
        '+ top_locations: list[str]',
        '+ monthly_spend: [MonthlySpendItem]',
        '+ title_tags: list[str]',
    ],
    methods=[],
    color=C_SCHEMA,
    stereotype='schema')

# MonthlySpendItem schema
draw_class_box(ax, 5.8, 7.2, 3.0,
    name='MonthlySpendItem',
    attrs=[
        '+ month: int',
        '+ total_spend: Decimal',
        '+ record_count: int',
    ],
    methods=[],
    color=C_SCHEMA,
    stereotype='schema')

# generate_annual_report service
draw_class_box(ax, 7.0, 4.0, 5.2,
    name='generate_annual_report()\n(report.py)',
    attrs=[],
    methods=[
        '+ __call__(db, user_id, year)',
        '  → db.query FoodRecord WHERE',
        '     user_id AND uploaded_at',
        '  → Counter(food.name) top5',
        '  → Counter(food.location) top5',
        '  → defaultdict monthly_spend',
        '  → build_title_tags(records)',
        '  → AnnualReportResponse',
    ],
    color=C_SERVICE,
    stereotype='service')

# build_title_tags helper
draw_class_box(ax, 12.0, 6.4, 3.5,
    name='build_title_tags()',
    attrs=[],
    methods=[
        '+ __call__(records) → list[str]',
        '  avg_price ≤ 20: 平价美食猎人',
        '  avg_price ≥ 50: 轻奢干饭家',
        '  like_ratio ≥ 0.8: 五星吃货',
        '  distinct_loc ≥ 5: 探店达人',
    ],
    color=C_UTIL,
    stereotype='utility')

# get_annual_report controller
draw_class_box(ax, 0.8, 3.2, 4.0,
    name='get_annual_report()\n(reports.py)',
    attrs=[],
    methods=[
        '+ GET /reports/annual/{year}',
        '  → Depends(get_current_user)',
        '  → generate_annual_report()',
        '  → AnnualReportResponse',
    ],
    color=C_SERVICE,
    stereotype='controller')

# Associations
draw_association(ax, 3.8, 7.5, 5.8, 8.5, '«JOIN»')
draw_association(ax, 7.8, 5.8, 5.8, 7.5, '«uses»')
draw_association(ax, 2.8, 5.8, 5.8, 7.2, '«contains»', 'dashed')
draw_association(ax, 2.8, 4.5, 7.0, 4.8, '«calls»')
draw_association(ax, 12.0, 6.0, 11.5, 5.0, '«calls»')
draw_association(ax, 2.8, 3.2, 2.8, 4.6, '«calls»')

ax.axis('off')
plt.tight_layout(pad=0.5)
plt.savefig('e:/Projects/chilemei/class_report_domain.png', dpi=200, bbox_inches='tight', facecolor=C_BG)
plt.close()
print('class_report_domain.png saved')

# ═══════════════════════════════════════════════════════════════
# Diagram 3: Entity-Relationship Diagram (DB Schema)
# ═══════════════════════════════════════════════════════════════
fig, ax = plt.subplots(1, 1, figsize=(18, 10))
fig.patch.set_facecolor(C_BG)
ax.set_facecolor(C_BG)
ax.set_xlim(0, 18)
ax.set_ylim(0, 10)

ax.text(9, 9.5, '图4-3  核心数据表实体-关系图（ER Diagram）', ha='center', va='center',
        fontsize=14, fontweight='bold', color='#2c3e50')

# Users table
draw_class_box(ax, 0.3, 9.0, 3.8,
    name='users',
    attrs=[
        '<<PK>> id: INT',
        'wechat_openid: VARCHAR(100) UQ',
        'wechat_unionid: VARCHAR(100) UQ',
        'username: VARCHAR(50) UQ',
        'email: VARCHAR(120) UQ',
        'password_hash: VARCHAR(255)',
        'nickname: VARCHAR(50) NN',
        'avatar_url: VARCHAR(255)',
        'gender: VARCHAR(20)',
        'grade: VARCHAR(20)',
        'campus: VARCHAR(20)',
        'is_private: BOOL = False',
        'taste_preferences: JSON',
        'taboo_list: JSON',
        'spicy_level: TINYINT = 0',
        'is_active: BOOL = True',
        'created_at / updated_at',
    ],
    methods=[],
    color=C_MODEL,
    stereotype='table')

# Food table
draw_class_box(ax, 5.0, 9.0, 3.5,
    name='food',
    attrs=[
        '<<PK>> id: INT',
        'name: VARCHAR(120) NN',
        'location: VARCHAR(255) NN',
        'price: DECIMAL(10,2) NN',
        'image_dir: VARCHAR(255)',
        'food_tags: JSON',
        'created_at / updated_at',
        'UK(name, location)',
    ],
    methods=[],
    color=C_MODEL,
    stereotype='table')

# FoodRecords table
draw_class_box(ax, 9.3, 9.0, 4.0,
    name='food_records',
    attrs=[
        '<<PK>> id: INT',
        '<<FK>> user_id → users.id',
        '<<FK>> food_id → food.id',
        'sentiment: ENUM(like,dislike)',
        'rating_level: SMALLINT NN',
        'review_text: TEXT',
        'image_filename: VARCHAR(255)',
        'uploaded_at: DATETIME',
        'created_at / updated_at',
    ],
    methods=[],
    color=C_MODEL,
    stereotype='table')

# UserFoodStats table
draw_class_box(ax, 0.3, 5.8, 3.8,
    name='user_food_stats',
    attrs=[
        '<<PK>> id: INT',
        '<<FK>> user_id → users.id',
        '<<FK>> food_id → food.id',
        'like_count: INT = 0',
        'dislike_count: INT = 0',
        'created_at / updated_at',
        'UK(user_id, food_id)',
    ],
    methods=[],
    color=C_MODEL,
    stereotype='table')

# UserFoodFavorites table
draw_class_box(ax, 5.0, 6.2, 3.5,
    name='user_food_favorites',
    attrs=[
        '<<PK>> id: INT',
        '<<FK>> user_id → users.id',
        '<<FK>> food_id → food.id',
        'created_at: DATETIME',
    ],
    methods=[],
    color=C_MODEL,
    stereotype='table')

# Comments table
draw_class_box(ax, 9.3, 6.5, 3.8,
    name='comments',
    attrs=[
        '<<PK>> id: INT',
        '<<FK>> user_id → users.id',
        '<<FK>> food_record_id',
        '  → food_records.id',
        'content: TEXT NN',
        'created_at: DATETIME',
    ],
    methods=[],
    color=C_MODEL,
    stereotype='table')

# FoodComments table
draw_class_box(ax, 13.8, 6.5, 3.8,
    name='food_comments',
    attrs=[
        '<<PK>> id: INT',
        '<<FK>> user_id → users.id',
        '<<FK>> food_id → food.id',
        'parent_comment_id: INT?',
        'content: TEXT NN',
        'created_at: DATETIME',
    ],
    methods=[],
    color=C_MODEL,
    stereotype='table')

# Draw relationships
# users → food_records (1:N)
ax.annotate('', xy=(9.3, 8.5), xytext=(4.1, 8.5),
           arrowprops=dict(arrowstyle='->', color='#D84315', lw=1.8), zorder=1)
ax.text(6.7, 8.65, '1:N', fontsize=7, color='#D84315', fontweight='bold', ha='center')

# food → food_records (1:N)
ax.annotate('', xy=(9.3, 7.8), xytext=(8.5, 7.8),
           arrowprops=dict(arrowstyle='->', color='#D84315', lw=1.8), zorder=1)
ax.text(8.9, 7.95, '1:N', fontsize=7, color='#D84315', fontweight='bold', ha='center')

# users → user_food_stats (1:N)
ax.annotate('', xy=(1.2, 6.8), xytext=(1.2, 7.8),
           arrowprops=dict(arrowstyle='->', color='#D84315', lw=1.8, linestyle='dashed'), zorder=1)

# users → user_food_favorites (1:N)
ax.annotate('', xy=(5.5, 7.2), xytext=(2.2, 7.2),
           arrowprops=dict(arrowstyle='->', color='#D84315', lw=1.8, linestyle='dashed'), zorder=1)

# users → comments (1:N)
ax.annotate('', xy=(9.5, 7.5), xytext=(2.2, 7.5),
           arrowprops=dict(arrowstyle='->', color='#D84315', lw=1.8, linestyle='dashed'), zorder=1)

ax.axis('off')
plt.tight_layout(pad=0.5)
plt.savefig('e:/Projects/chilemei/er_diagram.png', dpi=200, bbox_inches='tight', facecolor=C_BG)
plt.close()
print('er_diagram.png saved')

print('\nAll 3 class/ER diagrams generated successfully.')
