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

export { to };
