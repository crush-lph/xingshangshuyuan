export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/services/index',
    'pages/academy/index',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '行尚书苑',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#66736d',
    selectedColor: '#1f7a54',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/services/index',
        text: '服务商城'
      },
      {
        pagePath: 'pages/academy/index',
        text: '行尚书苑'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
