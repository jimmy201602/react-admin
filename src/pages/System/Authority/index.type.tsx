export type Page = {
  page: number;
  pageSize: number;
  total: number;
};

export type authorityTableData = {
  authorityId: number;
  authorityName: string;
  children: authorityTableData[];
  dataAuthorityId: any;
  defaultRouter: string;
  menus: any;
  parentId: number;
};

export type operateType = "add" | "copy" | "up" | "addSub";

export type ModalType = {
  operateType: operateType;
  nowData: any | null;
  modalShow: boolean;
  modalLoading: boolean;
};
