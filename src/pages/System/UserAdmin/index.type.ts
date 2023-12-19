/** 当前页面所需所有类型声明 **/

import { UserBasicInfoParam } from "@/models/index.type";

export type { UserBasicInfoParam, Res } from "@/models/index.type";

// 列表table的数据类型
export type TableRecordData = {
  key?: number;
  ID: number;
  serial: number; // 序号
  userName: string; // 用户名
  password: string; // 密码
  phone: string | number; // 手机
  email: string; // 邮箱
  nickName: string; // 描述
  enable: number; // 是否启用 1启用 -1禁用
  control?: number; // 控制，传入的ID
  roles?: number[]; // 拥有的所有权限ID
  headerImg: string; //头像图片链接
  authorities: any; //用户角色id
};

export type Page = {
  page: number;
  pageSize: number;
  total: number;
};

export type operateType = "add" | "see" | "up";

export type ModalType = {
  operateType: operateType;
  nowData: TableRecordData | null;
  modalShow: boolean;
  modalLoading: boolean;
};
