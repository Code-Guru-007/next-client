import useWordLibrary from "@eGroupAI/hooks/useWordLibrary";
import { Typography } from "@eGroupAI/material";
import Dialog from "@eGroupAI/material/Dialog";
import DialogActions from "@eGroupAI/material/DialogActions";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";
import { Divider, Grid, Stack, Switch, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { SNACKBAR } from "components/App";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import { UploadFile } from "interfaces/entities";
import { ServiceModuleValue } from "interfaces/utils";
import { useRef } from "react";
import { useSelector } from "react-redux";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import MergeFileItem from "./MergeFileItem";

export const DIALOG = "MergeFilesDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface MergeFilesDialogProps {
  selectedFiles: UploadFile[];
  onUnselectFile: (unselectedFile: UploadFile) => void;
  filePathType: ServiceModuleValue;
  onMergeSuccess?: (
    mergedFiles: UploadFile[],
    isDeleted?: boolean
  ) => Promise<void> | void;
}

export default function MergeFilesDialog({
  selectedFiles,
  onUnselectFile,
  filePathType,
  onMergeSuccess,
}: MergeFilesDialogProps) {
  const classes = useStyles();
  const theme = useTheme();
  const { wordLibrary } = useWordLibrary();

  const organizationId = useSelector(getSelectedOrgId);
  const { openSnackbar, closeSnackbar } =
    useReduxSnackbar<SnackbarProps>(SNACKBAR);

  const { isOpen, closeDialog } = useReduxDialog(DIALOG);

  const switchRef = useRef<HTMLInputElement>(null);

  const { excute: mergeFiles } = useAxiosApiWrapper(
    apis.org.mergeFiles,
    "None"
  );

  const handleRemoveFile = (file: UploadFile) => {
    if (onUnselectFile) onUnselectFile(file);

    if (selectedFiles.length - 1 < 2) closeDialog();
  };

  const handleSubmit = async () => {
    if (!switchRef.current) return;

    try {
      closeDialog();
      openSnackbar({
        message: wordLibrary?.["please wait"] ?? "請稍後",
        severity: "warning",
        autoHideDuration: 999999,
      });
      const mergedFile = await mergeFiles({
        organizationId,
        uploadFileIdList: selectedFiles.map((f) => f.uploadFileId),
        filePathType,
        isDeleteAfterMerge: !switchRef?.current?.checked,
      });
      closeSnackbar();
      openSnackbar({
        message: "合併檔案成功",
        severity: "success",
        autoHideDuration: 4000,
      });
      if (onMergeSuccess)
        onMergeSuccess(mergedFile.data, !switchRef?.current?.checked);
    } catch (error) {
      closeSnackbar();
      openSnackbar({
        message: "合併檔案失敗",
        severity: "error",
        autoHideDuration: 4000,
      });
      apis.tools.createLog({
        function: "mergeFiles: error",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      fullWidth
      maxWidth={"md"}
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={closeDialog}>
        {wordLibrary?.["merge files"] ?? "檔案合併"}
      </DialogTitle>
      <DialogContent sx={{ position: "relative", "&&": { py: 2.5 } }}>
        <Grid
          container
          rowSpacing={3}
          columnSpacing={2.5}
          columns={{ xs: 1, sm: 3, md: 5 }}
        >
          {selectedFiles.map((f, idx) => (
            <Grid key={idx} item xs={1} md={1}>
              <MergeFileItem file={f} onRemove={handleRemoveFile} />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <Divider sx={{ borderStyle: "dashed" }} />
      <DialogActions>
        <Stack sx={{ width: "100%", gap: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="h5"
              color="textSecondary"
              sx={{ marginLeft: "15px" }}
            >
              {wordLibrary?.["keep original files"] ??
                "是否要保留合併前的舊檔？"}
            </Typography>
            <Switch inputRef={switchRef} defaultChecked />
          </Stack>
          <Stack direction="row" justifyContent="end" gap={1.5}>
            <DialogCloseButton onClick={closeDialog} rounded />
            <DialogConfirmButton type="submit" rounded onClick={handleSubmit}>
              {wordLibrary?.confirm ?? "確認"}
            </DialogConfirmButton>
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
