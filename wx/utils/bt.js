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
  // TODO
}

export {
  setStoragePrinter,
  removeStoragePrinter,
  connentDevice,
  closeDevice,
  initDevices,
};
