// 蓝牙状态
const status = {
  0: {
    en_US: 'ok',
    zh_CN: '正常',
  },
  10000: {
    en_US: 'not init',
    zh_CN: '未初始化蓝牙适配器',
  },
  10001: {
    en_US: 'not available',
    zh_CN: '当前蓝牙适配器不可用',
  },
  10002: {
    en_US: 'no device',
    zh_CN: '没有找到指定设备',
  },
  10003: {
    en_US: 'connection fail',
    zh_CN: '连接失败',
  },
  10004: {
    en_US: 'no service',
    zh_CN: '没有找到指定服务',
  },
  10005: {
    en_US: 'no characteristic',
    zh_CN: '没有找到指定特征值',
  },
  10006: {
    en_US: 'no connection',
    zh_CN: '当前连接已断开',
  },
  10007: {
    en_US: 'property not support',
    zh_CN: '当前特征值不支持此操作',
  },
  10008: {
    en_US: 'system error',
    zh_CN: '其余所有系统上报的异常',
  },
  10009: {
    en_US: 'system not support',
    zh_CN: '系统版本低于 4.3 不支持 BLE',
  },
  10012: {
    en_US: 'operate time out',
    zh_CN: '连接超时',
  },
  10013: {
    en_US: 'invalid_data',
    zh_CN: '连接 deviceId 为空或者是格式不正确',
  },
};
export default status;
