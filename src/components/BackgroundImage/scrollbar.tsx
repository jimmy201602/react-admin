import React, { forwardRef, Ref, useImperativeHandle, useRef } from "react";
import { Scrollbar } from "react-scrollbars-custom";
import { converLayout } from "./helper";

const renderThumb = ({ style, ...props }) => {
  const thumbStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  };
  return <div style={{ ...style, ...thumbStyle }} {...props} />;
};

interface Props {
  width: number;
  height: number;
  autoHide: boolean;
  ref: Ref<any>;
  children: any;
}

export default function VScrollbarComponent(props: Props): JSX.Element {
  const { width, height, autoHide = true, ref } = props;
  const scrollbarRef = useRef();

  useImperativeHandle(ref, () => ({
    scrollTo: (top, left) => {
      scrollbarRef.current.scrollTop(Math.random() * top);
      scrollbarRef.current.scrollLeft(Math.random() * left);
    },
    getValues: () => ({
      top: scrollbarRef.current.getScrollTop(),
      left: scrollbarRef.current.getScrollLeft(),
    }),
  }));

  return (
    <Scrollbar
      style={{
        width: converLayout(width),
        height: converLayout(height),
        color: "#0a73ff",
      }}
      renderThumbVertical={renderThumb}
      renderThumbHorizontal={renderThumb}
      autoHide={autoHide}
      ref={(el) => {
        scrollbarRef.current = el;
      }}
    >
      {props.children}
    </Scrollbar>
  );
}
