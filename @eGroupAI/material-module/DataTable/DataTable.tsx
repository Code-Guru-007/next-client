import { useEffect, useState, useMemo, ReactNode, useCallback } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/styles";

import findDeepValue from "@eGroupAI/utils/findDeepValue";
import warning from "warning";

import {
  TablePaginationProps,
  CircularProgress,
  Table,
  TableBody,
  TableContainer as MuiTableContainer,
  TableContainerProps,
  TableRow,
  Theme,
  useMediaQuery,
  Box,
  Stack,
  Button,
} from "@mui/material";

import PaginationBar from "@eGroupAI/material-module/DataTable/PaginationBar";
import { useSettingsContext } from "minimal/components/settings";
import Scrollbar from "minimal/components/scrollbar/scrollbar";
import Iconify from "minimal/components/iconify";
import { ServiceModuleValue } from "interfaces/utils";
import { optionToValueType } from "@eGroupAI/material-lab/FilterDropDown/utils";

import useOrgReportList from "utils/useOrgReportList";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { type OrganizationReportDetail } from "interfaces/entities";

import clsx from "clsx";
import useControlled from "@eGroupAI/hooks/useControlled";
import { ReportDisplay } from "components/ReportDisplay/ReportDisplay";
import DataTableContext from "./DataTableContext";
import DefaultTableContainer from "./DefaultTableContainer";
import DataTableRow from "./DataTableRow";
import DataTableCell from "./DataTableCell";
import { Direction } from "./DataTableSortLabel";
import DataTableHeader from "./DataTableHeader";
import MobileTableHeader from "./MobileTableHeader";
import {
  Column,
  DataTableProps,
  TableEvent,
  DefaultData,
  FilterValues,
  EachRowState,
} from "./typing";
import { asc, desc, getSelectedColumnIds } from "./utils";
import DataTableHead from "./DataTableHead";
import MobileBody from "./MobileBody";
import DataTableExtendToolsbar from "./DataTableExtendToolsbar";
import DataTableToolBar from "./DataTableToolBar";
import StyledPaginationBar from "./StyledPaginationBar";

export interface EgDataTableProps<T> extends DataTableProps<T> {
  TableContainerProps: TableContainerProps;
  count: number;
  deleteState?: boolean;
  setDeleteState?: (state: boolean) => void;
}

