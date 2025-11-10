/* 用于菜单的自定义图标 */
import React from "react";
import { createFromIconfontCN } from "@ant-design/icons";
import AntIcon from "@ant-design/icons";
import { cloneDeep, set, get, upperFirst } from "lodash";
import * as Icons from "@ant-design/icons";

const IconFont = createFromIconfontCN({
  scriptUrl: "//at.alicdn.com/t/font_1688075_vwak21i2wxj.js",
});

export default function Icon(props: any): JSX.Element {
  props = cloneDeep(props);
  let theme = get(props, "theme", "outlined");
  const type = get(props, "type", "");
  if (type.indexOf("icon-") === 0) {
    return <IconFont type={type} {...props} />;
  }
  if (type.endsWith("Filled")) {
    theme = "Filled";
    set(props, "type", type.split("Filled")[0]);
  }
  const component = get(
    Icons,
    `${(props.type || "")
      .split("-")
      .map((s) => upperFirst(s))
      .join("")}${upperFirst(theme)}`
  );
  return <AntIcon {...props} theme={theme} component={component} />;
}
