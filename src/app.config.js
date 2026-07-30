export default {
  pages: [
    'pages/index/index',
    'pages/lobby/lobby',
    'pages/create-ride/create-ride',
    'pages/train-detail/train-detail',
    'pages/notifications/notifications',
    'pages/profile/profile',
  ],
  window: {
    navigationStyle: 'custom',
    backgroundColor: '#F6F3EE',
    backgroundTextStyle: 'dark',
  },
  tabBar: {
    color: '#847E79',
    selectedColor: '#171513',
    backgroundColor: '#FFFDFA',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/index/index', text: '首页' },
      { pagePath: 'pages/lobby/lobby', text: '拼车' },
      { pagePath: 'pages/notifications/notifications', text: '消息' },
      { pagePath: 'pages/profile/profile', text: '我的' }
    ]
  }
}
