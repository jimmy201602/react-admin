import React, { useState } from "react";
import { useMount, useSetState } from "react-use";
import {
  authorityTableData,
  ModalType,
  operateType,
  Page,
} from "@/pages/System/Authority/index.type";
import tools from "@/util/tools";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Space,
  Spin,
  Table,
  Tabs,
  TabsProps,
  Tooltip,
  Tree,
  TreeProps,
  TreeSelect,
} from "antd";
import type { CheckboxValueType } from "antd/es/checkbox/Group";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "@/store";

import "./index.less";
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusCircleOutlined,
  SubnodeOutlined,
  ToolOutlined,
} from "@ant-design/icons";

function AuthorityAdminContainer(): JSX.Element {
  const dispatch = useDispatch<Dispatch>();
  const [data, setData] = useState<authorityTableData[]>([]); // 当前页面列表数据
  const p = useSelector((state: RootState) => state.app.powersCode);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState([]);
  const [menuAuthority, setMenuAuthority] = useState([]);
  const [authorityId, setAuthorityId] = useState(0);
  const [api, setApi] = useState([]);
  const [apiAuthority, setApiAuthority] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [authority, setAuthority] = useState([]);
  const [currentRowData, setCurrentRowData] = useState<authorityTableData>();
  const [authorityBtnModalVisible, setAuthorityBtnModalVisible] =
    useState<boolean>(false);
  const [authorityBtns, setAuthorityBtns] = useState<any[]>([]);
  const [authorityBtnsSelected, setAuthorityBtnsSelected] = useState<any[]>([]);
  const [authorityBtnMenuID, setAuthorityBtnMenuID] = useState<number>(0);
  const [form] = Form.useForm();
  const [dataWithRoot, setDataWithRoot] = useState<any[]>([]);

  const { SHOW_ALL } = TreeSelect;

  // 模态框相关参数
  const [roleModal, setRoleModal] = useSetState<ModalType>({
    operateType: "add", // copy拷贝，add添加，up修改, addSub新增子角色
    nowData: null,
    modalShow: false,
    modalLoading: false,
  });

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 19 },
    },
  };

  const { Search } = Input;
  const CheckboxGroup = Checkbox.Group;

  // 分页相关参数
  const page: Page = {
    page: 1,
    pageSize: 999,
    total: 0,
  };

  const [loading, setLoading] = useState(false); // 数据是否正在加载中

  useMount(() => {
    onGetData(page);
  });

  /**
   * 添加/修改/新增自角色/拷贝 模态框出现
   * @param data 当前选中的那条数据
   * @param type add添加/up修改/copy拷贝/addSub新增子角色
   * **/
  const onModalShow = (
    data: authorityTableData | null,
    type: operateType
  ): void => {
    setRoleModal({
      modalShow: true,
      nowData: data,
      operateType: type,
    });
    // 用setTimeout是因为首次让Modal出现时得等它挂载DOM，不然form对象还没来得及挂载到Form上
    setTimeout(() => {
      if (type === "add") {
        // 新增，需重置表单各控件的值
        form.resetFields();
        form.setFieldsValue({
          parentId: 0,
          authorityId: 0,
        });
      } else if (data) {
        // 查看或修改，需设置表单各控件的值为当前所选中行的数据
        form.setFieldsValue({
          ...data,
        });
        if (type === "addSub") {
          form.setFieldsValue({
            parentId: data.authorityId,
          });
          form.setFieldsValue({
            authorityName: "",
          });
        }
      }
    });
  };

  // 获取所有的菜单列表
  const onGetMenuData = async (): Promise<void> => {
    if (!p.includes("role:power")) {
      return;
    }
    setLoading(true);
    try {
      const res = await dispatch.sys.getMenuList();
      if (res && res.code === 0) {
        setMenu(res.data.menus);
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } finally {
      setLoading(false);
    }
  };

  // 设置用户角色api
  const onSetApiAuthorityData = async (): Promise<void> => {
    if (!p.includes("role:power")) {
      return;
    }
    const params: { authorityId: number; casbinInfos: any[] } = {
      authorityId: authorityId,
      casbinInfos: apiAuthority,
    };
    setLoading(true);
    try {
      const res = await dispatch.sys.setApiAuthorityList(params);
      if (res && res.code === 0) {
        message.success("api设置成功!");
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } finally {
      setLoading(false);
    }
  };

  // 设置用户角色菜单
  const onSetMenuAuthorityData = async (): Promise<void> => {
    if (!p.includes("role:power")) {
      return;
    }
    const params: { authorityId: number; menus: any[] } = {
      authorityId: authorityId,
      menus: menuAuthority,
    };
    setLoading(true);
    try {
      const res = await dispatch.sys.setMenuAuthorityList(params);
      if (res && res.code === 0) {
        message.success("菜单设置成功!");
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } finally {
      setLoading(false);
    }
  };

  // 创建api树方法
  const buildApiTree = (apis): any => {
    const apiObj = {};
    apis &&
      apis.forEach((item) => {
        item.onlyId = "p:" + item.path + "m:" + item.method;
        if (Object.prototype.hasOwnProperty.call(apiObj, item.apiGroup)) {
          apiObj[item.apiGroup].push(item);
        } else {
          Object.assign(apiObj, { [item.apiGroup]: [item] });
        }
      });
    const apiTree = [];
    for (const key in apiObj) {
      const treeNode = {
        ID: key,
        description: key + "组",
        children: apiObj[key],
      };
      apiTree.push(treeNode);
    }
    return apiTree;
  };

  // 获取所有的api列表
  const onGetApiData = async (): Promise<void> => {
    if (!p.includes("role:power")) {
      return;
    }
    setLoading(true);
    try {
      const res = await dispatch.sys.getApiList();
      if (res && res.code === 0) {
        const apis = buildApiTree(res.data.apis);
        setApi(apis);
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } finally {
      setLoading(false);
    }
  };

  // 获取所有的角色api列表
  const onGetApiAuthorityData = async (params: {
    authorityId: number;
  }): Promise<void> => {
    if (!p.includes("role:power")) {
      return;
    }
    setLoading(true);
    try {
      const res = await dispatch.sys.getApiAuthorityList(params);
      // 垃圾代码，很丑的实现
      const resApi = await dispatch.sys.getApiList();
      if (resApi && resApi.code === 0) {
        if (res && res.code === 0) {
          const apiAuthorityData = [];
          res.data.paths.forEach((data) => {
            const apiData = resApi.data.apis.find((api) => {
              return api.path === data.path && api.method === data.method;
            });
            apiAuthorityData.push(apiData);
          });
          setApiAuthority(
            apiAuthorityData.filter((data) => {
              return data !== undefined;
            })
          );
        } else {
          message.error(res?.msg ?? "数据获取失败");
        }
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } finally {
      setLoading(false);
    }
  };

  // 获取所有的角色菜单列表
  const onGetMenuAuthorityData = async (params: {
    authorityId: number;
  }): Promise<void> => {
    if (!p.includes("role:power")) {
      return;
    }
    setLoading(true);
    try {
      const res = await dispatch.sys.getMenuAuthorityList(params);
      if (res && res.code === 0) {
        setMenuAuthority(res.data.menus);
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } finally {
      setLoading(false);
    }
  };

  // 函数 - 查询当前页面所需列表数据
  const onGetData = async (page: Page): Promise<void> => {
    if (!p.includes("role:query")) {
      return;
    }
    const params = {
      page: page.page,
      pageSize: page.pageSize,
    };
    setLoading(true);
    try {
      const res = await dispatch.sys.getAuthorityList(tools.clearNull(params));
      if (res && res.code === 0) {
        setData(res.data.list);
        //新增带根角色的树状数据
        const dataWithRootTmp = Array.from(res.data.list);
        dataWithRootTmp.push({
          authorityId: 0,
          authorityName: "根角色",
          children: [],
          dataAuthorityId: 0,
          defaultRouter: "",
          menus: null,
          parentId: 0,
        });
        setDataWithRoot(dataWithRootTmp);
        // 平铺资源角色数据
        const authoritiesData: any[] = [];
        roundAuthority(res.data.list, authoritiesData);
        setAuthorities(authoritiesData);
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } finally {
      setLoading(false);
    }
  };

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  // 设置用户角色权限
  const onCheck: TreeProps["onCheck"] = (checkedKeys, info) => {
    setMenuAuthority(info.checkedNodes);
  };

  // 设置用户角色api权限
  const onApiAuthorityCheck: TreeProps["onCheck"] = (checkedKeys, info) => {
    setApiAuthority(info.checkedNodes);
  };

  // 用户角色设置
  const onAuthorityChange = (checkedValues: CheckboxValueType[]) => {
    setAuthority(checkedValues);
  };

  // 全选用户角色
  const onAuthorityCheckAll = () => {
    setAuthority(
      authorities.map((data) => {
        return data.value;
      })
    );
  };

  // 选择用户本角色
  const onAuthorityCheckSelf = () => {
    setAuthority([authorityId]);
  };

  // 选择用户本角色及子角色
  const onAuthorityCheckSelfAndChild = () => {
    const authorityData = data.find((data) => {
      return data.authorityId === authorityId;
    });
    const authorities: any[] = [];
    roundAuthority([authorityData], authorities);
    setAuthority(
      authorities.map((data) => {
        return data.value;
      })
    );
  };

  //   平铺角色
  const roundAuthority = (authoritysData: any[], authorities: any[]) => {
    authoritysData.forEach((item) => {
      const obj: object = {};
      obj.value = item.authorityId;
      obj.label = item.authorityName;
      authorities.push(obj);
      if (item.children && item.children.length) {
        roundAuthority(item.children, authorities);
      }
    });
    return authorities;
  };

  // 更新角色默认首页
  const updateAuthorityDefaultIndex = async (data: {
    authorityId: any;
    AuthorityName: string | undefined;
    defaultRouter: any;
    parentId: any;
  }): Promise<void> => {
    setLoading(true);
    try {
      const res = await dispatch.sys.updateAuthorityDefaultIndex(data);
      if (res && res.code === 0) {
        message.success("设置成功");
        //刷新数据 ugly useage
        const currentData = currentRowData;
        if (currentData) {
          currentData.defaultRouter = data.defaultRouter;
        }
        setCurrentRowData(currentData);
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } finally {
      setLoading(false);
    }
  };

  // 分配角色按钮
  const handleOk = () => {
    setAuthorityBtn({
      authorityId: authorityId,
      menuID: authorityBtnMenuID,
      selected: authorityBtnsSelected,
    });
    setAuthorityBtnModalVisible(false);
  };

  // 分配角色取消按钮
  const handleCancel = () => {
    setAuthorityBtnModalVisible(false);
  };

  //设置用户角色按钮列表
  const setAuthorityBtn = async (params: {
    authorityId: number;
    menuID: number;
    selected: number[];
  }): Promise<void> => {
    setLoading(true);
    try {
      const res = await dispatch.sys.setAuthorityBtn(params);
      if (res && res.code === 0) {
        message.success("设置成功");
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } finally {
      setLoading(false);
    }
  };

  //获取用户角色分配的按钮列表
  const getAuthorityBtn = async (params: {
    authorityId: number;
    menuID: number;
  }): Promise<void> => {
    setLoading(true);
    try {
      const res = await dispatch.sys.getAuthorityBtn(params);
      if (res && res.code === 0) {
        setAuthorityBtnsSelected(res.data.selected);
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } finally {
      setLoading(false);
    }
  };

  // 为角色用户分配按钮权限
  const onSetAuthorityBtn = async (nodeData: any): Promise<void> => {
    setAuthorityBtnModalVisible(true);
    setAuthorityBtns(nodeData.menuBtn);
    getAuthorityBtn({ authorityId: authorityId, menuID: nodeData.ID });
    setAuthorityBtnMenuID(nodeData.ID);
  };

  //用户选择角色按钮列表事件
  const authorityBtnrowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      setAuthorityBtnsSelected(
        selectedRows.map((data) => {
          return data.ID;
        })
      );
    },
  };

  //角色模态框提交数据
  const onRoleModalOk = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      setRoleModal({
        modalLoading: true,
      });
      const params: {
        authorityId: number;
        parentId: number;
        authorityName: string;
      } = {
        authorityId: values.authorityId,
        parentId: values.parentId,
        authorityName: values.authorityName,
      };
      try {
        if (
          roleModal.operateType === "add" ||
          roleModal.operateType == "addSub"
        ) {
          const res = await dispatch.sys.createAuthority(params);
          if (res && res.code === 0) {
            message.success("添加成功!");
            //刷新数据
            onGetData(page);
            setRoleModal({
              modalShow: false,
              modalLoading: false,
            });
          } else {
            message.error(res?.msg ?? "数据获取失败");
          }
        } else if (roleModal.operateType == "copy") {
          const param1: {
            authority: {
              authorityId: number;
              parentId: number;
              authorityName: string;
              dataAuthorityId: any[];
            };
            oldAuthorityId: number;
          } = {
            authority: {
              authorityId: values.authorityId,
              parentId: values.parentId,
              authorityName: values.authorityName,
              dataAuthorityId: [roleModal.nowData],
            },
            oldAuthorityId: roleModal.nowData.authorityId,
          };
          const res = await dispatch.sys.copyAuthority(param1);
          if (res && res.code === 0) {
            message.success("复制成功!");
            //刷新数据
            onGetData(page);
            setRoleModal({
              modalShow: false,
              modalLoading: false,
            });
          } else {
            message.error(res?.msg ?? "数据获取失败");
          }
        } else {
          const res = await dispatch.sys.updateAuthority(params);
          if (res && res.code === 0) {
            message.success("更新成功!");
            //刷新数据
            onGetData(page);
            setRoleModal({
              modalShow: false,
              modalLoading: false,
            });
          } else {
            message.error(res?.msg ?? "数据获取失败");
          }
        }
      } finally {
        setRoleModal({
          modalLoading: false,
        });
      }
    } catch {}
  };

  //删除用户角色
  const onDeleteRoleChange = async (authorityId: number): Promise<void> => {
    try {
      const params: { authorityId: number } = {
        authorityId: authorityId,
      };
      const res = await dispatch.sys.deleteAuthority(params);
      if (res && res.code === 0) {
        message.success("删除成功!");
        //刷新数据
        onGetData(page);
        setRoleModal({
          modalShow: false,
          modalLoading: false,
        });
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } catch {}
  };

  // 删除角色确认模态框
  const onDeleteRole = async (authorityId: number): Promise<void> => {
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: "此操作将永久删除该角色, 是否继续?",
      onOk: () => {
        onDeleteRoleChange(authorityId);
      },
    });
  };

  // 角色模态框关闭
  const onRoleModalClose = async (): Promise<void> => {
    setRoleModal({
      modalShow: false,
    });
  };

  //设置用户角色及资源权限
  const setDataAuthority = async (): Promise<void> => {
    const dataAuthorityId: { authorityId: number }[] = [];
    authority.map((value) => {
      dataAuthorityId.push({ authorityId: value });
    });
    const params: {
      authorityId: number;
      dataAuthorityId: { authorityId: number }[];
    } = {
      authorityId: authorityId,
      dataAuthorityId: dataAuthorityId,
    };
    setLoading(true);
    try {
      const res = await dispatch.sys.setDataAuthority(params);
      if (res && res.code === 0) {
        message.success("资源设置成功");
        //刷新数据
        onGetData(page);
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } finally {
      setLoading(false);
    }
  };

  const authorityBtnColumns = [
    {
      title: "按钮名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "按钮备注",
      dataIndex: "desc",
      key: "desc",
    },
  ];

  const columns = [
    {
      title: "角色id",
      dataIndex: "authorityId",
      key: "authorityId",
      width: "30%",
    },
    {
      title: "角色名称",
      dataIndex: "authorityName",
      key: "authorityName",
      width: "30%",
    },
    {
      title: "操作",
      key: "operation",
      width: "40%",
      fixed: "right",
      render: (v: null, record: authorityTableData) => {
        const onClick = async (): Promise<void> => {
          onGetMenuAuthorityData({ authorityId: record.authorityId });
          setAuthorityId(record.authorityId);
          setAuthority(
            record.dataAuthorityId.map((data) => {
              return data.authorityId;
            })
          );
          onGetMenuData();
          onGetApiData();
          onGetApiAuthorityData({ authorityId: record.authorityId });
          setCurrentRowData(record);
          showDrawer();
        };
        const controls = [];
        p.includes("role:power") &&
          controls.push(
            <span key="0" className="control-btn blue" onClick={onClick}>
              <Tooltip placement="top" title="设置权限">
                <ToolOutlined />
                {/*<a>设置权限</a>*/}
              </Tooltip>
            </span>
          );
        p.includes("role:add") &&
          controls.push(
            <span
              key="1"
              className="control-btn blue"
              onClick={() => onModalShow(record, "addSub")}
            >
              <Tooltip placement="top" title="新增子角色">
                <SubnodeOutlined />
                {/*<a>新增子角色</a>*/}
              </Tooltip>
            </span>
          );
        p.includes("role:up") &&
          controls.push(
            <span
              key="2"
              className="control-btn blue"
              onClick={() => onModalShow(record, "copy")}
            >
              <Tooltip placement="top" title="拷贝">
                <CopyOutlined />
                {/*<a>拷贝</a>*/}
              </Tooltip>
            </span>
          );
        p.includes("role:up") &&
          controls.push(
            <span
              key="3"
              className="control-btn blue"
              onClick={() => onModalShow(record, "up")}
            >
              <Tooltip placement="top" title="编辑">
                <EditOutlined />
                {/*<a>编辑</a>*/}
              </Tooltip>
            </span>
          );
        p.includes("role:del") &&
          controls.push(
            <span
              key="4"
              className="control-btn red"
              onClick={() => {
                onDeleteRole(record.authorityId);
              }}
            >
              <Tooltip placement="top" title="删除">
                <DeleteOutlined />
                {/*<a>删除</a>*/}
              </Tooltip>
            </span>
          );
        const result: JSX.Element[] = [];
        controls.forEach((item, index) => {
          if (index) {
            result.push(<Divider key={`line${index}`} type="vertical" />);
          }
          result.push(item);
        });
        return result;
      },
    },
  ];

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "用户菜单",
      children:
        menu.length > 0 ? (
          <>
            <Search
              style={{ marginBottom: 8, width: "60%" }}
              placeholder="Search"
              disabled={true}
            />
            <Button
              type={"primary"}
              style={{ float: "right" }}
              onClick={onSetMenuAuthorityData}
            >
              确定
            </Button>
            <Tree
              defaultExpandAll
              checkable
              treeData={menu}
              checkedKeys={menuAuthority.map((data) => {
                return data.ID;
              })}
              onCheck={onCheck}
              titleRender={(nodeData: any) => {
                return (
                  <>
                    <Space>
                      <span>{nodeData.meta.title}</span>
                      <a
                        style={
                          !currentRowData ||
                          currentRowData.defaultRouter !== nodeData.name
                            ? { color: "#85ce61" }
                            : { color: "#E6A23C" }
                        }
                        onClick={() =>
                          updateAuthorityDefaultIndex({
                            AuthorityName: currentRowData?.authorityName,
                            authorityId: currentRowData?.authorityId,
                            defaultRouter: nodeData.name,
                            parentId: currentRowData?.parentId,
                          })
                        }
                      >
                        设为首页
                      </a>
                      {nodeData.menuBtn.length > 0 ? (
                        <a
                          type="primary"
                          onClick={() => onSetAuthorityBtn(nodeData)}
                        >
                          分配按钮
                        </a>
                      ) : (
                        ""
                      )}
                    </Space>
                  </>
                );
              }}
              fieldNames={{
                title: "meta.title",
                key: "ID",
                children: "children",
              }}
            />
          </>
        ) : (
          <div className="loading">
            <Spin />
          </div>
        ),
    },
    {
      key: "2",
      label: "角色api",
      children:
        api.length > 0 ? (
          <>
            <Search
              style={{ marginBottom: 8, width: "60%" }}
              placeholder="Search"
              disabled={true}
            />
            <Button
              type={"primary"}
              style={{ float: "right" }}
              onClick={onSetApiAuthorityData}
            >
              确定
            </Button>
            <Tree
              defaultExpandAll
              checkable
              treeData={api}
              checkedKeys={apiAuthority.map((data) => {
                return data.ID;
              })}
              onCheck={onApiAuthorityCheck}
              fieldNames={{
                title: "description",
                key: "ID",
                children: "children",
              }}
            />
          </>
        ) : (
          <div className="loading">
            <Spin />
          </div>
        ),
    },
    {
      key: "3",
      label: "资源权限",
      children: (
        <>
          <Alert
            message="此功能仅用于创建角色和角色的many2many关系表，具体使用还须自己结合表实现业务，详情参考示例代码（客户示例）。此功能不建议使用，建议使用插件市场【组织管理功能（点击前往）】来管理资源权限。"
            type="warning"
          />
          <Divider></Divider>
          <Space>
            <Button type={"primary"} onClick={onAuthorityCheckAll}>
              全选
            </Button>
            <Button type={"primary"} onClick={onAuthorityCheckSelf}>
              本角色
            </Button>
            <Button type={"primary"} onClick={onAuthorityCheckSelfAndChild}>
              本角色及子角色
            </Button>
          </Space>
          <Button
            type={"primary"}
            style={{ float: "right" }}
            onClick={setDataAuthority}
          >
            确定
          </Button>
          <Divider></Divider>
          <CheckboxGroup
            options={authorities}
            value={authority}
            onChange={onAuthorityChange}
          />
        </>
      ),
    },
  ];

  return data.length > 0 ? (
    <>
      <div>
        <div className="g-search">
          <ul className="search-func">
            <li>
              {p.includes("role:add") ? (
                <Button
                  type="primary"
                  icon={<PlusCircleOutlined />}
                  onClick={() => onModalShow(null, "add")}
                >
                  新增角色
                </Button>
              ) : (
                ""
              )}
            </li>
          </ul>
        </div>
        <div className="diy-table">
          <Table
            loading={loading}
            columns={columns}
            pagination={false}
            dataSource={data}
            rowKey={(record) => record.authorityId}
            defaultExpandAllRows={true}
          />
        </div>
        <Drawer
          width={"40%"}
          placement={"right"}
          closable={false}
          onClose={onClose}
          open={open}
          key={"right"}
        >
          <Card style={{ width: "100%" }}>
            <Tabs defaultActiveKey="1" items={items} />
          </Card>
        </Drawer>
        <Modal
          open={authorityBtnModalVisible}
          width={"40%"}
          title={"分配按钮"}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Table
            loading={loading}
            columns={authorityBtnColumns}
            dataSource={authorityBtns}
            rowKey={(record) => record.ID}
            rowSelection={{
              type: "checkbox",
              selectedRowKeys: authorityBtnsSelected,
              ...authorityBtnrowSelection,
            }}
            pagination={false}
          ></Table>
        </Modal>
        {/* 新增&修改&拷贝&新建子角色 模态框 */}
        <Modal
          title={
            {
              add: "新增角色",
              up: "编辑角色",
              copy: "拷贝角色",
              addSub: "新增子角色",
            }[roleModal.operateType]
          }
          open={roleModal.modalShow}
          onOk={onRoleModalOk}
          onCancel={onRoleModalClose}
          confirmLoading={roleModal.modalLoading}
        >
          <Form form={form}>
            <Form.Item
              label="父级角色"
              name="parentId"
              {...formItemLayout}
              rules={[
                {
                  required: true,
                  message: "必填",
                },
              ]}
            >
              <TreeSelect
                treeDefaultExpandAll
                style={{ width: "100%" }}
                treeData={dataWithRoot}
                showCheckedStrategy={SHOW_ALL}
                maxTagCount="responsive"
                disabled={
                  roleModal.operateType === "addSub" ||
                  roleModal.operateType === "add"
                }
                fieldNames={{
                  label: "authorityName",
                  value: "authorityId",
                  children: "children",
                }}
              ></TreeSelect>
            </Form.Item>
            <Form.Item
              label="角色ID"
              name="authorityId"
              {...formItemLayout}
              rules={[
                () => ({
                  validator: (rule, value) => {
                    const v = value;
                    if (v === 0) {
                      return Promise.reject("必须为大于1的正整数");
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="角色ID"
                min={1}
                disabled={roleModal.operateType === "up"}
              />
            </Form.Item>
            <Form.Item
              label="角色名称"
              name="authorityName"
              {...formItemLayout}
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "必填",
                },
                { max: 12, message: "最多输入12位字符" },
              ]}
            >
              <Input placeholder="角色名称" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  ) : (
    <div className="loading">
      <Spin />
    </div>
  );
}

export default AuthorityAdminContainer;
