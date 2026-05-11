export default defineAppConfig({
  // 主包：仅保留 TabBar 页面，确保主包控制在 1MB 以内
  pages: [
    'pages/index/index',
    'pages/record/index',
    'pages/publish/index',
    'pages/rank/index',
    'pages/profile/index',
  ],
  // 分包配置
  subPackages: [
    {
      root: 'packageUser',
      pages: [
        'register/index',
        'edit/index',
        'preferences/index'
      ]
    },
    {
      root: 'packageFood',
      pages: [
        'food/index',
        'check/index'
      ]
    },
    {
      root: 'packageInteractions/interactions',
      pages: [
        'comments/index',
        'likes/index',
        'favorites/index',
        'wishlist/index'
      ]
    }
  ],
  // 分包预下载规则，提升用户体验
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['packageFood', 'packageUser']
    }
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#f9fbff',
    navigationBarTitleText: 'Chilemei',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f9fbff',
  },
  tabBar: {
    custom: true,
    color: '#7f8ba8',
    selectedColor: '#2f6bff',
    backgroundColor: '#f9fbff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: 'Home',
      },
      {
        pagePath: 'pages/record/index',
        text: 'Record',
      },
      {
        pagePath: 'pages/publish/index',
        text: '+',
      },
      {
        pagePath: 'pages/rank/index',
        text: 'Rank',
      },
      {
        pagePath: 'pages/profile/index',
        text: 'Mine',
      },
    ],
  },
})