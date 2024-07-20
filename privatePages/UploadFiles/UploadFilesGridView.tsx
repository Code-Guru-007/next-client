import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useContext,
} from "react";

import {
  DataTableContext,
  EachRowState,
  FilterValues,
  TableEvent,
} from "@eGroupAI/material-module/DataTable";
import { EntityList } from "@eGroupAI/typings/apis";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import apis from "utils/apis";
import DataTableHeader from "@eGroupAI/material-module/DataTable/DataTableHeader";
import DataTableToolBar from "@eGroupAI/material-module/DataTable/DataTableToolBar";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import PaginationBar from "@eGroupAI/material-module/DataTable/PaginationBar";
import PermissionValid from "components/PermissionValid/PermissionValid";
import getDispositionFileName from "@eGroupAI/utils/getDispositionFileName";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";

import { useReduxDialog } from "@eGroupAI/redux-modules";

import {
  Box,
  CircularProgress,
  Collapse,
  IconButton,
  TablePaginationProps,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import Button from "@eGroupAI/material/Button";

import { UploadFile } from "interfaces/entities";
import { ServiceModuleValue, Table } from "interfaces/utils";
import { Center } from "@eGroupAI/material-layout";
import useDetectScrollAtBottom from "@eGroupAI/hooks/useDetectScrollAtBottom";
import FileSaver from "file-saver";

import { useBoolean } from "minimal/hooks/use-boolean";
import Iconify from "minimal/components/iconify/iconify";
import { ConfirmDialog } from "minimal/components/custom-dialog";
import FileManagerPanel from "minimal/sections/file-manager/file-manager-panel";
import FileManagerNewFolderDialog from "minimal/sections/file-manager/file-manager-new-folder-dialog";
import FileManagerActionSelected from "minimal/sections/file-manager/file-manager-action-selected";

import {
  TagAddDialog,
  TAG_ADD_DIALOG,
  TagDeleteDialog,
  TAG_DELETE_DIALOG,
} from "components/DatatableToolDialogs";

import UploadFilesContext from "./UploadFilesContext";
import UploadFileGridViewFileItem from "./UploadFilesGridViewFileItem";
import EditFileNameDialog, { DIALOG } from "./EditFileNameDialog";

export interface UploadFilesGridViewProps {
  organizationId: string;
  changeBrowserMode: (mode: "table" | "grid") => void;
  data?: EntityList<UploadFile>[] | undefined;
  setSize: (
    size: number | ((_size: number) => number)
  ) => Promise<any[] | undefined>;
}

// const useStyles = makeStyles(() => ({
//   loader: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     bottom: 0,
//     right: 0,
//     display: "none",
//     alignItems: "center",
//     justifyContent: "center",
//     zIndex: 1,
//   },
//   showLoader: {
//     display: "flex",
//   },
//   lightOpacity: {
//     background: "rgba(255,255,255,0.6)",
//   },
//   darkOpacity: {
//     background: "rgba(33, 43, 54, 0.6)",
//   },
// }));

const UploadFilesGridView: FC<UploadFilesGridViewProps> = (props) => {
  const { organizationId, changeBrowserMode, data, setSize } = props;
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
  } = useContext(UploadFilesContext);

  const wordLibrary = useSelector(getWordLibrary);
  const { openDialog } = useReduxDialog(DIALOG);

  const { openDialog: openTagDialog } = useReduxDialog(
    `${ServiceModuleValue.FILES}_${TAG_ADD_DIALOG}`
  );
  const { openDialog: openTagDeleteDialog } = useReduxDialog(
    `${ServiceModuleValue.FILES}_${TAG_DELETE_DIALOG}`
  );

  const { excute: deleteOrgFile, isLoading: isOrgFileDeleteLoading } =
    useAxiosApiWrapper(apis.org.deleteOrgFile, "Update");
  const { excute: previewOrgFile } = useAxiosApiWrapper(
    apis.org.previewOrgFile,
    "None"
  );
  const { excute: downloadOrgFile } = useAxiosApiWrapper(
    apis.org.downloadOrgFile,
    "None"
  );
  const { excute: updateOrgFileName, isLoading } = useAxiosApiWrapper(
    apis.org.updateOrgFileName,
    "Update"
  );

  const handleScrollAtBottom = useCallback(() => {
    if (!isValidating) {
      setSize((v) => v + 1);
    }
  }, [isValidating, setSize]);

  useDetectScrollAtBottom(handleScrollAtBottom);

  const upload = useBoolean();
  const files = useBoolean();
  const confirm = useBoolean();

  const [checkedAll, setCheckedAll] = useState(false);
  const [tableEvent, setTableEvent] = useState<TableEvent>();
  const [selfPage, setSelfPage] = useState(0);
  const [selfRowsPerPage, setSelfRowsPerPage] = useState(10);

  const [selectedFile, setSelectedFile] = useState<UploadFile>();
  const [eachRowState, setEachRowState] = useState<EachRowState<UploadFile>>(
    {}
  );
  const [totalCount, setTotalCount] = useState<number | undefined>(0);

  const isPageControlled = page !== undefined;
  const isRowsPerPageControlled = rowsPerPage !== undefined;
  const pageNumber = page !== undefined ? page : selfPage;
  const rowsPerPageValue =
    rowsPerPage !== undefined ? rowsPerPage : selfRowsPerPage;

  const [checkedAllPageRows] = useState<boolean>(false);

  useEffect(() => {
    if (data && data[0]?.total && totalCount !== data[0].total) {
      setTotalCount(data[0]?.total);
    }
    if (data && data?.length !== 0) {
      const lastFetchedEachRowState = data[data.length - 1]?.source.reduce<
        EachRowState<UploadFile>
      >((rowState, file) => {
        const dataId = file.uploadFileId;
        return {
          ...rowState,
          [dataId]: { checked: false, display: true, data: file },
        };
      }, {});
      setEachRowState((prev) => ({ ...prev, ...lastFetchedEachRowState }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.length]);

  const uploadFiles = useMemo(
    () => data?.reduce<UploadFile[]>((a, b) => [...a, ...b.source], []) || [],
    [data]
  );

  useEffect(() => {
    if (data && data[0]?.total === 0) {
      setTotalCount(0);
      setEachRowState({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadFiles.length]);

  const defaultFilterValues = filterConditionGroups
    ?.map((c, i) => ({ [i]: {} }))
    .reduce((a, b) => ({ ...a, ...b }), {}) as FilterValues;

  const selectedFiles = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => el?.checked)
        .map((el) => el?.data as UploadFile),
    [eachRowState]
  );

  const selectedTargetIdList = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => el?.checked)
        .map((el) => el?.data?.uploadFileId as string),
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

  const [view, setView] = useState<"table" | "grid">("grid");
  const handleChangeView = useCallback(
    (event: React.MouseEvent<HTMLElement>, mode: string | null) => {
      if (mode !== null && (mode === "table" || mode === "grid")) {
        setView(mode);
        changeBrowserMode(mode);
      }
    },
    [changeBrowserMode]
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

  const handleSelectFileItem = useCallback(
    (file) => {
      setEachRowState(() => ({
        ...eachRowState,
        [file.uploadFileId]: {
          ...eachRowState[file.uploadFileId],
          checked: !eachRowState[file.uploadFileId]?.checked,
        },
      }));
    },
    [eachRowState]
  );

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

  const handleDeleteUploadFiles = useCallback(async () => {
    if (selectedFiles.length > 0 && organizationId) {
      try {
        const promises = selectedFiles.map((sFile) =>
          deleteOrgFile({
            organizationId,
            uploadFileId: sFile.uploadFileId,
            eGroupService: "WEBSITE",
          })
        );
        Promise.all(promises)
          .then(() => {
            mutate();
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
  }, [deleteOrgFile, mutate, organizationId, selectedFiles]);

  const handleOnChangePage: TablePaginationProps["onPageChange"] = useCallback(
    (event, newPage) => {
      setTableEvent(TableEvent.CHANGE_PAGE);
      if (!isPageControlled) {
        setSelfPage(newPage);
      }
      if (handleChangePage) {
        handleChangePage(event, {
          page: newPage,
          rowsPerPage,
        });
      }
    },
    [handleChangePage, isPageControlled, rowsPerPage]
  );

  const handleOnRowsPerPageChange: TablePaginationProps["onRowsPerPageChange"] =
    useCallback(
      (event) => {
        setTableEvent(TableEvent.CHANGE_ROWS_PER_PAGE);
        if (!isRowsPerPageControlled) {
          setSelfRowsPerPage(Number(event.target.value));
        }
        if (handleRowsPerPageChange) {
          handleRowsPerPageChange(event, {
            page,
            rowsPerPage: Number(event.target.value),
          });
        }
      },
      [isRowsPerPageControlled, handleRowsPerPageChange, page]
    );

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
      >
        {wordLibrary?.upload ?? "上傳"}
      </Button>
    </PermissionValid>
  );

  const selectedToolsbar = useMemo(
    () => (
      <>
        {selectedFiles.length === 1 && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["READ"]}>
            <Tooltip title={wordLibrary?.download ?? "下載"}>
              <IconButton onClick={handleDownloadFile} color="primary">
                <Iconify icon="uil:file-download" width={24} />
              </IconButton>
            </Tooltip>
          </PermissionValid>
        )}
        {selectedFiles.length === 1 && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["READ"]}>
            <Tooltip title={wordLibrary?.preview ?? "預覽"}>
              <IconButton onClick={handlePreviewFile} color="primary">
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
              <IconButton onClick={confirm.onTrue} color="primary">
                <Iconify icon="solar:trash-bin-trash-bold" width={24} />
              </IconButton>
            </Tooltip>
          </PermissionValid>
        )}
        {(checkedAll || selectedFiles.length !== 0) && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
            <Tooltip title={wordLibrary?.["batch tagging"] ?? "批次標註"}>
              <IconButton
                onClick={openTagDialog}
                disabled={
                  (!checkedAll && selectedFiles.length === 0) ||
                  (checkedAll && totalCount === excludedTargetIdList.length)
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
                    onClick={() => {
                      openTagDeleteDialog();
                    }}
                    disabled={
                      (!checkedAll && selectedFiles.length === 0) ||
                      (checkedAll && totalCount === excludedTargetIdList.length)
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
      checkedAll,
      confirm.onTrue,
      totalCount,
      excludedTargetIdList.length,
      handleDownloadFile,
      handlePreviewFile,
      openTagDeleteDialog,
      openTagDialog,
      selectedFiles.length,
      wordLibrary,
    ]
  );

  const dataTableContext = useMemo(
    () => ({
      tableEvent,
      setTableEvent,
      eachRowState,
      setEachRowState,
      checkedAllPageRows,
    }),
    [checkedAllPageRows, eachRowState, tableEvent]
  );

  const renderContent = () => (
    <DataTableContext.Provider value={dataTableContext}>
      <Box sx={{ padding: "20px 10px", position: "relative" }}>
        {/* <div
          className={clsx(classes.loader, isValidating && classes.showLoader, {
            [classes.lightOpacity]: settings.themeMode === "light",
            [classes.darkOpacity]: settings.themeMode !== "light",
          })}
        >
          <CircularProgress />
        </div> */}
        <FileManagerPanel
          title="檔案"
          subTitle={`共 ${totalCount || 0} 個檔案`}
          onOpen={upload.onTrue}
          // collapse={files.value}
          // onCollapse={files.onToggle}
        />

        <Collapse in={!files.value} unmountOnExit style={{ overflow: "auto" }}>
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            }}
            gap={3}
          >
            {uploadFiles
              ?.filter((i) => i.uploadFileExtensionName !== "folder")
              .map((file) => (
                <UploadFileGridViewFileItem
                  key={file.uploadFileId}
                  file={file}
                  openDialog={openDialog}
                  setSelectedFile={setSelectedFile}
                  selected={selectedTargetIdList.includes(file.uploadFileId)}
                  onSelect={(file) => handleSelectFileItem(file)}
                  // onDelete={() => onDeleteItem(file.id)}
                  sx={{ maxWidth: "auto" }}
                />
              ))}
            {isValidating && (
              <Center height={100}>
                <CircularProgress />
              </Center>
            )}
          </Box>
        </Collapse>
      </Box>
    </DataTableContext.Provider>
  );

  return (
    <>
      <DataTableToolBar
        rowsPerPage={rowsPerPage}
        buttonTools={buttonTools}
        iconTools={iconTools}
        searchBar={
          <StyledSearchBar
            handleSearchChange={handleSearchChange}
            value={payload.query}
            placeholder={
              wordLibrary?.["search and press Enter"] ?? "搜尋並按Enter"
            }
          />
        }
      />
      <DataTableHeader
        payload={payload}
        serviceModuleValue={ServiceModuleValue.UPLOADFILE}
        enableFilter
        filterConditionGroups={filterConditionGroups}
        defaultFilterValues={defaultFilterValues}
        filterValues={payload.filterValues}
        onFilterViewSelect={handleSelectFilterView}
        onFilterValuesChange={handleFilterValuesChange}
        onFilterValuesSubmit={handleFilterValuesSubmit}
        onFilterValuesClear={handleFilterValuesClear}
        FilterDropDownProps={{
          onSubmit: handleFilterSubmit,
          onClear: handleFilterClear,
        }}
      />
      {renderContent()}
      <PaginationBar
        // shoud be true to display the pagination...
        isTablePagination={false}
        page={pageNumber}
        count={totalCount as number}
        rowsPerPage={rowsPerPageValue}
        onPageChange={handleOnChangePage}
        onRowsPerPageChange={handleOnRowsPerPageChange}
      />

      {!!selectedFiles?.length && (
        <FileManagerActionSelected
          numSelected={selectedTargetIdList.length}
          rowCount={uploadFiles.length as number}
          selected={selectedTargetIdList}
          onSelectAllItems={(checked) => {
            setCheckedAll(checked);
            const nextEachRowState = Object.keys(eachRowState).reduce<
              EachRowState<UploadFile>
            >(
              (prevState, key) => ({
                ...prevState,
                [key]: { ...eachRowState[key], display: true, checked },
              }),
              {}
            );
            setEachRowState(nextEachRowState);
          }}
          action={selectedToolsbar}
          sx={{ right: "80px" }}
        />
      )}

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete{" "}
            <strong> {selectedTargetIdList.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            loading={isOrgFileDeleteLoading}
            onClick={() => {
              handleDeleteUploadFiles();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
      <FileManagerNewFolderDialog
        open={upload.value}
        onClose={upload.onFalse}
        onUploadSuccess={() => {
          mutate();
        }}
        filePathType={ServiceModuleValue.FILES}
      />
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
    </>
  );
};

export default UploadFilesGridView;
