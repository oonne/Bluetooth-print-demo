import { to } from '../../utils/utils';
import { quickInitDevice, connentDevice, closeDevice } from '../../utils/bt';

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

  /* 打印 */
  async onPrint() {
    const { device } = getApp().globalData;
    const { deviceId } = device;

    // 连接
    const [connectErr] = await to(connentDevice(deviceId));
    if (connectErr) {
      wx.showToast({
        icon: 'none',
        title: connectErr.message,
      });
      await closeDevice(deviceId);
      return;
    }

    // 初始化
    const [initErr] = await to(quickInitDevice());
    if (initErr) {
      wx.showToast({
        icon: 'none',
        title: initErr.message,
      });
      await closeDevice(deviceId);
      return;
    }

    console.log(device);
    // TODO
    await closeDevice(deviceId);
  },
});
