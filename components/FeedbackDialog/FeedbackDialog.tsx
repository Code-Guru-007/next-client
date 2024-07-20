import React, { useState, useCallback } from "react";

import { useReduxDialog } from "@eGroupAI/redux-modules";
import { useSelector } from "react-redux";

import { makeStyles } from "@mui/styles";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import ScreenshotMonitorIcon from "@mui/icons-material/ScreenshotMonitor";
import Button from "@mui/material/Button";

import Dialog from "@eGroupAI/material/Dialog";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import DialogActions from "@mui/material/DialogActions";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import FroalaEditor from "components/FroalaEditor";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import {
  OrganizationMediaSizeType,
  ServiceModuleValue,
} from "interfaces/utils";
import { ScreenCapture } from "react-screen-capture";
import useUploadOrgFiles from "@eGroupAI/hooks/apis/useUploadOrgFiles";
import { UploadFile } from "interfaces/entities";

export const DIALOG = "FeedbackDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
  editSectionContainer: {
    padding: 10,
    borderRadius: 8,
    boxShadow: "none",
    marginBottom: 0,
    border: "1px solid rgba(145, 158, 171, 0.2)",
    wordBreak: "break-word",
    boxSizing: "border-box",
  },
}));

const FeedbackDialog = function () {
  const classes = useStyles();
  const theme = useTheme();
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const { isOpen, closeDialog } = useReduxDialog(DIALOG);
  const [newFeedback, setNewFeedback] = useState<string>("");
  const [dialogOpacity, setDialogOpacity] = useState<number>(1);
  const { excute: createOrgFeedback, isLoading } = useAxiosApiWrapper(
    apis.org.createOrgFeedback,
    "Create"
  );

  const { excute: uploadOrgFiles } = useUploadOrgFiles<
    UploadFile,
    ServiceModuleValue
  >();

  const handleClose = () => {
    setNewFeedback("");
    closeDialog();
  };

  const getScreenShotFile = (screenCapturedUrl: string): File => {
    const imageData = screenCapturedUrl.split(",")[1] || "";
    const binaryData = atob(imageData);
    const arrayBuffer = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      arrayBuffer[i] = binaryData.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: "image/png" });
    const file = new File([blob], "screenshot.png", {
      type: blob.type,
    });
    return file;
  };

  const handleUploadScreenCapturedFile = useCallback(
    async (screenshotFile: File) => {
      const res = await uploadOrgFiles({
        organizationId,
        filePathType: ServiceModuleValue.FEEDBACK,
        imageSizeType: OrganizationMediaSizeType.NORMAL,
        files: [screenshotFile],
        eGroupService: "WEBSITE",
      });

      const imageTag = `<img src="${res.data[0]?.uploadFilePath}" class="fr-fic fr-dib fr-draggable">`;
      const editorElement = document.querySelector(".fr-element");
      if (editorElement) {
        editorElement.innerHTML += imageTag;
      }
    },
    [organizationId, uploadOrgFiles]
  );

  const handleScreenCapture = (screenCapturedUrl: string) => {
    setDialogOpacity(1);
    const mButton = document.querySelector(
      ".MuiButtonBase-root.MuiIconButton-root.MuiIconButton-sizeMedium.css-numyp9-MuiButtonBase-root-MuiIconButton-root"
    ) as HTMLButtonElement;
    if (mButton) {
      mButton.style.opacity = "1";
    }

    const header = document.querySelector(
      ".MuiPaper-root.MuiPaper-elevation.MuiPaper-elevation4.MuiAppBar-root.MuiAppBar-colorTransparent.MuiAppBar-positionFixed.mui-fixed"
    ) as HTMLElement;
    header.style.zIndex = "0";

    const file = getScreenShotFile(screenCapturedUrl);
    handleUploadScreenCapturedFile(file);
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createOrgFeedback({
      organizationId,
      organizationMemberFeedbackContent: newFeedback,
      organizationMemberFeedbackBrowserDescription: navigator.userAgent,
    })
      .then(() => {
        handleClose();
      })
      .catch(() => {});
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ScreenCapture
        onStartCapture={() => null}
        onEndCapture={handleScreenCapture}
      >
        {({ onStartCapture }) => (
          <Dialog
            open={isOpen}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            className={classes.dialogPaper}
            transitionDuration={{
              enter: theme.transitions.duration.shortest,
              exit: theme.transitions.duration.shortest - 80,
            }}
            style={{
              opacity: dialogOpacity,
              cursor: dialogOpacity !== 1 ? "crosshair" : "auto",
            }}
            disableEnforceFocus
          >
            <DialogTitle onClickClose={handleClose}>
              {wordLibrary?.feedback ? wordLibrary?.feedback : "意見回饋"}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
              <DialogFullPageContainer>
                <Box
                  sx={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Button
                    style={{
                      alignSelf: "flex-end",
                    }}
                    onClick={() => {
                      setDialogOpacity(0);
                      const mDiv = document.querySelector(
                        ".MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation0.MuiAutocomplete-paper.css-1vqa58f-MuiPaper-root-MuiAutocomplete-paper"
                      ) as HTMLElement;

                      const header = document.querySelector(
                        ".MuiPaper-root.MuiPaper-elevation.MuiPaper-elevation4.MuiAppBar-root.MuiAppBar-colorTransparent.MuiAppBar-positionFixed.mui-fixed"
                      ) as HTMLElement;

                      const mButton = document.querySelector(
                        ".MuiButtonBase-root.MuiIconButton-root.MuiIconButton-sizeMedium.css-numyp9-MuiButtonBase-root-MuiIconButton-root"
                      ) as HTMLButtonElement;

                      if (mDiv) {
                        mDiv.style.display = "none";
                      }
                      if (mButton) {
                        mButton.style.opacity = "0.5";
                      }
                      if (header) {
                        header.style.zIndex = "-999";
                      }
                      onStartCapture();
                    }}
                  >
                    <ScreenshotMonitorIcon fontSize="small" />
                  </Button>

                  <FroalaEditor
                    filePathType={ServiceModuleValue.FEEDBACK}
                    className={classes.editSectionContainer}
                    model={newFeedback}
                    onModelChange={(model) => {
                      setNewFeedback(model);
                    }}
                    config={{
                      toolbarInline: true,
                      toolbarVisibleWithoutSelection: false,
                      charCounterCount: false,
                      placeholderText:
                        wordLibrary?.["welcome to give feedback"] ??
                        "歡迎給予回饋",
                      imageDefaultMargin: 7,
                      imageOutputSize: false,
                      heightMin: 200,
                    }}
                  />
                  <input
                    name="feedback"
                    required
                    value={newFeedback}
                    style={{
                      position: "absolute",
                      top: "30px",
                      left: "20px",
                      maxWidth: "140px",
                      zIndex: -1,
                    }}
                  />
                </Box>
              </DialogFullPageContainer>

              <DialogActions>
                <DialogCloseButton onClick={handleClose} />
                <DialogConfirmButton
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {wordLibrary?.save ?? "儲存"}
                </DialogConfirmButton>
              </DialogActions>
            </form>
          </Dialog>
        )}
      </ScreenCapture>
    </div>
  );
};

export default FeedbackDialog;
