import React, { FC, useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import clsx from "clsx";
import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import { makeStyles } from "@mui/styles";
import { Button, CircularProgress, IconButton } from "@mui/material";

import useTab from "@eGroupAI/hooks/useTab";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { format as formatDate } from "@eGroupAI/utils/dateUtils";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import Tab from "@eGroupAI/material/Tab";
import NewDateRangePicker from "@eGroupAI/material-lab/NewDateRangePicker";
import Tooltip from "@eGroupAI/material/Tooltip";
import Box from "@eGroupAI/material/Box";
import { TableRowProps } from "@eGroupAI/material/TableRow";
import EditSectionHeader from "components/EditSectionHeader";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import {
  EachRowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import FinanceDialog, {
  DIALOG,
  FinanceDialogProps,
} from "components/FinanceDialog";
import Tabs from "components/Tabs";
import { SNACKBAR as GLOBAL_SNACKBAR } from "components/App";
import I18nDataTable from "components/I18nDataTable";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import Iconify from "minimal/components/iconify/iconify";

import {
  OrganizationFinanceTarget,
  OrganizationUser,
} from "interfaces/entities";
import { OrganizationFinanceType } from "interfaces/utils";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import useOrgFinanceTargets from "utils/useOrgFinanceTargets";
import { useSettingsContext } from "minimal/components/settings";
import UserFinanceTableRow from "./UserFinanceTableRow";

export interface UserFinanceDetailProps {
  orgUserId?: string;
  orgUser?: OrganizationUser;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const useStyles = makeStyles(() => ({
  container: {
    padding: "10px 20px",
    position: "relative",
  },
  editSectionContainer: {
    padding: 0,
    borderRadius: 0,
  },
  mainLayout: {
    background: "#F5F6FA",
    paddingTop: 0,
  },
  tabContainer: {
    borderRadius: 0,
    boxShadow: "none",
    padding: 0,
    marginBottom: 0,
    "& .MuiTabs-indicator": {
      height: 2,
    },
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
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
  tag: {
    color: "white",
    border: "1px solid transparent",
    padding: "0.375rem 1rem",
    borderRadius: "10000px",
    width: "fit-content",
    display: "flex",
    justifyContent: "center",
    fontSize: "0.9375rem",
    margin: "1px 0px",
  },
  tagPopover: {
    color: "white",
    border: "1px solid transparent",
    padding: "0.375rem 1rem",
    borderRadius: "10000px",
    width: "fit-content",
    display: "flex",
    justifyContent: "center",
    fontSize: "0.9375rem",
    margin: "10px 0px",
  },
  popoverWrapper: {
    padding: "10px",
  },
}));

const UserFinanceDetail: FC<UserFinanceDetailProps> = function (props) {
  const [eachRowState, setEachRowState] = useState<
    EachRowState<
      OrganizationFinanceTarget & {
        TableRowProps: TableRowProps;
      }
    >
  >({});

  const {
    orgUserId,
    orgUser,
    readable = false,
    writable = false,
    deletable = false,
  } = props;
  const classes = useStyles();
  const settings = useSettingsContext();
  const router = useRouter();
  const organizationId = useSelector(getSelectedOrgId);
  const wordLibrary = useSelector(getWordLibrary);
  const { openDialog, closeDialog } = useReduxDialog(DIALOG);
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);
  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [checkedAll, setCheckedAll] = useState(false);
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(GLOBAL_SNACKBAR);
  const [dialogType, setDialogType] = useState<"edit" | "add">("edit");
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const matchMutate = useSwrMatchMutate();
  const { data, mutate, isValidating } = useOrgFinanceTargets(
    {
      organizationId,
    },
    {
      targetId: orgUser?.organizationUserId || router.query.userId,
      startDate: formatDate(startDate, "yyyy-MM-dd"),
      endDate: formatDate(endDate, "yyyy-MM-dd"),
    }
  );
  const { excute: createOrgFinanceTargets } = useAxiosApiWrapper(
    apis.org.createOrgFinanceTargets,
    "Create"
  );

  const { excute: deleteFinanceTarget, isLoading: isDeleting } =
    useAxiosApiWrapper(apis.org.deleteFinanceTarget, "Delete");

  const { value: tabValue, handleChange: handleTabChange } = useTab(
    "UserFinanceDetail",
    OrganizationFinanceType.INCOME,
    true
  );

  const selectedValues = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => el?.checked)
        .map((el) => {
          const { TableRowProps: trp, ...other } = el?.data || {};
          return other as OrganizationFinanceTarget;
        }),
    [eachRowState]
  );

  const [editValue, setEditValue] =
    useState<OrganizationFinanceTarget[]>(selectedValues);

  const excludedTargetIdList = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => !el?.checked)
        .map((el) => el?.data?.organizationFinanceTargetId as string),
    [eachRowState]
  );

  const {
    handleChangePage,
    handleRowsPerPageChange,
    payload,
    setPayload,

    page,
    rowsPerPage,
  } = useDataTable(
    `CrmUserFinancesDataTable-${orgUserId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );

  const incomes = useMemo(
    () =>
      data?.source?.filter(
        (el) =>
          el.organizationFinanceColumn.organizationFinanceType ===
          OrganizationFinanceType.INCOME
      ),
    [data]
  );

  const tableData = useMemo(
    () =>
      !incomes
        ? []
        : incomes.map((el) => ({
            ...el,
            TableRowProps: {
              hover: true,
              sx: { cursor: "pointer" },
              DataTableRowCheckboxProps: {
                onClick: (e) => {
                  e.stopPropagation();
                },
              },
            },
          })),
    [incomes]
  );

  const handleCheckedAllClick = useCallback(() => {
    setCheckedAll(true);
  }, []);

  const handleCheckedAllClearClick = useCallback(() => {
    setCheckedAll(false);
  }, []);

  const expenditures = useMemo(
    () =>
      data?.source?.filter(
        (el) =>
          el.organizationFinanceColumn.organizationFinanceType ===
          OrganizationFinanceType.EXPENDITURE
      ),
    [data]
  );

  const tableDataExp = useMemo(
    () =>
      !expenditures
        ? []
        : expenditures.map((el) => ({
            ...el,
            TableRowProps: {
              hover: true,
              sx: { cursor: "pointer" },
              DataTableRowCheckboxProps: {
                onClick: (e) => {
                  e.stopPropagation();
                },
              },
            },
          })),
    [expenditures]
  );

  const asset = useMemo(
    () =>
      data?.source?.filter(
        (el) =>
          el.organizationFinanceColumn.organizationFinanceType ===
          OrganizationFinanceType.ASSET
      ),
    [data]
  );

  const tableDataAsset = useMemo(
    () =>
      !asset
        ? []
        : asset.map((el) => ({
            ...el,
            TableRowProps: {
              hover: true,
              sx: { cursor: "pointer" },
              DataTableRowCheckboxProps: {
                onClick: (e) => {
                  e.stopPropagation();
                },
              },
            },
          })),
    [asset]
  );

  const debt = useMemo(
    () =>
      data?.source?.filter(
        (el) =>
          el.organizationFinanceColumn.organizationFinanceType ===
          OrganizationFinanceType.DEBT
      ),
    [data]
  );

  const tableDataDEBT = useMemo(
    () =>
      !debt
        ? []
        : debt.map((el) => ({
            ...el,
            TableRowProps: {
              hover: true,
              sx: { cursor: "pointer" },
              DataTableRowCheckboxProps: {
                onClick: (e) => {
                  e.stopPropagation();
                },
              },
            },
          })),
    [debt]
  );

  const newValues: FinanceDialogProps["defaultValues"] = useMemo(
    () => ({
      organizationFinanceColumnList: [
        {
          organizationFinanceColumnId: "",
          organizationFinanceColumnName: "",
          organizationFinanceType: tabValue,
          organizationFinanceTemplate: {
            organizationFinanceTemplateId: "",
          },
          organizationFinanceTarget: {
            organizationFinanceTargetId: "",
            organizationFinanceTargetAmount: 0,
            organizationFinanceTargetInsertDate: new Date().toISOString(),
            organizationTagList: [
              {
                tagId: "",
              },
            ],
          },
        },
      ],
    }),
    [tabValue]
  );

  const defaultValues: FinanceDialogProps["defaultValues"] = useMemo(
    () => ({
      organizationFinanceColumnList: editValue?.map((el) => ({
        organizationFinanceColumnId:
          el?.organizationFinanceColumn.organizationFinanceColumnId,
        organizationFinanceColumnName:
          el?.organizationFinanceColumn.organizationFinanceColumnName,
        organizationFinanceType:
          el?.organizationFinanceColumn.organizationFinanceType,
        organizationFinanceTemplate: {
          organizationFinanceTemplateId:
            el?.organizationFinanceColumn?.organizationFinanceTemplate
              ?.organizationFinanceTemplateId,
        },
        organizationFinanceTarget: {
          organizationFinanceTargetId: el?.organizationFinanceTargetId,
          organizationFinanceTargetAmount: el?.organizationFinanceTargetAmount,
          organizationFinanceTargetInsertDate:
            el?.organizationFinanceTargetInsertDate,
          organizationTagList: el.organizationTagTargetList.map((tag) => ({
            tagId: tag.organizationTag.tagId,
          })),
        },
      })),
    }),
    [editValue]
  );

  const handleDeleteFinanceTargets = useCallback(() => {
    openConfirmDeleteDialog({
      primary: `${
        wordLibrary?.["are you sure you want to delete this item"] ??
        "你確定要刪除這個項目嗎？"
      }`,
      onConfirm: async () => {
        try {
          closeConfirmDeleteDialog();
          const promises = selectedValues.map((el) =>
            deleteFinanceTarget({
              organizationId,
              organizationFinanceTargetId: el.organizationFinanceTargetId,
            })
          );
          Promise.all(promises)
            .then(() => {
              setDeleteState(true);
              mutate();
              matchMutate(
                new RegExp(
                  `^/organizations/${organizationId}/users/${orgUser?.organizationUserId}/finance-summary`,
                  "g"
                )
              );
            })
            .catch(() => {});
        } catch (error) {
          apis.tools.createLog({
            function: "DatePicker: handleDeleteFinanceTargets",
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
  }, [
    closeConfirmDeleteDialog,
    deleteFinanceTarget,
    matchMutate,
    mutate,
    openConfirmDeleteDialog,
    orgUser?.organizationUserId,
    organizationId,
    selectedValues,
    wordLibrary,
  ]);

  const handleDisableToolClick = useCallback(() => {
    if (selectedValues.length === 0) {
      openSnackbar({
        message: `${wordLibrary?.["please check the data"] ?? "請勾選資料"}`,
        severity: "warning",
      });
    }
  }, [openSnackbar, selectedValues.length, wordLibrary]);

  const handleSaveFinanceTarget = useCallback(
    async (v) => {
      if (orgUser) {
        try {
          setIsCreating(true);
          await createOrgFinanceTargets({
            organizationId,
            targetId: orgUser.organizationUserId,
            organizationFinanceColumnList: v.organizationFinanceColumnList,
          });
          closeDialog();
          mutate();
          matchMutate(
            new RegExp(
              `^/organizations/${organizationId}/users/${orgUser.organizationUserId}/finance-summary`,
              "g"
            )
          );
        } catch (error) {
          setIsCreating(false);
          apis.tools.createLog({
            function: "DatePicker: handleSaveFinanceTarget",
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
    [
      closeDialog,
      createOrgFinanceTargets,
      matchMutate,
      mutate,
      orgUser,
      organizationId,
    ]
  );

  const buttonTools = writable && (
    <Tooltip title={wordLibrary?.add ?? "新增"}>
      <Button
        onClick={() => {
          setDialogType("add");
          openDialog();
        }}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
        id="table-add-button"
        data-tid="table-add-button"
      >
        {wordLibrary?.add ?? "新增"}
      </Button>
    </Tooltip>
  );

  const selectedToolsbar = useMemo(
    () => (
      <>
        {(checkedAll || selectedValues.length !== 0) && deletable && (
          <Tooltip title={wordLibrary?.delete ?? "刪除"}>
            <div role="button" tabIndex={-1}>
              <IconButton
                onClick={() => {
                  handleDeleteFinanceTargets();
                }}
                onKeyPress={handleDisableToolClick}
                disabled={
                  (!checkedAll && selectedValues.length === 0) ||
                  (checkedAll && data?.total === excludedTargetIdList.length)
                }
                color="primary"
                id="table-delete-btn"
                data-tid="table-delete-btn"
              >
                <Iconify icon="solar:trash-bin-trash-bold" width={24} />
              </IconButton>
            </div>
          </Tooltip>
        )}
      </>
    ),
    [
      checkedAll,
      selectedValues.length,
      deletable,
      wordLibrary,
      handleDisableToolClick,
      data?.total,
      excludedTargetIdList.length,
      handleDeleteFinanceTargets,
    ]
  );

  useEffect(() => {
    if (!isValidating) {
      setIsCreating(false);
    }
  }, [isValidating]);

  return (
    <>
      <FinanceDialog
        primary={`${wordLibrary?.edit ?? "編輯"}${
          orgUser?.organizationUserNameZh
        }${wordLibrary?.["financial information"] ?? "財務資訊"}`}
        defaultValues={dialogType === "edit" ? defaultValues : newValues}
        loading={isCreating || isValidating}
        tabValue={tabValue}
        onSubmit={handleSaveFinanceTarget}
      />
      <div
        className={clsx(classes.loader, isValidating && classes.showLoader, {
          [classes.lightOpacity]: settings.themeMode === "light",
          [classes.darkOpacity]: settings.themeMode !== "light",
        })}
      >
        <CircularProgress />
      </div>
      <EditSectionHeader
        primary={wordLibrary?.["financial details"] ?? "財務詳細"}
      />
      <Box mt={2}>
        <NewDateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChanege={(date) => {
            setStartDate(date);
          }}
          onEndDateChange={(date) => {
            setEndDate(date);
          }}
        />
      </Box>
      <Box mt={2}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => handleTabChange(v)}
          sx={{ boxShadow: "none" }}
        >
          <Tab
            label={wordLibrary?.income ?? "收入"}
            value={OrganizationFinanceType.INCOME}
            id="finance-income-tab"
            data-tid="finance-income-tab"
          />
          <Tab
            label={wordLibrary?.expenditure ?? "支出"}
            value={OrganizationFinanceType.EXPENDITURE}
            id="finance-expenditure-tab"
            data-tid="finance-expenditure-tab"
          />
          <Tab
            label={wordLibrary?.assets ?? "資產"}
            value={OrganizationFinanceType.ASSET}
            id="finance-assets-tab"
            data-tid="finance-assets-tab"
          />
          <Tab
            label={wordLibrary?.liabilities ?? "負債"}
            value={OrganizationFinanceType.DEBT}
            id="finance-liabilities-tab"
            data-tid="finance-liabilities-tab"
          />
        </Tabs>
      </Box>
      {tabValue === OrganizationFinanceType.INCOME && (
        <Box mt={4}>
          <I18nDataTable
            columns={[
              {
                id: "organizationFinanceColumnName",
                name: `${wordLibrary?.["account name"] ?? "帳務名稱"}`,
                dataKey:
                  "organizationFinanceColumn.organizationFinanceColumnName",
                sortKey:
                  "organizationFinanceColumn.organizationFinanceColumnName",
              },
              {
                id: "organizationFinanceTargetInsertDate",
                name: `${
                  wordLibrary?.["accounting timestamp"] ?? "帳務發生時間"
                }`,
                dataKey: "organizationFinanceTargetInsertDate",
                sortKey: "organizationFinanceTargetInsertDate",
                format: (value) => formatDate(value, "yyyy-MM-dd"),
              },
              {
                id: "organizationFinanceTargetCreateDate",
                name: `${wordLibrary?.["filling time"] ?? "填寫時間"}`,
                dataKey: "organizationFinanceTargetCreateDate",
                sortKey: "organizationFinanceTargetCreateDate",
                format: (value) => formatDate(value, "PP pp"),
              },
              {
                id: "organizationFinanceTargetAmount",
                name: `${wordLibrary?.amount ?? "金額"}`,
                dataKey: "organizationFinanceTargetAmount",
                sortKey: "organizationFinanceTargetAmount",
              },
              {
                id: "organizationTagList",
                name: `${wordLibrary?.tag ?? "標籤"}`,
              },
            ]}
            rowKey="organizationFinanceTargetId"
            data={tableData}
            renderDataRow={(rowData) => {
              const row = rowData as OrganizationFinanceTarget;
              const rowArray = [] as OrganizationFinanceTarget[];
              rowArray.push(row);

              return (
                readable && (
                  <UserFinanceTableRow
                    row={row}
                    key={row.organizationFinanceTargetId}
                    onClick={() => {
                      if (writable) {
                        setDialogType("edit");
                        openDialog();
                        setEditValue(rowArray);
                      }
                    }}
                  />
                )
              );
            }}
            sx={{
              "&.MuiEgDataTable-table .MuiTableCell-root": {
                padding: "16px 8px",
              },
            }}
            enableRowCheckbox
            onEachRowStateChange={(state) => {
              setEachRowState(state);
            }}
            isEmpty={incomes?.length === 0}
            serverSide
            loading={isDeleting || isValidating}
            buttonTools={buttonTools}
            selectedToolsbar={selectedToolsbar}
            payload={payload}
            MuiTablePaginationProps={{
              count: incomes?.length ?? 0,
              page,
              rowsPerPage,
              onPageChange: handleChangePage,
              onRowsPerPageChange: handleRowsPerPageChange,
            }}
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
            deleteState={deleteState}
            setDeleteState={setDeleteState}
          />
        </Box>
      )}
      {tabValue === OrganizationFinanceType.EXPENDITURE && (
        <Box mt={4}>
          <I18nDataTable
            columns={[
              {
                id: "organizationFinanceColumnName",
                name: `${wordLibrary?.["account name"] ?? "帳務名稱"}`,
                dataKey:
                  "organizationFinanceColumn.organizationFinanceColumnName",
                sortKey:
                  "organizationFinanceColumn.organizationFinanceColumnName",
              },
              {
                id: "organizationFinanceTargetInsertDate",
                name: `${
                  wordLibrary?.["accounting timestamp"] ?? "帳務發生時間"
                }`,
                dataKey: "organizationFinanceTargetInsertDate",
                sortKey: "organizationFinanceTargetInsertDate",
                format: (value) => formatDate(value, "yyyy-MM-dd"),
              },
              {
                id: "organizationFinanceTargetCreateDate",
                name: `${wordLibrary?.["filling time"] ?? "填寫時間"}`,
                dataKey: "organizationFinanceTargetCreateDate",
                sortKey: "organizationFinanceTargetCreateDate",
                format: (value) => formatDate(value, "PP pp"),
              },
              {
                id: "organizationFinanceTargetAmount",
                name: `${wordLibrary?.amount ?? "金額"}`,
                dataKey: "organizationFinanceTargetAmount",
                sortKey: "organizationFinanceTargetAmount",
              },
              {
                id: "organizationTagList",
                name: `${wordLibrary?.tag ?? "標籤"}`,
              },
            ]}
            rowKey="organizationFinanceTargetId"
            data={tableDataExp}
            renderDataRow={(rowData) => {
              const row = rowData as OrganizationFinanceTarget;
              const rowArray = [] as OrganizationFinanceTarget[];
              rowArray.push(row);

              return (
                readable && (
                  <UserFinanceTableRow
                    row={row}
                    key={row.organizationFinanceTargetId}
                    onClick={() => {
                      if (writable) {
                        setDialogType("edit");
                        openDialog();
                        setEditValue(rowArray);
                      }
                    }}
                  />
                )
              );
            }}
            sx={{
              "&.MuiEgDataTable-table .MuiTableCell-root": {
                padding: "16px 8px",
              },
            }}
            enableRowCheckbox
            onEachRowStateChange={(state) => {
              setEachRowState(state);
            }}
            MuiTablePaginationProps={{
              count: expenditures?.length ?? 0,
              page,
              rowsPerPage,
              onPageChange: handleChangePage,
              onRowsPerPageChange: handleRowsPerPageChange,
            }}
            isEmpty={expenditures?.length === 0}
            serverSide
            loading={isDeleting || isValidating}
            buttonTools={buttonTools}
            selectedToolsbar={selectedToolsbar}
            payload={payload}
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
            deleteState={deleteState}
            setDeleteState={setDeleteState}
          />
        </Box>
      )}
      {tabValue === OrganizationFinanceType.ASSET && (
        <Box mt={4}>
          <I18nDataTable
            columns={[
              {
                id: "organizationFinanceColumnName",
                name: `${wordLibrary?.["account name"] ?? "帳務名稱"}`,
                dataKey:
                  "organizationFinanceColumn.organizationFinanceColumnName",
                sortKey:
                  "organizationFinanceColumn.organizationFinanceColumnName",
              },
              {
                id: "organizationFinanceTargetInsertDate",
                name: `${
                  wordLibrary?.["accounting timestamp"] ?? "帳務發生時間"
                }`,
                dataKey: "organizationFinanceTargetInsertDate",
                sortKey: "organizationFinanceTargetInsertDate",
                format: (value) => formatDate(value, "yyyy-MM-dd"),
              },
              {
                id: "organizationFinanceTargetCreateDate",
                name: `${wordLibrary?.["filling time"] ?? "填寫時間"}`,
                dataKey: "organizationFinanceTargetCreateDate",
                sortKey: "organizationFinanceTargetCreateDate",
                format: (value) => formatDate(value, "PP pp"),
              },
              {
                id: "organizationFinanceTargetAmount",
                name: `${wordLibrary?.amount ?? "金額"}`,
                dataKey: "organizationFinanceTargetAmount",
                sortKey: "organizationFinanceTargetAmount",
              },
              {
                id: "organizationTagList",
                name: `${wordLibrary?.tag ?? "標籤"}`,
              },
            ]}
            rowKey="organizationFinanceTargetId"
            data={tableDataAsset}
            renderDataRow={(rowData) => {
              const row = rowData as OrganizationFinanceTarget;
              const rowArray = [] as OrganizationFinanceTarget[];
              rowArray.push(row);

              return (
                readable && (
                  <UserFinanceTableRow
                    row={row}
                    key={row.organizationFinanceTargetId}
                    onClick={() => {
                      if (writable) {
                        setDialogType("edit");
                        openDialog();
                        setEditValue(rowArray);
                      }
                    }}
                  />
                )
              );
            }}
            sx={{
              "&.MuiEgDataTable-table .MuiTableCell-root": {
                padding: "16px 8px",
              },
            }}
            enableRowCheckbox
            onEachRowStateChange={(state) => {
              setEachRowState(state);
            }}
            isEmpty={asset?.length === 0}
            serverSide
            loading={isDeleting || isValidating}
            buttonTools={buttonTools}
            selectedToolsbar={selectedToolsbar}
            payload={payload}
            MuiTablePaginationProps={{
              count: asset?.length ?? 0,
              page,
              rowsPerPage,
              onPageChange: handleChangePage,
              onRowsPerPageChange: handleRowsPerPageChange,
            }}
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
            deleteState={deleteState}
            setDeleteState={setDeleteState}
          />
        </Box>
      )}
      {tabValue === OrganizationFinanceType.DEBT && (
        <Box mt={4}>
          <I18nDataTable
            columns={[
              {
                id: "organizationFinanceColumnName",
                name: `${wordLibrary?.["account name"] ?? "帳務名稱"}`,
                dataKey:
                  "organizationFinanceColumn.organizationFinanceColumnName",
                sortKey:
                  "organizationFinanceColumn.organizationFinanceColumnName",
              },
              {
                id: "organizationFinanceTargetInsertDate",
                name: `${
                  wordLibrary?.["accounting timestamp"] ?? "帳務發生時間"
                }`,
                dataKey: "organizationFinanceTargetInsertDate",
                sortKey: "organizationFinanceTargetInsertDate",
                format: (value) => formatDate(value, "yyyy-MM-dd"),
              },
              {
                id: "organizationFinanceTargetCreateDate",
                name: `${wordLibrary?.["filling time"] ?? "填寫時間"}`,
                dataKey: "organizationFinanceTargetCreateDate",
                sortKey: "organizationFinanceTargetCreateDate",
                format: (value) => formatDate(value, "PP pp"),
              },
              {
                id: "organizationFinanceTargetAmount",
                name: `${wordLibrary?.amount ?? "金額"}`,
                dataKey: "organizationFinanceTargetAmount",
                sortKey: "organizationFinanceTargetAmount",
              },
              {
                id: "organizationTagList",
                name: `${wordLibrary?.tag ?? "標籤"}`,
              },
            ]}
            rowKey="organizationFinanceTargetId"
            data={tableDataDEBT}
            renderDataRow={(rowData) => {
              const row = rowData as OrganizationFinanceTarget;
              const rowArray = [] as OrganizationFinanceTarget[];
              rowArray.push(row);

              return (
                readable && (
                  <UserFinanceTableRow
                    row={row}
                    key={row.organizationFinanceTargetId}
                    onClick={() => {
                      if (writable) {
                        setDialogType("edit");
                        openDialog();
                        setEditValue(rowArray);
                      }
                    }}
                  />
                )
              );
            }}
            sx={{
              "&.MuiEgDataTable-table .MuiTableCell-root": {
                padding: "16px 8px",
              },
            }}
            enableRowCheckbox
            onEachRowStateChange={(state) => {
              setEachRowState(state);
            }}
            isEmpty={debt?.length === 0}
            serverSide
            loading={isDeleting || isValidating}
            buttonTools={buttonTools}
            selectedToolsbar={selectedToolsbar}
            payload={payload}
            MuiTablePaginationProps={{
              count: debt?.length ?? 0,
              page,
              rowsPerPage,
              onPageChange: handleChangePage,
              onRowsPerPageChange: handleRowsPerPageChange,
            }}
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
            deleteState={deleteState}
            setDeleteState={setDeleteState}
          />
        </Box>
      )}
    </>
  );
};

export default UserFinanceDetail;
