import btStatusCode from '../../constant/btStatusCode';
import { to } from '../../utils/utils';
import { removeStoragePrinter } from '../../utils/bt';

Page({
  data: {
    // 蓝牙设备
    devices: [],
  },

  // 打开页面搜索蓝牙
  async onShow() {
    const isOpen = await this.openBluetooth();
    if (!isOpen) {
      return;
    }

    this.startSearch();
  },
  // 退出页面关闭搜索蓝牙
  onUnload() {
    getApp().globalData.deviceStatus = 'disconnect';
    if (getApp().globalData.btStatus === 0) {
      this.endSearch();
    }
  },

  /**
   * 打开蓝牙
   * return {boolean} 是否已打开蓝牙
   */
  async openBluetooth() {
    const {
      globalData: { btStatus },
    } = getApp();

    // 蓝牙状态正常，直接开始搜索
    if (btStatus === 0) {
      return true;
    }

    // 否则先打开蓝牙
    const [err] = await to(wx.openBluetoothAdapter());

    if (err) {
      console.log(err);
      const { errCode } = err;
      if (errCode) {
        getApp().globalData.btStatus = errCode;

        wx.showModal({
          title: '启动蓝牙失败',
          content: btStatusCode[errCode].zh_CN,
          showCancel: false,
          success: () => {
            wx.navigateBack();
          },
        });
        return false;
      }
    }

    return true;
  },

  /**
   * 搜索蓝牙设备
   */
  async startSearch() {
    // 清空当前蓝牙状态和设备
    getApp().globalData.deviceStatus = 'disconnect';
    getApp().globalData.device = null;
    getApp().globalData.serviceId = '';
    getApp().globalData.characteristicId = '';
    removeStoragePrinter();
    this.setData({
      devices: [],
    });

    // 开始搜索蓝牙设备
    const [startErr] = await to(wx.startBluetoothDevicesDiscovery());

    if (startErr) {
      console.warn(startErr);
      wx.showToast({
        icon: 'none',
        title: startErr.errMsg,
      });
      return;
    }

    // 监听发现蓝牙设备事件
    const [err, res] = await to(wx.getBluetoothDevices());
    if (err) {
      wx.showToast({
        icon: 'none',
        title: err.errMsg,
      });
      return;
    }

    // 安卓已经搜到的设备不会重复触发wx.onBluetoothDeviceFound()，因此需要先找出来一次
    res.devices.forEach((item) => this.onDeviceFound(item));

    // 发现新设备
    wx.onBluetoothDeviceFound((res) => {
      this.onDeviceFound(res.devices[0]);
    });
  },
  async endSearch() {
    // 取消监听寻找到新设备的事件
    wx.offBluetoothDeviceFound();
    // 停止搜索蓝牙设备
    const [err] = await to(wx.stopBluetoothDevicesDiscovery());
    if (err) {
      wx.showToast({
        icon: 'none',
        title: err.errMsg,
      });
      return;
    }

    wx.showToast({
      icon: 'none',
      title: '已停止搜索蓝牙设备',
    });
  },

  /**
   * 监听发现蓝牙设备事件
   */
  onDeviceFound(newDevice) {
    const { devices } = this.data;

    // 蓝牙设备在被搜索到时，系统返回的 name 字段一般为广播包中的 LocalName 字段中的设备名称，而如果与蓝牙设备建立连接，系统返回的 name 字段会改为从蓝牙设备上获取到的 GattName。
    // 打印机都会返回LocalName，所以过滤掉没有localName的设备
    if (!newDevice.localName) {
      return;
    }

    // 新设备加到列表中，重复设备则更新列表
    const index = devices.findIndex(
      (item) => item.deviceId === newDevice.deviceId,
    );
    if (index >= 0) {
      devices[index] = newDevice;
    } else {
      devices.push(newDevice);
    }

    this.setData({
      devices,
    });
  },
});
