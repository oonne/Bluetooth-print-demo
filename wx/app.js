App({
  globalData: {
    // 蓝牙状态
    btStatus: 10000,
    // 当前设备状态
    deviceStatus: 'disconnect',
    // 当前连接设备
    device: null,
    // 服务和特征值
    serviceId: '',
    characteristicId: '',
  },
  onLaunch() {},
});
