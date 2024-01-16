import { useEffect, useState } from "react";
import Message from "./message";

export default function PromptForm({
  initialPrompt,
  isFirstPrompt,
  onSubmit,
  disabled = false,
  status,
}) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [placeholder, setPlaceholder] = useState("不用输入，直接点击一键脱衣-->");
  const [selectValue, setSelectValue] = useState("");
  useEffect(() => {
    console.log("status",status)
  }, [status]);
  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);
  const handleSelectChange = (e) => {
    setSelectValue(e.target.value); // 更新状态变量的值
    switch (e.target.value) {
      case "charge":
        setPlaceholder("请输入你的邮箱+卡密，格式为");
        break;
      case "detail":
        setPlaceholder("Enter your query details...");
        break;
      case "service":
        setPlaceholder("Enter your service request...");
        break;
      case "download":
        setPlaceholder("Enter your download details...");
        break;
      default:
        setPlaceholder("Your message...");
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setPrompt("");
    onSubmit(e,selectValue);
  };

  if (disabled) {
    return;
  }

  return (
    <form onSubmit={handleSubmit} className="animate-in fade-in duration-700">

      {  status==="DEMO" && (<Message sender="replicate" isSameSender>
            <label htmlFor="prompt-input">
              {isFirstPrompt
                  ? "点击一键脱衣试试?1"
                  : "也可以上传自己的照片1"}
            </label>
          </Message>)
      }

      <div className="flex mt-8">
        {/*<select className="block w-1/10 flex-grow" onChange={handleSelectChange}>*/}
        {/*  <option value="default"></option>*/}
        {/*  <option value="charge">生成分享链接</option>*/}
        {/*  <option value="charge">充值</option>*/}
        {/*  <option value="detail">查询额度</option>*/}
        {/*  <option value="service">客服</option>*/}
        {/*  <option value="download">下载</option>*/}
        {/*</select>*/}
        <input
          id="prompt-input"
          type="text"
          name="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          className={`block w-full flex-grow${
            disabled ? " rounded-md" : " rounded-l-md"
          }`}
          disabled={disabled}
        />

        {disabled || (
          <button
            className="bg-black text-white rounded-r-md text-small inline-block p-3 flex-none"
            type="submit"
          >
            一键脱衣
          </button>
        )}
      </div>
    </form>
  );
}
