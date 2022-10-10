import btStatusCode from '../constant/bt-status-code';
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
 * 不同的打印机设备，使用不同的标准方式来获取可用的 service 和 characteristic
 * @params {string} deviceId 设备ID
 * @return {string} serviceId
 * @return {string} characteristicId
 */
/*
 * 普贴打印机，蓝牙名包含“51DC”或“54DC”
 * serviceId以“ 49535343 ”开头
 * characteristicId以“ 49535343 ”开头
 */
function isPt(localName) {
  return !!~localName.indexOf('51DC') || !!~localName.indexOf('54DC');
}
async function getPt(deviceId) {
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

  return {
    serviceId,
    characteristicId,
  };
}

/*
 * 芝柯打印机，蓝牙名以“CC4”开头
 * serviceId以“ 0000FFF0 ”开头
 * characteristicId以“ 0000FFF2 ”开头
 */
function isZicox(localName) {
  return localName.indexOf('CC4') === 0;
}
async function getZicox(deviceId) {
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
    return uuid.indexOf('0000FFF0') === 0;
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
    return uuid.indexOf('0000FFF2') === 0 && properties.write;
  });

  if (!characteristic) {
    getApp().globalData.deviceStatus = 'error';
    throw new Error('打印机不支持(未找到可用特征)');
  }

  const characteristicId = characteristic.uuid;

  return {
    serviceId,
    characteristicId,
  };
}

/*
 * 商为打印盒子，蓝牙名以“SW”开头
 * serviceId以“ 000000FF ”开头
 * characteristicId以“ 0000FF01 ”开头
 */
function isSw(localName) {
  return localName.indexOf('SW') === 0;
}
async function getSw(deviceId) {
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
    return uuid.indexOf('000000FF') === 0;
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
    return uuid.indexOf('0000FF01') === 0 && properties.write;
  });

  if (!characteristic) {
    getApp().globalData.deviceStatus = 'error';
    throw new Error('打印机不支持(未找到可用特征)');
  }

  const characteristicId = characteristic.uuid;

  return {
    serviceId,
    characteristicId,
  };
}

/*
 * 其他通用打印机，取第一个 (notify || indicate) && write 的特征值
 */
async function getUniversal(deviceId) {
  let serviceId = '';
  let characteristicId = '';

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

  const promiseArr = servicesRes.services.map(async (service) => {
    const { uuid } = service;

    const characteristicRes = await wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId: uuid,
    });
    const characteristic = characteristicRes.characteristics.find((char) => {
      const {
        properties: { notify, indicate, write },
      } = char;
      return (notify || indicate) && write;
    });

    if (!characteristic) {
      return;
    }

    serviceId = uuid;
    characteristicId = characteristic.uuid;
  });
  await Promise.all(promiseArr);

  if (!characteristicId) {
    getApp().globalData.deviceStatus = 'error';
    throw new Error('打印机不支持(未找到可用特征)');
  }

  return {
    serviceId,
    characteristicId,
  };
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

  getApp().globalData.serviceId = '';
  getApp().globalData.characteristicId = '';
  const { deviceId, localName } = device;
  let serviceId = '';
  let characteristicId = '';

  if (isPt(localName)) {
    // 普贴打印机
    ({ serviceId, characteristicId } = await getPt(deviceId));
  } else if (isZicox(localName)) {
    // 芝柯打印机
    ({ serviceId, characteristicId } = await getZicox(deviceId));
  } else if (isSw(localName)) {
    // 商为打印盒子
    ({ serviceId, characteristicId } = await getSw(deviceId));
  } else {
    // 其他打印机
    ({ serviceId, characteristicId } = await getUniversal(deviceId));
  }

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
