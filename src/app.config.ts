const imgUrl = './assets/tabbar/';

export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/follow/index',
    'pages/fans/index',
    'pages/nearby/index',
    'pages/publish/index',
    'pages/message/index/index',
    'pages/message/chat/index',
    'pages/message/list/index',
    'pages/mine/index',
    'pages/personal/index',
    'pages/profile/index',
    'pages/accounting/list',
    'pages/checklist/list/index',
    'pages/checklist/edit/index',
    'pages/footprint/index',
    'pages/history/index',
    'pages/favorite/index',
    'pages/guide/list/index',
    'pages/guide/where/index',
    'pages/guide/basic/index',
    'pages/guide/detail/index',
    'pages/guide/preview/index',
    'pages/guide/itinerary/index',
    'pages/trip/list/index',
    'pages/trip/basic/index',
    'pages/trip/itinerary/index',
    'pages/trip/detail/index',
    'pages/trip/preview/index',
    'pages/trip/where/index',
    'pages/trip/date/index',
    'pages/partner/create/index',
    'pages/partner/list/index',
    'pages/partner/detail/index',
  ],
  // 底部 TabBar 配置
  tabBar: {
    color: '#666666', // 未选中文字颜色
    selectedColor: '#F97316', // 选中文字颜色
    backgroundColor: '#ffffff', // 背景色
    borderStyle: 'black', // 顶部边框
    list: [
      {
        pagePath: 'pages/home/index',
        text: '攻略',
        iconPath: imgUrl + 'home.png',
        selectedIconPath: imgUrl + 'home1.png',
      },
      {
        pagePath: 'pages/nearby/index',
        text: '周边游',
        iconPath: imgUrl + 'addr.png',
        selectedIconPath: imgUrl + 'addr1.png',
      },
      {
        pagePath: 'pages/publish/index',
        text: '发布',
        iconPath: imgUrl + 'publish.png',
        selectedIconPath: imgUrl + 'publish1.png',
      },
      {
        pagePath: 'pages/message/index/index',
        text: '消息',
        iconPath: imgUrl + 'msg.png',
        selectedIconPath: imgUrl + 'msg1.png',
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: imgUrl + 'mine.png',
        selectedIconPath: imgUrl + 'mine1.png',
      },
    ],
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
  },
});
