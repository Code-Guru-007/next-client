import React, { FC, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import FileSaver from "file-saver";

import { makeStyles, styled } from "@mui/styles";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";

import Box from "@eGroupAI/material/Box";
import Typography from "@eGroupAI/material/Typography";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import IconButton from "@eGroupAI/material/IconButton";

import useUploadFilesHandler from "utils/useUploadFilesHandler";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import getFileNameFromContentDisposition from "utils/getFileNameFromContentDisposition";
import { ServiceModuleValue } from "interfaces/utils";
import { SNACKBAR as GLOBAL_SNACKBAR } from "components/App";
import { UploadFile } from "interfaces/entities";
import { DynamicValueType } from "interfaces/form";
import clsx from "clsx";

import { DIALOG as DELETE_CONFIRM_DIALOG } from "components/ConfirmDeleteDialog";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { useResponsive } from "minimal/hooks/use-responsive";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";

const useStyles = makeStyles(() => ({
  label: {
    minWidth: "100px",
    minHeight: "20px",
    alignItems: "center",
    display: "flex",
    position: "relative",
  },
  labelWidthFitContent: {
    width: "fit-content",
  },
  lebelWidthMinContent: {
    width: "min-content",
  },
  pointer: {
    cursor: "pointer",
  },
  fileInput: {
    display: "none",
  },
  actions: {
    position: "absolute",
    right: 0,
    transform: "translateX(100%)",
    display: "flex",
  },
  actionsRWD: {
    display: "flex",
    marginTop: "16px",
  },
}));

const StyledIconHoverButton = styled(IconButton)(({ theme }) => ({
  padding: "7px 8px 7px 7px",
  backgroundColor: "transparent",
  "&:hover": {
    filter: "none",
    backgroundColor: theme.palette.grey[600],
  },
}));

interface UploadFileWithActionProps {
  name: string;
  value?: string;
  onClickHistory?: (event: any) => void;
  handleOnChange?: (
    name: string,
    value?: DynamicValueType
  ) => void | Promise<void | string>;
  showHistoryIcon: boolean;
  uploadFile?: UploadFile;
  boldText?: boolean;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const UploadFileWithAction: FC<UploadFileWithActionProps> = (props) => {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    name,
    value,
    onClickHistory,
    handleOnChange,
    showHistoryIcon = false,
    uploadFile,
    boldText = false,
    readable = false,
    writable = false,
    deletable = false,
  } = props;

  const classes = useStyles();
  const isDownSM = useResponsive("down", "sm");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHover, setIsHover] = useState(false);
  const organizationId = useSelector(getSelectedOrgId);
  const { openSnackbar, closeSnackbar } =
    useReduxSnackbar<SnackbarProps>(GLOBAL_SNACKBAR);
  const { uploadOrgFiles } = useUploadFilesHandler({ useImageCompress: false });
  const { excute: downloadOrgFile } = useAxiosApiWrapper(
    apis.org.downloadOrgFile,
    "None"
  );
  const { excute: previewOrgFile } = useAxiosApiWrapper(
    apis.org.previewOrgFile,
    "None"
  );

  const { excute: deleteOrgFile } = useAxiosApiWrapper(
    apis.org.deleteOrgFile,
    "Delete"
  );

  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeDeleteConfirmDialog,
  } = useReduxDialog(DELETE_CONFIRM_DIALOG);

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
        if (handleOnChange) handleOnChange(name, { value: uploadFileId });
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

  const handleDownloadFile = async () => {
    if (uploadFile) {
      const resp = await downloadOrgFile({
        organizationId,
        uploadFileId: uploadFile.uploadFileId,
        eGroupService: "WEBSITE",
      });
      const filename = getFileNameFromContentDisposition(
        resp.headers["content-disposition"] as string
      );
      FileSaver.saveAs(resp.data, filename);
    }
  };

  /**
   * iPhone is blocking pop-ups by default after async call.
   */
  const handlePreviewFile = async () => {
    /**
     * ---------- iPhone issue - Blocking Pop-ups ----------
     *iPhone safari default setting is blocking pop-ups that are not direct user interaction.
     *
     * And below opening a window after async call await,
     *  seems like to be considered as an in-direct user interaction in iPhone.
     *  So the preiew pop-up window is preventing to be opened.
     * We need to avoid using of async calls awaiting before window.open()
     */

    try {
      if (uploadFile) {
        const resp = await previewOrgFile({
          organizationId,
          uploadFileId: uploadFile.uploadFileId,
          eGroupService: "WEBSITE",
        });

        // if file uploaded successfully then open a new preview tab
        if (resp) {
          const newWindow = window.open(resp.data, "_blank");
          if (!newWindow) {
            // eslint-disable-next-line no-alert
            alert(
              "It seems like you enabled Pop-ups Blocker in browser settings. \n Please disable it."
            );
          }
        }
      }
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: handlePreviewFile",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  const handleDeleteFile = async () => {
    if (uploadFile) {
      openConfirmDeleteDialog({
        primary: "Do you really want to delete this file uploaded?",
        onConfirm: async () => {
          await deleteOrgFile({
            organizationId,
            uploadFileId: uploadFile.uploadFileId,
            eGroupService: "WEBSITE",
          });
          if (handleOnChange) {
            handleOnChange(name, { value: "" });
          }
          closeDeleteConfirmDialog();
        },
      });
    }
  };

  const fileName = useMemo(
    () =>
      uploadFile
        ? `${uploadFile.uploadFileName}.${uploadFile.uploadFileExtensionName}`
        : value || "",
    [uploadFile, value]
  );

  return (
    <>
      {!isDownSM && (
        <Box
          className={clsx(
            classes.label,
            writable && classes.pointer,
            isDownSM
              ? classes.lebelWidthMinContent
              : classes.labelWidthFitContent
          )}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          {fileName ? (
            <Typography
              weight={boldText ? "bold" : "regular"}
              sx={{
                minWidth: "67px",
                minHeight: "21px",
                fontSize: 14,
              }}
            >
              {fileName}
            </Typography>
          ) : (
            writable && (
              <IconButton
                onClick={() => {
                  inputRef.current?.click();
                }}
              >
                <UploadRoundedIcon fontSize="medium" />
              </IconButton>
            )
          )}
          <input
            type="file"
            className={classes.fileInput}
            ref={inputRef}
            onChange={handleUploadFile}
          />
          {isHover && showHistoryIcon && !uploadFile && (
            <StyledIconHoverButton
              onClick={(event) => {
                event.stopPropagation();
                if (onClickHistory) onClickHistory(event);
              }}
            >
              <HistoryRoundedIcon fontSize="medium" />
            </StyledIconHoverButton>
          )}
          <Box className={clsx(classes.actions)}>
            {isHover && uploadFile && (
              <>
                {writable && (
                  <StyledIconHoverButton
                    onClick={() => {
                      inputRef.current?.click();
                    }}
                  >
                    <UploadRoundedIcon fontSize="medium" />
                  </StyledIconHoverButton>
                )}
                {readable && (
                  <StyledIconHoverButton onClick={handleDownloadFile}>
                    <DownloadRoundedIcon fontSize="medium" />
                  </StyledIconHoverButton>
                )}
                {readable && (
                  <StyledIconHoverButton onClick={handlePreviewFile}>
                    <RemoveRedEyeRoundedIcon fontSize="medium" />
                  </StyledIconHoverButton>
                )}
                {showHistoryIcon && (
                  <StyledIconHoverButton
                    onClick={(event) => {
                      event.stopPropagation();
                      if (onClickHistory) onClickHistory(event);
                    }}
                  >
                    <HistoryRoundedIcon fontSize="medium" />
                  </StyledIconHoverButton>
                )}
                {deletable && (
                  <StyledIconHoverButton onClick={handleDeleteFile}>
                    <DeleteRoundedIcon fontSize="medium" />
                  </StyledIconHoverButton>
                )}
              </>
            )}
          </Box>
        </Box>
      )}
      {isDownSM && (
        <>
          <Box
            className={clsx(
              classes.label,
              writable && classes.pointer,
              classes.labelWidthFitContent
              // isDownSM
              //   ? classes.lebelWidthMinContent
              //   : classes.labelWidthFitContent
            )}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
          >
            {fileName ? (
              <Typography
                weight={boldText ? "bold" : "regular"}
                sx={{
                  minWidth: "67px",
                  minHeight: "21px",
                  fontSize: 14,
                }}
              >
                {fileName}
              </Typography>
            ) : (
              writable && (
                <IconButton
                  onClick={() => {
                    inputRef.current?.click();
                  }}
                >
                  <UploadRoundedIcon fontSize="medium" />
                </IconButton>
              )
            )}
            <input
              type="file"
              className={classes.fileInput}
              ref={inputRef}
              onChange={handleUploadFile}
            />
            {isHover && showHistoryIcon && !uploadFile && (
              <StyledIconHoverButton
                onClick={(event) => {
                  event.stopPropagation();
                  if (onClickHistory) onClickHistory(event);
                }}
              >
                <HistoryRoundedIcon fontSize="medium" />
              </StyledIconHoverButton>
            )}
          </Box>
          <Box className={clsx(classes.actionsRWD)}>
            {isHover && uploadFile && (
              <>
                {writable && (
                  <StyledIconHoverButton
                    onClick={() => {
                      inputRef.current?.click();
                    }}
                  >
                    <UploadRoundedIcon fontSize="medium" />
                  </StyledIconHoverButton>
                )}
                {readable && (
                  <StyledIconHoverButton onClick={handleDownloadFile}>
                    <DownloadRoundedIcon fontSize="medium" />
                  </StyledIconHoverButton>
                )}
                {readable && (
                  <StyledIconHoverButton onClick={handlePreviewFile}>
                    <RemoveRedEyeRoundedIcon fontSize="medium" />
                  </StyledIconHoverButton>
                )}
                {showHistoryIcon && (
                  <StyledIconHoverButton
                    onClick={(event) => {
                      event.stopPropagation();
                      if (onClickHistory) onClickHistory(event);
                    }}
                  >
                    <HistoryRoundedIcon fontSize="medium" />
                  </StyledIconHoverButton>
                )}
                {deletable && (
                  <StyledIconHoverButton onClick={handleDeleteFile}>
                    <DeleteRoundedIcon fontSize="medium" />
                  </StyledIconHoverButton>
                )}
              </>
            )}
          </Box>
        </>
      )}
    </>
  );
};

export default UploadFileWithAction;
