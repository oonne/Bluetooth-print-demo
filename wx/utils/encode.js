import { TextEncoder } from '../libs/text-encode/encoding';
/*
 * 中文转ArrayBuffer
 */

// unicode 转 ArrayBuffer，适用于没有中文的场景
function unicode2ArrayBuffer(str) {
  const out = new ArrayBuffer(str.length);
  const uint8 = new Uint8Array(out);

  str.split('');
  const strs = str.split('');
  for (let i = 0; i < strs.length; i++) {
    uint8[i] = strs[i].charCodeAt();
  }
  return out;
}

// GB18030 转 ArrayBuffer，国内大部分打印机都是用GB18030
function gbk2buffer(content) {
  const encoder = new TextEncoder('gb18030', {
    NONSTANDARD_allowLegacyEncoding: true,
  });
  const val = encoder.encode(content);
  return val.buffer;
}

export { unicode2ArrayBuffer, gbk2buffer };
