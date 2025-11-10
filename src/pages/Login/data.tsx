// 工具 - 递归将扁平数据转换为层级数据
import { useCallback, useMemo } from "react";
import { cloneDeep } from "lodash";

const dataToJson = useCallback((one: any | undefined, data: any[]) => {
  let kids;
  if (!one) {
    // 第1次递归
    kids = data.filter((item: any) => !item.parent);
  } else {
    kids = data.filter((item: any) => item.parent === one.ID);
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
const makeKey = useCallback((data: any[]) => {
  const newData: any[] = [];
  for (let i = 0; i < data.length; i++) {
    const item: any = { ...data[i] };
    if (item.children) {
      item.children = makeKey(item.children);
    }
    const treeItem: any = {
      ...item,
      key: item.ID,
    };
    newData.push(treeItem);
  }
  return newData;
}, []);

// 处理原始数据，将原始数据处理为层级关系(菜单的层级关系)
const sourceData = useMemo(() => {
  const menuData: any[] = cloneDeep(props.data);
  // 这应该递归，把children数据也赋值key
  const d: any[] = makeKey(menuData);
  // 按照sort排序
  d.sort((a, b) => {
    return a.sorts - b.sorts;
  });

  return dataToJson(undefined, d) || [];
}, [props.data, dataToJson]);
