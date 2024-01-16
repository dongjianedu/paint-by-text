import { RotateCcw as UndoIcon } from "lucide-react";
import Image from "next/image";
import { Fragment, useEffect, useRef } from "react";
import PulseLoader from "react-spinners/PulseLoader";
import Message from "./message";
import Cookies from 'js-cookie';
export default function Messages({ events, isProcessing, onUndo }) {
  const messagesEndRef = useRef(null);
  let fullAddress;
  let protocol;

  if (typeof window !== 'undefined') {
    const domainName = window.location.hostname;
    const port = window.location.port;
    fullAddress = domainName;

    if (port) {
      fullAddress = `${domainName}:${port}`;
    }

    protocol = window.location.protocol;
  }
  const fullUrl = `${protocol}//${fullAddress}`;
  const sid = Cookies.get('sid');
  const km = Cookies.get('km');


  useEffect(() => {
    if (events.length > 2) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [events.length]);

  return (
    <section className="w-full">
      {events.map((ev, index) => {
        if (ev.image) {
          return (
            <Fragment key={"image-" + index}>
              <Message sender="replicate" shouldFillWidth>
                <Image
                  alt={
                    ev.prompt
                      ? `The result of the prompt "${ev.prompt}" on the previous image`
                      : "The source image"
                  }
                  width="512"
                  height="512"
                  priority={true}
                  className="w-full h-auto rounded-lg"
                  src={ev.image}
                />

                {onUndo && index > 0 && index === events.length - 1 && (
                  <div className="mt-2 text-right">
                    <button
                      className="lil-button"
                      onClick={() => {
                        onUndo(index);
                      }}
                    >
                      <UndoIcon className="icon" /> 撤销
                    </button>
                  </div>
                )}
              </Message>

              {ev.status==="DEMO" && isProcessing || index < events.length - 1   && (
                <Message sender="replicate" isSameSender>
                  {index === 0
                    ? "点击一键脱衣试试?2"
                    : "也可以上传自己的照片2"}
                </Message>
              )}
              {(ev.status==="COMPLETED") && (
                  <Message  sender="replicate" isSameSender>
                   {`请输入卡密获取下载链接，购买卡密请查看购买说明,
                           也可以通过分享链接获取卡密，专属分享链接：${fullUrl}/?sid=${sid} 
                           专属免费卡密：${km} ，每分享成功一次，该卡密使用次数+1`}
                  </Message>
              )}
              {(ev.status==="COMPLETED_Cookie") && (
                  <Message  sender="replicate" isSameSender>
                    {ev.share_num ? `点击左下角下载图片，你的分享卡密 ${km} 余额还剩${ev.share_num}次` : "点击左下角下载图片"}
                  </Message>
              )}

            </Fragment>
          );
        }
        if(ev.status==="need_charge")
        {
          return (
                <Message key={index} sender="replicate" isSameSender>
                  {`卡密无效：已被使用过或额度不够赶紧，购买或增加分享 专属分享链接：${fullUrl}/?sid=${sid}  专属免费卡密：${km} 每分享成功一次，该卡密使用次数+1`}
                </Message>
            );
        }

        if (ev.prompt) {
          return (
            <Message key={"prompt-" + index} sender="user">
              {ev.prompt}
            </Message>
          );
        }
      })}

      {isProcessing && (
        <Message sender="replicate">
          <PulseLoader color="#999" size={7} />
        </Message>
      )}

      <div ref={messagesEndRef} />
    </section>
  );
}
