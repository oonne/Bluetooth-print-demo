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
async function initDevice() {
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

/**
 * 快速初始化设备
 * ios下每次打印前都需要调用wx.getBLEDeviceServices()和wx.getBLEDeviceCharacteristics()
 */
async function quickInitDevice() {
  const { device, serviceId } = getApp().globalData;
  if (!device || !serviceId) {
    getApp().globalData.deviceStatus = 'disconnect';
    throw new Error('未设置连接设备');
  }
  const { deviceId } = device;

  const [servicesErr] = await to(
    wx.getBLEDeviceServices({
      deviceId,
    }),
  );
  if (servicesErr) {
    const { errCode } = servicesErr;
    if (errCode) {
      throw new Error(btStatusCode[errCode].zh_CN);
    }
    throw new Error(servicesErr.errMsg);
  }

  const [characteristicErr] = await to(
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
    }),
  );
  if (characteristicErr) {
    const { errCode } = characteristicErr;
    if (errCode) {
      throw new Error(btStatusCode[errCode].zh_CN);
    }
    throw new Error(characteristicErr.errMsg);
  }

  return device;
}

/**
 * 发送数据
 * @param {buffer} buffer 数据
 * 小程序不会对写入数据包大小做限制，但系统与蓝牙设备会限制蓝牙 4.0 单次传输的数据大小，超过最大字节数后会发生写入错误，建议每次写入不超过 20 字节
 */
async function sendDataToDevice(options) {
  const [err, res] = await to(wx.writeBLECharacteristicValue(options));
  if (err) {
    const { errCode } = err;
    if (errCode) {
      throw new Error(btStatusCode[errCode].zh_CN);
    }
    throw new Error(err.errMsg);
  }

  return res;
}
async function sendData(buffer) {
  const {
    device: { deviceId },
    serviceId,
    characteristicId,
  } = getApp().globalData;

  if (buffer.byteLength <= 0) {
    return;
  }

  const [err] = await to(
    sendDataToDevice({
      deviceId,
      serviceId,
      characteristicId,
      value: buffer.slice(0, buffer.byteLength > 20 ? 20 : buffer.byteLength),
    }),
  );

  if (err) {
    throw err;
  }

  await sendData(buffer.slice(20, buffer.byteLength));
}

export {
  setStoragePrinter,
  removeStoragePrinter,
  connentDevice,
  closeDevice,
  initDevice,
  quickInitDevice,
  sendData,
};
