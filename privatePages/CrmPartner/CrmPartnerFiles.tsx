import React, { FC, useMemo, useState } from "react";

import { useReduxDialog } from "@eGroupAI/redux-modules";
import { useSelector } from "react-redux";
import {
  EachRowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { UploadFile } from "interfaces/entities";
import useFileEvents from "utils/useFileEvents";

import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import { format as formatDate } from "@eGroupAI/utils/dateUtils";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";

import { Button, CircularProgress, IconButton } from "@mui/material";
import Tooltip from "@eGroupAI/material/Tooltip";
import TableCell from "@eGroupAI/material/TableCell";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import I18nDataTable from "components/I18nDataTable";
import EditSection from "components/EditSection";
import Iconify from "minimal/components/iconify/iconify";
import { useSettingsContext } from "minimal/components/settings";

import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";

import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";

import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import UserUploadFileDropzoneDialog from "./UploadFileDropzoneDialog";
import UserUploadFileDialog, { DIALOG } from "./UploadFileDialog";

export interface CrmPartnerFilesProps {
  orgPartnerId: string;
  data?: UploadFile[];
  loading?: boolean;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
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
  editSectionContainer: {
    padding: 0,
    borderRadius: 0,
  },
}));

const CrmPartnerFiles: FC<CrmPartnerFilesProps> = function (props) {
  const classes = useStyles(props);
  const settings = useSettingsContext();

  const {
    orgPartnerId,
    data,
    loading = false,
    readable = false,
    writable = false,
    deletable = false,
  } = props;

  const { data: curMemberInfo } = useMemberInfo();
  const organizationId = useSelector(getSelectedOrgId);
  const [deleteState, setDeleteState] = useState<boolean>(false);
  const wordLibrary = useSelector(getWordLibrary);
  const { openDialog } = useReduxDialog(DIALOG);
  const {
    isOpen,
    handleOpen: openUploadDialog,
    handleClose: closeUploadDialog,
  } = useIsOpen(false);

  const { handleChangePage, handleRowsPerPageChange, page, rowsPerPage } =
    useDataTable(
      `CrmPartnerFilesDataTable-${orgPartnerId}`,
      {},
      {
        fromKey: "startIndex",
        enableLocalStorageCache: true,
      }
    );
  const { handleDownloadFile, handlePreviewFile } = useFileEvents();

  const matchMutate = useSwrMatchMutate();
  const { excute: deleteOrgFile, isLoading: isDeleting = false } =
    useAxiosApiWrapper(apis.org.deleteOrgFile, "Delete");

  const { excute: deleteOrgFiles } = useAxiosApiWrapper(
    apis.org.deleteOrgFiles,
    "Update"
  );

  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

  const [selectedFile, setSelectedFile] = useState<UploadFile>();
  const [eachRowState, setEachRowState] = useState<EachRowState<UploadFile>>(
    {}
  );

  const selectedFiles = useMemo(
    () => Object.values(eachRowState).filter((el) => el?.checked),
    [eachRowState]
  );

  const targetIdList = useMemo(
    () => selectedFiles.map((el) => el?.data?.uploadFileId),
    [selectedFiles]
  );

  const buttonTools = writable && (
    <Tooltip title={wordLibrary?.upload ?? "上傳"}>
      <Button
        onClick={openUploadDialog}
        variant="contained"
        startIcon={<Iconify icon="ic:round-upload" />}
      >
        {wordLibrary?.upload ?? "上傳"}
      </Button>
    </Tooltip>
  );

  const selectedToolsbar = (
    <>
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
                        ? ` - ${targetIdList.length} counts ?`
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
                            `^/organizations/${organizationId}/partners/${orgPartnerId}\\?`,
                            "g"
                          )
                        );
                        setEachRowState({});
                      })
                      .catch(() => {});
                    closeDeleteDialog();
                  } catch (error) {
                    apis.tools.createLog({
                      function: "DatePicker: selectedToolsbar",
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
              if (targetIdList.length !== 0) {
                const promises = targetIdList.map((id) =>
                  handleDownloadFile(id as string)
                );
                setEachRowState({});

                try {
                  await Promise.all(promises);
                  // Optionally, you can do something here once all promises are resolved.
                  // For example, you might display a message to the user indicating success.
                } catch (error) {
                  // Handle any errors that occurred during the execution of the promises.
                  // For example, you might display an error message to the user.
                  // eslint-disable-next-line no-console
                  console.error(
                    "An error occurred while downloading files:",
                    error
                  );
                }
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

  return (
    <EditSection className={classes.editSectionContainer}>
      <UserUploadFileDropzoneDialog
        open={isOpen}
        orgPartnerId={orgPartnerId}
        onClose={closeUploadDialog}
      />
      <UserUploadFileDialog orgPartnerId={orgPartnerId} data={selectedFile} />
      <I18nDataTable
        title={wordLibrary?.file ?? "檔案"}
        rowKey="uploadFileId"
        columns={[
          {
            id: "uploadFileName",
            name: `${wordLibrary?.file ?? "檔案"}`,
            dataKey: "uploadFileName",
          },
          {
            id: "uploadFileTargetCreateDate",
            name: "上傳時間",
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
                  {(deletable || isFileOwned) && (
                    <Tooltip title={wordLibrary?.["delete file"] ?? "刪除檔案"}>
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
                                        `^/organizations/${organizationId}/partners/${orgPartnerId}\\?`,
                                        "g"
                                      )
                                    );
                                    setEachRowState({});
                                  })
                                  .catch(() => {});
                                closeDeleteDialog();
                              } catch (error) {
                                apis.tools.createLog({
                                  function: "DatePicker: selectedToolsbar",
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
                  <Tooltip title={wordLibrary?.["download file"] ?? "下載檔案"}>
                    <IconButton
                      onClick={() => {
                        handleDownloadFile(el.uploadFileId);
                      }}
                    >
                      <Iconify icon="ic:round-download" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={wordLibrary?.["preview file"] ?? "預覽檔案"}>
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
        onEachRowStateChange={(state) => {
          setEachRowState(state);
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
          (loading || isDeleting) && classes.showLoader,
          {
            [classes.lightOpacity]: settings.themeMode === "light",
            [classes.darkOpacity]: settings.themeMode !== "light",
          }
        )}
      >
        <CircularProgress />
      </div>
    </EditSection>
  );
};

export default CrmPartnerFiles;
