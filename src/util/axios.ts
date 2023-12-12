/** 对axios做一些配置 **/

import { baseUrl } from "../config";
import axios, { AxiosRequestConfig } from "axios";

axios.interceptors.request.use(async (config: AxiosRequestConfig) => {
  const authToken = localStorage.getItem("token");
  const Userid = localStorage.getItem("user-id");
  if (authToken && Userid && config.headers) {
    config.headers["x-token"] = authToken;
    config.headers["x-user-id"] = Userid;
    return config;
  }
  return config;
});

// 默认基础请求地址
axios.defaults.baseURL = baseUrl;
// 请求是否带上cookie
axios.defaults.withCredentials = false;
// 对返回的结果做处理
axios.interceptors.response.use((response) => {
  // const code = response?.data?.code ?? 200;
  // 没有权限，登录超时，登出，跳转登录
  // if (code === 3) {
  //   message.error("登录超时，请重新登录");
  //   sessionStorage.removeItem("userinfo");
  //   setTimeout(() => {
  //     window.location.href = "/";
  //   }, 1500);
  // } else {
  //   return response.data;
  // }
  return response.data;
});

export default axios;
