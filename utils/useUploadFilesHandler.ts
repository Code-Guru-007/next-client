import { useState, useCallback } from "react";
import useInputRefActions from "@eGroupAI/hooks/useInputRefActions";
import useUploadOrgFiles from "@eGroupAI/hooks/apis/useUploadOrgFiles";
import { UploadOrgFilesApiPayload } from "@eGroupAI/typings/apis";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import { SNACKBAR as GLOBAL_SNACKBAR } from "components/App";
import { ServiceModuleValue } from "interfaces/utils";
import { UploadFile } from "interfaces/entities";
import { UploadFilesApiPayload } from "interfaces/payloads";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import useAxiosApiWrapper from "./useAxiosApiWrapper";
import apis from "./apis";
import compress from "./CompressImage";

export type UploadFilesHandlerParams = {
  /**
   * enable compressing image before uploading preceed
   * @default true
   */
  useImageCompress?: boolean;
};

export default function useUploadFilesHandler(
  params?: UploadFilesHandlerParams
) {
  const { useImageCompress = true } = params || {};
  const { inputEl, clearValue } = useInputRefActions();
  const [completed, setCompleted] = useState(0);

  const { excute: excuteUploadOrgFiles, isLoading: isOrgUploading } =
    useUploadOrgFiles<UploadFile, ServiceModuleValue>();

  const { excute: excuteUploadFiles, isLoading: isUploading } =
    useAxiosApiWrapper(apis.publicapi.uploadFiles, "None");

  const { openSnackbar, closeSnackbar } =
    useReduxSnackbar<SnackbarProps>(GLOBAL_SNACKBAR);

  const wordLibrary = useSelector(getWordLibrary);

  const uploadOrgFiles = useCallback(
    async (payload: UploadOrgFilesApiPayload<ServiceModuleValue>) => {
      const { files, ...others } = payload;
      const file = files[0];
      if (file) {
        const uploadedFiles = [...files];
        for (let index = 0; index < files.length; index++) {
          const selectedFile = files[index];
          if (selectedFile) {
            const fileType = selectedFile.type.split("/")[0];
            const fileSubType = selectedFile.type.split("/")[1];
            if (
              useImageCompress &&
              fileType === "image" &&
              fileSubType !== "gif"
            ) {
              openSnackbar({
                message:
                  wordLibrary?.["上傳中，請稍後..."] ?? "上傳中，請稍後...",
                severity: "warning",
                autoHideDuration: null,
              });
              // eslint-disable-next-line no-await-in-loop
              const compressedData = await compress(selectedFile, {
                type: "browser-webp",
                options: {
                  quality: 0.8,
                },
              });
              // change file extension to .webp
              const fileName = selectedFile.name.replace(/\.[^/.]+$/, ".webp");
              const compressedFile = new File([compressedData], fileName || "");
              uploadedFiles[index] = compressedFile;
            }
          }
        }
        openSnackbar({
          message: wordLibrary?.["please wait"] ?? "請稍候",
          severity: "warning",
          autoHideDuration: null,
        });
        return excuteUploadOrgFiles(
          {
            files: uploadedFiles,
            ...others,
          },
          {
            onUploadProgress: (progressEvent) =>
              setCompleted(
                Math.round((progressEvent.loaded * 100) / progressEvent.total)
              ),
          }
        ).finally(() => {
          clearValue();
          setCompleted(0);
          closeSnackbar({
            autoHideDuration: 4000,
          });
          openSnackbar({
            message: wordLibrary?.["added successfully"] ?? "新增成功",
            severity: "success",
            autoHideDuration: 4000,
          });
        });
      }
      return null;
    },
    [
      clearValue,
      closeSnackbar,
      excuteUploadOrgFiles,
      openSnackbar,
      wordLibrary,
      useImageCompress,
    ]
  );

  const uploadFiles = useCallback(
    async (payload: UploadFilesApiPayload) => {
      const { files, ...others } = payload;
      const file = files[0];
      if (file) {
        const uploadedFiles = [...files];
        for (let index = 0; index < files.length; index++) {
          const selectedFile = files[index];
          if (selectedFile) {
            const fileType = selectedFile.type.split("/")[0];
            if (useImageCompress && fileType === "image") {
              openSnackbar({
                message:
                  wordLibrary?.["上傳中，請稍後..."] ?? "上傳中，請稍後...",
                severity: "warning",
                autoHideDuration: null,
              });
              // eslint-disable-next-line no-await-in-loop
              const compressedData = await compress(selectedFile, {
                type: "browser-webp",
                options: {
                  quality: 0.8,
                },
              });
              // change file extension to .webp
              const fileName = selectedFile.name.replace(/\.[^/.]+$/, ".webp");
              const compressedFile = new File([compressedData], fileName || "");
              uploadedFiles[index] = compressedFile;
            }
          }
        }
        openSnackbar({
          message: wordLibrary?.["please wait"] ?? "請稍候",
          severity: "warning",
          autoHideDuration: null,
        });
        return excuteUploadFiles(
          {
            files: uploadedFiles,
            ...others,
          },
          {
            onUploadProgress: (progressEvent) =>
              setCompleted(
                Math.round((progressEvent.loaded * 100) / progressEvent.total)
              ),
          }
        ).finally(() => {
          clearValue();
          setCompleted(0);
          closeSnackbar({
            autoHideDuration: 4000,
          });
        });
      }

      return null;
    },
    [
      clearValue,
      closeSnackbar,
      excuteUploadFiles,
      openSnackbar,
      useImageCompress,
      wordLibrary,
    ]
  );

  return {
    uploadOrgFiles,
    uploadFiles,
    isOrgUploading,
    isUploading,
    setCompleted,
    completed,
    inputEl,
    clearValue,
  };
}
