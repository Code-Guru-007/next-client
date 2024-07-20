import React, { FC, useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { getWordLibrary } from "redux/wordLibrary/selectors";

import FormLabel from "@eGroupAI/material/FormLabel";
import Typography from "@eGroupAI/material/Typography";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useUploadOrgFiles from "@eGroupAI/hooks/apis/useUploadOrgFiles";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";

import { Upload } from "minimal/components/upload";
import { UploadFile } from "interfaces/entities";
import {
  ServiceModuleValue,
  OrganizationMediaSizeType,
} from "interfaces/utils";

const SNACKBAR = "globalSnackbar";

interface DynamicFileDropzoneProps {
  name: string;
  error: string | undefined;
  label?: React.ReactElement | string;
  handleChange?: (name: string, value?: string) => void;
  required?: boolean;
  organizationIdforShareShortUrl?: string;
  filePath?: string;
  fileName?: string;
}

const DynamicFileDropzone: FC<DynamicFileDropzoneProps> = (props) => {
  const {
    name,
    error,
    label,
    handleChange,
    filePath,
    fileName,
    required = false,
    organizationIdforShareShortUrl,
  } = props;
  const wordLibrary = useSelector(getWordLibrary);
  const emptyText = wordLibrary?.["no files selected"] ?? "沒有選擇任何檔案";
  const organizationId = useSelector(getSelectedOrgId);
  const [uploadedFileName, setUploadedFileName] = useState(
    fileName ?? emptyText
  );
  const [uploadedFilePath, setUploadedFilePath] = useState(
    filePath ?? emptyText
  );
  useEffect(() => {
    setUploadedFilePath(filePath ?? emptyText ?? "");
    setUploadedFileName(
      fileName !== undefined && fileName !== "" ? fileName : emptyText ?? ""
    );
  }, [filePath, fileName, emptyText]);

  const { excute: excuteUploadOrgFiles } = useUploadOrgFiles<
    UploadFile,
    ServiceModuleValue
  >();

  const { openSnackbar, closeSnackbar } =
    useReduxSnackbar<SnackbarProps>(SNACKBAR);

  const handleUploadFiles = async (acceptedFiles: File[]) => {
    try {
      openSnackbar({
        message: wordLibrary?.["please wait"] ?? "請稍候",
        severity: "warning",
        autoHideDuration: null,
      });
      const res = await excuteUploadOrgFiles({
        organizationId: organizationId || organizationIdforShareShortUrl || "",
        files: acceptedFiles,
        filePathType: ServiceModuleValue.DYNAMIC_COLUMN,
        imageSizeType: OrganizationMediaSizeType.NORMAL,
      });
      if (handleChange) {
        handleChange(name, res.data[0]?.uploadFileId);
        setUploadedFileName(
          `${res.data[0]?.uploadFileName}.${res.data[0]?.uploadFileExtensionName}`
        );
        setUploadedFilePath(`${res.data[0]?.uploadFilePath}`);
      }
      closeSnackbar({
        autoHideDuration: 4000,
      });
      openSnackbar({
        message: wordLibrary?.["added successfully"] ?? "新增成功",
        severity: "success",
        autoHideDuration: 4000,
      });
    } catch (error) {
      closeSnackbar({
        autoHideDuration: 4000,
      });
      openSnackbar({
        message:
          wordLibrary?.["system error,please contact the administrator"] ??
          "系統異常，請稍後再試。",
        severity: "error",
        autoHideDuration: 4000,
      });
    }
  };

  return (
    <>
      <FormLabel color="secondary">{label}</FormLabel>
      <Typography color="textSecondary">{uploadedFileName}</Typography>
      {uploadedFilePath && (
        <Upload
          name={name}
          file={uploadedFilePath}
          error={!!error}
          required={!!required}
          onDropAccepted={handleUploadFiles}
          accept="image/*"
          onRemove={() => {
            if (handleChange) {
              handleChange(name, undefined);
            }
            setUploadedFileName("");
            setUploadedFilePath("");
          }}
        />
      )}
      {!uploadedFilePath && (
        <Upload
          name={name}
          error={!!error}
          onDropAccepted={handleUploadFiles}
          accept="image/*"
          required={required}
          onRemove={() => {
            if (handleChange) {
              handleChange(name, undefined);
            }
            setUploadedFileName("");
            setUploadedFilePath("");
          }}
        />
      )}
      {!!error && (
        <Typography color="error" sx={{ fontSize: "12px", mt: 1 }}>
          此為必填欄位。
        </Typography>
      )}
    </>
  );
};

export default DynamicFileDropzone;
