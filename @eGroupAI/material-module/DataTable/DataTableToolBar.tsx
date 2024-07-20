import React, { FC, ReactNode, useContext, useMemo } from "react";

import {
  Box,
  Grid,
  Tooltip,
  Typography,
  TypographyProps,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/styles";
import makeStyles from "@mui/styles/makeStyles";
import IconButton from "@mui/material/IconButton";
import Iconify from "minimal/components/iconify/iconify";
import CustomPopover, { usePopover } from "minimal/components/custom-popover";

import { FilterDropDownProps } from "@eGroupAI/material-lab/FilterDropDown";
import { ServiceModuleValue } from "interfaces/utils";
import { FilterSearch } from "@eGroupAI/typings/apis";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import ReportDialog, {
  DIALOG as REPORT_DIALOG,
  ReportDialogProps,
  ReportDialogStates,
} from "components/OrgChartReportDialog";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { OrganizationReport } from "interfaces/entities";

import clsx from "clsx";

import {
  EachRowState,
  FilterValues,
  TableFilterConditionGroup,
} from "./typing";
import DataTableOutSideAllCheckbox from "./StyledDataTableOutSideAllCheckbox";
import DataTableContext from "./DataTableContext";
import FilterNReportDropdownSelect from "./FilterNReportDropdownSelect";

const useStyles = makeStyles(
  (theme) => ({
    toolbar: {},
    checkBox: {
      display: "inline-block",
      "& div": {
        display: "inline-block",
      },
    },
    selectedToolsBar: {
      display: "inline-block",
      "& div": {
        display: "inline-block",
      },
    },
    tableTitle: {
      display: "inline-block",
      "& div": {
        display: "inline-block",
      },
    },
    menuTools: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      lineHeight: "40px",
      marginRight: 0,
      gap: theme.spacing(1),
      padding: "12px 10px 10px",
    },
    searchBarTool: {
      display: "flex",
      alignItems: "center",

      "& .MuiInputBase-input": {
        minWidth: 150,
      },

      "& .MuiEgDataTable-searchBarTool": {
        overFlow: "hidden",
      },
    },
  }),
  {
    name: "MuiEgDataTable",
  }
);

interface DataTableToolBarProps {
  rowsPerPage: number;
  outSideAllCheckbox?: boolean | undefined;
  /**
   * extra props for AllCheckbox proper work when rendered table row count < rowsPerPage
   * ex: at last page if there amounts of data is smaller than rowsPerPage 10, 25, 50, 100
   */
  curPage?: number;
  totalCount?: number;
  buttonTools?: ReactNode;
  eachRowState?: EachRowState<any>;
  selectedToolsbar?: ReactNode;
  iconTools?: ReactNode;
  menuTools?: ReactNode;
  searchBar?: ReactNode;
  title?: string;
  TitleTypographyProps?: TypographyProps;
  orgReportList?: OrganizationReport[];
  enableReportTool?: boolean;
  serviceModuleValue?: ServiceModuleValue;
  filterConditionGroups?: TableFilterConditionGroup[];
  filterSearch?: FilterSearch;
  FilterDropDownProps?: Omit<FilterDropDownProps, "options" | "value">;
  onFilterValuesSubmit?: (values: FilterValues) => void;
}

const DataTableToolBar: FC<DataTableToolBarProps> = (props) => {
  const classes = useStyles(props);
  const {
    rowsPerPage,
    outSideAllCheckbox = false,
    curPage = 0,
    totalCount = 0,
    buttonTools,
    searchBar,
    selectedToolsbar,
    iconTools,
    menuTools,
    title,
    TitleTypographyProps,
    orgReportList,
    enableReportTool,
    serviceModuleValue,
    filterConditionGroups,
    filterSearch,
    FilterDropDownProps,
    onFilterValuesSubmit,
  } = props;

  const popover = usePopover();
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));
  const wordLibrary = useSelector(getWordLibrary);

  const { eachRowState } = useContext(DataTableContext);

  const [checkedNums] = useMemo(() => {
    const states = Object.values(eachRowState as EachRowState<any>);
    const checkedNums = states.filter((el) => el?.checked).length;
    return [checkedNums, states.length - checkedNums];
  }, [eachRowState]);

  let rowsOnPage = rowsPerPage;
  const pageCount = Math.floor(totalCount / rowsPerPage) + 1;
  if (curPage + 1 === pageCount) {
    if ((curPage + 1) * rowsPerPage > totalCount)
      rowsOnPage = totalCount - curPage * rowsPerPage;
  }

  const { openDialog: openReportDialog, setDialogStates } =
    useReduxDialog<ReportDialogStates>(
      `${REPORT_DIALOG}-${serviceModuleValue}`
    );

  return (
    <div className={classes.toolbar}>
      <div
        className={clsx(classes.menuTools, "tour_target-data_table-toolsBar")}
      >
        <Box className="tour_target-data_table-leftTools">
          {!isDownSm && !iconTools && title && (
            <Grid item>
              <Typography variant="h4" {...TitleTypographyProps}>
                {title}
              </Typography>
            </Grid>
          )}
          {iconTools}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: theme.spacing(1),
          }}
          className="tour_target-data_table-rightTools"
        >
          {searchBar && !isDownSm && (
            <div
              className={clsx(
                classes.searchBarTool,
                "tour_target-data_table-tools-searchbar"
              )}
            >
              {searchBar}
            </div>
          )}
          {enableReportTool && (
            <div
              className={clsx(
                classes.searchBarTool,
                "tour_target-data_table-tools-searchbar"
              )}
            >
              <FilterNReportDropdownSelect
                orgReportList={orgReportList}
                serviceModuleValue={serviceModuleValue as ServiceModuleValue}
              />
            </div>
          )}
          {menuTools && (
            <IconButton onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
          {enableReportTool && (
            <Tooltip title={wordLibrary?.["graph analysis"] ?? "報表"}>
              <IconButton
                onClick={() => {
                  setDialogStates({ isEditing: false });
                  openReportDialog();
                }}
                id="report-new-btn"
                data-tid="report-new-btn"
              >
                <Iconify icon="solar:chart-bold" />
              </IconButton>
            </Tooltip>
          )}
          {buttonTools}
        </Box>
      </div>
      {totalCount > 0 && outSideAllCheckbox && (
        <div className={classes.checkBox}>
          <DataTableOutSideAllCheckbox
            rowsPerPage={totalCount === 0 ? rowsPerPage : rowsOnPage}
          />
        </div>
      )}
      {totalCount > 0 && checkedNums > 0 && selectedToolsbar && (
        <div className={classes.selectedToolsBar}>{selectedToolsbar}</div>
      )}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {menuTools}
      </CustomPopover>
      <ReportDialog
        serviceModuleValue={
          serviceModuleValue as ReportDialogProps["serviceModuleValue"]
        }
        filterConditionGroups={filterConditionGroups}
        filterSearch={filterSearch}
        FilterDropDownProps={FilterDropDownProps}
        onFilterValuesSubmit={onFilterValuesSubmit}
      />
    </div>
  );
};

export default DataTableToolBar;
