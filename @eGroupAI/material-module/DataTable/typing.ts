import {
  MouseEvent,
  ChangeEvent,
  ReactNode,
  HTMLAttributes,
  SetStateAction,
} from "react";
import { TablePaginationProps, TableProps, TableRowProps } from "@mui/material";
import { TypographyProps } from "@eGroupAI/material/Typography";
import {
  Value as FilterValue,
  FilterDropDownProps,
} from "@eGroupAI/material-lab/FilterDropDown";
import {
  FilterCondition,
  FilterConditionGroup,
  FilterSearch,
} from "@eGroupAI/typings/apis";
import { ServiceModuleValue } from "interfaces/utils";
import { KeyedMutator } from "swr";
import { AxiosResponse } from "axios";
import {
  OrganizationReport,
  type OrganizationReportDetail,
} from "interfaces/entities";

import { DataTableCellProps } from "./DataTableCell";
import { SearchBarProps } from "../SearchBar";
import { Direction } from "./DataTableSortLabel";

export type LocalizationArgs = {
  emptyMessage: string;
  columnSelectBtn: string;
};

export type RowState<Data> = {
  checked: boolean;
  display: boolean;
  data?: Data;
};

export type RoleType = {
  name: string;
  value: string;
};

export interface TextListData {
  id: number;
  name: string;
  roles: RoleType[];
  permissions: RoleType[];
}

export type EachRowState<Data> = {
  [dataId in string]?: RowState<Data>;
};

export enum TableFilterEvents {
  FILTER_OPTION_CLEAR = "FILTER_OPTION_CLEAR",
  FILTER_VIEW_SELECT = "FILTER_VIEW_SELECT",
}

export enum TableEvent {
  CHANGE_PAGE = "CHANGE_PAGE",
  CHANGE_ROWS_PER_PAGE = "CHANGE_ROWS_PER_PAGE",
  CHNAGE_ALL_CHECKED_ROWS = "CHNAGE_ALL_CHECKED_ROWS",
  CHNAGE_CHECKED_ROW = "CHNAGE_CHECKED_ROW",
  CLEAR_ALL_CHECKED_ROWS = "CLEAR_ALL_CHECKED_ROWS",
  CHECKED_ALL_PAGE_ROWS = "CHECKED_ALL_PAGE_ROWS",
}

export interface DataTableContextProps {
  /**
   * Current table event.
   */
  tableEvent?: TableEvent;
  /**
   * Set table event.
   */
  setTableEvent?: (tableEvent: SetStateAction<TableEvent | undefined>) => void;
  /**
   * default row state.
   */
  defaultEachRowState?: EachRowState<any>;
  /**
   * Each row state.
   */
  eachRowState: EachRowState<any>;
  /**
   * Set each row state.
   */
  setEachRowState?: (rowState: SetStateAction<EachRowState<any>>) => void;
  /**
   * CheckedAllPageRows state.
   */
  checkedAllPageRows: boolean;
  /**
   * Set checkedAllPageRows state.
   */
  setCheckedAllPageRows?: (rowState: SetStateAction<boolean>) => void;
  /**
   * Last Loaded table page data each row states
   */
  lastLoadedRowState?: EachRowState<any>;
  /**
   *  show status of the report chart on the table instead
   */
  reportChartShow?: boolean;
  /**
   * set chart show of the report result
   */
  setReportChartShow?: React.Dispatch<React.SetStateAction<boolean>>;
  /**
   * report list saved already
   */
  reportList?: OrganizationReport[];
  /**
   * mutate function of report list
   */
  reportListMutate?: KeyedMutator<AxiosResponse<OrganizationReport[], any>>;
  /**
   * currently user selected report
   */
  selectedReport?:
    | OrganizationReportDetail
    | ({ organizationReportId: undefined } & Pick<
        OrganizationReportDetail,
        "reportChartType" | "reportResult"
      >);
  /**
   * set currently user selected report
   */
  setSelectedReport?: React.Dispatch<
    React.SetStateAction<
      | OrganizationReportDetail
      | ({ organizationReportId: undefined } & Pick<
          OrganizationReportDetail,
          "reportChartType" | "reportResult"
        >)
      | undefined
    >
  >;
  /**
   * chart report loading status
   */
  isLoadingChartResult?: boolean;
  /**
   * set chart report loading status
   */
  setIsLoadingChartResult?: React.Dispatch<React.SetStateAction<boolean>>;
}