const useStyles = makeStyles(
  (theme: Theme) => ({
    container: {
      position: "relative",
      maxHeight: (props) => props.maxHeight,
    },
    table: {
      minWidth: (props: DataTableProps<any>) => {
        if (props.minWidth === false) return undefined;
        if (props.minWidth === "auto") return "auto";
        if (typeof props.minWidth === "number") return props.minWidth;
        return 800;
      },
      "& .MuiTableCell-root": {
        borderBottom: (props) =>
          props.disableBorder ? "none" : `1px solid ${theme.palette.divider}`,
        padding: "8px 8px",
      },
      "& .MuiTableCell-stickyHeader": {
        backgroundColor: theme.palette.common.white,
      },
    },
    mobileTable: {
      width: (props: DataTableProps<any>) => props.width,
      minWidth: 280,
      border: 0,
      "& .MuiTableCell-root": {
        borderBottom: (props) =>
          props.disableBorder ? "none" : `1px solid ${theme.palette.divider}`,
        padding: "2px 17px",
      },
      "& td.MuiTableCell-root": {
        border: 0,
      },
      "& .MuiTableCell-stickyHeader": {
        backgroundColor: theme.palette.common.white,
      },
    },
    tableCell: {
      color: theme.palette.text.primary,
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
      zIndex: 1,
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
    tableList: {
      "& ul": {
        padding: 1,
        boxShadow: "0 3px 16px 0 rgba(10, 75, 109, 0.08)",
      },
    },
  }),
  {
    name: "MuiEgDataTable",
  }
);

const DataTable = <Data extends DefaultData>(props: EgDataTableProps<Data>) => {
  const classes = useStyles(props);
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    className,
    serverSide,
    loading,
    isEmpty,
    disableTableContainer,
    columns: columnsProp,
    data: dataProp,
    rowKey,
    defaultData,
    payload,
    filterSearch,
    serviceModuleValue,
    filterConditionGroups,
    renderColumns,
    renderDataRow: renderDataRowProp,
    renderDataRowDetail,
    renderEmpty,
    to,
    defaultPage = 0,
    defaultRowsPerPage = 10,
    defaultColumnIds,
    columnsShow = 6,
    MuiTablePaginationProps: {
      page: pageProp,
      count: countProp,
      rowsPerPage: rowsPerPageProp,
      onRowsPerPageChange,
      onPageChange,
      ...otherTablePaginationProps
    },
    localization = {
      emptyMessage: "No records to display",
      columnSelectBtn: "Filter Column",
    },
    title,
    TitleTypographyProps,
    subTitle,
    SubTitleTypographyProps,
    selectedToolsbar,
    searchBar,
    SearchBarProps,
    FilterDropDownProps,
    enableSelectColumn,
    enableRowCollapse,
    enableRowCheckbox,
    isControlledEachRowState = false,
    eachRowState: eachRowStateProp,
    defaultEachRowState,
    defaultFilterValues: defaultFilterValuesProp,
    filterValues,
    onFilterViewSelect,
    onFilterValuesChange,
    onFilterValuesSubmit,
    onFilterValuesClear,
    checkedAllPageRows: checkedAllPageRowsProp,
    defaultCheckedAllPageRows = false,
    onEachRowStateChange,
    onSortLabelClick,
    onColumnsChange,
    onCheckedAllClick,
    onCheckedAllClearClick,
    disableExtendToolbar = false,
    outSideAllCheckbox,
    renderPaginationBar,
    TableContainerProps,
    enableFilter = false,
    enableReportTool = false,
    buttonTools,
    iconTools,
    menuTools,
    isStyledPagination = false,
    isTablePagination = true,
    isBorderSeparate,
    deleteState = false,
    setDeleteState,
    ...other
  } = props;

  const organizationId = useSelector(getSelectedOrgId);
  const settings = useSettingsContext();

  const [selfPage, setSelfPage] = useState(defaultPage);
  const [selfRowsPerPage, setSelfRowsPerPage] = useState(defaultRowsPerPage);
  const [data, setData] = useControlled({
    controlled: dataProp,
    default: defaultData || [],
  });
  const [totalCount, setTotalCount] = useState<number>(countProp || 0);
  const [tableEvent, setTableEvent] = useState<TableEvent>();
  const [eachRowState, setEachRowState] = useControlled({
    controlled: eachRowStateProp,
    default: defaultEachRowState || {},
    useForcedUnControlled: eachRowStateProp && !isControlledEachRowState,
  });

  const [checkedAllPageRows, setCheckedAllPageRows] = useControlled({
    controlled: checkedAllPageRowsProp,
    default: defaultCheckedAllPageRows,
  });

  useEffect(() => {
    if (isEmpty) {
      setEachRowState({});
      setCheckedAllPageRows(false);
    }
  }, [isEmpty, setCheckedAllPageRows, setEachRowState]);

  const [selectedColumnIds, setSelectedColumnIds] = useState<
    string[] | undefined
  >(defaultColumnIds);
  const [lastLoadedRowState, setLastLoadedRowState] = useState<
    EachRowState<Data>
  >({});

  // Define if user need control `page` and `rowsPerPage` attribute.
  const isPageControlled = pageProp !== undefined;
  const isRowsPerPageControlled = rowsPerPageProp !== undefined;
  const page = pageProp !== undefined ? pageProp : selfPage;
  const rowsPerPage =
    rowsPerPageProp !== undefined ? rowsPerPageProp : selfRowsPerPage;
  const TableContainer = !disableTableContainer
    ? MuiTableContainer
    : DefaultTableContainer;

  const defaultFilterValues = (defaultFilterValuesProp ||
    filterConditionGroups
      ?.map((c, i) => ({ [i]: {} }))
      .reduce((a, b) => ({ ...a, ...b }), {})) as FilterValues;

  const detailedDefaultFilterValues = useMemo(
    () =>
      filterConditionGroups
        ? filterConditionGroups
            .map(({ filterConditionList }) => ({
              ...filterConditionList
                .map((option) => ({
                  [option.filterId]: optionToValueType(option, null, null),
                }))
                .reduce((a, b) => ({ ...a, ...b }), {}),
            }))
            .reduce((a, b) => ({ ...a, ...b }), {})
        : {},
    [filterConditionGroups]
  );

  const [reportChartShow, setReportChartShow] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<
    | OrganizationReportDetail
    | ({ organizationReportId: undefined } & Pick<
        OrganizationReportDetail,
        "reportChartType" | "reportResult"
      >)
  >();
  const [isLoadingChartResult, setIsLoadingChartResult] =
    useState<boolean>(false);

  const {
    data: orgReportList,
    isValidating: isGettingReportList,
    mutate: reportListMutate,
  } = useOrgReportList(
    { organizationId },
    { serviceModuleValue },
    undefined,
    !enableReportTool
  );

  const selectedColumns = useMemo(
    () =>
      enableSelectColumn
        ? columnsProp?.filter((el) => selectedColumnIds?.includes(el.id))
        : columnsProp,
    [enableSelectColumn, columnsProp, selectedColumnIds]
  );

  warning(
    !((loading || isGettingReportList) && !serverSide),
    "[@eGroupAI/material-module]: DataTable loading status is only work whit serverSide=`true`."
  );

  useEffect(() => {
    if (onEachRowStateChange && Object.keys(eachRowState).length !== 0) {
      onEachRowStateChange(eachRowState, tableEvent);
    }
  }, [eachRowState, onEachRowStateChange, tableEvent]);

  useEffect(() => {
    if (!selectedColumnIds && columnsProp) {
      setSelectedColumnIds(
        getSelectedColumnIds<Data>(columnsShow, columnsProp)
      );
    }
  }, [columnsProp, columnsShow, selectedColumnIds]);

  useEffect(() => {
    if (!isPageControlled && typeof to === "number" && to >= 0) {
      setSelfPage(to);
    }
  }, [isPageControlled, to]);

  const handleChangePage: TablePaginationProps["onPageChange"] = useCallback(
    (event, newPage) => {
      setTableEvent(TableEvent.CHANGE_PAGE);
      if (!isPageControlled) {
        setSelfPage(newPage);
      }
      if (onPageChange) {
        onPageChange(event, {
          page: newPage,
          rowsPerPage,
        });
      }
    },
    [isPageControlled, onPageChange, rowsPerPage]
  );

  const handleRowsPerPageChange: TablePaginationProps["onRowsPerPageChange"] =
    useCallback(
      (event) => {
        setTableEvent(TableEvent.CHANGE_ROWS_PER_PAGE);
        if (!isRowsPerPageControlled) {
          setSelfRowsPerPage(Number(event.target.value));
        }
        if (onRowsPerPageChange) {
          onRowsPerPageChange(event, {
            page,
            rowsPerPage: Number(event.target.value),
          });
        }
      },
      [isRowsPerPageControlled, onRowsPerPageChange, page]
    );

  const handleColumnChange = useCallback(
    (column: Column<Data>, checked: boolean) => {
      let next = selectedColumnIds;
      if (!next) return;
      if (checked) {
        next = [...next, column.id];
      } else {
        next = next.filter((el) => el !== column.id);
      }
      setSelectedColumnIds(next);
      if (onColumnsChange) {
        onColumnsChange(next);
      }
    },
    [onColumnsChange, selectedColumnIds]
  );

  const handleSort = useCallback(
    (sortKey: string, direction: Direction) => {
      if (direction === "desc") {
        setData(desc(data, sortKey));
      } else {
        setData(asc(data, sortKey));
      }
      if (onSortLabelClick) {
        onSortLabelClick(sortKey, direction);
      }
    },
    [data, onSortLabelClick, setData]
  );

  const renderEmptyText = () => {
    if (renderEmpty) return renderEmpty();
    let colSpan = selectedColumns ? selectedColumns.length : 1;
    if (selectedColumns && (enableRowCheckbox || outSideAllCheckbox)) {
      colSpan += 1;
    }
    return (
      <TableRow style={{ height: 245 }}>
        <DataTableCell colSpan={colSpan} style={{ textAlign: "center" }}>
          {localization.emptyMessage}
        </DataTableCell>
      </TableRow>
    );
  };

  const renderDataRow = (rowData: Data, index: number) => {
    localStorage.setItem("searchWord", payload?.query);
    if (renderDataRowProp) {
      return renderDataRowProp(rowData, index);
    }
    if (selectedColumns) {
      const dataid = findDeepValue<string>(rowData, rowKey) as string;
      return (
        <DataTableRow
          {...rowData?.TableRowProps}
          key={dataid}
          dataId={dataid}
          data={rowData}
          collapse={enableRowCollapse}
          checkbox={enableRowCheckbox || outSideAllCheckbox}
          detail={
            renderDataRowDetail
              ? renderDataRowDetail(rowData, index)
              : undefined
          }
          DataTableRowCheckboxProps={{
            defaultChecked: Boolean(
              defaultEachRowState && defaultEachRowState[dataid]
            ),
          }}
          sx={{
            cursor: "pointer",
            "&.MuiTableRow-root td.MuiTableCell-root": {
              verticalAlign: "middle",
            },
          }}
        >
          {selectedColumns.map((col) => {
            if (col.render) {
              return col.render(rowData);
            }
            if (col.dataKey) {
              const value = findDeepValue<ReactNode>(rowData, col.dataKey);
              return (
                <DataTableCell
                  key={col.id}
                  isFixed={!!col.fixed}
                  direction={col.fixed}
                  className={classes.tableCell}
                >
                  {col.format ? col.format(value) : value}
                </DataTableCell>
              );
            }
            return undefined;
          })}
        </DataTableRow>
      );
    }
    return undefined;
  };

  const renderBody = () => {
    if (isEmpty) {
      return renderEmptyText();
    }
    if (serverSide) {
      return data.map(renderDataRow);
    }
    return data
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map(renderDataRow);
  };

  // table totalCount memorized, and eachRowState initialize with data when total count change (after data added or deleted)
  useEffect(() => {
    // added first row
    if (totalCount === 0 && countProp !== 0) {
      setTotalCount(countProp);
    }

    // added or deleted from not empty data
    if (totalCount !== 0 && countProp !== 0 && totalCount !== countProp) {
      setTotalCount(countProp);
      setEachRowState((prev) => {
        const next = data.reduce<EachRowState<Data>>((rowState, rowData) => {
          const dataId = findDeepValue<string>(rowData, rowKey) as string;
          return {
            ...rowState,
            [dataId]: { checked: false, display: true, data: rowData },
          };
        }, {});
        setLastLoadedRowState(next);
        if (deleteState && setDeleteState) {
          setDeleteState(false);
          return { ...next };
        }
        return { ...next, ...prev };
      });
    }

    // deleted all rows
    if (countProp === 0 && isEmpty) {
      if (deleteState && setDeleteState) {
        setDeleteState(false);
      }
      setTotalCount(0);
      setEachRowState({});
    }

    // set last loaded data row states
    const next = data.reduce<EachRowState<Data>>((rowState, rowData) => {
      const dataId = findDeepValue<string>(rowData, rowKey) as string;
      return {
        ...rowState,
        [dataId]: { checked: false, display: true, data: rowData },
      };
    }, {});
    setLastLoadedRowState(next);
  }, [
    isEmpty,
    data,
    countProp,
    rowKey,
    setEachRowState,
    totalCount,
    onCheckedAllClearClick,
    deleteState,
    setDeleteState,
  ]);

  const dataTableContext = useMemo(
    () => ({
      tableEvent,
      setTableEvent,
      eachRowState,
      setEachRowState,
      defaultEachRowState,
      checkedAllPageRows,
      setCheckedAllPageRows,
      lastLoadedRowState,
      reportChartShow,
      setReportChartShow,
      orgReportList,
      reportListMutate,
      selectedReport,
      setSelectedReport,
      isLoadingChartResult,
      setIsLoadingChartResult,
    }),
    [
      tableEvent,
      eachRowState,
      defaultEachRowState,
      checkedAllPageRows,
      setCheckedAllPageRows,
      lastLoadedRowState,
      reportChartShow,
      orgReportList,
      reportListMutate,
      selectedReport,
      isLoadingChartResult,
      setEachRowState,
    ]
  );

  return (
    <>
      {!isDownSm && (
        <DataTableContext.Provider value={dataTableContext}>
          {!reportChartShow && (
            <div className={className}>
              <TableContainer
                className={classes.container}
                {...TableContainerProps}
              >
                <div
                  className={clsx(
                    classes.loader,
                    serverSide &&
                      (loading || isGettingReportList) &&
                      classes.showLoader,
                    {
                      [classes.lightOpacity]: settings.themeMode === "light",
                      [classes.darkOpacity]: settings.themeMode !== "light",
                    }
                  )}
                >
                  <CircularProgress />
                </div>
                <DataTableToolBar
                  rowsPerPage={rowsPerPage}
                  curPage={page}
                  totalCount={totalCount}
                  orgReportList={orgReportList}
                  enableReportTool={enableReportTool}
                  serviceModuleValue={serviceModuleValue}
                  filterConditionGroups={filterConditionGroups}
                  FilterDropDownProps={FilterDropDownProps}
                  onFilterValuesSubmit={onFilterValuesSubmit}
                  filterSearch={filterSearch}
                  buttonTools={buttonTools}
                  iconTools={iconTools}
                  menuTools={menuTools}
                  searchBar={searchBar}
                  title={title}
                  TitleTypographyProps={TitleTypographyProps}
                />
                <DataTableHeader
                  subTitle={subTitle}
                  SubTitleTypographyProps={SubTitleTypographyProps}
                  payload={payload}
                  serviceModuleValue={serviceModuleValue}
                  filterConditionGroups={filterConditionGroups}
                  defaultFilterValues={defaultFilterValues}
                  filterValues={filterValues}
                  onFilterViewSelect={onFilterViewSelect}
                  onFilterValuesChange={onFilterValuesChange}
                  onFilterValuesSubmit={onFilterValuesSubmit}
                  onFilterValuesClear={onFilterValuesClear}
                  FilterDropDownProps={FilterDropDownProps}
                  enableSelectColumn={enableSelectColumn}
                  columns={columnsProp}
                  selectedColumnKeys={selectedColumnIds}
                  localization={localization}
                  onColumnChange={handleColumnChange}
                  enableFilter={enableFilter}
                />
                <Scrollbar>
                  <Table
                    className={clsx(
                      classes.table,
                      "tour_target-data_table-content"
                    )}
                    {...other}
                    sx={{
                      "&.MuiEgDataTable-table .MuiTableCell-root": {
                        padding: "4px 6px",
                      },
                      borderCollapse: isBorderSeparate
                        ? "separate"
                        : "collapse",
                      borderSpacing: "0 16px",
                    }}
                  >
                    <DataTableHead
                      columns={selectedColumns}
                      renderColumns={renderColumns}
                      onSortLabelClick={handleSort}
                      eachRowState={eachRowState}
                      enableRowCollapse={enableRowCollapse}
                      enableRowCheckbox={enableRowCheckbox}
                      outSideAllCheckbox={outSideAllCheckbox}
                      rowsPerPage={rowsPerPage}
                      curPage={page}
                      totalCount={totalCount}
                      onCheckedAllClick={onCheckedAllClick}
                      onCheckedAllClearClick={onCheckedAllClearClick}
                      selectedToolsbar={selectedToolsbar}
                      isBorderSeparate={isBorderSeparate}
                    />
                    <TableBody>{renderBody()}</TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>
              {isStyledPagination ? (
                <StyledPaginationBar
                  page={page}
                  count={totalCount}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  {...otherTablePaginationProps}
                />
              ) : (
                <PaginationBar
                  page={page}
                  count={totalCount}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  isTablePagination={isTablePagination}
                  {...otherTablePaginationProps}
                />
              )}
            </div>
          )}
          {reportChartShow && (
            <div className={className}>
              <DataTableToolBar
                rowsPerPage={rowsPerPage}
                curPage={page}
                totalCount={totalCount}
                orgReportList={orgReportList}
                enableReportTool={enableReportTool}
                serviceModuleValue={serviceModuleValue}
                filterConditionGroups={filterConditionGroups}
                FilterDropDownProps={FilterDropDownProps}
                onFilterValuesSubmit={onFilterValuesSubmit}
                filterSearch={filterSearch}
                iconTools={iconTools}
                menuTools={menuTools}
                title={title}
                TitleTypographyProps={TitleTypographyProps}
              />
              <Box sx={{ p: { xs: 2, lg: 2 } }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ marginBottom: 1, paddingLeft: 1 }}
                >
                  <Button
                    variant="text"
                    startIcon={<Iconify icon="ic:round-arrow-back-ios" />}
                    onClick={() => {
                      setReportChartShow(false);
                      setSelectedReport(undefined);

                      // filter values back
                      if (onFilterValuesSubmit)
                        onFilterValuesSubmit(defaultFilterValues);

                      // submitted filterSearch payload back
                      if (FilterDropDownProps?.onSubmit)
                        FilterDropDownProps?.onSubmit({
                          ...detailedDefaultFilterValues,
                        });
                    }}
                  >
                    {"回到資訊列表頁"}
                  </Button>
                </Stack>
                <Box
                  sx={{
                    p: { xs: 2, lg: 10 },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <ReportDisplay
                    serviceModuleValue={
                      serviceModuleValue as ServiceModuleValue
                    }
                    filterConditionGroups={filterConditionGroups}
                    FilterDropDownProps={FilterDropDownProps}
                    onFilterValuesSubmit={onFilterValuesSubmit}
                    reportChartShow={reportChartShow}
                    setReportChartShow={setReportChartShow}
                  />
                </Box>
              </Box>
            </div>
          )}
        </DataTableContext.Provider>
      )}
      {isDownSm && (
        <DataTableContext.Provider value={dataTableContext}>
          {!reportChartShow && (
            <div className={className}>
              <DataTableExtendToolsbar
                disabled={Boolean(disableExtendToolbar)}
                onCheckedAllClick={onCheckedAllClick}
                onCheckedAllClearClick={onCheckedAllClearClick}
                totalCount={totalCount}
              />
              <TableContainer
                className={classes.container}
                {...TableContainerProps}
              >
                <div
                  className={clsx(
                    classes.loader,
                    serverSide &&
                      (loading || isGettingReportList) &&
                      classes.showLoader,
                    {
                      [classes.lightOpacity]: settings.themeMode === "light",
                      [classes.darkOpacity]: settings.themeMode !== "light",
                    }
                  )}
                >
                  <CircularProgress />
                </div>
                <DataTableToolBar
                  rowsPerPage={rowsPerPage}
                  orgReportList={orgReportList}
                  enableReportTool={enableReportTool}
                  serviceModuleValue={serviceModuleValue}
                  filterConditionGroups={filterConditionGroups}
                  FilterDropDownProps={FilterDropDownProps}
                  onFilterValuesSubmit={onFilterValuesSubmit}
                  filterSearch={filterSearch}
                  buttonTools={buttonTools}
                  iconTools={iconTools}
                  menuTools={menuTools}
                  selectedToolsbar={selectedToolsbar}
                  curPage={page}
                  totalCount={totalCount}
                  title={title}
                  TitleTypographyProps={TitleTypographyProps}
                />
                <MobileTableHeader
                  subTitle={subTitle}
                  SubTitleTypographyProps={SubTitleTypographyProps}
                  searchBar={searchBar}
                  SearchBarProps={SearchBarProps}
                  payload={payload}
                  serviceModuleValue={serviceModuleValue}
                  filterConditionGroups={filterConditionGroups}
                  defaultFilterValues={defaultFilterValues}
                  filterValues={filterValues}
                  onFilterViewSelect={onFilterViewSelect}
                  onFilterValuesChange={onFilterValuesChange}
                  onFilterValuesSubmit={onFilterValuesSubmit}
                  onFilterValuesClear={onFilterValuesClear}
                  FilterDropDownProps={FilterDropDownProps}
                  enableSelectColumn={enableSelectColumn}
                  columns={columnsProp}
                  selectedColumnKeys={selectedColumnIds}
                  localization={localization}
                  onColumnChange={handleColumnChange}
                />
                <Scrollbar>
                  <Table className={classes.mobileTable} {...other}>
                    {isEmpty ? (
                      renderEmptyText()
                    ) : (
                      <MobileBody
                        columns={selectedColumns}
                        renderColumns={renderColumns}
                        onSortLabelClick={handleSort}
                        eachRowState={eachRowState}
                        enableRowCollapse={enableRowCollapse}
                        enableRowCheckbox={enableRowCheckbox}
                        outSideAllCheckbox={outSideAllCheckbox}
                        rowsPerPage={rowsPerPage}
                        curPage={page}
                        totalCount={totalCount}
                        data={data}
                        rowKey={rowKey}
                        renderDataRowDetail={renderDataRowDetail}
                        enableSelectColumn={enableSelectColumn}
                        selectedColumnIds={selectedColumnIds}
                        renderDataRow={renderDataRowProp}
                      />
                    )}
                  </Table>
                </Scrollbar>
              </TableContainer>
              {renderPaginationBar ? (
                <>
                  {renderPaginationBar(
                    page,
                    rowsPerPage,
                    totalCount,
                    handleChangePage,
                    handleRowsPerPageChange
                  )}
                </>
              ) : (
                <PaginationBar
                  page={page}
                  count={totalCount}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  isTablePagination={isTablePagination}
                  {...otherTablePaginationProps}
                />
              )}
            </div>
          )}
          {reportChartShow && (
            <div className={className}>
              <DataTableToolBar
                rowsPerPage={rowsPerPage}
                curPage={page}
                totalCount={totalCount}
                orgReportList={orgReportList}
                enableReportTool={enableReportTool}
                serviceModuleValue={serviceModuleValue}
                filterConditionGroups={filterConditionGroups}
                FilterDropDownProps={FilterDropDownProps}
                onFilterValuesSubmit={onFilterValuesSubmit}
                filterSearch={filterSearch}
                iconTools={iconTools}
                menuTools={menuTools}
                title={title}
                TitleTypographyProps={TitleTypographyProps}
              />
              <Box sx={{ p: { xs: 2, lg: 2 } }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ marginBottom: 1, paddingLeft: 1 }}
                >
                  <Button
                    variant="text"
                    startIcon={<Iconify icon="ic:round-arrow-back-ios" />}
                    onClick={() => {
                      setReportChartShow(false);
                      setSelectedReport(undefined);

                      // filter values back
                      if (onFilterValuesSubmit)
                        onFilterValuesSubmit(defaultFilterValues);

                      // submitted filterSearch payload back
                      if (FilterDropDownProps?.onSubmit)
                        FilterDropDownProps?.onSubmit({
                          ...detailedDefaultFilterValues,
                        });
                    }}
                  >
                    {"回到資訊列表頁"}
                  </Button>
                </Stack>
                <Box
                  sx={{
                    p: { xs: 2, lg: 10 },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <ReportDisplay
                    serviceModuleValue={
                      serviceModuleValue as ServiceModuleValue
                    }
                    filterConditionGroups={filterConditionGroups}
                    FilterDropDownProps={FilterDropDownProps}
                    onFilterValuesSubmit={onFilterValuesSubmit}
                    reportChartShow={reportChartShow}
                    setReportChartShow={setReportChartShow}
                  />
                </Box>
              </Box>
            </div>
          )}
        </DataTableContext.Provider>
      )}
    </>
  );
};

export default DataTable;
