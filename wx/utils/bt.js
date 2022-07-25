import btStatusCode from '../constant/btStatusCode';
import { to } from './utils';

/**
 * 储存已连接的打印机
 * @param {object} data
 */
function setStoragePrinter(data) {
  wx.setStorage({
    key: 'btPrinter',
    data,
  });
}
/**
 * 删除已连接的打印机
 */
function removeStoragePrinter() {
  wx.removeStorage({
    key: 'btPrinter',
  });
}

/**
 * 连接设备
 * @param {string} deviceId 设备id
 */
async function connentDevice(deviceId) {
  const [err, res] = await to(
    wx.createBLEConnection({
      deviceId,
      timeout: 3000,
    }),
  );

  if (err) {
    const { errCode } = err;
    if (errCode > 0) {
      getApp().globalData.btStatus = err.errCode;
      getApp().globalData.deviceStatus = 'error';
      throw new Error(btStatusCode[err.errCode].zh_CN);
    }

    throw new Error(err.errMsg);
  }

  getApp().globalData.deviceStatus = 'connected';
  return res;
}
/**
 * 断开设备
 * @param {string} deviceId 设备id
 */
async function closeDevice(deviceId) {
  const [err, res] = await to(
    wx.closeBLEConnection({
      deviceId,
    }),
  );

  if (err) {
    const { errCode } = err;
    if (errCode > 0) {
      getApp().globalData.btStatus = err.errCode;
      getApp().globalData.deviceStatus = 'error';
      throw new Error(btStatusCode[err.errCode].zh_CN);
    }

    throw new Error(err.errMsg);
  }

  getApp().globalData.deviceStatus = 'disconnect';
  return res;
}

/**
 * 初始化设备
 */
async function initDevices() {
  const { deviceStatus, device } = getApp().globalData;

  if (!device) {
    getApp().globalData.deviceStatus = 'disconnect';
    throw new Error('未设置连接设备');
  }
  if (deviceStatus !== 'connected') {
    throw new Error('设备状态不正确');
  }

  /*
   * 先以 普贴 51DC 作为适配设备进行测试
   * serviceId以“ 49535343 ”开头
   * characteristicId以“ 49535343 ”开头
   */
  getApp().globalData.serviceId = '';
  getApp().globalData.characteristicId = '';
  const { deviceId } = device;

  // 确定 service
  const [servicesErr, servicesRes] = await to(
    wx.getBLEDeviceServices({
      deviceId,
    }),
  );

  if (servicesErr) {
    getApp().globalData.deviceStatus = 'error';
    const { errCode } = servicesErr;
    if (errCode) {
      throw new Error(btStatusCode[errCode].zh_CN);
    }
    throw new Error(servicesErr.errMsg);
  }

  const service = servicesRes.services.find((item) => {
    const { uuid } = item;
    return uuid.indexOf('49535343') === 0;
  });

  if (!service) {
    getApp().globalData.deviceStatus = 'error';
    throw new Error('打印机不支持(未找到可用服务)');
  }

  const serviceId = service.uuid;

  // 确定 characteristic
  const [characteristicErr, characteristicRes] = await to(
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
    }),
  );

  if (characteristicErr) {
    getApp().globalData.deviceStatus = 'error';
    const { errCode } = characteristicErr;
    if (errCode) {
      throw new Error(btStatusCode[errCode].zh_CN);
    }
    throw new Error(characteristicErr.errMsg);
  }

  const characteristic = characteristicRes.characteristics.find((char) => {
    const { uuid, properties } = char;
    return uuid.indexOf('49535343') === 0 && properties.write;
  });

  if (!characteristic) {
    getApp().globalData.deviceStatus = 'error';
    throw new Error('打印机不支持(未找到可用特征)');
  }

  const characteristicId = characteristic.uuid;

  // 初始化完成
  getApp().globalData.serviceId = serviceId;
  getApp().globalData.characteristicId = characteristicId;
  getApp().globalData.deviceStatus = 'completed';
  return {
    device,
    serviceId,
    characteristicId,
  };
}

export {
  setStoragePrinter,
  removeStoragePrinter,
  connentDevice,
  closeDevice,
  initDevices,
};
