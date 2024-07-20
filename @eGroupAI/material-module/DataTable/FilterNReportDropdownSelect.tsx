import React, { useContext, useEffect, useRef, useState } from "react";
import { OrganizationReport } from "interfaces/entities";
import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  alpha,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import Iconify from "minimal/components/iconify";
import { useTheme, makeStyles } from "@mui/styles";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { ServiceModuleValue } from "interfaces/utils";

import DataTableContext from "./DataTableContext";

export interface FilterNReportDropdownSelectProps {
  orgReportList?: OrganizationReport[];
  serviceModuleValue: ServiceModuleValue;
}

const useStyles = makeStyles((theme) => ({
  list: {
    maxHeight: 350,
    overflowY: "auto",
    position: "relative", // Changed from 'absolute' to 'relative'
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
  dropdown: {
    position: "relative",
    width: "100%",
  },
  collapse: {
    position: "absolute",
    top: "100%", // Adjusted to align directly below the input field
    left: 0,
    width: "100%",
    zIndex: 10,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[3],
    maxHeight: 350,
    overflowY: "auto",
  },
}));

const FilterNReportDropdownSelect: React.FC<
  FilterNReportDropdownSelectProps
> = (props) => {
  const { orgReportList } = props;
  const theme = useTheme();
  const classes = useStyles();

  const organizationId = useSelector(getSelectedOrgId);
  const wordLibary = useSelector(getWordLibrary);

  const [searchText, setSearchText] = useState("");
  const [openReportlist, setOpenReportlist] = useState(false);
  const [filteredReports, setFilteredReports] = useState<OrganizationReport[]>(
    orgReportList || []
  );

  const [openReport, setOpenReport] = useState(true);
  const handleClickReport = () => {
    setOpenReport(!openReport);
  };

  const {
    setReportChartShow,
    selectedReport,
    setSelectedReport,
    setIsLoadingChartResult,
  } = useContext(DataTableContext);

  const { excute: getOrgReportDetail, isLoading: isGettingReportResult } =
    useAxiosApiWrapper(apis.org.getOrgReportDetail, "None");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (setIsLoadingChartResult) setIsLoadingChartResult(isGettingReportResult);
    return () => {
      if (setIsLoadingChartResult) setIsLoadingChartResult(false);
    };
  }, [isGettingReportResult, setIsLoadingChartResult]);

  useEffect(() => {
    setSearchText(
      selectedReport?.organizationReportId
        ? selectedReport?.organizationReportName
        : ""
    );
  }, [selectedReport]);

  useEffect(() => {
    if (searchText === "") {
      setFilteredReports(orgReportList || []);
    } else {
      setFilteredReports(
        orgReportList?.filter((report) =>
          report.organizationReportName
            .toLowerCase()
            .includes(searchText.toLowerCase())
        ) || []
      );
    }
  }, [searchText, orgReportList]);

  const handleReportSelect = async (report: OrganizationReport) => {
    setOpenReportlist(false);
    const res = await getOrgReportDetail({
      organizationId,
      organizationReportId: report.organizationReportId,
    });

    if (res.data) {
      if (setSelectedReport) setSelectedReport(res.data);
      if (setReportChartShow) setReportChartShow(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenReportlist(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className={classes.dropdown} ref={dropdownRef}>
      <TextField
        id="report-input"
        data-tid="report-input"
        size="small"
        onFocus={() => setOpenReportlist(true)}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder={wordLibary?.["filter and report"] ?? "報表"}
        InputProps={{
          startAdornment: selectedReport?.organizationReportId && (
            <Iconify icon="ri:bar-chart-fill" width={15} sx={{ mr: 1 }} />
          ),
          // eslint-disable-next-line no-nested-ternary
          endAdornment: isGettingReportResult ? (
            <Iconify
              icon="line-md:loading-twotone-loop"
              width={32}
              color={theme.palette.primary.main}
            />
          ) : selectedReport?.organizationReportId ? (
            <Iconify
              icon="ic:round-cancel"
              width={24}
              sx={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                if (setSelectedReport) setSelectedReport(undefined);
                if (setReportChartShow) setReportChartShow(false);
              }}
            />
          ) : (
            <Iconify icon="iconoir:nav-arrow-down" />
          ),
        }}
      />
      {openReportlist && (
        <List
          sx={{ width: "100%", bgcolor: "background.paper" }}
          component="nav"
          className={classes.collapse}
        >
          <ListItemButton
            id="report-list-show-btn"
            data-tid="report-list-show-btn"
            onClick={handleClickReport}
            sx={{
              bgcolor: `${
                openReport ? `${theme.palette.action.selected}` : "transparent"
              }`,
            }}
          >
            <ListItemIcon>
              <Iconify icon="ri:bar-chart-fill" />
            </ListItemIcon>
            <ListItemText primary="Reports" />
            {openReport ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse
            in={openReport}
            timeout="auto"
            unmountOnExit
            className={classes.list}
          >
            {filteredReports?.map((report, index) => {
              const isSelected =
                report.organizationReportId ===
                selectedReport?.organizationReportId;
              return (
                <List
                  component="div"
                  disablePadding
                  key={report.organizationReportId}
                >
                  <ListItemButton
                    id={`report-list-item-${report.organizationReportId}`}
                    data-tid={`report-list-item-${index}`}
                    sx={{
                      pl: "26px",
                      bgcolor: `${
                        isSelected
                          ? `${alpha(theme.palette.action.selected, 0.5)}`
                          : "transparent"
                      }`,
                    }}
                    onClick={() => handleReportSelect(report)}
                  >
                    <ListItemIcon
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        transform: "translate(-50%, 0%)",
                      }}
                    >
                      {isSelected && (
                        <Iconify
                          icon="icon-park-outline:dot"
                          color={theme.palette.primary.main}
                        />
                      )}
                      {!isSelected && <Iconify icon="radix-icons:dot-filled" />}
                    </ListItemIcon>
                    <ListItemText primary={report.organizationReportName} />
                  </ListItemButton>
                </List>
              );
            })}
          </Collapse>
        </List>
      )}
    </div>
  );
};

export default FilterNReportDropdownSelect;
