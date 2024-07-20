/* eslint-disable @typescript-eslint/no-shadow */
import React, { FC, useState, useMemo, useCallback, useContext } from "react";
import { useSelector } from "react-redux";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import FileSaver from "file-saver";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { DIALOG as DELTE_CONFIRM } from "components/ConfirmDeleteDialog";
import MergeFilesDialog, {
  DIALOG as MERGE_FILES_DIALOG,
} from "components/MergeFilesDialog";

import {
  Button,
  IconButton,
  TableCell,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useBoolean } from "minimal/hooks/use-boolean";
import Iconify from "minimal/components/iconify/iconify";
import FileManagerNewFolderDialog from "minimal/sections/file-manager/file-manager-new-folder-dialog";

import Paper from "@eGroupAI/material/Paper";
import Tooltip from "@eGroupAI/material/Tooltip";
import { RowState, EachRowState } from "@eGroupAI/material-module/DataTable";
import SearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import { TableRowProps } from "@eGroupAI/material/TableRow";
import getDispositionFileName from "@eGroupAI/utils/getDispositionFileName";
import { EntityList } from "@eGroupAI/typings/apis";

import { getWordLibrary } from "redux/wordLibrary/selectors";

import I18nDataTable from "components/I18nDataTable";
import UploadFilesDataTableRow from "components/UploadFilesDataTableRow";
import { Table, ServiceModuleValue } from "interfaces/utils";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { UploadFile } from "interfaces/entities";
import PermissionValid from "components/PermissionValid";
import {
  TagAddDialog,
  TAG_ADD_DIALOG,
  TagDeleteDialog,
  TAG_DELETE_DIALOG,
} from "components/DatatableToolDialogs";

import UploadFilesContext from "./UploadFilesContext";
import EditFileNameDialog, { DIALOG } from "./EditFileNameDialog";

interface Props {
  organizationId: string;
  changeBrowserMode: (mode: "table" | "grid") => void;
  data?: EntityList<UploadFile> | undefined;
}

