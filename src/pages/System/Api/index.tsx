import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "@/store";
import {
  Button,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table, Tooltip,
} from "antd";
import React, { useState } from "react";
import {
  ModalType,
  operateType,
  Page,
  SearchInfo,
  TableRecordData,
} from "@/pages/System/Api/index.type";
import { useMount, useSetState } from "react-use";
import {
  DeleteOutlined, EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import tools from "@/util/tools";

function ApiAdminContainer(): JSX.Element {
  const dispatch = useDispatch<Dispatch>();
  const p = useSelector((state: RootState) => state.app.powersCode);
  const [form] = Form.useForm();
  const [formApi] = Form.useForm();
  const [data, setData] = useState<TableRecordData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInfo, setSearchInfo] = useSetState<SearchInfo>({
    path: undefined, //请求路径
    apiGroup: undefined, // api组
    desc: false, // 是否倒序
    description: undefined, // 描述
    method: undefined, // 请求方式
    orderKey: undefined, // 排序的key
  });
  // 模态框相关参数
  const [apiModal, setApiModal] = useSetState<ModalType>({
    operateType: "add", // copy拷贝，add添加，up修改, addSub新增子角色
    nowData: null,
    modalShow: false,
    modalLoading: false,
  });

  const [selectedRows, setSelectedRows] = useState<TableRecordData[]>([]);

  useMount(() => {
    onGetData(page);
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

  // 分页相关参数
  const [page, setPage] = useSetState<Page>({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  // 函数 - 查询当前页面所需列表数据
  const onGetData = async (page: {
    page: number;
    pageSize: number;
  }): Promise<void> => {
    if (!p.includes("api:query")) {
      return;
    }
    const params: {
      orderKey: string | undefined;
      path: string | undefined;
      apiGroup: string | undefined;
      method: string | undefined;
      pageSize: number;
      description: string | undefined;
      page: number;
      desc: boolean;
    } = {
      page: page.page,
      pageSize: page.pageSize,
      apiGroup: searchInfo.apiGroup,
      desc: searchInfo.desc,
      description: searchInfo.description,
      method: searchInfo.method,
      orderKey: searchInfo.orderKey,
      path: searchInfo.path,
    };
    setLoading(true);
    try {
      const res = await dispatch.sys.getApiList(tools.clearNull(params));
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
  };

  // 表格页码改变
  const onTablePageChange = (page: number, pageSize: number): void => {
    setPage((prevState) => {
      prevState.page = page;
      prevState.pageSize = pageSize;
      return prevState;
    });
    onGetData({
      page: page,
      pageSize: pageSize,
    });
  };

  //用户选择api按钮列表事件
  const rowDataSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      setSelectedRows(selectedRows);
    },
  };

  // 重置用户api搜索信息
  const onResetSearchChange = async (): Promise<void> => {
    form.resetFields();
    setSearchInfo({
      path: undefined,
      description: undefined,
      apiGroup: undefined,
      method: undefined,
    });
    form.setFieldsValue({
      path: null,
      description: null,
      apiGroup: null,
      method: null,
    });
  };

  // 搜索api信息
  const onSearchChange = async (): Promise<void> => {
    const values = await form.validateFields();
    setSearchInfo((prevState) => {
      prevState.path = values.path;
      prevState.description = values.description;
      prevState.apiGroup = values.apiGroup;
      prevState.method = values.method;
      return prevState;
    });
    onGetData({
      page: page.page,
      pageSize: page.pageSize,
    });
  };

  const handleChange = (pagination, filters, sorter) => {
    setSearchInfo((prevState) => {
      prevState.desc = true ? sorter.order === "descend" : false;
      prevState.orderKey = sorter.columnKey;
      return prevState;
    });
    onGetData({
      page: page.page,
      pageSize: page.pageSize,
    });
  };

  //批量删除api
  const onDeleteBatchApiChange = async (datas: TableRecordData[]) => {
    try {
      const params: { ids: number[] } = {
        ids: datas.map((data) => {
          return data.ID;
        }),
      };
      const res = await dispatch.sys.deleteApisByIds(params);
      if (res && res.code === 0) {
        message.success("删除成功!");
        //刷新数据
        onGetData({
          page: page.page,
          pageSize: page.pageSize,
        });
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } catch {}
  };

  //批量删除选择的api数据
  const onDeleteBatchChange = async (): Promise<void> => {
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: "确定要删除吗?",
      onOk: () => {
        onDeleteBatchApiChange(selectedRows);
      },
    });
  };

  //删除单条api数据
  const onDeleteApiChange = async (id: number) => {
    try {
      const params: { ID: number } = { ID: id };
      const res = await dispatch.sys.deleteApi(params);
      if (res && res.code === 0) {
        message.success("删除成功!");
        //刷新数据
        onGetData({
          page: page.page,
          pageSize: page.pageSize,
        });
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } catch {
    }
  };

  //删除单条api数据
  const onDeleteChange = async (id: number): Promise<void> => {
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: "此操作将永久删除所有角色下该api, 是否继续?",
      onOk: () => {
        onDeleteApiChange(id);
      },
    });
  };

  //刷新casbin缓存
  const onFreshCasbinChange = async (): Promise<void> => {
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: "确定要刷新Casbin缓存吗？",
      onOk: async () => {
        try {
          const res = await dispatch.sys.freshCasbin();
          if (res && res.code === 0) {
            message.success("刷新成功!");
            //刷新数据
            onGetData({
              page: page.page,
              pageSize: page.pageSize,
            });
          } else {
            message.error(res?.msg ?? "数据获取失败");
          }
        } catch {
        }
      },
    });
  };

  /**
   * 新增/修改 模态框出现
   * @param data 当前选中的那条数据
   * @param type add添加/up修改
   * **/
  const onModalShow = (
    data: TableRecordData | null,
    type: operateType
  ): void => {
    setApiModal({
      modalShow: true,
      nowData: data,
      operateType: type,
    });
    // 用setTimeout是因为首次让Modal出现时得等它挂载DOM，不然form对象还没来得及挂载到Form上
    setTimeout(() => {
      if (type === "add") {
        // 新增，需重置表单各控件的值
        formApi.resetFields();
      } else if (data) {
        // 查看或修改，需设置表单各控件的值为当前所选中行的数据
        formApi.setFieldsValue({
          ...data,
        });
      }
    });
  };

  //角色模态框提交数据
  const onRoleModalOk = async (): Promise<void> => {
    try {
      const values = await formApi.validateFields();
      setApiModal({
        modalLoading: true,
      });
      const params: {
        apiGroup: string;
        description: string;
        method: string;
        path: string;
      } = {
        apiGroup: values.apiGroup,
        description: values.description,
        method: values.method,
        path: values.path,
      };
      try {
        if (apiModal.operateType === "add") {
          const res = await dispatch.sys.createApi(params);
          if (res && res.code === 0) {
            message.success("添加成功!");
            //刷新数据
            onGetData({
              page: page.page,
              pageSize: page.pageSize,
            });
            setApiModal({
              modalShow: false,
              modalLoading: false,
            });
          } else {
            message.error(res?.msg ?? "数据获取失败");
          }
        } else {
          const res = await dispatch.sys.updateApi(params);
          if (res && res.code === 0) {
            message.success("更新成功!");
            //刷新数据
            onGetData(page);
            setApiModal({
              modalShow: false,
              modalLoading: false,
            });
          } else {
            message.error(res?.msg ?? "数据获取失败");
          }
        }
      } finally {
        setApiModal({
          modalLoading: false,
        });
      }
    } catch {}
  };

  const columns = [
    {
      title: "id",
      dataIndex: "ID",
      key: "id",
      sorter: true,
    },
    {
      title: "API路径",
      dataIndex: "path",
      key: "path",
      sorter: true,
    },
    {
      title: "API分组",
      dataIndex: "apiGroup",
      key: "api_group",
      sorter: true,
    },
    {
      title: "API简介",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      sorter: true,
    },
    {
      title: "请求方式",
      dataIndex: "method",
      key: "method",
      sorter: true,
    },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      render: (v: null, record: TableRecordData) => {
        const controls = [];
        p.includes("api:up") &&
        controls.push(
          <span
            key="1"
            className="control-btn blue"
            onClick={() => onModalShow(record, "up")}
          >
              <Tooltip placement="top" title="编辑">
                <EditOutlined />
                {/*<a>编辑</a>*/}
              </Tooltip>
            </span>
        );
        p.includes("api:del") &&
        controls.push(
          <span
            key="2"
            className="control-btn red"
            onClick={() => {
              onDeleteChange(record.ID);
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
        return result
      },
    },
  ];

  return (
    <div>
      <div className="g-search">
        {p.includes("api:query") && (
          <Form layout={"inline"} form={form}>
            <Form.Item label={"请求路径"} name={"path"}>
              <Input placeholder="路径" value={searchInfo.path} />
            </Form.Item>
            <Form.Item label={"描述"} name={"description"}>
              <Input placeholder="描述" value={searchInfo.description} />
            </Form.Item>
            <Form.Item label={"API组"} name={"apiGroup"}>
              <Input placeholder="api组" value={searchInfo.apiGroup} />
            </Form.Item>
            <Form.Item label={"请求方式"} name={"method"}>
              <Select
                placeholder="请选择"
                allowClear
                style={{ width: "200px" }}
                value={searchInfo.method}
              >
                <Select.Option value={"POST"}>创建(POST)</Select.Option>
                <Select.Option value={"GET"}>查看(GET)</Select.Option>
                <Select.Option value={"PUT"}>更新(PUT)</Select.Option>
                <Select.Option value={"DELETE"}>删除(DELETE)</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={onSearchChange}
              >
                搜索
              </Button>
            </Form.Item>
            <Form.Item>
              <Button
                type="default"
                icon={<ReloadOutlined />}
                onClick={onResetSearchChange}
              >
                重置
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
      {(p.includes("api:del") || p.includes("api:add")) && <Divider />}
      <Space>
        {p.includes("api:del") && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => onModalShow(null, "add")}
          >
            新增
          </Button>
        )}
        {p.includes("api:add") && <Divider type="vertical" />}
        {p.includes("api:del") && (
          <Button
            type="danger"
            icon={<DeleteOutlined />}
            disabled={selectedRows.length === 0}
            onClick={onDeleteBatchChange}
          >
            删除
          </Button>
        )}
        {p.includes("api:casbinfresh") && (
          <Button
            type="default"
            icon={<ReloadOutlined />}
            onClick={onFreshCasbinChange}
          >
            刷新缓存
          </Button>
        )}
      </Space>
      {(p.includes("api:query") || p.includes("api:del")) && (
        <div className="diy-table">
          {(p.includes("api:add") || p.includes("api:del")) && (
            <Divider type="vertical" />
          )}
          <Table
            loading={loading}
            columns={columns}
            dataSource={data}
            rowKey={(record) => record.ID}
            rowSelection={{
              type: "checkbox",
              ...rowDataSelection,
            }}
            pagination={{
              total: page.total,
              current: page.page,
              pageSize: page.pageSize,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条数据`,
              onChange: (page, pageSize) => onTablePageChange(page, pageSize),
            }}
            onChange={handleChange}
          ></Table>
        </div>
      )}
      <Modal
        open={apiModal.modalShow}
        title={
          {
            add: "新增Api",
            up: "编辑Api",
          }[apiModal.operateType]
        }
        confirmLoading={apiModal.modalLoading}
        onCancel={() => {
          setApiModal({ modalShow: false });
        }}
        onOk={onRoleModalOk}
      >
        <Form form={formApi}>
          <Form.Item
            label={"请求路径"}
            name={"path"}
            rules={[
              {
                required: true,
                message: "必填",
              },
            ]}
            {...formItemLayout}
          >
            <Input placeholder="路径" value={searchInfo.path} />
          </Form.Item>
          <Form.Item
            label={"描述"}
            name={"description"}
            rules={[
              {
                required: true,
                message: "必填",
              },
            ]}
            {...formItemLayout}
          >
            <Input placeholder="描述" value={searchInfo.description} />
          </Form.Item>
          <Form.Item
            label={"API组"}
            name={"apiGroup"}
            rules={[
              {
                required: true,
                message: "必填",
              },
            ]}
            {...formItemLayout}
          >
            <Input placeholder="api组" value={searchInfo.apiGroup} />
          </Form.Item>
          <Form.Item
            label={"请求方式"}
            rules={[
              {
                required: true,
                message: "必填",
              },
            ]}
            name={"method"}
            {...formItemLayout}
          >
            <Select placeholder="请选择" allowClear value={searchInfo.method}>
              <Select.Option value={"POST"}>创建(POST)</Select.Option>
              <Select.Option value={"GET"}>查看(GET)</Select.Option>
              <Select.Option value={"PUT"}>更新(PUT)</Select.Option>
              <Select.Option value={"DELETE"}>删除(DELETE)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ApiAdminContainer;
