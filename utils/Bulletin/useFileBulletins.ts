import { useCallback } from "react";
import FileSaver from "file-saver";
import { useSelector } from "react-redux";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import getDispositionFileName from "@eGroupAI/utils/getDispositionFileName";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import { SNACKBAR } from "components/App";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import { ServiceModuleValue } from "interfaces/utils";
import { UploadFile } from "interfaces/entities";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import apis from "../apis";
import useUploadFilesHandler from "../useUploadFilesHandler";

type HandleUploadFileArgs = {
  files: File[];
  filePathType: ServiceModuleValue;
  imageSizeType?: "PC" | "MOBILE" | "NORMAL";
  targetId?: string;
  onUploadSuccess?: (uploadFiles: UploadFile[]) => void;
  onSuccess?: () => void;
};

export default function useFileBulletin() {
  const organizationId = useSelector(getSelectedOrgId);
  const { openDialog: openConfirmDeleteDialog, closeDialog } =
    useReduxDialog(DELETE_DIALOG);
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);

  const { excute: downloadOrgFile } = useAxiosApiWrapper(
    apis.org.downloadOrgFile,
    "None"
  );
  const { excute: deleteOrgFile, isLoading: isDeleting } = useAxiosApiWrapper(
    apis.org.deleteOrgFile,
    "Delete"
  );
  const { excute: previewOrgFile } = useAxiosApiWrapper(
    apis.org.previewOrgFile,
    "None"
  );
  const { uploadOrgFiles, isOrgUploading, completed, inputEl } =
    useUploadFilesHandler();
  const { excute: createOrgFileTarget, isLoading: isCreating } =
    useAxiosApiWrapper(apis.org.createOrgFileTarget, "Create");

  const handleUploadFile = useCallback(
    ({
      files,
      filePathType,
      imageSizeType,
      targetId,
      onUploadSuccess,
      onSuccess,
    }: HandleUploadFileArgs) => {
      if (files.length === 0) return;
      uploadOrgFiles({
        organizationId,
        files,
        filePathType,
        imageSizeType,
        eGroupService: "WEBSITE",
      })
        .then((res) => {
          if (res) {
            if (onUploadSuccess) {
              onUploadSuccess(res.data);
            }
            if (targetId && res.data[0]) {
              createOrgFileTarget({
                organizationId,
                uploadFileId: res.data[0].uploadFileId,
                uploadFileTargetList: [
                  {
                    targetId,
                    uploadFile: {
                      uploadFilePathType: filePathType,
                    },
                  },
                ],
              })
                .then(() => {
                  if (onSuccess) {
                    onSuccess();
                  }
                })
                .catch(() => {});
            }
          }
        })
        .catch(() => {});
    },
    [createOrgFileTarget, organizationId, uploadOrgFiles]
  );

  const handlePreviewFile = (uploadFileId: string) => {
    if (organizationId) {
      previewOrgFile({
        organizationId,
        uploadFileId,
        eGroupService: "WEBSITE",
      })
        .then((res) => {
          window.open(res.data, "_blank");
        })
        .catch(() => {});
    }
  };

  const handleDownloadFile = (uploadFileId: string) => {
    if (organizationId) {
      downloadOrgFile({
        organizationId,
        uploadFileId,
        eGroupService: "WEBSITE",
      })
        .then((res) => {
          const filename = getDispositionFileName(
            res.headers["content-disposition"] as string
          );
          FileSaver.saveAs(res.data, filename);
        })
        .catch(() => {});
    }
  };

  const wordLibrary = useSelector(getWordLibrary);

  const handleDeleteFile = async (
    uploadFileId: string,
    onSuccess?: () => void
  ) => {
    if (!organizationId) return;
    openConfirmDeleteDialog({
      primary:
        wordLibrary?.["are you sure you want to delete this file"] ??
        "您確定要刪除此檔案?",
      onConfirm: () => {
        if (organizationId) {
          openSnackbar({
            message: wordLibrary?.["please wait"] ?? "請稍後",
            severity: "warning",
            autoHideDuration: null,
          });
          deleteOrgFile({
            organizationId,
            uploadFileId,
          })
            .then(() => {
              closeDialog();
              openSnackbar({
                message: wordLibrary?.["deletion successful"] ?? "刪除成功",
                severity: "success",
                autoHideDuration: 4000,
              });
              if (onSuccess) {
                onSuccess();
              }
            })
            .catch(() => {});
        }
      },
    });
  };

  return {
    handleUploadFile,
    handlePreviewFile,
    handleDownloadFile,
    handleDeleteFile,
    isUploading: isOrgUploading,
    isCreating,
    isDeleting,
    completed,
    inputEl,
  };
}
