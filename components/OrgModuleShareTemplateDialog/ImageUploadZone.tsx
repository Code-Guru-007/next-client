import React, { FC, useCallback, useState } from "react";

import {
  setWelcomeUploadFiles,
  setFinishUploadFiles,
  setWelcomeUploadFileId,
  setFinishUploadFileId,
} from "redux/createUserInfoFilledUrlDialog";

import { useAppDispatch } from "redux/configureAppStore";
import { ServiceModuleValue } from "interfaces/utils";
import Typography from "@eGroupAI/material/Typography";
import { Upload } from "minimal/components/upload";

export interface ImageUploadZoneProps {
  filePathType: ServiceModuleValue;
  label?: string;
  uploadFiles?: (string | File)[];
}

const ImageUploadZone: FC<ImageUploadZoneProps> = function (props) {
  const { filePathType, label, uploadFiles } = props;
  const dispatch = useAppDispatch();
  const [file, setFile] = useState<File | string | null>(
    uploadFiles?.[0] || null
  );

  const handleUploadFiles = useCallback(
    (acceptedFiles: File[]) => {
      const newFile = acceptedFiles[0];
      if (newFile) {
        setFile(
          Object.assign(newFile, {
            preview: URL.createObjectURL(newFile),
          })
        );
        if (filePathType === ServiceModuleValue.WELCOME_IMAGE) {
          dispatch(setWelcomeUploadFiles(acceptedFiles));
        } else if (filePathType === ServiceModuleValue.FINISH_IMAGE) {
          dispatch(setFinishUploadFiles(acceptedFiles));
        }
      }
    },
    [dispatch, filePathType]
  );

  return (
    <>
      <Typography gutterBottom>{label}</Typography>
      <Upload
        file={file}
        onDropAccepted={handleUploadFiles}
        accept="image/*"
        onRemove={() => {
          setFile(null);
          if (filePathType === ServiceModuleValue.WELCOME_IMAGE) {
            dispatch(setWelcomeUploadFiles([]));
            dispatch(setWelcomeUploadFileId(""));
          } else if (filePathType === ServiceModuleValue.FINISH_IMAGE) {
            dispatch(setFinishUploadFiles([]));
            dispatch(setFinishUploadFileId(""));
          }
        }}
        onDelete={() => {
          setFile(null);
          if (filePathType === ServiceModuleValue.WELCOME_IMAGE) {
            dispatch(setWelcomeUploadFiles([]));
            dispatch(setWelcomeUploadFileId(""));
          } else if (filePathType === ServiceModuleValue.FINISH_IMAGE) {
            dispatch(setFinishUploadFiles([]));
            dispatch(setFinishUploadFileId(""));
          }
        }}
      />
    </>
  );
};

export default ImageUploadZone;
