import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import tools from "@/util/tools";

import { Button, Checkbox, Form, Input, message } from "antd";
import { KeyOutlined, UserOutlined } from "@ant-design/icons";
import CanvasBack from "@/components/CanvasBack";
import LogoImg from "@/assets/logo.png";

import { Dispatch } from "@/store";
import { Menu, Power, Res, Role, UserBasicInfo } from "@/models/index.type";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import "./index.less";
import { useMount } from "react-use";
import { cloneDeep } from "lodash";

function LoginContainer(): JSX.Element {
  const dispatch = useDispatch<Dispatch>();

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false); // 是否正在登录中
  const [rememberPassword, setRememberPassword] = useState(false); // 是否记住密码
  const [show, setShow] = useState(false); // 加载完毕时触发动画
  const [captchaValue, setCaptchaValue] = useState();
  const [captchaIdValue, setCaptchaIdValue] = useState("123456");
  const [openCaptchaValue, setOpenCaptchaValue] = useState(true);

  const onGetCaptcha = async (): Promise<void> => {
    const res: Res | undefined = await dispatch.app.getCaptcha();
    if (res) {
      setCaptchaValue(res.data.picPath);
      setCaptchaIdValue(res.data.captchaId);
      setOpenCaptchaValue(res.data.openCaptcha);
    }
  };

  useMount(() => {
    //设置初始化的验证码
    onGetCaptcha();
  });

  // 进入登陆页时，判断之前是否保存了用户名和密码
  useEffect(() => {
    const userLoginInfo = localStorage.getItem("userLoginInfo");
    if (userLoginInfo) {
      const userLoginInfoObj = JSON.parse(userLoginInfo);
      setRememberPassword(true);

      form.setFieldsValue({
        username: userLoginInfoObj.username,
        password: tools.uncompile(userLoginInfoObj.password),
      });
    }
    if (!userLoginInfo) {
      document.getElementById("username")?.focus();
    } else {
      document.getElementById("vcode")?.focus();
    }
    setShow(true);
  }, [form]);

  /** 工具 - 递归将扁平数据转换为层级数据 **/
  const dataToJson = useCallback((one: any | undefined, data: any[]) => {
    let kids;
    if (!one) {
      // 第1次递归
      kids = data.filter((item: any) => item.parentId === "0");
    } else {
      kids = data.filter((item: any) => item.parentId === String(one.ID));
    }
    kids.forEach((item: any) => {
      item.children = dataToJson(item, data);
      item.key = item.ID;
    });
    return kids.length ? kids : undefined;
  }, []);

  // ==================
  // 计算属性 memo
  // ==================

  // 工具 - 赋值Key
  const menuData: any[] = [];
  const makeKey = useCallback((data: any[]) => {
    for (let i = 0; i < data.length; i++) {
      const item: any = { ...data[i] };

      const treeItem: any = {
        // ...item,
        key: item.ID,
        id: item.ID,
        title: item.meta.title,
        icon: item.meta.icon,
        url: item.path,
        parent: item.parentId === "0" ? null : item.ID, //data.parentId
        parentPath: item.path === "" ? "" : item.path,
        desc: "",
        sorts: item.sort,
        conditions: 1,
        btns: item.btns,
      };
      if (item.parentId !== "0") {
        let parentData;
        parentData = menuData.find(
          (it: any) => String(it.id) === String(item.parentId)
        );
        treeItem.parentPath = `${parentData.parentPath}/${item.path}`;
        treeItem.url = `${parentData.parentPath}/${item.path}`;
        treeItem.parent = parentData.id;
      } else {
        treeItem.parentPath = `/${item.path}`;
        treeItem.url = `${item.path}`;
      }
      if (!item.hidden) {
        menuData.push(treeItem);
      }

      if (item.children && !item.hidden) {
        item.children = makeKey(item.children);
      }
    }
    // console.log("menuData",menuData);
    return menuData;
  }, []);

  /**
   * 执行登录
   * 1.登录，得到用户信息
   * 2.通过用户信息获取菜单信息
   * **/
  const loginIn = useCallback(
    async (
      username: string,
      password: string,
      captcha: string,
      captchaIdValue: string,
      openCaptcha: boolean
    ) => {
      let userBasicInfo: UserBasicInfo | null = null;
      const roles: Role[] = [];
      const menus: Menu[] = [];
      const powers: Power[] = [];

      /** 1.登录 （返回信息中有该用户id及token信息） **/
      const res1: Res | undefined = await dispatch.app.onLogin({
        username,
        password,
        captcha,
        captchaId: captchaIdValue,
        openCaptcha,
      });
      if (!res1 || res1.code !== 0 || !res1.data) {
        // 登录失败
        return res1;
      } else {
        await dispatch.app.setToken(res1.data.token);
        await dispatch.app.setUserId(res1.data.user.ID);
      }

      userBasicInfo = res1.data.user;

      /** 2.查询用户的权限菜单 **/
      const res2: Res | undefined = await dispatch.sys.getMenu();
      if (res2 && res2.code === 0) {
        // 这应该递归，把children数据也赋值key
        const menu: any[] = makeKey(cloneDeep(res2.data.menus));
        // 按照sort排序
        // console.log("makekey",menu);
        menu.sort((a, b) => {
          return a.sort - b.sort;
        });
        // 生成权限按钮列表数据
        menuData.map((item) => {
          if (item.btns) {
            Object.keys(item.btns).map((btn) => {
              powers.push({
                conditions: 1,
                desc: "",
                menu: 0,
                sorts: 0,
                title: "",
                code: btn,
                id: item.id,
              });
            });
          }
        });

        // console.log("menu", menu);
        console.log("powers", powers);
        return {
          code: 0,
          data: {
            userBasicInfo: userBasicInfo,
            roles,
            menus: menu,
            powers,
          },
        };
      }
      return { code: 0, data: { userBasicInfo, roles, menus, powers } };
    },
    [dispatch.sys, dispatch.app]
  );

  // 用户提交登录
  const onSubmit = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await loginIn(
        values.username,
        values.password,
        values.captcha,
        captchaIdValue,
        openCaptchaValue
      );
      if (res && res.code === 0) {
        message.success("登录成功");
        if (rememberPassword) {
          localStorage.setItem(
            "userLoginInfo",
            JSON.stringify({
              username: values.username,
              password: tools.compile(values.password), // 密码简单加密一下再存到localStorage
            })
          ); // 保存用户名和密码
        } else {
          localStorage.removeItem("userLoginInfo");
        }
        /** 将这些信息加密后存入sessionStorage,并存入store **/
        sessionStorage.setItem(
          "userinfo",
          tools.compile(JSON.stringify(res.data))
        );
        await dispatch.app.setUserInfo(res.data);
        navigate("/"); // 跳转到主页
      } else {
        onGetCaptcha();
        message.error(res?.msg ?? "登录失败");
        setLoading(false);
      }
    } catch (e) {
      // 验证未通过
    }
  };

  // 记住密码按钮点击
  const onRemember = (e: CheckboxChangeEvent): void => {
    setRememberPassword(e.target.checked);
  };

  return (
    <div className="page-login">
      <div className="canvasBox">
        <CanvasBack row={12} col={8} />
      </div>
      <div className={show ? "loginBox show" : "loginBox"}>
        <Form form={form}>
          <div className="title">
            <img src={LogoImg} alt="logo" />
            <span>React-Admin</span>
          </div>
          <div>
            <Form.Item
              name="username"
              rules={[
                { max: 12, message: "最大长度为12位字符" },
                {
                  required: true,
                  whitespace: true,
                  message: "请输入用户名",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ fontSize: 13 }} />}
                size="large"
                id="username" // 为了获取焦点
                placeholder="admin/user"
                onPressEnter={onSubmit}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "请输入密码" },
                { max: 18, message: "最大长度18个字符" },
              ]}
            >
              <Input
                prefix={<KeyOutlined style={{ fontSize: 13 }} />}
                size="large"
                type="password"
                placeholder="123456/123456"
                onPressEnter={onSubmit}
              />
            </Form.Item>
            <Form.Item>
              <Form.Item
                name="captcha"
                noStyle
                rules={[
                  (): any => ({
                    validator: (rule: any, value: string): Promise<any> => {
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 6) {
                          return Promise.reject("验证码为6位字符");
                        } else {
                          return Promise.resolve();
                        }
                      } else {
                        return Promise.reject("请输入验证码");
                      }
                    },
                  }),
                ]}
              >
                <Input
                  style={{ width: "200px" }}
                  size="large"
                  id="captcha" // 为了获取焦点
                  placeholder="请输入验证码"
                  onPressEnter={onSubmit}
                />
              </Form.Item>
              <>
                <div
                  height={40}
                  width={150}
                  className="captcha"
                  onClick={onGetCaptcha}
                >
                  <img
                    height={40}
                    width={150}
                    src={captchaValue}
                    alt={"请输入验证码"}
                  />
                </div>
              </>
            </Form.Item>
            <div style={{ lineHeight: "40px" }}>
              <Checkbox
                className="remember"
                checked={rememberPassword}
                onChange={onRemember}
              >
                记住密码
              </Checkbox>
              <Button
                className="submit-btn"
                size="large"
                type="primary"
                loading={loading}
                onClick={onSubmit}
              >
                {loading ? "请稍后" : "登录"}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default LoginContainer;
