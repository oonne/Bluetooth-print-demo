/* 蓝牙方法 */

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

export { setStoragePrinter, removeStoragePrinter };
