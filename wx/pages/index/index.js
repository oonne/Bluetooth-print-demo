Page({
  data: {
    deviceName: '',
  },

  onShow() {
    this.showDeviceName();
  },

  // 显示当前连接的设备
  showDeviceName() {
    this.setData({
      deviceName: '',
    });
    const { device } = getApp().globalData;

    if (!device) {
      return;
    }
    this.setData({
      deviceName: device.localName,
    });
  },

  toConnection() {
    wx.navigateTo({
      url: '/pages/bt-connection/index',
    });
  },
});
