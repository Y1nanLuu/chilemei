export default defineAppConfig({
  pages: [
    'pages/register/index',
    'pages/check/index',
    'pages/food/index',
    'pages/interactions/comments/index',
    'pages/interactions/likes/index',
    'pages/interactions/favorites/index',
    'pages/interactions/wishlist/index',
    'pages/preferences/index',
    'pages/index/index',
    'pages/record/index',
    'pages/publish/index',
    'pages/rank/index',
    'pages/profile/index',
    'pages/profile/edit/index',
  ],
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
