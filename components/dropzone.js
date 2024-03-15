import { Upload as UploadIcon } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function Dropzone(props) {
  const onImageDropped = props.onImageDropped;
  const onDrop = useCallback(
    (acceptedFiles) => {
      onImageDropped(acceptedFiles[0]);
    },
    [onImageDropped]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="lil-button cursor-pointer select-none" {...getRootProps()}>
      <div className="m-auto">
        <input {...getInputProps()} />
          {true ? (
              <div style={{border: '1px dashed #000', padding: '10px'}}>
                  <p>把照片拖动到这里或点击上传</p>
                  <p>目前只支持单人露脸正面照片</p>
                  <p>带墨镜或口罩会影响成图效果</p>
                  <p style={{ fontWeight: 'bold', color: 'red' }}>禁用脱光等不雅词汇诱导模型</p>
              </div>
          ) : (
              <p>
                  <UploadIcon className="icon" />
                  上传图片
              </p>
          )}
      </div>
    </div>
  );
}