const UploadFilesDataTable: FC<Props> = function (props) {
  const { organizationId, changeBrowserMode, data } = props;
  const {
    handleChangePage,
    handleRowsPerPageChange,
    handleSearchChange,
    handleFilterValuesChange,
    handleSelectFilterView,
    handleFilterValuesSubmit,
    handleFilterValuesClear,
    page,
    rowsPerPage,
    filterConditionGroups,
    handleFilterSubmit,
    handleFilterClear,
    isValidating,
    filterSearch,
    payload,
    mutate,
    columns,
    isFilterConditionGroupsValidating,
    setPayload,
  } = useContext(UploadFilesContext);
  const { openDialog } = useReduxDialog(DIALOG);
  const { openDialog: openTagDialog } = useReduxDialog(
    `${ServiceModuleValue.FILES}_${TAG_ADD_DIALOG}`
  );
  const { openDialog: openTagDeleteDialog } = useReduxDialog(
    `${ServiceModuleValue.FILES}_${TAG_DELETE_DIALOG}`
  );

  const {
    openDialog: openDeleteConfirmDialog,
    closeDialog: closeDeleteConfirmDialog,
    setDialogStates: setConfirmDeleteDialogStates,
  } = useReduxDialog(DELTE_CONFIRM);
  const { isOpen: isMergeFilesDialogOpened, openDialog: openMergeFilesDialog } =
    useReduxDialog(MERGE_FILES_DIALOG);

  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<UploadFile>();
  const wordLibrary = useSelector(getWordLibrary);

  const { excute: downloadOrgFile } = useAxiosApiWrapper(
    apis.org.downloadOrgFile,
    "None"
  );

  const { excute: previewOrgFile } = useAxiosApiWrapper(
    apis.org.previewOrgFile,
    "None"
  );

  const { excute: updateOrgFileName, isLoading } = useAxiosApiWrapper(
    apis.org.updateOrgFileName,
    "Update"
  );

  const { excute: deleteOrgFiles, isLoading: isDeleting } = useAxiosApiWrapper(
    apis.org.deleteOrgFiles,
    "Update"
  );

  const [checkedAll, setCheckedAll] = useState(false);

  const [view, setView] = useState<"table" | "grid">("table");
  const handleChangeView = useCallback(
    (event: React.MouseEvent<HTMLElement>, mode: string | null) => {
      if (mode !== null && (mode === "table" || mode === "grid")) {
        setView(mode);
        changeBrowserMode(mode);
      }
    },
    [changeBrowserMode]
  );

  const upload = useBoolean();

  const [eachRowState, setEachRowState] = useState<
    EachRowState<
      UploadFile & {
        TableRowProps: TableRowProps;
      }
    >
  >({});

  const selectedFiles = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => el?.checked)
        .map((el) => {
          const { TableRowProps: trp, ...other } = el?.data || {};
          return other as UploadFile;
        }),
    [eachRowState]
  );

  const selectedTagIdList = useMemo(
    () =>
      selectedFiles
        .filter((file) => (file?.organizationTagTargetList?.length ?? 0) > 0)
        .flatMap((file) =>
          file?.organizationTagTargetList?.map((tag) => tag?.id?.tagId)
        ),
    [selectedFiles]
  );

  const excludedTargetIdList = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => !el?.checked)
        .map((el) => el?.data?.uploadFileId as string),
    [eachRowState]
  );

  const handleCheckedAllClick = useCallback(() => {
    setCheckedAll(true);
  }, []);

  const handleCheckedAllClearClick = useCallback(() => {
    setCheckedAll(false);
  }, []);

  const handleDownloadFile = useCallback(async () => {
    if (selectedFiles.length === 1 && organizationId && selectedFiles[0]) {
      try {
        const res = await downloadOrgFile({
          organizationId,
          uploadFileId: selectedFiles[0].uploadFileId,
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
  }, [downloadOrgFile, organizationId, selectedFiles]);

  const handlePreviewFile = useCallback(async () => {
    if (selectedFiles.length === 1 && organizationId && selectedFiles[0]) {
      try {
        const res = await previewOrgFile({
          organizationId,
          uploadFileId: selectedFiles[0].uploadFileId,
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
  }, [organizationId, previewOrgFile, selectedFiles]);

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

  const handleDeleteUploadFiles = useCallback(async () => {
    openDeleteConfirmDialog({
      primary: "您確定要刪除此欄位嗎？",
      isDeleting,
      onConfirm: async () => {
        if (selectedFiles.length > 0 && organizationId) {
          try {
            setConfirmDeleteDialogStates({ isDeleting: true });
            deleteOrgFiles({
              organizationId,
              uploadFileIdList: selectedFiles.map(
                (sFile) => sFile.uploadFileId as string
              ),
            })
              .then(() => {
                setDeleteState(true);
                mutate();
                setEachRowState({});
                closeDeleteConfirmDialog();
              })
              .catch(() => {});
          } catch (error) {
            apis.tools.createLog({
              function: "DatePicker: handleDeleteUploadFiles",
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
  }, [
    closeDeleteConfirmDialog,
    deleteOrgFiles,
    mutate,
    openDeleteConfirmDialog,
    organizationId,
    selectedFiles,
    isDeleting,
    setConfirmDeleteDialogStates,
  ]);

  const handleMergeSuccess = (
    mergedFiles: UploadFile[],
    isDeleted?: boolean
  ) => {
    try {
      const [mergedFile] = mergedFiles;
      if (!mergedFile) return;

      mutate();
      if (isDeleted) setDeleteState(true);
    } catch (error) {
      apis.tools.createLog({
        function: "UploadFiles: handleMergeSuccess",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  const iconTools = (
    <ToggleButtonGroup
      size="small"
      value={view}
      exclusive
      onChange={handleChangeView}
    >
      <ToggleButton value="table">
        <Tooltip title="List View">
          <Iconify icon="solar:list-bold" />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="grid">
        <Tooltip title="方格展示">
          <Iconify icon="mingcute:dot-grid-fill" />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );

  const buttonTools = (
    <PermissionValid shouldBeOrgOwner modulePermissions={["CREATE"]}>
      <Button
        variant="contained"
        startIcon={<Iconify icon="eva:cloud-upload-fill" />}
        onClick={upload.onTrue}
        id="upload-files-upload-btn"
        data-tid="upload-files-upload-btn"
      >
        {wordLibrary?.upload ?? "上傳"}
      </Button>
    </PermissionValid>
  );

  const selectedToolsbar = useMemo(
    () => (
      <>
        {selectedFiles.length >= 2 &&
          selectedFiles.every((f) =>
            f?.uploadFileExtensionName.match(/(jpe?g|png|pdf|webp)/i)
          ) && (
            <PermissionValid
              shouldBeOrgOwner
              modulePermissions={["READ", "CREATE"]}
            >
              <Tooltip title={wordLibrary?.["merge files"] ?? "檔案合併"}>
                <IconButton
                  onClick={openMergeFilesDialog}
                  color="primary"
                  id="table-tools-selected-merge-btn"
                  data-tid="table-tools-selected-merge-btn"
                >
                  <Iconify icon="material-symbols:picture-as-pdf" width={24} />
                </IconButton>
              </Tooltip>
            </PermissionValid>
          )}
        {selectedFiles.length === 1 && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["READ"]}>
            <Tooltip title={wordLibrary?.download ?? "下載"}>
              <IconButton
                onClick={handleDownloadFile}
                color="primary"
                id="table-tools-selected-download-btn"
                data-tid="table-tools-selected-download-btn"
              >
                <Iconify icon="uil:file-download" width={24} />
              </IconButton>
            </Tooltip>
          </PermissionValid>
        )}
        {selectedFiles.length === 1 && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["READ"]}>
            <Tooltip title={wordLibrary?.preview ?? "預覽"}>
              <IconButton
                onClick={handlePreviewFile}
                color="primary"
                id="table-tools-selected-preview-btn"
                data-tid="table-tools-selected-preview-btn"
              >
                <Iconify
                  icon="material-symbols:visibility-rounded"
                  width={24}
                />
              </IconButton>
            </Tooltip>
          </PermissionValid>
        )}
        {selectedFiles.length > 0 && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["DELETE_ALL"]}>
            <Tooltip title={wordLibrary?.delete ?? "刪除"}>
              <IconButton
                onClick={handleDeleteUploadFiles}
                color="primary"
                id="table-tools-selected-delete-btn"
                data-tid="table-tools-selected-delete-btn"
              >
                <Iconify icon="solar:trash-bin-trash-bold" width={24} />
              </IconButton>
            </Tooltip>
          </PermissionValid>
        )}
        {(checkedAll || selectedFiles.length !== 0) && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
            <Tooltip title={wordLibrary?.["batch tagging"] ?? "批次標註"}>
              <IconButton
                id="table-tools-selected-tagadd-btn"
                data-tid="table-tools-selected-tagadd-btn"
                onClick={openTagDialog}
                disabled={
                  (!checkedAll && selectedFiles.length === 0) ||
                  (checkedAll && data?.total === excludedTargetIdList.length)
                }
                color="primary"
              >
                <Iconify icon="ic:round-local-offer" width={24} />
              </IconButton>
            </Tooltip>
          </PermissionValid>
        )}
        {(checkedAll || selectedFiles.length !== 0) &&
          selectedTagIdList.length !== 0 && (
            <PermissionValid
              shouldBeOrgOwner
              modulePermissions={["DELETE_ALL"]}
            >
              <Tooltip
                title={wordLibrary?.["batch tagging delete"] ?? "批次標註刪除"}
              >
                <div role="button" tabIndex={-1}>
                  <IconButton
                    id="table-tools-selected-tagdelete-btn"
                    data-tid="table-tools-selected-tagdelete-btn"
                    onClick={() => {
                      openTagDeleteDialog();
                    }}
                    disabled={
                      (!checkedAll && selectedFiles.length === 0) ||
                      (checkedAll &&
                        data?.total === excludedTargetIdList.length)
                    }
                    color="primary"
                  >
                    <Iconify icon="mdi:tag-off" width={24} />
                  </IconButton>
                </div>
              </Tooltip>
            </PermissionValid>
          )}
      </>
    ),
    [
      selectedTagIdList,
      openMergeFilesDialog,
      selectedFiles,
      checkedAll,
      data?.total,
      excludedTargetIdList.length,
      handleDeleteUploadFiles,
      handleDownloadFile,
      handlePreviewFile,
      openTagDeleteDialog,
      openTagDialog,
      wordLibrary,
    ]
  );

  return (
    <div>
      <EditFileNameDialog
        data={selectedFile}
        onUpdateFileName={handleUpdateFileName}
        isLoading={isLoading}
      />
      {filterSearch && (
        <TagAddDialog
          filterSearch={filterSearch}
          tableModule={Table.UPLOADFILE}
          serviceModuleValue={ServiceModuleValue.FILES}
          isCheckedAllPageRows={checkedAll}
          selectedTargetIds={selectedFiles.map((el) => el.uploadFileId)}
          excludeSelectedTargetIds={excludedTargetIdList}
          onSuccess={() => {
            mutate();
          }}
        />
      )}
      {filterSearch && (
        <TagDeleteDialog
          filterSearch={filterSearch}
          tableModule={Table.UPLOADFILE}
          serviceModuleValue={ServiceModuleValue.FILES}
          isCheckedAllPageRows={checkedAll}
          selectedTargetIds={selectedFiles.map((el) => el.uploadFileId)}
          excludeSelectedTargetIds={excludedTargetIdList}
          onSuccess={() => {
            mutate();
          }}
          selectedTagIdList={checkedAll ? undefined : selectedTagIdList}
        />
      )}
      <Paper>
        <I18nDataTable
          columns={[
            ...columns,
            {
              id: "uploadFileAction",
              name: wordLibrary?.action ?? "操作",
              dataKey: "uploadFileAction",
              render: () => (
                <TableCell key="action">
                  <Typography color="primary" variant="body2">
                    {wordLibrary?.action ?? "操作"}
                  </Typography>
                </TableCell>
              ),
            },
          ]}
          rowKey="uploadFileId"
          data={!data ? [] : data?.source}
          renderDataRow={(rowData: UploadFile) => (
            <UploadFilesDataTableRow
              organizationId={organizationId}
              mutate={mutate}
              onUpdateFileName={handleUpdateFileName}
              columns={columns}
              row={rowData}
              key={rowData.uploadFileId}
              setSelectedFile={setSelectedFile}
              openDialog={openDialog}
            />
          )}
          isEmpty={data?.total === 0}
          serverSide
          loading={
            isValidating || isFilterConditionGroupsValidating || !filterSearch
          }
          MuiTablePaginationProps={{
            count: data?.total ?? 0,
            page,
            rowsPerPage,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
          isBorderSeparate={false}
          // isStyledPagination
          enableRowCheckbox
          iconTools={iconTools}
          buttonTools={buttonTools}
          selectedToolsbar={selectedToolsbar}
          serviceModuleValue={ServiceModuleValue.FILES}
          payload={payload}
          onFilterViewSelect={handleSelectFilterView}
          enableFilter
          filterConditionGroups={filterConditionGroups}
          onFilterValuesChange={handleFilterValuesChange}
          onFilterValuesSubmit={handleFilterValuesSubmit}
          onFilterValuesClear={handleFilterValuesClear}
          filterValues={payload.filterValues}
          onSortLabelClick={(sortKey, order) => {
            setPayload((p) => ({
              ...p,
              sort: {
                sortKey,
                order: order.toUpperCase(),
              },
            }));
          }}
          onCheckedAllClick={handleCheckedAllClick}
          onCheckedAllClearClick={handleCheckedAllClearClick}
          FilterDropDownProps={{
            onSubmit: handleFilterSubmit,
            onClear: handleFilterClear,
          }}
          searchBar={
            <SearchBar
              handleSearchChange={handleSearchChange}
              value={payload.query}
              placeholder={
                wordLibrary?.["search and press Enter"] ?? "搜尋並按Enter"
              }
            />
          }
          onEachRowStateChange={(state) => {
            setEachRowState(state);
          }}
          isControlledEachRowState={isMergeFilesDialogOpened}
          eachRowState={eachRowState}
          deleteState={deleteState}
          setDeleteState={setDeleteState}
        />
      </Paper>
      <FileManagerNewFolderDialog
        open={upload.value}
        onClose={upload.onFalse}
        onUploadSuccess={() => {
          mutate();
        }}
      />
      <MergeFilesDialog
        selectedFiles={selectedFiles}
        onUnselectFile={(unselectedFile) => {
          setEachRowState((prev) => ({
            ...prev,
            [unselectedFile.uploadFileId]: {
              ...(prev[unselectedFile.uploadFileId] as RowState<
                UploadFile & {
                  TableRowProps: TableRowProps;
                }
              >),
              checked: false,
            },
          }));
        }}
        filePathType={ServiceModuleValue.FILES}
        onMergeSuccess={handleMergeSuccess}
      />
    </div>
  );
};

export default UploadFilesDataTable;
