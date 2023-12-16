/** User 系统管理/用户管理 **/

// ==================
// 所需的第三方库
// ==================
import React, { useState, useMemo } from "react";
import { useSetState, useMount } from "react-use";
import { useSelector, useDispatch } from "react-redux";
import {
  Form,
  Button,
  Input,
  Table,
  message,
  Popconfirm,
  Modal,
  Tooltip,
  Divider,
  Select,
  Switch,
  Cascader,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  ToolOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";

// ==================
// 所需的自定义的东西
// ==================
import tools from "@/util/tools"; // 工具函数

const { TextArea } = Input;
const { Option } = Select;

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
// 类型声明
// ==================
import {
  TableRecordData,
  Page,
  operateType,
  ModalType,
  RoleTreeInfo,
  UserBasicInfoParam,
  Res,
} from "./index.type";
import { RootState, Dispatch } from "@/store";

// ==================
// CSS
// ==================
import "./index.less";

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
  // const [role, setRole] = useSetState<RoleTreeInfo>({
  //   roleData: [],
  //   roleTreeLoading: false,
  //   roleTreeShow: false,
  //   roleTreeDefault: [],
  // });
  const [role, setRole] = useSetState({
    roleData: [],
    modalShow: false,
    modalLoading: false,
  });

  const { SHOW_CHILD } = Cascader;

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
  const setUserStatus = async (params: { ID: number; enable: number, email: string, headerImg: string,nickName: string, phone: string | number }): Promise<void> => {
    try {
      const res = await dispatch.sys.setUserStatus(params);
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

  // 函数 - 设置用户角色 bug需修复和权限菜单的联动
  const setUserAuthorities = async (params: { ID: number; authorityIds: number[] }): Promise<void> => {
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
      operateType: type
    });
    // 用setTimeout是因为首次让Modal出现时得等它挂载DOM，不然form对象还没来得及挂载到Form上
    setTimeout(() => {
      if (type === "add") {
        // 新增，需重置表单各控件的值
        form.resetFields();
      } else if (data) {
        // 查看或修改，需设置表单各控件的值为当前所选中行的数据
        form.setFieldsValue({
          ...data,
        });
      }
    });
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
      const params: UserBasicInfoParam = {
        username: values.username,
        password: values.password,
        phone: values.phone,
        email: values.email,
        desc: values.desc,
        enable: values.enable,
      };
      if (modal.operateType === "add") {
        // 新增
        try {
          const res: Res | undefined = await dispatch.sys.addUser(params);
          if (res && res.code === 0) {
            message.success("添加成功");
            onGetData(page);
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
        params.id = modal.nowData?.id;
        try {
          const res: Res | undefined = await dispatch.sys.upUser(params);
          if (res && res.code === 0) {
            message.success("修改成功");
            onGetData(page);
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

  // 删除某一条数据
  const onDel = async (id: number): Promise<void> => {
    setLoading(true);
    try {
      const res = await dispatch.sys.delUser({ id });
      if (res && res.code === 0) {
        message.success("删除成功");
        onGetData(page);
      } else {
        message.error(res?.msg ?? "操作失败");
      }
    } finally {
      setLoading(false);
    }
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
        return <img src={v} className={"header-img-box"}/>
      }
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
        const onChange = (value: number[][]) => {
          setUserAuthorities({ID: record.ID, authorityIds: value[0]});
        };
        const authorities: number[] = [];
        v.forEach( (authority) => {
          authorities.push(authority.authorityId);
        });
        return (
          <Cascader
          multiple={{ checkStrictly: true }}
          options={role.roleData}
          onChange={onChange}
          showCheckedStrategy={SHOW_CHILD}
          maxTagCount="responsive"
          defaultValue={authorities}
          expandTrigger={"hover"}
          fieldNames={{ label: 'authorityName', value: 'authorityId', children: 'children' }}
          />)
      }
    },
    {
      title: "状态",
      dataIndex: "enable",
      key: "enable",
      render: (v: number, record: TableRecordData): JSX.Element => {
        const onUserStatus = (checked: boolean) => {
          setUserStatus( {
            ID: record.ID,
            enable: checked ? 1 : 2,
            email: record.email,
            headerImg: record.headerImg,
            nickName: record.nickName,
            phone: record.phone,
          })
        };
        return <Switch checked={v === 1 ? true: false} onChange={onUserStatus}/>
      }
    },
    {
      title: "操作",
      key: "control",
      width: 200,
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
              </Tooltip>
            </span>
          );

        p.includes("user:del") &&
          u.ID !== record.ID &&
          controls.push(
            <Popconfirm
              key="3"
              title="确定删除吗?"
              onConfirm={() => onDel(record.ID)}
              okText="确定"
              cancelText="取消"
            >
              <span className="control-btn red">
                <Tooltip placement="top" title="删除">
                  <DeleteOutlined />
                </Tooltip>
              </span>
            </Popconfirm>
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
    tableColumns = tableColumns.filter( (data) => data.key !== "authorities")
  };
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
              { required: true, whitespace: true, message: "必填" },
              { max: 12, message: "最多输入12位字符" },
            ]}
          >
            <Input
              placeholder="请输入用户名"
              disabled={modal.operateType === "see"}
            />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            {...formItemLayout}
            rules={[
              { required: true, whitespace: true, message: "必填" },
              { min: 6, message: "最少输入6位字符" },
              { max: 18, message: "最多输入18位字符" },
            ]}
          >
            <Input.Password
              placeholder="请输入密码"
              disabled={modal.operateType === "see"}
            />
          </Form.Item>
          <Form.Item
            label="电话"
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
            label="昵称"
            name="nickName"
            {...formItemLayout}
            rules={[{ max: 100, message: "最多输入100个字符" }]}
          >
            <Input
              disabled={modal.operateType === "see"}
            />
          </Form.Item>
          <Form.Item
            label="状态"
            name="enable"
            {...formItemLayout}
            rules={[{ required: true, message: "请选择状态" }]}
          >
            <Select disabled={modal.operateType === "see"}>
              <Option key={1} value={1}>
                启用
              </Option>
              <Option key={-1} value={-1}>
                禁用
              </Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
}

export default UserAdminContainer;
