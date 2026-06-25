export default defineAppConfig({
  pages: ['pages/home/index', 'pages/services/index', 'pages/shuyuan/index', 'pages/profile/index'],
  subPackages: [
    {
      root: 'pages/resource',
      pages: [
        'home/index',
        'list/index',
        'standard-detail/index',
        'nonstandard-detail/index',
        'submit/index',
        'purchase/index'
      ]
    },
    {
      root: 'pages/event',
      pages: ['home/index', 'list/index', 'detail/index', 'signup/index', 'group/index', 'ticket/index']
    },
    {
      root: 'pages/member',
      pages: ['benefit/index', 'confirm/index', 'payment-transfer/index']
    },
    {
      root: 'pages/opportunity',
      pages: ['home/index', 'detail/index', 'publish/index', 'apply/index']
    },
    {
      root: 'pages/user',
      pages: [
        'cert/index',
        'orders/index',
        'events/index',
        'benefits/index',
        'points/index',
        'reviews/index',
        'settings/index'
      ]
    },
    {
      root: 'pages/admin',
      pages: ['checkin/index', 'cert/index', 'orders/index', 'resource/index', 'opportunity/index']
    }
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '行商书苑',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#4E5D70',
    selectedColor: '#005BFF',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home-active.png'
      },
      {
        pagePath: 'pages/services/index',
        text: '服务商城',
        iconPath: 'assets/tabbar/services.png',
        selectedIconPath: 'assets/tabbar/services-active.png'
      },
      {
        pagePath: 'pages/shuyuan/index',
        text: '行商书苑',
        iconPath: 'assets/tabbar/shuyuan.png',
        selectedIconPath: 'assets/tabbar/shuyuan-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tabbar/profile.png',
        selectedIconPath: 'assets/tabbar/profile-active.png'
      }
    ]
  }
})
