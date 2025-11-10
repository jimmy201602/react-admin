import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "@/store";
import { useState } from "react";
import { menuTableData } from "@/pages/System/Menu/index.type";
import { Button, Form } from "antd";

function DictionaryContainer(): JSX.Element {
  const dispatch = useDispatch<Dispatch>();
  const [data, setData] = useState<menuTableData[]>([]); // 当前页面列表数据
  const p = useSelector((state: RootState) => state.app.powersCode);
  const [form] = Form.useForm();

  return (
    <>
      <div>
        <div className="dict-box flex gap-4">
          <div className="w-64 bg-white p-4">
            <div className="flex justify-between items-center">
              <span className="text font-bold">字典列表</span>
              <Button>新增</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DictionaryContainer;
