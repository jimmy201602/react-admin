export type Page = {
  page: number;
  pageSize: number;
  total: number;
};

// 列表table的数据类型
export type TableRecordData = {
  ID: number;
  CreatedAt: string; //创建时间
  UpdatedAt: string; //更新时间
  agent: string; //用户agent
  body: string; //请求参数
  error_message: string; //错误信息
  ip: string; //ip地址
  latency: number; //耗时
  method: string; //请求方法
  path: string; //请求路径
  resp: string; //返回数据
  status: number; //状态码
  user: object; //用户信息
  user_id: number; //用户id
};

// 搜索相关参数
export type SearchInfo = {
  status: string | undefined; // 状态码
  method: string | undefined; // 请求方法
  path: string | undefined; //路径
};
