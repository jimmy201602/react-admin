export type Page = {
  page: number;
  pageSize: number;
  total: number;
};

export type menuTableData = {
  CreatedAt: string;
  ID: number;
  UpdatedAt: string;
  authoritys: any;
  children: menuTableData[];
  component: string;
  hidden: boolean;
  menuBtn: any[];
  meta: object;
  name: string;
  parameters: any[];
  parentId: string;
  path: string;
  sort: number;
};

export type operateType = "add" | "up" | "addSub";

export type ModalType = {
  operateType: operateType;
  nowData: menuTableData | null;
  modalShow: boolean;
  modalLoading: boolean;
};
