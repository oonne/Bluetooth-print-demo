Page({
  data: {
    deviceName: '未连接',
  },

  toConnection() {
    wx.navigateTo({
      url: '/pages/bt-connection/index',
    });
  },
});
