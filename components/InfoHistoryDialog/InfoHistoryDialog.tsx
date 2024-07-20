import React, { FC, useEffect, useRef } from "react";
import FileSaver from "file-saver";

import { useReduxDialog } from "@eGroupAI/redux-modules";
import useOrgRecordTargets from "utils/useOrgRecordTargets";
import { useSelector } from "react-redux";
import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { format } from "@eGroupAI/utils/dateUtils";
import { ColumnType } from "@eGroupAI/typings/apis";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import clsx from "clsx";
import { useSettingsContext } from "minimal/components/settings";
import Iconify from "minimal/components/iconify";
import Table from "@eGroupAI/material/Table";
import TableHead from "@eGroupAI/material/TableHead";
import TableBody from "@eGroupAI/material/TableBody";
import TableRow from "@eGroupAI/material/TableRow";
import TableCell from "@eGroupAI/material/TableCell";
import Dialog from "@eGroupAI/material/Dialog";
import Typography from "@eGroupAI/material/Typography";
import DialogContent from "@eGroupAI/material/DialogContent";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useUploadFilesHandler from "utils/useUploadFilesHandler";
import { ServiceModuleValue } from "interfaces/utils";
import getFileNameFromContentDisposition from "utils/getFileNameFromContentDisposition";
import DialogCloseButton from "components/DialogCloseButton";
import FroalaEditorView from "components/FroalaEditorView";
import { SNACKBAR as GLOBAL_SNACKBAR } from "components/App";
import { DynamicFieldWithActionHandleChangeType } from "privatePages/CrmUser/types";

export const DIALOG = "InfoHistoryDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  showLoader: {
    display: "flex",
  },
  lightOpacity: {
    background: "rgba(255,255,255,0.6)",
  },
  darkOpacity: {
    background: "rgba(33, 43, 54, 0.6)",
  },
  fileInput: {
    display: "none",
  },
}));

export type RecordTarget = {
  key?: string;
  type?: ColumnType;
  name?: string;
  permission?: {
    readable?: boolean;
    writable?: boolean;
    deletable?: boolean;
  };
};
export interface InfoHistoryDialogProps {
  targetId: string;
  recordTarget: RecordTarget;
  handleChange?: DynamicFieldWithActionHandleChangeType;
  values?: any;
}

const getFormatTargetValue = (type: ColumnType, value: string) => {
  switch (type) {
    case ColumnType.DATE:
      return format(value, "PP");
    case ColumnType.DATETIME:
      return format(value, "MMM dd, yyyy | HH:mm");
    case ColumnType.TEXT_MULTI:
      return <FroalaEditorView model={value} />;
    default:
      return value;
  }
};

