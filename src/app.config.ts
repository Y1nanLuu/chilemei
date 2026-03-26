export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/record/index',
    'pages/publish/index',
    'pages/rank/index',
    'pages/profile/index',
    'pages/check/index',
    'pages/register/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#f8f2ea',
    navigationBarTitleText: 'Chilemei',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    custom: true,
    color: '#9e9084',
    selectedColor: '#dc9a5f',
    backgroundColor: '#fffaf4',
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
