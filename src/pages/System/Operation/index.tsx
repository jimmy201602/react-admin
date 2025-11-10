import {
  Button,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Popover,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "@/store";
import {
  Page,
  SearchInfo,
  TableRecordData,
} from "@/pages/System/Operation/index.type";
import tools from "@/util/tools";
import { useMount, useSetState } from "react-use";

import "./index.less";

function OperationAdminContainer(): JSX.Element {
  const dispatch = useDispatch<Dispatch>();
  const p = useSelector((state: RootState) => state.app.powersCode);
  const [form] = Form.useForm();
  const [data, setData] = useState<TableRecordData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInfo, setSearchInfo] = useSetState<SearchInfo>({
    status: undefined, // 状态码
    method: undefined, // 请求方法
    path: undefined, // 请求路径
  });
  const [selectedRows, setSelectedRows] = useState<TableRecordData[]>([]);

  // 分页相关参数
  const [page, setPage] = useSetState<Page>({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  useMount(() => {
    onGetData(page);
  });

  //批量删除用户操作日志
  const onDeleteBatchOperationChange = async (datas: TableRecordData[]) => {
    try {
      const params: { ids: number[] } = {
        ids: datas.map((data) => {
          return data.ID;
        }),
      };
      const res = await dispatch.sys.deleteSysOperationRecordByIds(params);
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

  //批量删除选择的数据
  const onDeleteBatchChange = async (): Promise<void> => {
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: "确定要删除吗?",
      onOk: () => {
        onDeleteBatchOperationChange(selectedRows);
      },
    });
  };

  //删除单条用户操作日志
  const onDeleteOperationChange = async (id: number) => {
    try {
      const params: { ID: number } = { ID: id };
      const res = await dispatch.sys.deleteSysOperationRecord(params);
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

  //删除单条选择的数据
  const onDeleteChange = async (id: number): Promise<void> => {
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: "确定要删除吗?",
      onOk: () => {
        onDeleteOperationChange(id);
      },
    });
  };

  // 搜索用户信息
  const onSearchChange = async (): Promise<void> => {
    onGetData({
      page: page.page,
      pageSize: page.pageSize,
    });
  };

  // 重置用户搜索信息
  const onResetSearchChange = async (): Promise<void> => {
    form.resetFields();
    setSearchInfo({
      method: undefined,
      status: undefined,
      path: undefined,
    });
    form.setFieldsValue({
      method: null,
      status: null,
      path: null,
    });
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

  // 搜索 - 状态码输入框值改变时触发
  const searchStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInfo({ status: e.target.value });
  };

  // 搜索 - 请求方法输入框值改变时触发
  const searchMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInfo({ method: e.target.value });
  };

  // 搜索 - 请求路径输入框值改变时触发
  const searchPathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInfo({ path: e.target.value });
  };

  //用户选择角色按钮列表事件
  const rowDataSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      setSelectedRows(selectedRows);
    },
  };

  //格式化json数据
  const fmtbody = (value) => {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  };

  // 函数 - 查询当前页面所需列表数据
  const onGetData = async (page: {
    page: number;
    pageSize: number;
  }): Promise<void> => {
    if (!p.includes("operation:query")) {
      return;
    }
    const params: {
      page: number;
      pageSize: number;
      status: string | undefined;
      method: string | undefined;
      path: string | undefined;
    } = {
      page: page.page,
      pageSize: page.pageSize,
      status: searchInfo.status,
      method: searchInfo.method,
      path: searchInfo.path,
    };
    setLoading(true);
    try {
      const res = await dispatch.sys.getSysOperationRecordList(
        tools.clearNull(params)
      );
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

  let columns = [
    {
      title: "操作人",
      dataIndex: "user",
      key: "user",
      render: (v: null, record: TableRecordData) => {
        return `${record.user.userName}(${record.user.nickName})`;
      },
    },
    {
      title: "日期",
      dataIndex: "CreatedAt",
      key: "CreatedAt",
      render: (v: null, record: TableRecordData) => {
        return tools.formatDate(record.CreatedAt);
      },
    },
    {
      title: "状态码",
      dataIndex: "status",
      key: "status",
      render: (v: null, record: TableRecordData) => {
        return (
          <Tag color={record.status === 200 ? "success" : "warning"}>
            {record.status}
          </Tag>
        );
      },
    },
    {
      title: "请求IP",
      dataIndex: "ip",
      key: "ip",
    },
    {
      title: "请求方法",
      dataIndex: "method",
      key: "method",
    },
    {
      title: "请求路径",
      dataIndex: "path",
      key: "path",
    },
    {
      title: "请求",
      dataIndex: "body",
      key: "body",
      render: (v: null, record: TableRecordData) => {
        return (
          <Popover
            content={() => {
              return (
                <div className="popover-box">
                  <pre>{fmtbody(record.body)}</pre>
                </div>
              );
            }}
            placement="leftTop"
            trigger="click"
          >
            <InfoCircleOutlined />
          </Popover>
        );
      },
    },
    {
      title: "响应",
      dataIndex: "resp",
      key: "resp",
      render: (v: null, record: TableRecordData) => {
        return (
          <Popover
            content={() => {
              return (
                <div className="popover-box">
                  <pre>{fmtbody(record.resp)}</pre>
                </div>
              );
            }}
            placement="leftTop"
            trigger="click"
          >
            <InfoCircleOutlined />
          </Popover>
        );
      },
    },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      render: (v: null, record: TableRecordData) => {
        return (
          <span
            key="4"
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
      },
    },
  ];

  // 如果用户没有删除操作日志权限，不予显示
  if (!p.includes("operation:del")) {
    columns = columns.filter((data) => data.key !== "action");
  }

  return (
    <div>
      <div className="g-search">
        {p.includes("operation:del") && (
          <ul className="search-func">
            <li>
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                disabled={selectedRows.length === 0}
                onClick={onDeleteBatchChange}
              >
                删除
              </Button>
            </li>
          </ul>
        )}
        {p.includes("operation:del") && <Divider type="vertical" />}
        {p.includes("operation:query") && (
          <ul className="search-ul">
            <Form layout={"inline"} form={form}>
              <Form.Item label={"请求方法"} name={"method"}>
                <Input
                  placeholder="搜索条件"
                  value={searchInfo.method}
                  onChange={searchMethodChange}
                />
              </Form.Item>
              <Form.Item label={"请求路径"} name={"path"}>
                <Input
                  placeholder="搜索条件"
                  value={searchInfo.path}
                  onChange={searchPathChange}
                />
              </Form.Item>
              <Form.Item label={"结果状态码"} name={"status"}>
                <Input
                  placeholder="搜索条件"
                  value={searchInfo.status}
                  onChange={searchStatusChange}
                />
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
          </ul>
        )}
      </div>
      <div className="diy-table">
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
        ></Table>
      </div>
    </div>
  );
}

export default OperationAdminContainer;
