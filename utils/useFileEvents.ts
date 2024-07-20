import { useCallback } from "react";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
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
import apis from "./apis";
import useUploadFilesHandler from "./useUploadFilesHandler";

export type HandleUploadFileArgs = {
  files: File[];
  filePathType: ServiceModuleValue;
  imageSizeType?: "PC" | "MOBILE" | "NORMAL";
  targetId?: string;
  onUploadSuccess?: (uploadFiles: UploadFile[]) => void;
  onSuccess?: () => void;
};

export type UseFileEventsParams = {
  useImageCompressUpload?: boolean;
};

export default function useFileBulletins(params?: UseFileEventsParams) {
  const { useImageCompressUpload = true } = params || {};
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
    useUploadFilesHandler({ useImageCompress: useImageCompressUpload });
  const { excute: createOrgFileTarget, isLoading: isCreating } =
    useAxiosApiWrapper(apis.org.createOrgFileTarget, "Create");

  const handleUploadFile = useCallback(
    async ({
      files,
      filePathType,
      imageSizeType,
      targetId,
      onUploadSuccess,
      onSuccess,
    }: HandleUploadFileArgs) => {
      if (files.length === 0) return;
      try {
        const res = await uploadOrgFiles({
          organizationId,
          files,
          filePathType,
          imageSizeType,
          eGroupService: "WEBSITE",
        });
        if (res) {
          if (onUploadSuccess) {
            onUploadSuccess(res.data);
          }
          if (targetId && res.data) {
            const promises = res.data.map((uploadedFile: UploadFile) =>
              createOrgFileTarget({
                organizationId,
                uploadFileId: uploadedFile.uploadFileId,
                uploadFileTargetList: [
                  {
                    targetId,
                    uploadFile: {
                      uploadFilePathType: filePathType,
                    },
                  },
                ],
              })
            );
            Promise.all(promises).catch(() => {});
            // await createOrgFileTarget({
            //   organizationId,
            //   uploadFileId: res.data[0].uploadFileId,
            //   uploadFileTargetList: [
            //     {
            //       targetId,
            //       uploadFile: {
            //         uploadFilePathType: filePathType,
            //       },
            //     },
            //   ],
            // }).catch(() => {});
            if (onSuccess) {
              onSuccess();
            }
          }
        }
      } catch (error) {
        apis.tools.createLog({
          function: "DatePicker: handleUploadFile",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
    },
    [createOrgFileTarget, organizationId, uploadOrgFiles]
  );

  const handlePreviewFile = async (uploadFileId: string) => {
    if (organizationId) {
      try {
        const res = await previewOrgFile({
          organizationId,
          uploadFileId,
          eGroupService: "WEBSITE",
        });
        window.open(res.data, "_blank");
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
    }
  };

  const handleDownloadFile = async (uploadFileId: string) => {
    if (organizationId) {
      try {
        const res = await downloadOrgFile({
          organizationId,
          uploadFileId,
          eGroupService: "WEBSITE",
        });
        const filename = getDispositionFileName(
          res.headers["content-disposition"] as string
        );
        FileSaver.saveAs(res.data, filename);
      } catch (error) {
        apis.tools.createLog({
          function: "DatePicker: handleDownloadFile",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
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
      onConfirm: async () => {
        if (organizationId) {
          openSnackbar({
            message: wordLibrary?.["please wait"] ?? "請稍候",
            severity: "warning",
            autoHideDuration: null,
          });
          try {
            await deleteOrgFile({
              organizationId,
              uploadFileId,
            });
            closeDialog();
            openSnackbar({
              message: wordLibrary?.["deletion successful"] ?? "刪除成功",
              severity: "success",
              autoHideDuration: 4000,
            });
            if (onSuccess) {
              onSuccess();
            }
          } catch (error) {
            apis.tools.createLog({
              function: "DatePicker: handleDeleteFile",
              browserDescription: window.navigator.userAgent,
              jsonData: {
                data: error,
                deviceInfo: getDeviceInfo(),
              },
              level: "ERROR",
            });
          }
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