type Values = {
  page: number;
  rowsPerPage: number;
};

export interface MuiTablePaginationProps
  extends Omit<
    TablePaginationProps,
    "ref" | "page" | "rowsPerPage" | "onPageChange" | "onRowsPerPageChange"
  > {
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (
    event: MouseEvent<HTMLButtonElement> | null,
    values: Values
  ) => void;
  onRowsPerPageChange?: (
    event: ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>,
    values: Values
  ) => void;
}

export type FilterValues = {
  [key: number]: FilterValue;
};

export interface Column<Data>
  extends Omit<DataTableCellProps, "id" | "isFixed" | "direction"> {
  /**
   * Id for map function key and determine which column should display when enable select columns.
   */
  id: string;
  /**
   * Column display name.
   */
  name: string;
  /**
   * Auto Mapping Data object key, For Example if data shap is { foo: "bar" }
   * You can set dataKey="foo" and it'll auto mapping the value in row.
   */
  dataKey?: string;
  /**
   * To determine which column has been sort currently.
   */
  sortKey?: string;
  /**
   * Fixed cell in right or left.
   */
  fixed?: "right" | "left";
  /**
   * Render function for row cell and it pass the cell data.
   */
  render?: (data: Data) => ReactNode;
  /**
   * Format function to format cell value.
   */
  format?: (value?: ReactNode) => ReactNode;
}

export type ColumnArgs = {
  activeIndex?: number;
  eachRowState?: DataTableContextProps["eachRowState"];
};

export interface DefaultData {
  TableRowProps?: TableRowProps;
}

export interface TableFilterCondition extends FilterCondition {
  filterId: string;
}

export interface DialogFilterCondition extends FilterCondition {
  filterId: string;
  filterGroupName?: string;
}

export interface TableFilterConditionGroup extends FilterConditionGroup {
  filterConditionList: TableFilterCondition[];
}

export interface DataTableExtendToolsbarProps {
  /**
   * disable status for DataTable ExtendToolbar usage
   * @default false
   */
  disabled: boolean;
  /**
   * Count for total rows when checkedAll buttton clicked.
   */
  totalCount: number;
  /**
   * Callback Event fired when checkedAll button click.
   */
  onCheckedAllClick?: () => void;
  /**
   * Callback Event fired when checkedAllClear button click.
   */
  onCheckedAllClearClick?: () => void;
}

