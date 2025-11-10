import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "@/store";
import React, { useEffect, useState } from "react";
import {
  menuTableData,
  Page,
  ModalType,
  operateType,
} from "@/pages/System/Menu/index.type";
import tools from "@/util/tools";
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tooltip,
  TreeSelect,
} from "antd";
import { useMount, useSetState } from "react-use";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusCircleOutlined,
  SubnodeOutlined,
} from "@ant-design/icons";
import "./index.less";
import { IconsData } from "@/util/json";
import Icon from "@/components/Icon";
import { string } from "prop-types";

function MenuAdminContainer(): JSX.Element {
  const dispatch = useDispatch<Dispatch>();
  const [data, setData] = useState<menuTableData[]>([]); // 当前页面列表数据
  const p = useSelector((state: RootState) => state.app.powersCode);
  const [form] = Form.useForm();
  const [dataWithRoot, setDataWithRoot] = useState<any[]>([]);

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
  const page: Page = {
    page: 1,
    pageSize: 999,
    total: 0,
  };

  const { SHOW_ALL } = TreeSelect;

  const [loading, setLoading] = useState(false); // 数据是否正在加载中

  useMount(() => {
    onGetData(page);
    // console.log(Icons["CloudTwoTone"].render);
  });

  // 模态框相关参数
  const [menuModal, setMenuModal] = useSetState<ModalType>({
    operateType: "add", // add添加，up修改, addSub新增子菜单
    nowData: null,
    modalShow: false,
    modalLoading: false,
  });

  //删除菜单
  const onDeleteMenuChange = async (ID: number): Promise<void> => {
    try {
      const params: { ID: number } = {
        ID: ID,
      };
      const res = await dispatch.sys.deleteBaseMenu(params);
      if (res && res.code === 0) {
        message.success("删除成功!");
        //刷新数据
        onGetData(page);
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } catch {}
  };

  // 删除菜单确认模态框
  const onDeleteMenu = async (ID: number): Promise<void> => {
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: "此操作将永久删除所有角色下该菜单, 是否继续?",
      onOk: () => {
        onDeleteMenuChange(ID);
      },
    });
  };

  //菜单模态框提交数据
  const onMenuModalOk = async (): Promise<void> => {
    const values = await form.validateFields();
    setMenuModal({
      modalLoading: true,
    });
    // console.log(values);
    // console.log(dataParameterMenu);
    // console.log(dataMenu);
    const dataParameterMenuTmp = [];
    dataParameterMenu.map((item) => {
      if (item.isNew === true) {
        delete item.ID;
        delete item.isNew;
        dataParameterMenuTmp.push(item);
      } else {
        dataParameterMenuTmp.push(item);
      }
    });
    const dataMenuTmp = [];
    dataMenu.map((item) => {
      if (item.isNew === true) {
        delete item.ID;
        delete item.isNew;
        dataMenuTmp.push(item);
      } else {
        dataMenuTmp.push(item);
      }
    });
    // console.log(dataParameterMenuTmp);
    // console.log(dataMenuTmp);
    const params: {
      ID: number;
      component: string;
      hidden: boolean;
      menuBtn: any[];
      meta: {
        activeName: string;
        keepAlive: boolean;
        defaultMenu: boolean;
        title: string;
        icon: string;
        closeTab: boolean;
      };
      name: string;
      parameters: any[];
      parentId: string;
      path: string;
      sort: number;
    } = {
      ID: 0,
      component: values.component,
      hidden: values.hidden,
      menuBtn: Array.from(dataMenuTmp),
      meta: {
        activeName: values.meta.activeName,
        keepAlive: values.meta.keepAlive,
        defaultMenu: values.meta.defaultMenu,
        title: values.meta.title,
        icon: values.meta.icon,
        closeTab: values.meta.closeTab,
      },
      name: values.name,
      parameters: Array.from(dataParameterMenuTmp),
      parentId: String(values.parentId),
      path: values.path,
      sort: values.sort,
    };
    try {
      if (
        menuModal.operateType === "add" ||
        menuModal.operateType === "addSub"
      ) {
        const res = await dispatch.sys.addBaseMenu(params);
        if (res && res.code === 0) {
          message.success("添加成功!");
          setMenuModal({
            modalShow: false,
          });
          //刷新数据
          onGetData(page);
        } else {
          message.error(res?.msg ?? "数据获取失败");
        }
      } else {
        if (menuModal.nowData) {
          params.ID = menuModal.nowData.ID;
        }
        const res = await dispatch.sys.updateBaseMenu(params);
        if (res && res.code === 0) {
          message.success("编辑成功");
          setMenuModal({
            modalShow: false,
          });
          //刷新数据
          onGetData(page);
        } else {
          message.error(res?.msg ?? "数据获取失败");
        }
      }
    } finally {
      setMenuModal({
        modalLoading: false,
      });
    }
  };

  // 菜单模态框关闭
  const onMenuModalClose = async (): Promise<void> => {
    setMenuModal({
      modalShow: false,
    });
  };

  /**
   * 添加/修改/新增根菜单 模态框出现
   * @param data 当前选中的那条数据
   * @param type add添加根菜单/up修改/addSub新增子菜单
   * **/
  const onModalShow = (data: menuTableData | null, type: operateType): void => {
    setMenuModal({
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
          parentId: "0",
          hidden: false,
          sort: 0,
          meta: {
            activeName: "",
            keepAlive: false,
            closeTab: false,
            icon: "",
            defaultMenu: false,
            title: "",
          },
          checkFlag: false,
        });
        setDataMenu([]);
        setParameterDataMenu([]);
      } else if (type === "addSub") {
        if (data) {
          form.resetFields();
          form.setFieldsValue({
            parentId: data.ID,
            hidden: false,
            sort: 0,
            meta: {
              activeName: "",
              keepAlive: false,
              closeTab: false,
              icon: "",
              defaultMenu: false,
              title: "",
            },
            checkFlag: false,
          });
        }
      } else {
        // 修改数据
        if (data) {
          // 查看或修改，需设置表单各控件的值为当前所选中行的数据
          form.setFieldsValue({
            checkFlag: false,
            ...data,
          });
          const newParameterData = [...data.parameters];
          setParameterDataMenu(newParameterData);
          const newData = [...data.menuBtn];
          setDataMenu(newData);
        }
      }
    });
  };

  // 函数 - 查询当前页面所需列表数据
  const onGetData = async (page: Page): Promise<void> => {
    if (!p.includes("menu:query")) {
      return;
    }
    const params = {
      page: page.page,
      pageSize: page.pageSize,
    };
    setLoading(true);
    try {
      const res = await dispatch.sys.getMenuList(tools.clearNull(params));
      if (res && res.code === 0) {
        setData(res.data.list);
        // 重新设置带根目录的树状数据
        const menusData: any[] = [];
        const dataWithRootTmp = Array.from(res.data.list);
        dataWithRootTmp.push({
          ID: 0,
          name: "根目录",
          children: [],
          meta: { title: "根目录" },
        });
        setMenuOptions(dataWithRootTmp, menusData);
        setDataWithRoot(menusData);
      } else {
        message.error(res?.msg ?? "数据获取失败");
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "ID",
      key: "ID",
      width: "100px",
    },
    {
      title: "展示名称",
      dataIndex: "title",
      key: "title",
      width: "120px",
      render: (v: null, record: menuTableData) => {
        return record.meta.title;
      },
    },
    {
      title: "图标",
      dataIndex: "icon",
      key: "icon",
      width: "140px",
      render: (v: null, record: menuTableData) => {
        return record ? (
          <>
            <span>{record.meta.icon}</span>
            <Icon type={record.meta.icon} />
          </>
        ) : (
          ""
        );
      },
    },
    {
      title: "路由Name",
      dataIndex: "name",
      key: "name",
      width: "160px",
    },
    {
      title: "路由Path",
      dataIndex: "path",
      key: "path",
      width: "160px",
    },
    {
      title: "是否隐藏",
      dataIndex: "hidden",
      key: "hidden",
      render: (v: null, record: menuTableData) => {
        return record.hidden === true ? "隐藏" : "显示";
      },
      width: "100px",
    },
    {
      title: "父节点",
      dataIndex: "parentId",
      key: "parentId",
      width: "90px",
    },
    {
      title: "排序",
      dataIndex: "sort",
      key: "sort",
      width: "70px",
    },
    {
      title: "文件路径",
      dataIndex: "component",
      key: "component",
      width: "360px",
    },
    {
      title: "操作",
      key: "operation",
      width: "300px",
      fixed: "right",
      render: (v: null, record: menuTableData) => {
        const controls = [];
        p.includes("menu:add") &&
          controls.push(
            <span
              key="0"
              className="control-btn blue"
              onClick={() => onModalShow(record, "addSub")}
            >
              <Tooltip placement="top" title="添加子菜单">
                <SubnodeOutlined />
                {/*<a>添加子菜单</a>*/}
              </Tooltip>
            </span>
          );
        p.includes("menu:up") &&
          controls.push(
            <span
              key="0"
              className="control-btn blue"
              onClick={() => onModalShow(record, "up")}
            >
              <Tooltip placement="top" title="编辑">
                <EditOutlined />
                {/*<a>编辑</a>*/}
              </Tooltip>
            </span>
          );
        p.includes("menu:del") &&
          controls.push(
            <span
              key="0"
              className="control-btn red"
              onClick={() => {
                onDeleteMenu(record.ID);
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

  // antd菜单表格动态列表

  //生成一个随机的id数
  const generateID = () => {
    let randomNum = Math.floor(Math.random() * (30 - 1)) + 1;
    if (
      dataMenu
        .map((element) => {
          return element.ID;
        })
        .includes(randomNum)
    ) {
      return generateID();
    }
    return randomNum;
  };

  const [dataMenu, setDataMenu] = useState([]);

  useEffect(() => {
    // Set totals on initial render
    const newData = [...dataMenu];
    setDataMenu(newData);
  }, []);

  const handleMenuDelete = (id) => {
    const newData = dataMenu.filter((item) => item.ID !== id);
    setDataMenu(newData);
  };

  const columnsMenu = [
    {
      title: "按钮名称",
      dataIndex: "name",
      width: "40%",
      editable: true,
      render: (text, record, index) => (
        <Input value={text} onChange={onMenuInputChange("name", index)} />
      ),
    },
    {
      title: "备注",
      dataIndex: "desc",
      width: "40%",
      editable: true,
      render: (text, record, index) => (
        <Input value={text} onChange={onMenuInputChange("desc", index)} />
      ),
    },
    {
      title: "",
      dataIndex: "operation",
      render: (_, record) =>
        dataMenu.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleMenuDelete(record.ID)}
          >
            <Button danger>删除</Button>
          </Popconfirm>
        ) : null,
    },
  ];

  const handleMenuAdd = () => {
    const newData = {
      ID: generateID(),
      name: "",
      desc: "",
      isNew: true, //新增标志位用来判断是否是新增的行
    };
    setDataMenu([...dataMenu, newData]);
  };

  const onMenuInputChange =
    (key, index) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newData = [...dataMenu];
      newData[index][key] = e.target.value;
      setDataMenu(newData);
    };

  // antd参数菜单表格动态列表
  const [dataParameterMenu, setParameterDataMenu] = useState([]);

  useEffect(() => {
    // Set totals on initial render
    const newData = [...dataParameterMenu];
    setParameterDataMenu(newData);
  }, []);

  const setMenuOptions = (menuData, optionsData) => {
    menuData &&
      menuData.forEach((item) => {
        if (item.children && item.children.length) {
          const option = {
            title: item.meta.title,
            ID: String(item.ID),
            children: [],
          };
          setMenuOptions(item.children, option.children);
          optionsData.push(option);
        } else {
          const option = {
            title: item.meta.title,
            ID: String(item.ID),
          };
          optionsData.push(option);
        }
      });
  };

  const handleParameterMenuDelete = (id) => {
    const newData = dataParameterMenu.filter((item) => item.ID !== id);
    setParameterDataMenu(newData);
  };

  const columnsParameterMenu = [
    {
      title: "参数类型",
      dataIndex: "type",
      width: "40%",
      editable: true,
      render: (text, record, index) => (
        <Select
          defaultValue="query"
          style={{ width: 120 }}
          value={text}
          onChange={onParameterMenuInputChange("type", index)}
          options={[
            { value: "query", label: "query" },
            { value: "params", label: "params" },
          ]}
        />
      ),
    },
    {
      title: "参数key",
      dataIndex: "key",
      width: "40%",
      editable: true,
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={onParameterMenuInputChange("key", index)}
        />
      ),
    },
    {
      title: "参数值",
      dataIndex: "value",
      width: "40%",
      editable: true,
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={onParameterMenuInputChange("value", index)}
        />
      ),
    },
    {
      title: "",
      dataIndex: "operation",
      render: (_, record) =>
        dataMenu.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleParameterMenuDelete(record.ID)}
          >
            <Button danger>删除</Button>
          </Popconfirm>
        ) : null,
    },
  ];

  const handleParameterMenuAdd = () => {
    const newData = {
      ID: generateID(),
      type: "",
      key: "",
      value: "",
      isNew: true, //新增标志位用来判断是否是新增的行
    };
    setParameterDataMenu([...dataParameterMenu, newData]);
  };

  const onParameterMenuInputChange =
    (key, index) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newData = [...dataParameterMenu];
      if (key === "type") {
        //select为选中的数据值
        newData[index][key] = e;
      } else {
        newData[index][key] = e.target.value;
      }
      setParameterDataMenu(newData);
    };

  //添加参数按钮改变时做相应的设置
  const [checkFlag, setCheckFlag] = useState<boolean>(false);

  const onFormValuesChange = (changedValues, allValues) => {
    // console.log(changedValues, allValues);
    if (changedValues.checkFlag !== undefined) {
      setCheckFlag(allValues.checkFlag);
    }
    if (changedValues.name !== undefined) {
      form.setFieldsValue({
        path: changedValues.name,
      });
    }
  };

  return (
    <>
      <div>
        <div className="g-search">
          <ul className="search-func">
            <li>
              {p.includes("menu:add") ? (
                <Button
                  type="primary"
                  icon={<PlusCircleOutlined />}
                  onClick={() => onModalShow(null, "add")}
                >
                  新增根菜单
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
            rowKey={"ID"}
            defaultExpandAllRows={false}
          />
        </div>
        {/* 新增&修改&新建子菜单 模态框 */}
        <Modal
          title={
            {
              add: "新增根菜单",
              up: "编辑菜单",
              addSub: "新增子菜单",
            }[menuModal.operateType]
          }
          width={900}
          open={menuModal.modalShow}
          onOk={onMenuModalOk}
          onCancel={onMenuModalClose}
          confirmLoading={menuModal.modalLoading}
        >
          <Form
            form={form}
            layout={"vertical"}
            onValuesChange={onFormValuesChange}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="路由Name"
                  name="name"
                  {...formItemLayout}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "必填",
                    },
                  ]}
                >
                  <Input placeholder="唯一英文字符串" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="路由Path" {...formItemLayout} required>
                  <Row gutter={24}>
                    <Col span={7}>
                      <Form.Item name="checkFlag" valuePropName="checked">
                        <Checkbox>添加参数</Checkbox>
                      </Form.Item>
                    </Col>
                    <Col span={17}>
                      <Form.Item
                        name="path"
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "必填",
                          },
                        ]}
                      >
                        <Input
                          placeholder="建议只在后方拼接参数"
                          disabled={!checkFlag}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="是否隐藏"
                  name="hidden"
                  valuePropName="checked"
                  {...formItemLayout}
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="父节点ID" name="parentId" {...formItemLayout}>
                  <TreeSelect
                    treeDefaultExpandAll
                    style={{ width: "100%" }}
                    treeData={dataWithRoot}
                    showCheckedStrategy={SHOW_ALL}
                    maxTagCount="responsive"
                    fieldNames={{
                      label: "title",
                      value: "ID",
                      children: "children",
                    }}
                    disabled={
                      menuModal.operateType === "addSub" ||
                      menuModal.operateType === "add"
                    }
                  ></TreeSelect>
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Row gutter={24}>
              <Col span={12}>
                <Space direction="vertical">
                  <Space.Compact direction="vertical">
                    <Form.Item
                      label="文件路径"
                      name="component"
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "必填",
                        },
                      ]}
                    >
                      <Input placeholder="页面:view/xxx/xx.vue 插件:plugin/xx/xx.vue" />
                    </Form.Item>
                    <Space.Compact direction="horizontal">
                      <span style={{ fontSize: "14px", marginRight: "2px" }}>
                        如果菜单包含子菜单，请创建router-view二级路由页面或者
                      </span>
                      <Button style={{ marginTop: "4px", fixed: "right" }}>
                        点我设置
                      </Button>
                    </Space.Compact>
                  </Space.Compact>
                </Space>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="展示名称"
                  name={["meta", "title"]}
                  {...formItemLayout}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "必填",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="图标"
                  name={["meta", "icon"]}
                  {...formItemLayout}
                >
                  <Select dropdownClassName="iconSelect" allowClear showSearch>
                    {IconsData.map((item, index) => {
                      return (
                        <Option key={index} value={item}>
                          <Icon type={item} />
                          {item}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="排序标记" name="sort" {...formItemLayout}>
                  <InputNumber />
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="高亮菜单"
                  name={["meta", "activeName"]}
                  tooltip={
                    "注：当到达此路由时候，指定左侧菜单指定name会处于活跃状态（亮起），可为空，为空则为本路由Name。"
                  }
                  {...formItemLayout}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="keepAlive"
                  name={["meta", "keepAlive"]}
                  valuePropName="checked"
                  {...formItemLayout}
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="closeTab"
                  name={["meta", "closeTab"]}
                  valuePropName="checked"
                  {...formItemLayout}
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="是否为基础页面"
                  name={["meta", "defaultMenu"]}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <Divider />
          <Button onClick={handleParameterMenuAdd}>新增菜单参数</Button>
          <div style={{ padding: 10 }}>
            <Table
              bordered
              dataSource={dataParameterMenu}
              columns={columnsParameterMenu}
              pagination={false}
            />
          </div>
          <Button onClick={handleMenuAdd}>新增可控按钮</Button>
          <div style={{ padding: 10 }}>
            <Table
              bordered
              dataSource={dataMenu}
              columns={columnsMenu}
              pagination={false}
            />
          </div>
        </Modal>
      </div>
    </>
  );
}

export default MenuAdminContainer;
