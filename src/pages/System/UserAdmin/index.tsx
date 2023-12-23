/** User 系统管理/用户管理 **/

// ==================
// 所需的第三方库
// ==================
import React, { useMemo, useState } from "react";
import { useMount, useSetState } from "react-use";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Pagination,
  Switch,
  Table,
  Tooltip,
  TreeSelect,
} from "antd";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  ToolOutlined,
} from "@ant-design/icons";

// ==================
// 所需的自定义的东西
// ==================
import tools from "@/util/tools"; // 工具函数
// ==================
// 类型声明
// ==================
import {
  ModalType,
  operateType,
  Page,
  Res,
  TableRecordData,
} from "./index.type";
import { Dispatch, RootState } from "@/store";

// ==================
// CSS
// ==================
import "./index.less";

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

// ==================
// 本组件
// ==================
function UserAdminContainer(): JSX.Element {
  const dispatch = useDispatch<Dispatch>();
  const userinfo = useSelector((state: RootState) => state.app.userinfo);
  const p = useSelector((state: RootState) => state.app.powersCode);

  const [form] = Form.useForm();
  const [data, setData] = useState<TableRecordData[]>([]); // 当前页面列表数据
  const [loading, setLoading] = useState(false); // 数据是否正在加载中
  const [switchValue, setSwitchValue] = useState(true);

  // 改变用户图像功能，未完成
  const [backgroundVisible, setBackgroundVisible] = useState(false);
  const [backgroundImagedata, setBackgroundImageData] = useState<any[]>([]); // 当前页面列表数据

  // 用户图像分页相关参数
  const [backgroundPage, setBackgroundPage] = useSetState<Page>({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  // 分页相关参数
  const [page, setPage] = useSetState<Page>({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  // 模态框相关参数
  const [modal, setModal] = useSetState<ModalType>({
    operateType: "add", // see查看，add添加，up修改
    nowData: null,
    modalShow: false,
    modalLoading: false,
  });

  // 角色树相关参数
  const [role, setRole] = useSetState({
    roleData: [],
    modalShow: false,
    modalLoading: false,
  });

  const { SHOW_ALL } = TreeSelect;

  // 生命周期 - 组件挂载时触发一次
  useMount(() => {
    onGetData(page);
    getAllAuthorityData();
  });

  // 函数 - 获取所有的角色数据，用于分配角色控件的原始数据
  const getAllAuthorityData = async (): Promise<void> => {
    try {
      const res = await dispatch.sys.getAllAuthority();
      if (res && res.code === 0) {
        setRole({ roleData: res.data.list });
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } catch {
      //
    }
  };

  // 函数 - 设置用户开启关闭状态
  const setUserStatus = async (params: {
    ID: number;
    enable: number;
    email: string;
    headerImg: string;
    nickName: string;
    userName: string;
    phone: string | number;
    password: string;
    authorityIds: number[];
  }): Promise<void> => {
    try {
      const res = await dispatch.sys.updateUserInfo(params);
      if (res && res.code === 0) {
        setRole({ roleData: res.data.list });
        message.success(params.enable === 1 ? "启用成功" : "禁用成功");
        onGetData(page);
        getAllAuthorityData();
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } catch {
      //
    }
  };

  // 函数 - 设置用户角色
  const setUserAuthorities = async (params: {
    ID: number;
    authorityIds: number[];
  }): Promise<void> => {
    try {
      const res = await dispatch.sys.setUserAuthorities(params);
      if (res && res.code === 0) {
        message.success("角色设置成功");
        onGetData(page);
        getAllAuthorityData();
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } catch {
      //
    }
  };

  // 函数 - 查询当前页面所需列表数据
  async function onGetBackgroundImageData(page: {
    page: number;
    pageSize: number;
  }): Promise<void> {
    if (!p.includes("user:query")) {
      return;
    }

    const params = {
      page: page.page,
      pageSize: page.pageSize,
    };
    setLoading(true);
    try {
      const res = await dispatch.sys.getBackgroundImageList(
        tools.clearNull(params)
      );
      if (res && res.code === 0) {
        setBackgroundImageData(res.data.list);
        setBackgroundPage({
          page: page.page,
          pageSize: page.pageSize,
          total: res.data.total,
        });
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } finally {
      setLoading(false);
    }
  }

  // 函数 - 查询当前页面所需列表数据
  async function onGetData(page: {
    page: number;
    pageSize: number;
  }): Promise<void> {
    if (!p.includes("user:query")) {
      return;
    }

    const params = {
      page: page.page,
      pageSize: page.pageSize,
    };
    setLoading(true);
    try {
      const res = await dispatch.sys.getUserList(tools.clearNull(params));
      if (res && res.code === 0) {
        setData(res.data.list);
        setPage({
          page: page.page,
          pageSize: page.pageSize,
          total: res.data.total,
        });
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } finally {
      setLoading(false);
    }
  }

  const onCancel = async (): Promise<void> => {
    setBackgroundVisible(false);
  };

  /**
   * 添加/修改/查看 模态框出现
   * @param data 当前选中的那条数据
   * @param type add添加/up修改/see查看
   * **/
  const onModalShow = (
    data: TableRecordData | null,
    type: operateType
  ): void => {
    setModal({
      modalShow: true,
      nowData: data,
      operateType: type,
    });
    // 用setTimeout是因为首次让Modal出现时得等它挂载DOM，不然form对象还没来得及挂载到Form上
    setTimeout(() => {
      if (data) {
        setSwitchValue(data.enable === 1);
      }
      if (type === "add") {
        // 新增，需重置表单各控件的值
        form.resetFields();
      } else if (data) {
        // 查看或修改，需设置表单各控件的值为当前所选中行的数据
        form.setFieldsValue({
          ...data,
        });
        const authorities: number[] = [];
        data.authorities.forEach((authority) => {
          authorities.push(authority.authorityId);
        });
        form.setFieldsValue({
          authorityIds: authorities,
        });
      }
    });
  };

  const onSwitchValueChange = async (checked: boolean) => {
    setSwitchValue(checked);
  };

  /** 模态框确定 **/
  const onOk = async (): Promise<void> => {
    if (modal.operateType === "see") {
      onClose();
      return;
    }
    try {
      const values = await form.validateFields();
      setModal({
        modalLoading: true,
      });
      const params: {
        ID: number;
        enable: number;
        email: string;
        headerImg: string;
        nickName: string;
        userName: string;
        phone: string | number;
        password: string;
        authorityIds: number[];
      } = {
        ID: 0,
        enable: 2,
        email: values.email,
        headerImg: values.headerImg,
        nickName: values.nickName,
        userName: values.userName,
        phone: values.phone,
        password: values.password,
        authorityIds: values.authorityIds,
      };
      if (values.enable) {
        params.enable = 1;
      }
      if (modal.operateType === "add") {
        // 新增
        try {
          const res: Res | undefined = await dispatch.sys.addUser(params);
          if (res && res.code === 0) {
            message.success("创建成功");
            onGetData(page);
            getAllAuthorityData();
            onClose();
          } else {
            message.error(res?.msg ?? "操作失败");
          }
        } finally {
          setModal({
            modalLoading: false,
          });
        }
      } else {
        // 修改
        params.ID = modal.nowData?.ID as number;
        try {
          const res: Res | undefined = await dispatch.sys.updateUserInfo(
            params
          );
          if (res && res.code === 0) {
            message.success("编辑成功");
            onGetData(page);
            getAllAuthorityData();
            onClose();
          } else {
            message.error(res?.msg ?? "操作失败");
          }
        } finally {
          setModal({
            modalLoading: false,
          });
        }
      }
    } catch {
      // 未通过校验
    }
  };

  //重置用户密码
  const onResetPasswordChange = async (id: number): Promise<void> => {
    setLoading(true);
    try {
      const res = await dispatch.sys.resetUserPassword({ ID: id });
      if (res && res.code === 0) {
        message.success("重置成功");
        onGetData(page);
        getAllAuthorityData();
      } else {
        message.error(res?.msg ?? "操作失败");
      }
    } finally {
      setLoading(false);
    }
  };

  //重置用户密码
  const onResetPassword = async (id: number): Promise<void> => {
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: "是否将此用户密码重置为123456?",
      onOk: () => {
        onResetPasswordChange(id);
      },
    });
  };

  // 删除某一条数据
  const onDelUser = async (id: number): Promise<void> => {
    setLoading(true);
    try {
      const res = await dispatch.sys.delUser({ id });
      if (res && res.code === 0) {
        message.success("删除成功");
        onGetData(page);
        getAllAuthorityData();
      } else {
        message.error(res?.msg ?? "操作失败");
      }
    } finally {
      setLoading(false);
    }
  };

  //删除用户
  const onDel = async (id: number): Promise<void> => {
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: "确定删除吗?",
      onOk: () => {
        onDelUser(id);
      },
    });
  };

  /** 模态框关闭 **/
  const onClose = () => {
    setModal({
      modalShow: false,
    });
  };

  // 表格页码改变
  const onTablePageChange = (page: number, pageSize: number): void => {
    onGetData({ page, pageSize });
  };

  // 获取用户头像数据页码改变
  const onBackgroundImageChangePage = async (
    page: number,
    pageSize: number
  ): Promise<void> => {
    onGetBackgroundImageData({ page, pageSize });
  };

  // ==================
  // 属性 和 memo
  // ==================

  // table字段
  let tableColumns = [
    {
      title: "头像",
      dataIndex: "headerImg",
      key: "headerImg",
      render: (v: null) => {
        return <img src={v} className={"header-img-box"} />;
      },
    },
    {
      title: "ID",
      dataIndex: "serial",
      key: "serial",
    },
    {
      title: "用户名",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "昵称",
      dataIndex: "nickName",
      key: "nickName",
    },
    {
      title: "手机号",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "用户角色",
      dataIndex: "authorities",
      key: "authorities",
      render: (v: any, record: TableRecordData): JSX.Element => {
        const onChange = (value: number[]) => {
          setUserAuthorities({ ID: record.ID, authorityIds: value });
        };
        const authorities: number[] = [];
        v.forEach((authority) => {
          authorities.push(authority.authorityId);
        });
        return (
          <TreeSelect
            multiple
            allowClear
            treeDefaultExpandAll
            style={{ width: "100%" }}
            treeData={role.roleData}
            onChange={onChange}
            showCheckedStrategy={SHOW_ALL}
            maxTagCount="responsive"
            value={authorities}
            fieldNames={{
              label: "authorityName",
              value: "authorityId",
              children: "children",
            }}
          />
        );
      },
    },
    {
      title: "状态",
      dataIndex: "enable",
      key: "enable",
      render: (v: number, record: TableRecordData): JSX.Element => {
        const onUserStatus = (checked: boolean) => {
          setUserStatus({
            ID: record.ID,
            enable: checked ? 1 : 2,
            email: record.email,
            headerImg: record.headerImg,
            userName: record.userName,
            nickName: record.nickName,
            phone: record.phone,
            password: "",
            authorityIds: [],
          });
        };
        return (
          <Switch checked={v === 1 ? true : false} onChange={onUserStatus} />
        );
      },
    },
    {
      title: "操作",
      key: "control",
      width: "20%",
      render: (v: null, record: TableRecordData) => {
        const controls = [];
        const u = userinfo.userBasicInfo || { ID: -1 };
        p.includes("user:query") &&
          controls.push(
            <span
              key="0"
              className="control-btn green"
              onClick={() => onModalShow(record, "see")}
            >
              <Tooltip placement="top" title="查看">
                <EyeOutlined />
                {/*<a>查看</a>*/}
              </Tooltip>
            </span>
          );
        p.includes("user:up") &&
          controls.push(
            <span
              key="1"
              className="control-btn blue"
              onClick={() => onModalShow(record, "up")}
            >
              <Tooltip placement="top" title="修改">
                <ToolOutlined />
                {/*<a>修改</a>*/}
              </Tooltip>
            </span>
          );

        p.includes("user:resetpass") &&
          controls.push(
            <span
              key="2"
              className="control-btn blue"
              onClick={() => onResetPassword(record.ID)}
            >
              <Tooltip placement="top" title="重置密码">
                <ReloadOutlined />
                {/*<a>重置密码</a>*/}
              </Tooltip>
            </span>
          );

        p.includes("user:del") &&
          u.ID !== record.ID &&
          controls.push(
            <span className="control-btn red" onClick={() => onDel(record.ID)}>
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

  // 用户角色权限设置
  if (!p.includes("user:role")) {
    tableColumns = tableColumns.filter((data) => data.key !== "authorities");
  }
  // table列表所需数据
  const tableData = useMemo(() => {
    return data.map((item, index) => {
      return {
        key: index,
        ID: item.ID,
        serial: index + 1 + (page.page - 1) * page.pageSize,
        userName: item.userName,
        password: item.password,
        phone: item.phone,
        email: item.email,
        nickName: item.nickName,
        enable: item.enable,
        control: item.ID,
        roles: item.roles,
        headerImg: item.headerImg,
        authorities: item.authorities,
      };
    });
  }, [page, data]);

  const backgroundOnChange = async (name, value: string): Promise<void> => {
    console.log(name, value);
  };

  return (
    <div>
      <div className="g-search">
        <ul className="search-func">
          <li>
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              disabled={!p.includes("user:add")}
              onClick={() => onModalShow(null, "add")}
            >
              添加用户
            </Button>
          </li>
        </ul>
      </div>
      <div className="diy-table">
        <Table
          columns={tableColumns}
          loading={loading}
          dataSource={tableData}
          rowKey={(record) => {
            return record.key;
          }}
          pagination={{
            total: page.total,
            current: page.page,
            pageSize: page.pageSize,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条数据`,
            onChange: onTablePageChange,
          }}
        />
      </div>

      <Modal
        open={backgroundVisible}
        footer={
          <Pagination
            current={backgroundPage.page}
            defaultPageSize={backgroundPage.pageSize}
            total={backgroundPage.total}
            size="large"
            onChange={onBackgroundImageChangePage}
          />
        }
        onCancel={onCancel}
      ></Modal>

      {/* 新增&修改&查看 模态框 */}
      <Modal
        title={{ add: "新增", up: "修改", see: "查看" }[modal.operateType]}
        open={modal.modalShow}
        onOk={onOk}
        onCancel={onClose}
        confirmLoading={modal.modalLoading}
      >
        <Form
          form={form}
          initialValues={{
            enable: 1,
          }}
        >
          <Form.Item
            label="用户名"
            name="userName"
            {...formItemLayout}
            rules={[
              {
                required: modal.operateType === "add" ? true : false,
                whitespace: true,
                message: "必填",
              },
              { max: 12, message: "最多输入12位字符" },
            ]}
          >
            <Input
              placeholder="请输入用户名"
              disabled={
                modal.operateType === "see" || modal.operateType === "up"
              }
            />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            {...formItemLayout}
            rules={[
              {
                required: modal.operateType === "add" ? true : false,
                whitespace: true,
                message: "必填",
              },
              { min: 6, message: "最少输入6位字符" },
              { max: 18, message: "最多输入18位字符" },
            ]}
            style={{ display: modal.operateType !== "add" ? "none" : "" }}
          >
            <Input.Password
              placeholder="请输入密码"
              disabled={modal.operateType === "see"}
            />
          </Form.Item>
          <Form.Item
            label="昵称"
            name="nickName"
            {...formItemLayout}
            rules={[
              { required: modal.operateType === "add" ? true : false },
              { max: 100, message: "最多输入100个字符" },
            ]}
          >
            <Input disabled={modal.operateType === "see"} />
          </Form.Item>
          <Form.Item
            label="手机号"
            name="phone"
            {...formItemLayout}
            rules={[
              () => ({
                validator: (rule, value) => {
                  const v = value;
                  if (v) {
                    if (!tools.checkPhone(v)) {
                      return Promise.reject("请输入有效的手机号码");
                    }
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input
              placeholder="请输入手机号"
              maxLength={11}
              disabled={modal.operateType === "see"}
            />
          </Form.Item>
          <Form.Item
            label="邮箱"
            name="email"
            {...formItemLayout}
            rules={[
              () => ({
                validator: (rule, value) => {
                  const v = value;
                  if (v) {
                    if (!tools.checkEmail(v)) {
                      return Promise.reject("请输入有效的邮箱地址");
                    }
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input
              placeholder="请输入邮箱地址"
              disabled={modal.operateType === "see"}
            />
          </Form.Item>
          <Form.Item
            label="用户角色"
            name="authorityIds"
            {...formItemLayout}
            rules={[{ required: modal.operateType !== "see" }]}
            disabled={modal.operateType === "see"}
          >
            <TreeSelect
              multiple
              allowClear
              treeDefaultExpandAll
              style={{ width: "100%" }}
              treeData={role.roleData}
              showCheckedStrategy={SHOW_ALL}
              maxTagCount="responsive"
              fieldNames={{
                label: "authorityName",
                value: "authorityId",
                children: "children",
              }}
            />
          </Form.Item>
          <Form.Item
            label="启用"
            name="enable"
            {...formItemLayout}
            disabled={modal.operateType === "see"}
          >
            <Switch
              checked={switchValue}
              disabled={modal.operateType === "see"}
              onChange={onSwitchValueChange}
            />
          </Form.Item>
          <Form.Item
            label="头像"
            name="headerImg"
            {...formItemLayout}
            disabled={modal.operateType === "see"}
          >
            <>
              <img
                alt="头像"
                className="header-img-box-content"
                src={modal.nowData?.headerImg}
                style={{
                  display:
                    modal.operateType === "add" ||
                    modal.nowData?.headerImg === ""
                      ? "none"
                      : "",
                }}
              />
              <div
                className="header-img-box-content"
                style={{ display: modal.operateType !== "add" ? "none" : "" }}
              >
                从媒体库选择
              </div>
            </>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UserAdminContainer;
