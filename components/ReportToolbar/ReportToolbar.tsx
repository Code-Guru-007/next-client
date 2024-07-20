import { DataTableContext } from "@eGroupAI/material-module/DataTable";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import {
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { DIALOG as CONFIRM_DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import { DIALOG as REPORT_DIALOG } from "components/OrgChartReportDialog";
import CustomPopover, { usePopover } from "minimal/components/custom-popover";
import Iconify from "minimal/components/iconify";
import { useCallback, useContext } from "react";
import { useSelector } from "react-redux";

import useWordLibrary from "@eGroupAI/hooks/useWordLibrary";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { useReportDisplayContext } from "components/ReportDisplay/ReportDisplayContext";
import { CHART_IDS, EXTENDED_CHART_TOOLS } from "./types";

export const ReportToolbar = () => {
  const {
    selectedReport,
    setSelectedReport,
    reportListMutate,
    setReportChartShow,
  } = useContext(DataTableContext);
  const { serviceModuleValue, reportMode, setReportMode } =
    useReportDisplayContext();

  const { wordLibrary } = useWordLibrary();
  const organizationId = useSelector(getSelectedOrgId);

  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(CONFIRM_DELETE_DIALOG);
  const { openDialog: openReportDialog, setDialogStates } = useReduxDialog(
    `${REPORT_DIALOG}-${serviceModuleValue}`
  );

  const popover = usePopover();

  const { excute: deleteOrgReport, isLoading: isDeletingOrgReport } =
    useAxiosApiWrapper(apis.org.deleteOrgReport, "Delete");

  const handleMenuTools = useCallback(
    (chartId: CHART_IDS | undefined, toolType: EXTENDED_CHART_TOOLS) => {
      const chartInstance = window.Apex._chartInstances.find((chart) =>
        chart.id
          .toLowerCase()
          .split("_CHART")[0]
          .includes(chartId?.toLocaleLowerCase())
      );
      switch (toolType) {
        case EXTENDED_CHART_TOOLS.EXPORT_CSV: {
          chartInstance?.chart?.exports?.exportToCSV({
            series: chartInstance?.chart?.series.w.series,
          });
          break;
        }
        case EXTENDED_CHART_TOOLS.EXPORT_PNG: {
          chartInstance?.chart?.exports?.exportToPng();
          break;
        }
        default:
          break;
      }
    },
    []
  );

  return (
    <>
      <Stack
        direction="row"
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" fontWeight={900}>
          {selectedReport?.organizationReportId
            ? selectedReport.organizationReportName
            : ""}
        </Typography>
        <div>
          <IconButton
            id="report-mode-change-btn"
            data-tid="report-mode-change-btn"
            onClick={() =>
              setReportMode?.(reportMode === "chart" ? "table" : "chart")
            }
          >
            {reportMode === "chart" ? (
              <Iconify icon="material-symbols:table-chart" />
            ) : (
              <Iconify icon="material-symbols:pie-chart" />
            )}
          </IconButton>
          <IconButton
            id="report-tools-btn"
            data-tid="report-tools-btn"
            onClick={popover.onOpen}
          >
            <Iconify icon="ic:round-more-vert" />
          </IconButton>
        </div>
      </Stack>
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        sx={{ maxWidth: 200 }}
        arrow="right-top"
      >
        {selectedReport?.organizationReportId && (
          <List
            sx={{ width: "100%", bgcolor: "background.paper" }}
            component="nav"
          >
            <ListItemButton
              id="report-tool-edit-btn"
              data-tid="report-tool-edit-btn"
              onClick={() => {
                popover.onClose();
                setDialogStates({
                  isEditing: true,
                });
                openReportDialog();
              }}
            >
              <ListItemIcon>
                <Iconify icon="solar:pen-bold" />
              </ListItemIcon>
              <ListItemText primary={`${wordLibrary?.edit ?? "編輯"}`} />
            </ListItemButton>
          </List>
        )}
        {reportMode === "chart" && (
          <List
            sx={{ width: "100%", bgcolor: "background.paper" }}
            component="nav"
          >
            <ListItemButton
              id="report-tool-download-csv-btn"
              data-tid="report-tool-download-csv-btn"
              onClick={() => {
                handleMenuTools(
                  selectedReport?.reportChartType as CHART_IDS,
                  EXTENDED_CHART_TOOLS.EXPORT_CSV
                );
              }}
            >
              <ListItemIcon>
                <Iconify icon="teenyicons:csv-solid" />
              </ListItemIcon>
              <ListItemText
                primary={`${wordLibrary?.["download csv"] ?? "下載CSV"}`}
              />
            </ListItemButton>
          </List>
        )}
        {reportMode === "chart" && (
          <List
            sx={{ width: "100%", bgcolor: "background.paper" }}
            component="nav"
          >
            <ListItemButton
              id="report-tool-download-png-btn"
              data-tid="report-tool-download-png-btn"
              onClick={() => {
                handleMenuTools(
                  selectedReport?.reportChartType as CHART_IDS,
                  EXTENDED_CHART_TOOLS.EXPORT_PNG
                );
              }}
            >
              <ListItemIcon>
                <Iconify icon="teenyicons:png-solid" />
              </ListItemIcon>
              <ListItemText
                primary={`${wordLibrary?.["download png"] ?? "下載PNG"}`}
              />
            </ListItemButton>
          </List>
        )}
        {selectedReport?.organizationReportId && (
          <List
            sx={{ width: "100%", bgcolor: "background.paper" }}
            component="nav"
          >
            <ListItemButton
              id="report-tool-delete-btn"
              data-tid="report-tool-delete-btn"
              disabled={isDeletingOrgReport}
              onClick={() => {
                openConfirmDeleteDialog({
                  primary: `確定刪除${selectedReport.organizationReportName}嗎？`,
                  deletableName: selectedReport.organizationReportName,
                  onConfirm: async () => {
                    popover.onClose();
                    try {
                      closeConfirmDeleteDialog();
                      await deleteOrgReport({
                        organizationId,
                        organizationReportId:
                          selectedReport.organizationReportId,
                      });
                      if (setReportChartShow) setReportChartShow(false);
                      if (setSelectedReport) setSelectedReport(undefined);
                      if (reportListMutate) reportListMutate();
                    } catch (error) {
                      apis.tools.createLog({
                        function: "deleteOrgReport: error",
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
            >
              <ListItemIcon sx={{ color: "error.main" }}>
                <Iconify icon="solar:trash-bin-trash-bold" />
              </ListItemIcon>
              <ListItemText
                primary={`${wordLibrary?.delete ?? "刪除"}`}
                sx={{ color: "error.main" }}
              />
            </ListItemButton>
          </List>
        )}
      </CustomPopover>
    </>
  );
};
