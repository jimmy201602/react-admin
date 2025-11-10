import type { BaseOptionType, DefaultOptionType } from "rc-cascader";
import * as React from "react";
import type { CascaderProps } from "antd";
import { Cascader } from "antd";

import {
  MultipleCascaderProps as RcMultipleCascaderProps,
  SingleCascaderProps as RcSingleCascaderProps,
} from "rc-cascader/lib/Cascader";

// type SingleCascaderProps = Omit<RcSingleCascaderProps, 'checkable' | 'options'> & {
//   multiple?: false;
// };
// type MultipleCascaderProps = Omit<RcMultipleCascaderProps, 'checkable' | 'options'> & {
//   multiple: true;
// };
// type UnionCascaderProps = SingleCascaderProps | MultipleCascaderProps;

// export { BaseOptionType, DefaultOptionType };
// declare const SHOW_CHILD: "SHOW_CHILD", SHOW_PARENT: "SHOW_PARENT";
//
// export interface CascaderRef {
//   focus: () => void;
//   blur: () => void;
// }
//
// export type Props = CascaderProps<DataNodeType = any> & {
//   multiple?: boolean | { checkStrictly: boolean };
// }
//
// declare const Cascader: (<OptionType extends DefaultOptionType | BaseOptionType = DefaultOptionType>(props: React.PropsWithChildren<CascaderProps<OptionType>> & {
//   ref?: React.Ref<CascaderRef> | undefined;
// }) => React.ReactElement) & {
//   displayName: string;
//   SHOW_PARENT: typeof SHOW_PARENT;
//   SHOW_CHILD: typeof SHOW_CHILD;
// };

export default Cascader;
