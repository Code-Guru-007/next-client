import React, { FC } from "react";
import EgFileUploadDropzone, {
  FileUploadDropzoneProps,
} from "@eGroupAI/material-lab/FileUploadDropzone";

const MB = 50;
const MAX_SIZE = MB * 1000 * 1000;

const FileUploadDropzone: FC<FileUploadDropzoneProps> = function (props) {
  const { onDrop, onDropRejected, ...other } = props;

  return (
    <EgFileUploadDropzone
      onDrop={(...args) => {
        if (onDrop) {
          onDrop(...args);
        }
      }}
      onDropRejected={(...args) => {
        if (onDropRejected) {
          onDropRejected(...args);
        }
      }}
      maxSize={MAX_SIZE}
      {...other}
    />
  );
};

export default FileUploadDropzone;
