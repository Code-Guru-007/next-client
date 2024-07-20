import React, { FC, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  EachRowState,
  RowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useOrgFeedbacks from "utils/useOrgFeedbacks";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import {
  OrganizationFeedback,
  OrganizationTagTarget,
} from "interfaces/entities";

import { ServiceModuleValue, Table as TableType } from "interfaces/utils";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";

import {
  TagAddDialog,
  TAG_ADD_DIALOG,
  TagDeleteDialog,
  TAG_DELETE_DIALOG,
} from "components/DatatableToolDialogs";
import { DefaultPayload } from "@eGroupAI/material-module/DataTable/useDataTable";
import apis from "utils/apis";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Label from "minimal/components/label";
import Checkbox from "@mui/material/Checkbox";
import { visuallyHidden } from "@mui/utils";
import Tooltip from "@eGroupAI/material/Tooltip";
import IconButton from "components/IconButton/StyledIconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import Iconify from "minimal/components/iconify/iconify";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";

import { format } from "@eGroupAI/utils/dateUtils";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";

import { useReduxDialog } from "@eGroupAI/redux-modules";
import EditSectionLoader from "components/EditSectionLoader";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import { CustomPaginationActions } from "@eGroupAI/material-module/DataTable/CustomPaginationTool";
import getTextColor from "@eGroupAI/utils/colorUtils";
import FeedbackDialog, { DIALOG } from "./FeedbackDialog";

interface Data {
  organizationFeedbackId: string;
  organizationFeedbackType: string | undefined;
  organizationFeedbackTitle: string | undefined;
  organizationFeedbackPersonName: string | undefined;
  organizationFeedbackContent: string | undefined;
  organizationFeedbackPersonPhone: number;
  organizationFeedbackPersonEmail: string;
  organizationFeedbackCountry: string | undefined;
  organizationFeedbackCompanyName: string | undefined;
  organizationFeedbackCreateDate: number;
  organizationTagTargetList: OrganizationTagTarget[];
}
interface FeedbackDefaultPayload extends DefaultPayload {
  startIndex?: number;
}

type Order = "asc" | "desc";

const headCells = [
  {
    id: "organizationFeedbackTag",
    numeric: false,
    disablePadding: true,
    label: "標籤",
  },
  {
    id: "organizationFeedbackTitle",
    numeric: false,
    disablePadding: true,
    label: "回饋標題",
  },
  {
    id: "organizationFeedbackPersonName",
    numeric: false,
    disablePadding: true,
    label: "回饋姓名",
  },
  {
    id: "organizationFeedbackPersonPhone",
    numeric: false,
    disablePadding: true,
    label: "聯絡電話",
  },
  {
    id: "organizationFeedbackPersonEmail",
    numeric: false,
    disablePadding: true,
    label: "聯絡 Email",
  },
  {
    id: "organizationFeedbackCreateDate",
    numeric: true,
    disablePadding: true,
    label: "新增日期",
  },
];

const FeedbackDataTable: FC = function () {
  const locale = useSelector(getGlobalLocale);
  const organizationId = useSelector(getSelectedOrgId);
  const [selectedRowId, setSelectedRowId] = useState<string>("");
  const [order, setOrder] = useState<Order>("desc");
  const [checkedAll] = useState<boolean>(false);

  const { payload, setPayload, submitedPayload, setSubmitedPayload } =
    useDataTable<FeedbackDefaultPayload>(
      `feedback-${organizationId}`,
      {},
      {
        fromKey: "startIndex",
        enableLocalStorageCache: true,
      }
    );
  const { filterSearch } = useDataTableFilterColumns(
    TableType.ARTICLES,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

  const { openDialog: openTagDialog } = useReduxDialog(
    `${ServiceModuleValue.CMS_FEEDBACK}_${TAG_ADD_DIALOG}`
  );
  const { openDialog: openTagDeleteDialog } = useReduxDialog(
    `${ServiceModuleValue.CMS_FEEDBACK}_${TAG_DELETE_DIALOG}`
  );

  const [orderBy, setOrderBy] = useState<keyof Data>(
    "organizationFeedbackType"
  );

  const [totalCount, setTotalCount] = useState<number>(0);
  const [isClickedAllCheckbox, setIsClickedAllCheckbox] =
    useState<boolean>(false);
  const [allChecked, setAllChecked] = useState<boolean>(false);
  const [indeterminate, setIndeterminate] = useState<boolean>(false);
  const [lastLoadedRowState, setLastLoadedRowState] = useState<
    EachRowState<OrganizationFeedback>
  >({});
  const [eachRowState, setEachRowState] = useState<
    EachRowState<OrganizationFeedback>
  >({});

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [visibleRows, setVisibleRows] = useState<OrganizationFeedback[]>([]);

  const excludedTargetIdList = useMemo(
    () => Object.values(visibleRows).map((el) => el?.organizationFeedbackId),
    [visibleRows]
  );

  const { excute: deleteOrgFeedback } = useAxiosApiWrapper(
    apis.org.deleteOrgFeedback,
    "Delete"
  );

  const { excute: batchDeleteOrgFeedback } = useAxiosApiWrapper(
    apis.org.batchDeleteOrgFeedback,
    "Delete"
  );
  const { openDialog } = useReduxDialog(DIALOG);

  const {
    data,
    mutate: mutateFeedback,
    isValidating,
  } = useOrgFeedbacks(
    {
      organizationId,
    },
    {
      locale,
      size: rowsPerPage,
      startIndex: page * rowsPerPage,
    }
  );

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) return -1;

    if (b[orderBy] > a[orderBy]) return 1;

    return 0;
  }

  function getComparator(
    order: Order,
    orderBy: string | number
  ): (
    a: { [key in string | number]: number | string },
    b: { [key in string | number]: number | string }
  ) => number {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function stableSort(array: OrganizationFeedback[], comparator) {
    const stabilizedThis = array?.map(
      (el, index) => [el, index] as unknown as OrganizationFeedback
    );
    stabilizedThis?.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis?.map((el) => el[0]);
  }

  useEffect(() => {
    setIsClickedAllCheckbox(false); // Reset "Select All" state when navigating pages
  }, [page, rowsPerPage]);

  useEffect(() => {
    if (totalCount === 0) {
      setTotalCount(data?.total || 0);
    }
    if (totalCount !== 0) {
      if (totalCount !== data?.total) setTotalCount(data?.total || 0);
      setEachRowState((prev) => {
        const newRowStates = data?.source.reduce<
          EachRowState<OrganizationFeedback>
        >((rowState, rowData) => {
          const dataId = rowData.organizationFeedbackId;
          const isExisted = Object.keys(prev).includes(dataId);
          return {
            ...rowState,
            [dataId]: {
              checked: isExisted
                ? Boolean(prev[dataId]?.checked)
                : isClickedAllCheckbox,
              display: true,
              data: rowData,
            },
          };
        }, {});
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        setLastLoadedRowState(newRowStates || {});
        return { ...prev, ...newRowStates };
      });
    }
  }, [data?.source, data?.total, isClickedAllCheckbox, totalCount]);

  const checkedIds = useMemo(
    () => Object.keys(eachRowState).filter((key) => eachRowState[key]?.checked),
    [eachRowState]
  );

  useEffect(() => {
    if (data?.source.length) {
      setVisibleRows(data?.source);
    }
  }, [data?.source, page, rowsPerPage]);

  useEffect(() => {
    const sort = stableSort(data?.source || [], getComparator(order, orderBy));
    setVisibleRows(sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderBy, page, rowsPerPage, data?.source]);

  // handle state of allchecked and indeterminate status
  useEffect(() => {
    if (isClickedAllCheckbox) {
      if (
        Object.keys(eachRowState).length === checkedIds.length &&
        checkedIds.length > 0
      ) {
        setAllChecked(true);
        setIndeterminate(false);
      } else if (checkedIds.length > 0) {
        setAllChecked(false);
        setIndeterminate(true);
      } else {
        setAllChecked(false);
        setIndeterminate(false);
        setIsClickedAllCheckbox(false);
      }
    } else if (!isClickedAllCheckbox && data?.source.length) {
      if (
        Object.keys(lastLoadedRowState).filter(
          (key) => lastLoadedRowState[key]?.checked
        ).length === rowsPerPage
      ) {
        setAllChecked(true);
        setIndeterminate(false);
      } else if (
        Object.keys(lastLoadedRowState).filter(
          (key) => lastLoadedRowState[key]?.checked
        ).length > 0
      ) {
        setAllChecked(false);
        setIndeterminate(true);
      } else {
        setAllChecked(false);
        setIndeterminate(false);
        setIsClickedAllCheckbox(false);
      }
    }
  }, [
    eachRowState,
    totalCount,
    checkedIds.length,
    isClickedAllCheckbox,
    lastLoadedRowState,
    rowsPerPage,
    data?.source.length,
  ]);

  useEffect(() => {
    const visibleRowCheckedCount = visibleRows.filter(
      (row) => eachRowState[row.organizationFeedbackId]?.checked
    ).length;
    if (visibleRows.length === 0) {
      setAllChecked(false);
      setIndeterminate(false);
    } else if (visibleRowCheckedCount === visibleRows.length) {
      setAllChecked(true);
      setIndeterminate(false);
    } else if (visibleRowCheckedCount > 0) {
      setAllChecked(false);
      setIndeterminate(true);
    } else {
      setAllChecked(false);
      setIndeterminate(false);
    }
  }, [visibleRows, eachRowState]);
  function EnhancedTableHead(props) {
    const { onSelectAllClick, order, orderBy, onRequestSort } = props;

    const createSortHandler =
      (property) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
      };

    const handleClickAllCheckbox = (checked: boolean) => {
      if (visibleRows.length) onSelectAllClick(checked);
    };

    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={indeterminate}
              checked={allChecked}
              onChange={(_, checked) => handleClickAllCheckbox(checked)}
              inputProps={{
                "aria-label": "select all desserts",
              }}
            />
          </TableCell>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? "right" : "left"}
              padding={"normal"}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id && !!visibleRows.length}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }

  function EnhancedTableToolbar({ numSelected }): JSX.Element {
    return (
      <div>
        {numSelected > 0 && (
          <Toolbar
            sx={{
              pl: { sm: 2 },
              pr: { xs: 1, sm: 1 },
              ...(numSelected > 0 && {
                bgcolor: (theme) =>
                  alpha(
                    theme.palette.primary.main,
                    theme.palette.action.activatedOpacity
                  ),
              }),
            }}
          >
            <Typography
              sx={{ flex: "1 1 100%" }}
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {numSelected} selected
            </Typography>
            <Tooltip title="刪除">
              <IconButton
                onClick={() => {
                  openConfirmDeleteDialog({
                    primary: `您確定要刪除嗎？`,
                    onConfirm: async () => {
                      if (checkedIds.length === 1) {
                        await deleteOrgFeedback({
                          organizationId,
                          organizationFeedbackId: checkedIds[0] || "",
                        });
                      } else {
                        await batchDeleteOrgFeedback({
                          organizationId,
                          organizationFeedbackIdList: checkedIds,
                        });
                      }
                      mutateFeedback();
                      setEachRowState({});
                      closeConfirmDeleteDialog();
                    },
                  });
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="批次新增標籤">
              <IconButton
                onClick={() => {
                  openTagDialog();
                }}
              >
                <LocalOfferIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="批次刪除標籤">
              <IconButton
                onClick={() => {
                  openTagDeleteDialog();
                }}
              >
                <Iconify icon="mdi:tag-off" width={24} />
              </IconButton>
            </Tooltip>
          </Toolbar>
        )}
      </div>
    );
  }

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (checked: boolean) => {
    if (checked) {
      setIsClickedAllCheckbox(true);
      setEachRowState((prev) => {
        const next = visibleRows.reduce<EachRowState<OrganizationFeedback>>(
          (a, row) => {
            const data = eachRowState[
              row.organizationFeedbackId
            ] as RowState<OrganizationFeedback>;
            return {
              ...a,
              [row.organizationFeedbackId]: { ...data, checked: true },
            };
          },
          {}
        );
        return { ...prev, ...next };
      });
    } else {
      setIsClickedAllCheckbox(false);
      setEachRowState((prev) => {
        const next = visibleRows.reduce<EachRowState<OrganizationFeedback>>(
          (a, row) => {
            const data = eachRowState[
              row.organizationFeedbackId
            ] as RowState<OrganizationFeedback>;
            return {
              ...a,
              [row.organizationFeedbackId]: { ...data, checked: false },
            };
          },
          {}
        );
        return { ...prev, ...next };
      });
    }
  };

  const handleClick = (priorChecked: boolean, data: OrganizationFeedback) => {
    setEachRowState((prev) => {
      const clickedId = data.organizationFeedbackId;
      const before = prev[clickedId] as RowState<OrganizationFeedback>;
      return {
        ...prev,
        [clickedId]: { ...before, checked: !priorChecked },
      };
    });
    setLastLoadedRowState((prev) => {
      const clickedId = data.organizationFeedbackId;
      const before = prev[clickedId] as RowState<OrganizationFeedback>;
      return {
        ...prev,
        [clickedId]: { ...before, checked: !priorChecked },
      };
    });
  };

  const handleChangePage = (event: unknown, newPage: number) =>
    setPage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (data: OrganizationFeedback) =>
    checkedIds?.indexOf(data.organizationFeedbackId) !== -1;

  if (isValidating) return <EditSectionLoader />;

  return (
    <>
      <Box sx={{ width: "100%" }}>
        {filterSearch && (
          <TagAddDialog
            filterSearch={filterSearch}
            tableModule={TableType.FEEDBACK}
            serviceModuleValue={ServiceModuleValue.CMS_FEEDBACK}
            isCheckedAllPageRows={checkedAll}
            selectedTargetIds={checkedIds}
            excludeSelectedTargetIds={excludedTargetIdList}
            onSuccess={() => {
              mutateFeedback();
              setEachRowState({});
            }}
          />
        )}
        {filterSearch && (
          <TagDeleteDialog
            filterSearch={filterSearch}
            tableModule={TableType.FEEDBACK}
            serviceModuleValue={ServiceModuleValue.CMS_FEEDBACK}
            isCheckedAllPageRows={checkedAll}
            selectedTargetIds={checkedIds}
            excludeSelectedTargetIds={excludedTargetIdList}
            onSuccess={() => {
              mutateFeedback();
              setEachRowState({});
            }}
          />
        )}
        <FeedbackDialog organizationFeedbackId={selectedRowId} />
        <Paper sx={{ width: "100%", mb: 2 }}>
          <EnhancedTableToolbar numSelected={checkedIds.length} />
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
              <EnhancedTableHead
                numSelected={checkedIds.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={data?.source.length}
              />
              {visibleRows.length ? (
                <TableBody>
                  {visibleRows?.map((row, index) => {
                    const isItemSelected = isSelected(row);
                    const labelId = `enhanced-table-checkbox-${index}`;
                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row?.organizationFeedbackId}
                        selected={isItemSelected}
                        sx={{ cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRowId(row.organizationFeedbackId);
                          openDialog();
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            onClick={(event) => {
                              handleClick(isItemSelected, row);
                              event.stopPropagation();
                            }}
                            checked={isItemSelected}
                            inputProps={{
                              "aria-labelledby": labelId,
                            }}
                          />
                        </TableCell>
                        <TableCell component="th" id={labelId} padding="normal">
                          {row.organizationTagTargetList?.map((tag) => (
                            <Label
                              variant="soft"
                              key={`${tag.targetId}-${tag.organizationTag.tagName}`}
                              sx={{
                                backgroundColor: tag.organizationTag.tagColor,
                                margin: "4px",
                                color: getTextColor(
                                  tag.organizationTag.tagColor
                                ),
                              }}
                            >
                              {tag.organizationTag.tagName}
                            </Label>
                          ))}
                        </TableCell>
                        <TableCell>{row.organizationFeedbackTitle}</TableCell>
                        <TableCell>
                          {row.organizationFeedbackPersonName}
                        </TableCell>
                        <TableCell>
                          {row.organizationFeedbackPersonPhone}
                        </TableCell>
                        <TableCell>
                          {row.organizationFeedbackPersonEmail}
                        </TableCell>
                        <TableCell align="right">
                          {format(
                            zonedTimeToUtc(
                              new Date(row.organizationFeedbackCreateDate),
                              "Asia/Taipei"
                            ),
                            "PP pp",
                            { locale: zhCN }
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              ) : (
                <TableBody>
                  <TableRow sx={{ height: 245 }}>
                    <TableCell colSpan={6} sx={{ textAlign: "center" }}>
                      no data found
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </TableContainer>
          {visibleRows.length ? (
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={data?.total || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              showFirstButton
              showLastButton
              SelectProps={{
                inputProps: { id: "table-rowsPerPage-select" },
              }}
              ActionsComponent={CustomPaginationActions}
            />
          ) : (
            <div>{""}</div>
          )}
        </Paper>
      </Box>
    </>
  );
};

export default FeedbackDataTable;
