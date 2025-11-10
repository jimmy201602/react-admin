/**
 * 通用的辅助工具方法
 * @module 通用工具方法
 * */
// 获取数据类型
export function toRawType(value) {
  const _toString = Object.prototype.toString;
  return _toString.call(value).slice(8, -1);
}

/**
 * 数组分割成多数组
 * @param  {[type]} target  要分割的数组
 * @param  {[type]} size  每个数组的个数
 * @return {[type]}       返回一个数组
 */
export function chunk(target, size) {
  let [start, end, result] = [null, null, []];
  for (let i = 0; i < Math.ceil(target.length / size); i++) {
    start = i * size;
    end = start + size;
    result.push(target.slice(start, end));
  }
  return result;
}

// 转化样式布局值
export function converLayout(value, defaultValue = "100%") {
  // 是否为数字 ex："222"、222
  function isLooselyNumber(num) {
    if (toRawType(num) === "Number") return true;
    if (toRawType(num) === "String") {
      return !Number.isNaN(Number(num));
    }
    return false;
  }

  function isCssLength(str) {
    if (typeof str !== "string") return false;
    return str.match(/^([0-9])*(%|px|rem|em)$/i);
  }

  return isLooselyNumber(value)
    ? Number(value)
    : isCssLength(value)
    ? value
    : defaultValue;
}
