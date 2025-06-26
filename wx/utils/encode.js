import { GB18303_TABLE, GB18303_RANGES } from '../constant/gb18030-table';

/*
 * unicode 转 ArrayBuffer，适用于没有中文的场景
 */
function unicode2ArrayBuffer(str) {
  const out = new ArrayBuffer(str.length);
  const uint8 = new Uint8Array(out);

  str.split('');
  const strs = str.split('');
  for (let i = 0; i < strs.length; i++) {
    uint8[i] = strs[i].charCodeAt(0);
  }
  return out;
}

/**
 * @param {string} string Input string of UTF-16 code units.
 * @return {!Array.<number>} Code points.
 */
function stringToCodePoints(string) {
  // 1. Let S be the DOMString value.
  const s = String(string);
  // 2. Let n be the length of S.
  const n = s.length;
  // 3. Initialize i to 0.
  let i = 0;
  // 4. Initialize U to be an empty sequence of Unicode characters.
  const u = [];
  // 5. While i < n:
  while (i < n) {
    // 1. Let c be the code unit in S at index i.
    const c = s.charCodeAt(i);
    // 2. Depending on the value of c:
    // c < 0xD800 or c > 0xDFFF
    if (c < 0xd800 || c > 0xdfff) {
      // Append to U the Unicode character with code point c.
      u.push(c);
    }
    // 0xDC00 ≤ c ≤ 0xDFFF
    else if (c >= 0xdc00 && c <= 0xdfff) {
      // Append to U a U+FFFD REPLACEMENT CHARACTER.
      u.push(0xfffd);
    }
    // 0xD800 ≤ c ≤ 0xDBFF
    else if (c >= 0xd800 && c <= 0xdbff) {
      // 1. If i = n−1, then append to U a U+FFFD REPLACEMENT
      // CHARACTER.
      if (i === n - 1) {
        u.push(0xfffd);
      }
      // 2. Otherwise, i < n−1:
      else {
        // 1. Let d be the code unit in S at index i+1.
        const d = s.charCodeAt(i + 1);
        // 2. If 0xDC00 ≤ d ≤ 0xDFFF, then:
        if (d >= 0xdc00 && d <= 0xdfff) {
          // 1. Let a be c & 0x3FF.
          const a = c & 0x3ff;
          // 2. Let b be d & 0x3FF.
          const b = d & 0x3ff;
          // 3. Append to U the Unicode character with code point
          // 2^16+2^10*a+b.
          u.push(0x10000 + (a << 10) + b);
          // 4. Set i to i+1.
          i += 1;
        }
        // 3. Otherwise, d < 0xDC00 or d > 0xDFFF. Append to U a
        // U+FFFD REPLACEMENT CHARACTER.
        else {
          u.push(0xfffd);
        }
      }
    }
    // 3. Set i to i+1.
    i += 1;
  }
  // 6. Return U.
  return u;
}

/**
 * An ASCII byte is a byte in the range 0x00 to 0x7F, inclusive.
 * @param {number} a The number to test.
 * @return {boolean} True if a is in the range 0x00 to 0x7F, inclusive.
 */
function isASCIICodePoint(a) {
  return a >= 0x00 && a <= 0x7f;
}
/**
 * @param {number} codePoint The |code point| to search for.
 * @param {!Array.<?number>} index The |index| to search within.
 * @return {?number} The first pointer corresponding to |code point| in
 *     |index|, or null if |code point| is not in |index|.
 */
function indexPointerFor(codePoint, index) {
  const pointer = index.indexOf(codePoint);
  return pointer === -1 ? null : pointer;
}
/**
 * @param {number} code_point The |code point| to locate in the gb18030 index.
 * @return {number} The first pointer corresponding to |code point| in the
 *     gb18030 index.
 */
function indexGB18030RangesPointerFor(codePoint) {
  // 1. If code point is U+E7C7, return pointer 7457.
  if (codePoint === 0xe7c7) return 7457;

  // 2. Let offset be the last code point in index gb18030 ranges
  // that is equal to or less than code point and let pointer offset
  // be its corresponding pointer.
  let offset = 0;
  let pointerOffset = 0;
  const idx = GB18303_RANGES;
  let i;
  for (i = 0; i < idx.length; ++i) {
    /** @type {!Array.<number>} */
    const entry = idx[i];
    if (entry[1] <= codePoint) {
      [pointerOffset, offset] = entry;
      // TODO 删除调试代码
      // offset = entry[1];
      // pointerOffset = entry[0];
    } else {
      break;
    }
  }

  // 3. Return a pointer whose value is pointer offset + code point
  // − offset.
  return pointerOffset + codePoint - offset;
}
/**
 * @param {number} codePoint Next code point read from the stream.
 * @return {(number|!Array.<number>)} Byte(s) to emit.
 */
const finished = -1;
const endOfStream = -1;
function GB18030Encoder(codePoint) {
  // 1. If code point is end-of-stream, return finished.
  if (codePoint === endOfStream) {
    return finished;
  }
  // 2. If code point is an ASCII code point, return a byte whose
  // value is code point.
  if (isASCIICodePoint(codePoint)) {
    return codePoint;
  }
  // 3. If code point is U+E5E5, return error with code point.
  if (codePoint === 0xe5e5) {
    throw TypeError(`The code point ${codePoint} could not be encoded.`);
  }
  // 5. Let pointer be the index pointer for code point in index
  // gb18030.
  let pointer = indexPointerFor(codePoint, GB18303_TABLE);
  // 6. If pointer is not null, run these substeps:
  if (pointer !== null) {
    // 1. Let lead be floor(pointer / 190) + 0x81.
    const lead = Math.floor(pointer / 190) + 0x81;
    // 2. Let trail be pointer % 190.
    const trail = pointer % 190;
    // 3. Let offset be 0x40 if trail is less than 0x3F and 0x41 otherwise.
    const offset = trail < 0x3f ? 0x40 : 0x41;
    // 4. Return two bytes whose values are lead and trail + offset.
    return [lead, trail + offset];
  }
  // 8. Set pointer to the index gb18030 ranges pointer for code
  // point.
  pointer = indexGB18030RangesPointerFor(codePoint);
  // 9. Let byte1 be floor(pointer / 10 / 126 / 10).
  const byte1 = Math.floor(pointer / 10 / 126 / 10);
  // 10. Set pointer to pointer − byte1 × 10 × 126 × 10.
  pointer -= byte1 * 10 * 126 * 10;
  // 11. Let byte2 be floor(pointer / 10 / 126).
  const byte2 = Math.floor(pointer / 10 / 126);
  // 12. Set pointer to pointer − byte2 × 10 × 126.
  pointer -= byte2 * 10 * 126;
  // 13. Let byte3 be floor(pointer / 10).
  const byte3 = Math.floor(pointer / 10);
  // 14. Let byte4 be pointer − byte3 × 10.
  const byte4 = pointer - byte3 * 10;
  // 15. Return four bytes whose values are byte1 + 0x81, byte2 +
  // 0x30, byte3 + 0x81, byte4 + 0x30.
  return [byte1 + 0x81, byte2 + 0x30, byte3 + 0x81, byte4 + 0x30];
}

/*
 * 中文转ArrayBuffer
 */
function gbk2buffer(content) {
  const codePoints = stringToCodePoints(content);
  const output = codePoints
    .map((point) => {
      return GB18030Encoder(point);
    })
    .flat();

  const unitArray = new Uint8Array(output);
  return unitArray.buffer;
}

export { unicode2ArrayBuffer, gbk2buffer };
