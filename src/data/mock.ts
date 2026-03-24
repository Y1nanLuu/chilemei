export type Dish = {
  id: string
  name: string
  restaurant: string
  location: string
  price: number
  rating: number
  tags: string[]
  image: string
  author: string
  authorTitle: string
  publishTime: string
  summary: string
  highlights: string[]
  tips: string[]
  comments: Array<{
    user: string
    avatar: string
    rating: number
    content: string
    time: string
  }>
}

export const featuredDishes: Dish[] = [
  {
    id: 'seafood-risotto',
    name: '蓝湾海鲜烩饭',
    restaurant: '潮汐轻食厨房',
    location: '一食堂 2F',
    price: 32,
    rating: 4.9,
    tags: ['今日推荐', '奶香浓郁', '海鲜控'],
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    author: 'Mia',
    authorTitle: '校园探店主理人',
    publishTime: '今天 11:40',
    summary: '米粒吸满海鲜高汤，入口有黄油香，虾仁和青口的新鲜感很足。',
    highlights: ['酱汁包裹感强', '海鲜分量足', '摆盘很清爽'],
    tips: ['建议趁热吃', '搭配柠檬气泡水更解腻', '饭量小可两人分享'],
    comments: [
      {
        user: '阿昭',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        content: '虾仁弹牙，饭芯偏软一点但很香，午饭选它很稳。',
        time: '12分钟前',
      },
      {
        user: '一口鲸',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        rating: 4,
        content: '奶味明显，适合喜欢顺口风味的人，拍照也很出片。',
        time: '24分钟前',
      },
    ],
  },
  {
    id: 'sushi-bowl',
    name: '深海三文鱼拌饭',
    restaurant: '北纬食研所',
    location: '二食堂 1F',
    price: 28,
    rating: 4.8,
    tags: ['人气王', '高蛋白', '清爽'],
    image:
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80',
    author: 'Luna',
    authorTitle: '轻卡爱好者',
    publishTime: '今天 10:15',
    summary: '三文鱼切片厚度在线，牛油果和温泉蛋把整体口感拉得很顺。',
    highlights: ['酱汁平衡', '摆盘高级', '适合夏天'],
    tips: ['加一点芥末更提味', '早点去口感更稳定', '适合作为轻午餐'],
    comments: [
      {
        user: '阿宁',
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        content: '牛油果很熟，拌开以后整体很丝滑。',
        time: '38分钟前',
      },
    ],
  },
  {
    id: 'berry-toast',
    name: '莓果云朵吐司',
    restaurant: '晨光甜品社',
    location: '生活区 A 座',
    price: 22,
    rating: 4.7,
    tags: ['下午茶', '甜口', '拍照友好'],
    image:
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1200&q=80',
    author: 'Kiki',
    authorTitle: '甜品记录官',
    publishTime: '今天 09:05',
    summary: '吐司边缘烤得酥脆，莓果酸甜和奶油的轻盈感搭配得很舒服。',
    highlights: ['层次细腻', '糖度克制', '出片稳定'],
    tips: ['适合两人分享', '下午两点后奶油状态更稳定', '建议搭配美式'],
    comments: [
      {
        user: 'riri',
        avatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        rating: 4,
        content: '甜度不腻，口感很轻，下午茶很适合。',
        time: '1小时前',
      },
    ],
  },
]

export const restaurantCards = [
  {
    id: 'tidal',
    name: '潮汐轻食厨房',
    image:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80',
    score: 4.9,
    theme: '海鲜与轻食',
  },
  {
    id: 'latfood',
    name: '北纬食研所',
    image:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80',
    score: 4.8,
    theme: '健康拌饭',
  },
  {
    id: 'sweetclub',
    name: '晨光甜品社',
    image:
      'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80',
    score: 4.7,
    theme: '甜品与咖啡',
  },
  {
    id: 'blueflame',
    name: '蓝焰烤物屋',
    image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
    score: 4.6,
    theme: '炙烤风味',
  },
]

export const timelineRecords = [
  {
    day: '03/24',
    meal: '午餐',
    title: '蓝湾海鲜烩饭',
    note: '酱汁香味很足，虾仁新鲜，今天最满意的一餐。',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    mood: '满足',
    calories: '586 kcal',
  },
  {
    day: '03/23',
    meal: '晚餐',
    title: '深海三文鱼拌饭',
    note: '很适合健身日，口感清爽，吃完没有负担。',
    image:
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    mood: '轻盈',
    calories: '442 kcal',
  },
  {
    day: '03/22',
    meal: '下午茶',
    title: '莓果云朵吐司',
    note: '适合边聊天边吃，奶油绵密，莓果酸味很提神。',
    image:
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=800&q=80',
    mood: '治愈',
    calories: '318 kcal',
  },
]

export const rankBoards = {
  daily: [
    { name: '蓝湾海鲜烩饭', price: 32, restaurant: '潮汐轻食厨房', heat: '98%' },
    { name: '深海三文鱼拌饭', price: 28, restaurant: '北纬食研所', heat: '95%' },
    { name: '香煎鸡腿能量碗', price: 26, restaurant: '轻盈实验室', heat: '92%' },
    { name: '莓果云朵吐司', price: 22, restaurant: '晨光甜品社', heat: '89%' },
    { name: '焦糖布丁拿铁', price: 18, restaurant: '微光咖啡站', heat: '85%' },
  ],
  weekly: [
    { name: '深海三文鱼拌饭', price: 28, restaurant: '北纬食研所', heat: '97%' },
    { name: '蓝湾海鲜烩饭', price: 32, restaurant: '潮汐轻食厨房', heat: '96%' },
    { name: '蓝焰炙烤牛排饭', price: 36, restaurant: '蓝焰烤物屋', heat: '93%' },
    { name: '莓果云朵吐司', price: 22, restaurant: '晨光甜品社', heat: '91%' },
    { name: '松露蘑菇意面', price: 29, restaurant: '森系意食馆', heat: '88%' },
  ],
  total: [
    { name: '蓝焰炙烤牛排饭', price: 36, restaurant: '蓝焰烤物屋', heat: '99%' },
    { name: '蓝湾海鲜烩饭', price: 32, restaurant: '潮汐轻食厨房', heat: '97%' },
    { name: '深海三文鱼拌饭', price: 28, restaurant: '北纬食研所', heat: '95%' },
    { name: '松露蘑菇意面', price: 29, restaurant: '森系意食馆', heat: '92%' },
    { name: '莓果云朵吐司', price: 22, restaurant: '晨光甜品社', heat: '90%' },
  ],
}

export const profileHighlights = [
  { label: '已记录', value: '128' },
  { label: '收藏', value: '64' },
  { label: '想吃', value: '23' },
  { label: '获赞', value: '2.4k' },
]

export const quickActions = ['收藏分享', '想吃清单', '餐厅追踪', '评论互动']
