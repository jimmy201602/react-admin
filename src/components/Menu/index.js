/** 左侧导航 **/
/**
 * static propTypes = {
    data: P.array, // 所有的菜单数据
    collapsed: P.bool, // 菜单咱开还是收起
    location: P.any
  };
 * */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Layout, Menu } from "antd";
import { Link } from "react-router-dom";
import "./index.less";
import ImgLogo from "@/assets/logo.png";
import Icon from "@/components/Icon";
import _ from "lodash";

const { Sider } = Layout;
const { SubMenu, Item } = Menu;

export default function MenuCom(props) {
  const [chosedKey, setChosedKey] = useState([]); // 当前选中
  const [openKeys, setOpenKeys] = useState([]); // 当前需要被展开的项

  // 当页面路由跳转时，即location发生改变，则更新选中项
  useEffect(() => {
    const paths = props.location.pathname.split("/").filter((item) => !!item);
    setChosedKey([props.location.pathname]);
    setOpenKeys(paths.map((item) => `/${item}`));
  }, [props.location]);

  // ==================
  // 私有方法
  // ==================

  // 菜单被选择
  const onSelect = useCallback(
    (e) => {
      props.history.push(e.key);
    },
    [props.history]
  );

  // 工具 - 递归将扁平数据转换为层级数据
  const dataToJson = useCallback((one, data) => {
    let kids;
    if (!one) {
      // 第1次递归
      kids = data.filter((item) => !item.parent);
    } else {
      kids = data.filter((item) => item.parent === one.id);
    }
    kids.forEach((item) => (item.children = dataToJson(item, data)));
    return kids.length ? kids : null;
  }, []);

  // 构建树结构
  const makeTreeDom = useCallback((data, key) => {
    return data.map((item, index) => {
      const newKey = `${key}/${item.url.replace(/\//, "")}`;
      if (item.children) {
        return (
          <SubMenu
            key={newKey}
            title={
              !item.parent && item.icon ? (
                <span>
                  <Icon type={item.icon} />
                  <span>{item.title}</span>
                </span>
              ) : (
                item.title
              )
            }
          >
            {makeTreeDom(item.children, newKey)}
          </SubMenu>
        );
      } else {
        return (
          <Item key={newKey}>
            {!item.parent && item.icon ? <Icon type={item.icon} /> : null}
            <span>{item.title}</span>
          </Item>
        );
      }
    });
  }, []);

  // ==================
  // 计算属性 memo
  // ==================

  /** 处理原始数据，将原始数据处理为层级关系 **/
  const treeDom = useMemo(() => {
    const d = _.cloneDeep(props.data);
    // 按照sort排序
    d.sort((a, b) => {
      return a.sorts - b.sorts;
    });
    const sourceData = dataToJson(null, d) || [];
    const treeDom = makeTreeDom(sourceData, "");
    return treeDom;
  }, [props.data, dataToJson, makeTreeDom]);

  // ==================
  // 组件DOM渲染
  // ==================
  return (
    <Sider
      width={256}
      className="sider"
      trigger={null}
      collapsible
      collapsed={props.collapsed}
    >
      <div className={props.collapsed ? "menuLogo hide" : "menuLogo"}>
        <Link to="/">
          <img src={ImgLogo} />
          <div>React-Admin</div>
        </Link>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={chosedKey}
        {...(props.collapsed ? {} : { openKeys })}
        onOpenChange={setOpenKeys}
        onSelect={onSelect}
      >
        {treeDom}
      </Menu>
    </Sider>
  );
}