const InfoHistoryDialog: FC<InfoHistoryDialogProps> = function (props) {
  const { targetId, recordTarget, handleChange, values } = props;

  const {
    // readable = false,
    writable = false,
    // deletable = false,
  } = recordTarget?.permission || {};

  const classes = useStyles();
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const settings = useSettingsContext();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const organizationId = useSelector(getSelectedOrgId);
  const { openSnackbar, closeSnackbar } =
    useReduxSnackbar<SnackbarProps>(GLOBAL_SNACKBAR);
  const { data, mutate } = useOrgRecordTargets(
    {
      organizationId,
    },
    {
      targetId,
      organizationRecordTargetKey: recordTarget.key,
    },
    undefined,
    !recordTarget.key
  );
  const { uploadOrgFiles } = useUploadFilesHandler();
  const { excute: downloadOrgFile } = useAxiosApiWrapper(
    apis.org.downloadOrgFile,
    "None"
  );
  const { excute: previewOrgFile } = useAxiosApiWrapper(
    apis.org.previewOrgFile,
    "None"
  );

  useEffect(() => {
    if (mutate) {
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const handleUploadFile = async (e) => {
    if (e.target.files) {
      openSnackbar({
        message: wordLibrary?.["please wait"] ?? "請稍後",
        severity: "warning",
        autoHideDuration: 999999,
      });
      const res = await uploadOrgFiles({
        organizationId,
        files: Array.from(e.target.files),
        filePathType: ServiceModuleValue.DYNAMIC_COLUMN,
        eGroupService: "WEBSITE",
      });
      if (res) {
        const uploadFileId = res.data[0]?.uploadFileId;
        if (handleChange)
          handleChange(recordTarget.key || "", { value: uploadFileId });
        mutate();
        closeSnackbar();
        if (inputRef?.current) {
          inputRef.current.value = "";
        }
        openSnackbar({
          message: wordLibrary?.["added successfully"] ?? "新增成功",
          severity: "success",
          autoHideDuration: 4000,
        });
      }
    }
  };

  const handleDownloadFile = async (uploadFileId: string | undefined) => {
    if (uploadFileId) {
      const resp = await downloadOrgFile({
        organizationId,
        uploadFileId,
        eGroupService: "WEBSITE",
      });
      const filename = getFileNameFromContentDisposition(
        resp.headers["content-disposition"] as string
      );
      FileSaver.saveAs(resp.data, filename);
    }
  };

  const handlePreviewFile = async (uploadFileId: string | undefined) => {
    if (uploadFileId) {
      const resp = await previewOrgFile({
        organizationId,
        uploadFileId,
        eGroupService: "WEBSITE",
      });
      window.open(resp.data, "_blank");
    }
  };

  const wordLibrary = useSelector(getWordLibrary);

  const renderContent = () => {
    if (!data) {
      return (
        <div
          className={clsx(classes.loader, true && classes.showLoader, {
            [classes.lightOpacity]: settings.themeMode === "light",
            [classes.darkOpacity]: settings.themeMode !== "light",
          })}
        >
          <CircularProgress />
        </div>
      );
    }
    if (data.length === 0) {
      return (
        <Typography variant="body2">
          {wordLibrary?.["no data available"] ?? "無資料"}
        </Typography>
      );
    }
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              {wordLibrary?.["history record"] ?? "歷史紀錄"}
            </TableCell>
            <TableCell>{wordLibrary?.time ?? "時間"}</TableCell>
            <TableCell>{wordLibrary?.editor ?? "編輯者"}</TableCell>
            {recordTarget.type === "FILE" && <TableCell> </TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((el) => (
            <TableRow key={el.organizationRecordTargetId}>
              <TableCell>
                {recordTarget.type &&
                  getFormatTargetValue(
                    recordTarget.type,
                    el.organizationRecordTargetValue
                  )}
              </TableCell>
              <TableCell>
                {format(el.organizationRecordTargetCreateDate, "PP pp")}
              </TableCell>
              <TableCell>
                {el.updater?.memberName ||
                  `${wordLibrary?.["edit via link"] ?? "透過連結編輯"}`}
              </TableCell>
              {recordTarget.type === "FILE" && (
                <TableCell>
                  <IconButton
                    onClick={() => {
                      handlePreviewFile(el.uploadFileId);
                    }}
                  >
                    <RemoveRedEyeRoundedIcon fontSize="medium" />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      handleDownloadFile(el.uploadFileId);
                    }}
                  >
                    <CloudDownloadIcon fontSize="medium" />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      fullWidth
      maxWidth="md"
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle
        onClickClose={recordTarget.type === "FILE" ? undefined : closeDialog}
        isFlex={recordTarget.type === "FILE"}
      >
        {wordLibrary?.["history record"] ?? "歷史紀錄"} -{" "}
        {wordLibrary?.[recordTarget.name || ""] ?? recordTarget.name}
        {recordTarget.type === "FILE" && writable && (
          <Button
            variant="contained"
            onClick={() => {
              inputRef.current?.click();
            }}
            startIcon={<Iconify icon="eva:cloud-upload-fill" />}
          >
            上傳新版本
          </Button>
        )}
      </DialogTitle>
      <DialogContent>
        {recordTarget.type === "FILE" && writable && (
          <input
            type="file"
            className={classes.fileInput}
            ref={inputRef}
            onChange={handleUploadFile}
          />
        )}
        {renderContent()}
      </DialogContent>
      <DialogActions>
        <DialogCloseButton onClick={closeDialog} />
      </DialogActions>
    </Dialog>
  );
};

export default InfoHistoryDialog;
