// 执行传入的promise并返回一个数组，方便在async函数中使用await时判断异常
function to(promise) {
  if (promise instanceof Promise) {
    return promise
      .then((res) => {
        return [null, res];
      })
      .catch((err) => {
        return [err, null];
      });
  }

  return [null, promise];
}

// 字符转ArrayBuffer
function charToArrayBuffer(str) {
  const out = new ArrayBuffer(str.length);
  const uint8 = new Uint8Array(out);

  str.split('');
  const strs = str.split('');
  for (let i = 0; i < strs.length; i++) {
    uint8[i] = strs[i].charCodeAt();
  }
  return out;
}

export { to, charToArrayBuffer };
