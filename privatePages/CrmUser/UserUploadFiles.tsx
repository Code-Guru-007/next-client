import React, { FC, useMemo, useState } from "react";

import { useReduxDialog } from "@eGroupAI/redux-modules";
import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import {
  EachRowState,
  RowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { UploadFile } from "interfaces/entities";
import useFileEvents from "utils/useFileEvents";

import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import { format as formatDate } from "@eGroupAI/utils/dateUtils";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";
import FileSaver from "file-saver";

import {
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  TableCell,
} from "@mui/material";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import I18nDataTable from "components/I18nDataTable";
import Iconify from "minimal/components/iconify/iconify";

import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";

import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import { useSettingsContext } from "minimal/components/settings";
import UploadFilesDataTableRow from "components/UploadFilesDataTableRow";
import MergeFilesDialog, {
  DIALOG as MERGE_FILES_DIALOG,
} from "components/MergeFilesDialog";

import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import { ServiceModuleValue } from "interfaces/utils";
import getFileNameFromContentDisposition from "utils/getFileNameFromContentDisposition";
import UserUploadFileDropzoneDialog from "./UserUploadFileDropzoneDialog";
import UserUploadFileDialog, { DIALOG } from "./UserUploadFileDialog";

export interface UserUploadFilesProps {
  orgUserId: string;
  data?: UploadFile[];
  loading?: boolean;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
  onMergeSuccess?: (mergedFiles: UploadFile[]) => void;
  mutate: () => void;
}

const useStyles = makeStyles(() => ({
  loader: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
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
}));

const UserUploadFiles: FC<UserUploadFilesProps> = function (props) {
  const classes = useStyles(props);
  const {
    orgUserId,
    data,
    loading = false,
    readable = false,
    writable = false,
    deletable = false,
    onMergeSuccess,
    mutate,
  } = props;
  const settings = useSettingsContext();
  const { data: curMemberInfo } = useMemberInfo();

  const organizationId = useSelector(getSelectedOrgId);
  const { openDialog } = useReduxDialog(DIALOG);
  const {
    isOpen,
    handleOpen: openUploadDialog,
    handleClose: closeUploadDialog,
  } = useIsOpen(false);
  const { isOpen: isMergeFilesDialogOpened, openDialog: openMergeFilesDialog } =
    useReduxDialog(MERGE_FILES_DIALOG);

  const { handleChangePage, handleRowsPerPageChange, page, rowsPerPage } =
    useDataTable(
      `CrmUserUploadFilesDataTable-${orgUserId}`,
      {},
      {
        fromKey: "startIndex",
        enableLocalStorageCache: true,
      }
    );
  const { handleDownloadFile, handlePreviewFile } = useFileEvents();

  const matchMutate = useSwrMatchMutate();

  const { excute: downloadOrgFilesBatch, isLoading: isDownloading = false } =
    useAxiosApiWrapper(apis.org.downloadOrgFilesBatch, "Download");

  const { excute: deleteOrgFile, isLoading: isDeleting = false } =
    useAxiosApiWrapper(apis.org.deleteOrgFile, "Delete");
  const { excute: deleteOrgFiles, isLoading: isDeletingFiles = false } =
    useAxiosApiWrapper(apis.org.deleteOrgFiles, "Delete");
  const { excute: createOrgFileTarget } = useAxiosApiWrapper(
    apis.org.createOrgFileTarget,
    "None"
  );

  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<UploadFile>();
  const [eachRowState, setEachRowState] = useState<EachRowState<UploadFile>>(
    {}
  );
  const wordLibrary = useSelector(getWordLibrary);

  const selectedFiles = useMemo(
    () => Object.values(eachRowState).filter((el) => el?.checked),
    [eachRowState]
  );

  const targetIdList = useMemo(
    () => selectedFiles.map((el) => el?.data?.uploadFileId),
    [selectedFiles]
  );

  const buttonTools = writable && (
    <Tooltip title={wordLibrary?.["upload file"] ?? "上傳檔案"}>
      <Button
        onClick={openUploadDialog}
        variant="contained"
        startIcon={<Iconify icon="ic:round-upload" />}
      >
        {wordLibrary?.["upload file"] ?? "上傳檔案"}
      </Button>
    </Tooltip>
  );

  const selectedToolsbar = (
    <>
      {selectedFiles.length >= 2 &&
        selectedFiles.every((f) =>
          f?.data?.uploadFileExtensionName.match(/(jpe?g|png|pdf|webp)/i)
        ) &&
        readable &&
        writable && (
          <Tooltip title={wordLibrary?.["merge files"] ?? "檔案合併"}>
            <IconButton onClick={openMergeFilesDialog} color="primary">
              <Iconify icon="material-symbols:picture-as-pdf" width={24} />
            </IconButton>
          </Tooltip>
        )}
      {selectedFiles.length !== 0 && deletable && (
        <Tooltip title={wordLibrary?.["delete file"] ?? "刪除檔案"}>
          <IconButton
            onClick={() => {
              openConfirmDeleteDialog({
                primary:
                  wordLibrary?.["are you sure you want to delete this file"] ??
                  "您確定要刪除此檔案?" +
                    `${
                      targetIdList.length > 1
                        ? `(${targetIdList.length} 筆資料)`
                        : ""
                    }`,
                onConfirm: async () => {
                  try {
                    deleteOrgFiles({
                      organizationId,
                      uploadFileIdList: targetIdList.map(
                        (targetId) => targetId as string
                      ),
                    })
                      .then(() => {
                        setDeleteState(true);
                        matchMutate(
                          new RegExp(
                            `^/organizations/${organizationId}/users/${orgUserId}\\?`,
                            "g"
                          )
                        );
                        setEachRowState({});
                      })
                      .catch(() => {});
                    closeDeleteDialog();
                  } catch (error) {
                    apis.tools.createLog({
                      function: "DatePicker: openConfirmDeleteDialog",
                      browserDescription: window.navigator.userAgent,
                      jsonData: {
                        data: error,
                        deviceInfo: getDeviceInfo(),
                      },
                      level: "ERROR",
                    });
                  }
                },
              });
            }}
            color="primary"
          >
            <Iconify icon="solar:trash-bin-trash-bold" width={24} />
          </IconButton>
        </Tooltip>
      )}
      {selectedFiles.length !== 0 && readable && (
        <Tooltip title={wordLibrary?.["download file"] ?? "下載檔案"}>
          <IconButton
            onClick={async () => {
              if (targetIdList.length > 1) {
                const resp = await downloadOrgFilesBatch({
                  organizationId,
                  uploadFileIdList: targetIdList.map(
                    (targetId) => targetId as string
                  ),
                  eGroupService: "WEBSITE",
                });
                const filename = getFileNameFromContentDisposition(
                  resp.headers["content-disposition"] as string
                );
                FileSaver.saveAs(resp.data, filename);
                matchMutate(
                  new RegExp(
                    `^/organizations/${organizationId}/users/${orgUserId}\\?`,
                    "g"
                  )
                );
                setEachRowState({});
              } else if (targetIdList.length === 1) {
                handleDownloadFile(targetIdList[0] as string)
                  .then(() => {
                    matchMutate(
                      new RegExp(
                        `^/organizations/${organizationId}/users/${orgUserId}\\?`,
                        "g"
                      )
                    );
                  })
                  .catch(() => {});
                setEachRowState({});
              }
            }}
            color="primary"
          >
            <Iconify icon="ic:round-download" width={24} />
          </IconButton>
        </Tooltip>
      )}
      {selectedFiles.length === 1 && readable && (
        <Tooltip title={wordLibrary?.["preview file"] ?? "預覽檔案"}>
          <IconButton
            onClick={() => {
              if (targetIdList.length === 1) {
                handlePreviewFile(targetIdList[0] as string);
                setEachRowState({});
              }
            }}
            color="primary"
          >
            <Iconify icon="material-symbols:visibility-rounded" width={24} />
          </IconButton>
        </Tooltip>
      )}
    </>
  );

  const handleMergeSuccess = async (
    mergedFiles: UploadFile[],
    isDeleted?: boolean
  ) => {
    try {
      const [mergedFile] = mergedFiles;
      if (!mergedFile) return;

      await createOrgFileTarget({
        organizationId,
        uploadFileId: mergedFile.uploadFileId,
        uploadFileTargetList: [
          {
            targetId: orgUserId,
            uploadFile: { uploadFilePathType: ServiceModuleValue.USER_FILE },
          },
        ],
      });
      onMergeSuccess?.(mergedFiles);
      if (isDeleted) setDeleteState(true);
    } catch (error) {
      apis.tools.createLog({
        function: "UserUploadFiles: handleMergeSuccess",
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
    <>
      <div style={{ position: "relative" }}>
        <UserUploadFileDropzoneDialog
          open={isOpen}
          orgUserId={orgUserId}
          onClose={closeUploadDialog}
        />
        <UserUploadFileDialog orgUserId={orgUserId} data={selectedFile} />
        <I18nDataTable
          title={wordLibrary?.["client profile"] ?? "服務對象檔案"}
          rowKey="uploadFileId"
          columns={[
            {
              id: "uploadFileName",
              name: `${wordLibrary?.filename ?? "檔案名稱"}`,
              dataKey: "uploadFileName",
            },
            {
              id: "uploadFileExtensionName",
              name: `${wordLibrary?.filetype ?? "檔案類型"}`,
              dataKey: "uploadFileExtensionName",
            },
            {
              id: "uploadFileSize",
              name: `${wordLibrary?.filesize ?? "檔案大小"}`,
              dataKey: "uploadFileSize",
            },
            {
              id: "uploadFileOwner",
              name: `${wordLibrary?.fileowner ?? "建立者"}`,
              dataKey: "uploadFileOwner",
            },
            {
              id: "uploadFileTargetCreateDate",
              name: `${wordLibrary?.filecreation ?? "建立時間"}`,
              dataKey: "uploadFileTargetCreateDate",
              format: (val) =>
                formatDate(
                  zonedTimeToUtc(new Date(val), "Asia/Taipei"),
                  "PP pp",
                  {
                    locale: zhCN,
                  }
                ),
            },
            {
              name: wordLibrary?.action ?? "操作",
              render: (el: UploadFile) => {
                const fileCreator = el.creator;
                const isFileOwned =
                  fileCreator.memberName === curMemberInfo?.memberName;

                return (
                  <TableCell key="fileName" sx={{ display: "flex" }}>
                    {(isFileOwned || deletable) && (
                      <Tooltip
                        title={wordLibrary?.["delete file"] ?? "刪除檔案"}
                      >
                        <IconButton
                          onClick={() => {
                            openConfirmDeleteDialog({
                              primary:
                                wordLibrary?.[
                                  "are you sure you want to delete this file"
                                ] ?? "您確定要刪除此檔案?",
                              onConfirm: async () => {
                                try {
                                  deleteOrgFile({
                                    organizationId,
                                    uploadFileId: el.uploadFileId,
                                  })
                                    .then(() => {
                                      matchMutate(
                                        new RegExp(
                                          `^/organizations/${organizationId}/users/${orgUserId}\\?`,
                                          "g"
                                        )
                                      );
                                      setEachRowState({});
                                    })
                                    .catch(() => {});
                                  closeDeleteDialog();
                                } catch (error) {
                                  apis.tools.createLog({
                                    function:
                                      "DatePicker: openConfirmDeleteDialog",
                                    browserDescription:
                                      window.navigator.userAgent,
                                    jsonData: {
                                      data: error,
                                      deviceInfo: getDeviceInfo(),
                                    },
                                    level: "ERROR",
                                  });
                                }
                              },
                            });
                          }}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {(writable || isFileOwned) && (
                      <Tooltip title={wordLibrary?.["edit file"] ?? "編輯檔案"}>
                        <IconButton
                          onClick={() => {
                            openDialog();
                            setSelectedFile(el);
                          }}
                        >
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip
                      title={wordLibrary?.["download file"] ?? "下載檔案"}
                    >
                      <IconButton
                        onClick={() => {
                          handleDownloadFile(el.uploadFileId);
                        }}
                      >
                        <Iconify icon="ic:round-download" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={wordLibrary?.["preview file"] ?? "預覽檔案"}
                    >
                      <IconButton
                        onClick={() => {
                          handlePreviewFile(el.uploadFileId);
                        }}
                      >
                        <Iconify icon="material-symbols:visibility-rounded" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                );
              },
            },
          ]}
          data={data || []}
          enableRowCheckbox
          buttonTools={buttonTools}
          selectedToolsbar={selectedToolsbar}
          isControlledEachRowState={isMergeFilesDialogOpened}
          eachRowState={eachRowState}
          onEachRowStateChange={(state) => {
            setEachRowState(state);
          }}
          renderDataRow={(rowData: UploadFile) => {
            const fileCreator = rowData.creator;
            const isFileOwned =
              fileCreator.memberName === curMemberInfo?.memberName;

            return (
              <UploadFilesDataTableRow
                organizationId={organizationId}
                mutate={mutate}
                row={rowData}
                key={rowData.uploadFileId}
                setSelectedFile={setSelectedFile}
                openDialog={openDialog}
                tagShow={false}
                specifiedTargetPermission={writable || isFileOwned}
              />
            );
          }}
          isEmpty={data ? data.length === 0 : true}
          MuiTablePaginationProps={{
            count: data?.length ?? 0,
            page,
            rowsPerPage,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
          deleteState={deleteState}
          setDeleteState={setDeleteState}
        />
        <div
          className={clsx(
            classes.loader,
            (loading || isDeleting || isDeletingFiles || isDownloading) &&
              classes.showLoader,
            {
              [classes.lightOpacity]: settings.themeMode === "light",
              [classes.darkOpacity]: settings.themeMode !== "light",
            }
          )}
        >
          <CircularProgress />
        </div>
      </div>
      <MergeFilesDialog
        selectedFiles={selectedFiles
          .map((f) => f?.data)
          .filter((f): f is UploadFile => !!f)}
        onUnselectFile={(unselectedFile) => {
          setEachRowState((prev) => ({
            ...prev,
            [unselectedFile.uploadFileId]: {
              ...(prev[unselectedFile.uploadFileId] as RowState<UploadFile>),
              checked: false,
            },
          }));
        }}
        filePathType={ServiceModuleValue.USER_FILE}
        onMergeSuccess={handleMergeSuccess}
      />
    </>
  );
};

export default UserUploadFiles;
