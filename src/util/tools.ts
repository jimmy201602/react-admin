/** 这个文件封装了一些常用的工具函数 **/

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
// eslint-disable-next-line no-extend-native
Date.prototype.Format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1, // 月份
    "d+": this.getDate(), // 日
    "h+": this.getHours(), // 小时
    "m+": this.getMinutes(), // 分
    "s+": this.getSeconds(), // 秒
    "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
    S: this.getMilliseconds(), // 毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }
  return fmt;
};

//格式化日期
function formatTimeToStr(times, pattern) {
  var d = new Date(times).Format("yyyy-MM-dd hh:mm:ss");
  if (pattern) {
    d = new Date(times).Format(pattern);
  }
  return d.toLocaleString();
}

const tools = {
  /**
   * 保留N位小数
   * 最终返回的是字符串
   * 若转换失败，返回参数原值
   * @param str - 数字或字符串
   * @param x   - 保留几位小数点
   */
  pointX(str: string | number, x = 0): string | number {
    if (!str && str !== 0) {
      return str;
    }
    const temp = Number(str);
    if (temp === 0) {
      return temp.toFixed(x);
    }
    return temp ? temp.toFixed(x) : str;
  },

  /**
   * 去掉字符串两端空格
   * @param str - 待处理的字符串
   */
  trim(str: string): string {
    const reg = /^\s*|\s*$/g;
    return str.replace(reg, "");
  },

  /**
   * 给字符串打马赛克
   * 如：将123456转换为1****6，最多将字符串中间6个字符变成*
   * 如果字符串长度小于等于2，将不会有效果
   * @param str - 待处理的字符串
   */
  addMosaic(str: string): string {
    const s = String(str);
    const lenth = s.length;
    const howmuch = ((): number => {
      if (s.length <= 2) {
        return 0;
      }
      const l = s.length - 2;
      if (l <= 6) {
        return l;
      }
      return 6;
    })();
    const start = Math.floor((lenth - howmuch) / 2);
    const ret = s.split("").map((v, i) => {
      if (i >= start && i < start + howmuch) {
        return "*";
      }
      return v;
    });
    return ret.join("");
  },

  /**
   * 验证字符串
   * 只能为字母、数字、下划线
   * 可以为空
   * @param str - 待处理的字符串
   * **/
  checkStr(str: string): boolean {
    if (str === "") {
      return true;
    }
    const rex = /^[_a-zA-Z0-9]+$/;
    return rex.test(str);
  },

  /**
   * 验证字符串
   * 只能为数字
   * 可以为空
   * @param str - 待处理的字符串
   * **/
  checkNumber(str: string): boolean {
    if (!str) {
      return true;
    }
    const rex = /^\d*$/;
    return rex.test(str);
  },

  /**
   * 正则 手机号验证
   * @param str - 待处理的字符串或数字
   * **/
  checkPhone(str: string | number): boolean {
    const rex = /^1[34578]\d{9}$/;
    return rex.test(String(str));
  },

  /**
   * 正则 邮箱验证
   * @param str - 待处理的字符串
   * **/
  checkEmail(str: string): boolean {
    const rex =
      /^[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*\.[a-z]{2,}$/;
    return rex.test(str);
  },

  /**
   * 字符串加密
   * 简单的加密方法
   * @param code - 待处理的字符串
   */
  compile(code: string): string {
    let c = String.fromCharCode(code.charCodeAt(0) + code.length);
    for (let i = 1; i < code.length; i++) {
      c += String.fromCharCode(code.charCodeAt(i) + code.charCodeAt(i - 1));
    }
    return c;
  },

  /**
   * 字符串解谜
   * 对应上面的字符串加密方法
   * @param code - 待处理的字符串
   */
  uncompile(code: string): string {
    let c = String.fromCharCode(code.charCodeAt(0) - code.length);
    for (let i = 1; i < code.length; i++) {
      c += String.fromCharCode(code.charCodeAt(i) - c.charCodeAt(i - 1));
    }
    return c;
  },

  /**
   * 清除一个对象中那些属性为空值的属性
   * 0 算有效值
   * @param {Object} obj  待处理的对象
   * **/
  clearNull<T>(obj: T): T {
    const temp: any = { ...obj };
    for (const key in temp) {
      if (temp.hasOwnProperty(key)) {
        const value = temp[key];
        if (value === null || value === undefined) {
          delete temp[key];
        }
      }
    }
    return temp as T;
  },

  // 格式化时间日期
  formatDate<T>(time): T {
    if (time !== null && time !== "") {
      var date = new Date(time);
      return formatTimeToStr(date, "yyyy-MM-dd hh:mm:ss") as T;
    } else {
      return "" as T;
    }
  },
};

export default tools;
