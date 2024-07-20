import React, { FC, useCallback, useMemo, useState } from "react";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";
import { useSelector } from "react-redux";

import { makeStyles } from "@mui/styles";
import FileSaver from "file-saver";

import Typography from "@eGroupAI/material/Typography";
import Tooltip from "@eGroupAI/material/Tooltip";
import TableCell from "@eGroupAI/material/TableCell";
import {
  EachRowState,
  RowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import { format as formatDate } from "@eGroupAI/utils/dateUtils";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import apis from "utils/apis";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";
import EditSection from "components/EditSection";
import I18nDataTable from "components/I18nDataTable";
import UploadFilesDataTableRow from "components/UploadFilesDataTableRow";
import useFileEvents from "utils/useFileEvents";
import { OrganizationEvent, UploadFile } from "interfaces/entities";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { Button, CircularProgress, IconButton } from "@mui/material";
import { useBoolean } from "minimal/hooks/use-boolean";
import Iconify from "minimal/components/iconify/iconify";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import MergeFilesDialog, {
  DIALOG as MERGE_FILES_DIALOG,
} from "components/MergeFilesDialog";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";
import clsx from "clsx";
import { useSettingsContext } from "minimal/components/settings";
import { ServiceModuleValue } from "interfaces/utils";
import getFileNameFromContentDisposition from "utils/getFileNameFromContentDisposition";
import EditFileNameDialog, {
  DIALOG as FILE_NAME_DIALOG,
} from "privatePages/UploadFiles/EditFileNameDialog";

import EventUploadFilesDialog from "./EventUploadFilesDialog";

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
  editSectionContainer: {
    padding: 0,
    borderRadius: 0,
    boxShadow: "none",
    marginBottom: 0,
    borderBottom: "1px solid #EEEEEE",
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

export interface EventUploadFilesProps {
  event?: OrganizationEvent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdateEvent?: (values: { [key: string]: any }) => void;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
  loading?: boolean;
  onMergeSuccess?: (mergedFiles: UploadFile[]) => void;
  mutate: () => void;
}

const EventUploadFiles: FC<EventUploadFilesProps> = function (props) {
  const {
    event,
    onUpdateEvent,
    loading = false,
    readable = false,
    writable = false,
    deletable = false,
    onMergeSuccess,
    mutate,
  } = props;

  const settings = useSettingsContext();
  const { data: curMemberInfo } = useMemberInfo();

  const classes = useStyles();
  const upload = useBoolean();
  const wordLibrary = useSelector(getWordLibrary);
  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [eachRowState, setEachRowState] = useState<EachRowState<UploadFile>>(
    {}
  );
  const {
    handleChangePage,
    handleRowsPerPageChange,

    page,
    rowsPerPage,
  } = useDataTable(
    `EventFilesDataTable-${event?.organizationEventId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );
  const matchMutate = useSwrMatchMutate();
  const organizationId = useSelector(getSelectedOrgId);
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);
  const { isOpen: isMergeFilesDialogOpened, openDialog: openMergeFilesDialog } =
    useReduxDialog(MERGE_FILES_DIALOG);

  const selectedFiles = useMemo(
    () => Object.values(eachRowState).filter((el) => el?.checked),
    [eachRowState]
  );

  const targetIdList = useMemo(
    () => selectedFiles.map((el) => el?.data?.uploadFileId),
    [selectedFiles]
  );
  const { excute: downloadOrgFilesBatch, isLoading: isDownloading = false } =
    useAxiosApiWrapper(apis.org.downloadOrgFilesBatch, "Download");
  const { handleDownloadFile, handlePreviewFile, handleDeleteFile } =
    useFileEvents();
  const { excute: deleteOrgFiles, isLoading: isDeletingFiles = false } =
    useAxiosApiWrapper(apis.org.deleteOrgFiles, "Delete");
  const { excute: createOrgFileTarget } = useAxiosApiWrapper(
    apis.org.createOrgFileTarget,
    "None"
  );

  const [selectedFile, setSelectedFile] = useState<UploadFile>();
  const { openDialog: openFileNameDialog } = useReduxDialog(FILE_NAME_DIALOG);

  const { excute: updateOrgFileName, isLoading } = useAxiosApiWrapper(
    apis.org.updateOrgFileName,
    "Update"
  );

  const handleUpdateFileName = useCallback(
    async (fileId, newName) => {
      try {
        await updateOrgFileName({
          organizationId,
          uploadFileId: fileId,
          uploadFileName: newName,
        });
        mutate();
      } catch (error) {
        apis.tools.createLog({
          function: "DatePicker: handleUpdateFileName",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
    },
    [mutate, organizationId, updateOrgFileName]
  );

  const buttonTools = writable && (
    <Button
      disabled={event?.isReviewing}
      onClick={upload.onTrue}
      variant="contained"
      startIcon={<Iconify icon="eva:cloud-upload-fill" />}
    >
      {wordLibrary?.["upload file"] ?? "上傳檔案"}
    </Button>
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
                    `^/organizations/${organizationId}/events/${event?.organizationEventId}\\?`,
                    "g"
                  )
                );
                setEachRowState({});
              } else if (targetIdList.length === 1) {
                handleDownloadFile(targetIdList[0] as string)
                  .then(() => {
                    matchMutate(
                      new RegExp(
                        `^/organizations/${organizationId}/events/${event?.organizationEventId}\\?`,
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
                            `^/organizations/${organizationId}/events/${event?.organizationEventId}\\?`,
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
    </>
  );

  const handleMergeSuccess = (
    mergedFiles: UploadFile[],
    isDeleted?: boolean
  ) => {
    try {
      const [mergedFile] = mergedFiles;
      if (!mergedFile) return;

      createOrgFileTarget({
        organizationId,
        uploadFileId: mergedFile.uploadFileId,
        uploadFileTargetList: [
          {
            targetId: event?.organizationEventId as string,
            uploadFile: { uploadFilePathType: ServiceModuleValue.EVENT },
          },
        ],
      });
      onMergeSuccess?.(mergedFiles);
      if (isDeleted) setDeleteState(true);
    } catch (error) {
      apis.tools.createLog({
        function: "EventUploadFiles: handleMergeSuccess",
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
      <EventUploadFilesDialog
        event={event}
        onUpdateEvent={onUpdateEvent}
        open={upload.value}
        onClose={upload.onFalse}
      />
      <EditFileNameDialog
        data={selectedFile}
        onUpdateFileName={handleUpdateFileName}
        isLoading={isLoading}
      />
      <EditSection
        sx={{ marginBottom: 2 }}
        className={classes.editSectionContainer}
      >
        <I18nDataTable
          rowKey="uploadFileId"
          columns={[
            {
              id: "uploadFileName",
              name: "檔案名稱",
              dataKey: "uploadFileName",
              render: (el) => (
                <TableCell key="fileName">
                  <Typography
                    variant="body2"
                    sx={{ display: "flex", align: "center" }}
                  >
                    {el.uploadFileName}
                  </Typography>
                </TableCell>
              ),
            },
            {
              id: "uploadFileType",
              name: "檔案類型",
              dataKey: "uploadFileType",
              render: (el) => (
                <TableCell key="fileType">
                  <Typography
                    variant="body2"
                    sx={{ display: "flex", align: "center" }}
                  >
                    {el.uploadFileExtensionName}
                  </Typography>
                </TableCell>
              ),
            },
            {
              id: "uploadFileSize",
              name: "檔案大小",
              dataKey: "uploadFileSize",
              render: (el) => (
                <TableCell key="fileSize">
                  <Typography
                    variant="body2"
                    sx={{ display: "flex", align: "center" }}
                  >
                    {el.uploadFileSize}
                  </Typography>
                </TableCell>
              ),
            },
            {
              id: "uploadFileOwner",
              name: `${wordLibrary?.fileowner ?? "建立者"}`,
              dataKey: "uploadFileOwner",
            },
            {
              id: "uploadFileTargetCreateDate",
              name: "建立時間",
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
              id: "action",
              name: "操作",
              dataKey: "action",
              align: "center",
              render: (val) => (
                <TableCell key="action" align="center">
                  {deletable && (
                    <Tooltip title={wordLibrary?.["delete file"] ?? "刪除檔案"}>
                      <IconButton
                        disabled={event?.isReviewing}
                        onClick={() => {
                          handleDeleteFile(val.uploadFileId, () => {
                            if (onUpdateEvent && event) {
                              onUpdateEvent({
                                uploadFileList: event.uploadFileList
                                  ?.map((el) => ({
                                    uploadFileId: el.uploadFileId,
                                  }))
                                  .filter(
                                    (ele) =>
                                      ele.uploadFileId !== val.uploadFileId
                                  ),
                              });
                              setDeleteState(true);
                            }
                          });
                        }}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" width={24} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {readable && (
                    <Tooltip
                      title={wordLibrary?.["download file"] ?? "下載檔案"}
                    >
                      <IconButton
                        onClick={() => {
                          handleDownloadFile(val.uploadFileId);
                        }}
                      >
                        <Iconify icon="ic:round-download" width={24} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {readable && (
                    <Tooltip
                      title={wordLibrary?.["preview file"] ?? "預覽檔案"}
                    >
                      <IconButton
                        onClick={() => {
                          handlePreviewFile(val.uploadFileId);
                        }}
                      >
                        <Iconify
                          icon="material-symbols:visibility-rounded"
                          width={24}
                        />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              ),
            },
          ]}
          data={event?.uploadFileList || []}
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
                openDialog={openFileNameDialog}
                tagShow={false}
                fileNameEditable={
                  event?.organizationEventIsOpen === 1 && !event.isReviewing
                }
                specifiedTargetPermission={writable || isFileOwned}
              />
            );
          }}
          isEmpty={event?.uploadFileList?.length === 0}
          MuiTablePaginationProps={{
            count: event?.uploadFileList ? event?.uploadFileList.length : 0,
            page,
            rowsPerPage,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
          isControlledEachRowState={isMergeFilesDialogOpened}
          eachRowState={eachRowState}
          onEachRowStateChange={(state) => {
            setEachRowState(state);
          }}
          enableRowCheckbox
          buttonTools={buttonTools}
          selectedToolsbar={selectedToolsbar}
          deleteState={deleteState}
          setDeleteState={setDeleteState}
        />
        <div
          className={clsx(
            classes.loader,
            (loading || isDeletingFiles || isDownloading) && classes.showLoader,
            {
              [classes.lightOpacity]: settings.themeMode === "light",
              [classes.darkOpacity]: settings.themeMode !== "light",
            }
          )}
        >
          <CircularProgress />
        </div>
      </EditSection>
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
        filePathType={ServiceModuleValue.EVENT}
        onMergeSuccess={handleMergeSuccess}
      />
    </>
  );
};

export default EventUploadFiles;