export interface DataTableProps<Data> extends Omit<TableProps, "classes"> {
  /**
   * Table data.
   */
  data?: Data[];
  /**
   * The name of table row key.
   */
  rowKey?: string;
  /**
   * Default Data.
   */
  defaultData?: Data[];
  /**
   * Use data prop to render rows you want.
   */
  renderDataRow?: (rowData: Data, index: number) => ReactNode;
  /**
   * Use data prop to render row detail(Only work when enableRowCollapse).
   */
  renderDataRowDetail?: (rowData: Data, index: number) => ReactNode;
  /**
   * Mui TablePagination props.
   */
  MuiTablePaginationProps: MuiTablePaginationProps;
  /**
   * Columns is used to pass in renderColumns.
   */
  columns?: Column<Data>[];
  /**
   * Use columns prop to render columns you want.
   */
  renderColumns?: (
    columns: Column<Data>[],
    columnArgs: ColumnArgs
  ) => ReactNode;
  /**
   * Event when sort label click
   */
  onSortLabelClick?: (sortKey: string, direction: Direction) => void;
  /**
   * Provide a function to customized empty state.
   */
  renderEmpty?: () => ReactNode;
  /**
   * Set to choosed page and it's only work when `page` is not be controlled.
   */
  to?: number;
  /**
   * Set default page and it's only work when `page` is not be controlled and `to` is not be provided.
   */
  defaultPage?: number;
  /**
   * Set default rows per page and it's only work when `rowsPerPage` is not be controlled.
   */
  defaultRowsPerPage?: number;
  /**
   * Set default column ids to display columns when enable select columns.
   */
  defaultColumnIds?: string[];
  /**
   * Set how many columns to show, the default value is 6.
   */
  columnsShow?: number;
  /**
   * If `data` is get from server set this to true.
   */
  serverSide?: boolean;
  /**
   * Toggle `Loader` and this only work with `serverSide`.
   */
  loading?: boolean;
  /**
   * If `true` show empty state.
   */
  isEmpty?: boolean;
  /**
   * If `true` disable DataTableCell border.
   */
  disableBorder?: boolean;
  /**
   * If `true` disable TableContainer.
   */
  disableTableContainer?: boolean;
  /**
   * Use your own text to localize DataTable.
   */
  localization?: LocalizationArgs;
  /**
   * Set minWidth when table need horizontal scroll.
   */
  minWidth?: number | false | string;
  /**
   * Set maxHeight when table need fixed header.
   */
  maxHeight?: number;
  /**
   * enable controlled Each Row State
   */
  isControlledEachRowState?: boolean;
  /**
   * Control Each row state.
   */
  eachRowState?: EachRowState<Data>;
  /**
   * default eachRowState.
   */
  defaultEachRowState?: EachRowState<Data>;
  /**
   * default checked Row Ids
   */
  defaultCheckedRowIds?: string[];
  /**
   * Control checkedAllPageRows state.
   */
  checkedAllPageRows?: boolean;
  /**
   * default checkedAllPageRows.
   */
  defaultCheckedAllPageRows?: boolean;
  /**
   * Table header title.
   */
  title?: string;
  /**
   * Title TypographyProps
   */
  TitleTypographyProps?: TypographyProps;
  /**
   * Table header subTitle.
   */
  subTitle?: string;
  /**
   * SubTitle TypographyProps
   */
  SubTitleTypographyProps?: TypographyProps;
  /**
   * Customer selectedToolsbar actions which is placed on the selected table head.
   */
  selectedToolsbar?: ReactNode;
  /**
   * Customer search actions.
   */
  searchBar?: ReactNode;
  /**
   * SearchBar props.
   */
  SearchBarProps?: Omit<SearchBarProps, "container">;
  /**
   * current DataTable Payload with filter and search values
   */
  payload?: any;
  /**
   * serviceModuleValue
   */
  serviceModuleValue?: ServiceModuleValue;
  /**
   * Filter conditions for display FilterDropDown.
   */
  filterConditionGroups?: TableFilterConditionGroup[];
  /**
   * Default Filter values
   */
  defaultFilterValues?: FilterValues;
  /**
   * Controlled Filter values
   */
  filterValues?: FilterValues;
  /**
   * Event fired when Filter View Select.
   */
  onFilterViewSelect?: (values: FilterValues) => void;
  /**
   * Event fired when filter values change.
   */
  onFilterValuesChange?: (values: FilterValues, index?: number) => void;
  /**
   * Event fired when filter values submit.
   */
  onFilterValuesSubmit?: (values: FilterValues, index?: number) => void;
  /**
   * Event fired when filter values clear.
   */
  onFilterValuesClear?: (values: FilterValues, index: number | string) => void;
  /**
   * FilterDropDown props.
   */
  FilterDropDownProps?: Omit<FilterDropDownProps, "options" | "value">;
  /**
   * Enable filter column.
   */
  enableSelectColumn?: boolean;
  /**
   * Set true to enable table row with collapse.
   */
  enableRowCollapse?: boolean;
  /**
   * Set true to enable table row with checkbox.
   */
  enableRowCheckbox?: boolean;
  /*
   * Set true to enable all checkbox to outside of table.
   */
  outSideAllCheckbox?: boolean;
  /**
   * set ture to enable show Plus button
   */
  enablePlusButton?: boolean;
  /**
   * set ture to enable show Upload button
   */
  enableUploadButton?: boolean;
  /**
   * set ture to enable show Edit button
   */
  enableEditButton?: boolean;
  /**
   * set ture to enable show Delete button
   */
  enableDeleteButton?: boolean;
  /*
   * Set true to enable DownloadButton.
   */
  enableDownloadButton?: boolean;
  /**
   * set ture to enable show Calendar button
   */
  enableCalendarButton?: boolean;
  /**
   * set ture to enable show Tag button
   */
  enableTagButton?: boolean;
  /**
   * set ture to enable show Send Mobile SMS button
   */
  enableSMSButton?: boolean;
  /**
   *  pagination bar renderer
   */
  renderPaginationBar?: (
    page: number,
    rowsPerPage: number,
    count: number,
    handleChangePage: (
      event: MouseEvent<HTMLButtonElement> | null,
      page: number
    ) => void,
    handleRowsPerPageChange: (
      event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => void,
    isDensible?: boolean,
    dense?: boolean,
    setDense?: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
  /**
   * Event when rowState change
   */
  onEachRowStateChange?: (
    eachRowState: SetStateAction<EachRowState<Data>>,
    tableEvent?: TableEvent
  ) => void;
  /**
   * Event when selected column change
   */
  onColumnsChange?: (selectedColumns: string[]) => void;
  onCheckedAllClick?: DataTableExtendToolsbarProps["onCheckedAllClick"];
  onCheckedAllClearClick?: DataTableExtendToolsbarProps["onCheckedAllClearClick"];
  /**
   * disable status for ExtendToolbar usage
   * @default false
   */
  disableExtendToolbar: boolean;
  /**
   * enable dynamic filter view
   */
  enableFilter?: boolean;
  /**
   * add New button which is placed on table tool bar
   */
  buttonTools?: ReactNode;
  /**
   * icon tool buttons which placed on table tool bar
   */
  iconTools?: ReactNode;
  /**
   * tool buttons in menu which is placed on table tool bar
   */
  menuTools?: ReactNode;
  /**
   * if true the styled table pagination, if not default table pagination.
   */
  isStyledPagination?: boolean;
  /**
   * Table Pagination usage boolean
   * @default is true
   */
  isTablePagination?: boolean;
  /**
   * table border separate
   */
  isBorderSeparate?: boolean;
  /**
   * table config settings
   */
  configs?: any;
  /**
   * set table data report feature
   */
  enableReportTool?: boolean;
  /**
   * filter object that user searched
   */
  filterSearch?: FilterSearch;
}

export type DataTableHeadProps<Data> = Pick<
  DataTableProps<Data>,
  | "columns"
  | "eachRowState"
  | "renderColumns"
  | "onSortLabelClick"
  | "enableRowCollapse"
  | "enableRowCheckbox"
  | "outSideAllCheckbox"
  | "onCheckedAllClick"
  | "onCheckedAllClearClick"
  | "selectedToolsbar"
  | "isBorderSeparate"
> & {
  rowsPerPage: number;
  curPage: number;
  totalCount: number;
};

export type MobileBodyProps<Data> = Pick<
  DataTableProps<Data>,
  | "columns"
  | "eachRowState"
  | "renderColumns"
  | "onSortLabelClick"
  | "enableRowCollapse"
  | "enableRowCheckbox"
  | "outSideAllCheckbox"
  | "data"
  | "rowKey"
  | "renderDataRow"
  | "renderDataRowDetail"
  | "enableSelectColumn"
> & {
  rowsPerPage: number;
  curPage: number;
  totalCount: number;
  selectedColumnIds: string[] | undefined;
};

export interface DataTableHeaderProps<Data>
  extends Pick<
      DataTableProps<Data>,
      | "columns"
      | "subTitle"
      | "selectedToolsbar"
      | "searchBar"
      | "filterConditionGroups"
      | "TitleTypographyProps"
      | "SubTitleTypographyProps"
      | "payload"
      | "serviceModuleValue"
      | "FilterDropDownProps"
      | "defaultFilterValues"
      | "filterValues"
      | "onFilterViewSelect"
      | "onFilterValuesChange"
      | "onFilterValuesSubmit"
      | "onFilterValuesClear"
      | "SearchBarProps"
      | "enableSelectColumn"
      | "localization"
      | "enableFilter"
    >,
    HTMLAttributes<HTMLDivElement> {
  /**
   * Event when Column Change
   */
  onColumnChange?: (column: Column<Data>, checked: boolean) => void;
  /**
   * Filter column keys.
   */
  selectedColumnKeys?: string[];
}
