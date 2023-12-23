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
  apiGroup: string; //api组
  description: string; //描述
  path: string; //请求路径
  method: string; //请求方法
};

// 搜索相关参数
export type SearchInfo = {
  path: string | undefined; // 请求路径
  apiGroup: string | undefined; // api组
  desc: boolean; // 是否倒序
  description: string | undefined; // 描述
  method: string | undefined; // 请求方式
  orderKey: string | undefined; // 排序的key
};

export type operateType = "add" | "up";

export type ModalType = {
  operateType: operateType;
  nowData: any | null;
  modalShow: boolean;
  modalLoading: boolean;
};
