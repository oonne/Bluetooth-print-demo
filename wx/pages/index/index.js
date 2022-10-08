import { to } from '../../utils/utils';
import { gbk2buffer } from '../../utils/encode';
import {
  quickInitDevice,
  connentDevice,
  closeDevice,
  sendData,
} from '../../utils/bt';

Page({
  data: {
    deviceName: '',
    text: '打印blog.oonne.com',
    printing: false,
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
    const { printing } = this.data;

    if (printing) {
      return;
    }
    this.setData({
      printing: true,
    });

    // 连接
    const [connectErr] = await to(connentDevice(deviceId));
    if (connectErr) {
      wx.showToast({
        icon: 'none',
        title: connectErr.message,
      });
      await closeDevice(deviceId);
      this.setData({
        printing: false,
      });
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
      this.setData({
        printing: false,
      });
      return;
    }

    // 发送数据
    const data = this.getDemoPrintData();
    await sendData(data);

    // 发送结束
    await closeDevice(deviceId);
    this.setData({
      printing: false,
    });
  },

  // 测试打印数据
  getDemoPrintData() {
    const text = `${this.data.text}\n`;
    return gbk2buffer(text);
  },
});
