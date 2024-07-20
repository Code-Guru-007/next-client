import React, { useContext, useEffect, useState } from "react";

import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@eGroupAI/material/DialogActions";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import {
  Box,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
} from "@mui/material";

import { makeStyles, useTheme } from "@mui/styles";
import { useSelector } from "react-redux";

import { OrgChartReportFormInput } from "interfaces/form";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { Controller, useFormContext } from "react-hook-form";
import { ServiceModuleValue } from "interfaces/utils";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import {
  DataTableContext,
  FilterValues,
} from "@eGroupAI/material-module/DataTable";

import { CreateOrgReportSavingApiPayload } from "interfaces/payloads";
import {
  FilterDropDownProps,
  Value,
  ValueType,
} from "@eGroupAI/material-lab/FilterDropDown";
import { OrganizationReport } from "interfaces/entities";
import { AxiosResponse } from "axios";
import {
  getFilterValuesFromFilterConditionForms,
  getReportResultApiPayloadDataSourceList,
} from "./utils";
import OrgChartReportDialogContext from "./OrgChartReportDialogContext";

export const DIALOG = "OrgReportSaveDialog";

export interface OrgReportSaveDialogProps {
  serviceModuleValue?: ServiceModuleValue;
  onFilterValuesSubmit?: (values: FilterValues) => void;
  onSubmitFilterValue?: FilterDropDownProps["onSubmit"];
  isEditing?: boolean;
}

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

const OrgReportSaveDialog = (props: OrgReportSaveDialogProps) => {
  const {
    serviceModuleValue,
    onFilterValuesSubmit,
    onSubmitFilterValue,
    isEditing,
  } = props;

  const classes = useStyles();
  const theme = useTheme();

  const organizationId = useSelector(getSelectedOrgId);
  const wordLibrary = useSelector(getWordLibrary);
  const { isOpen, closeDialog } = useReduxDialog(DIALOG);

  const {
    filterSearch,
    closeReportDialog,
    defaultFilterValues,
    detailedDefaultFilterValues,
  } = useContext(OrgChartReportDialogContext);
  const {
    reportListMutate,
    setSelectedReport,
    setReportChartShow,
    selectedReport,
  } = useContext(DataTableContext);

  const { control, watch, getValues } =
    useFormContext<OrgChartReportFormInput>();
  const reportName = watch("organizationReportName");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [payload, setPayload] =
    useState<CreateOrgReportSavingApiPayload | null>(null);
  const [hasFilterConditions, setHasFilterConditions] = useState(false);

  const { excute: createOrgReportSave, isLoading: isCreatingReportSave } =
    useAxiosApiWrapper(apis.org.createOrgReportSave, "Create");
  const { excute: updateOrgReport, isLoading: isUpdatingReport } =
    useAxiosApiWrapper(apis.org.updateOrgReport, "Update");
  const { excute: getOrgReportDetail, isLoading: isGettingReportDetail } =
    useAxiosApiWrapper(apis.org.getOrgReportDetail, "None");

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitted(false);
      setPayload(null);
    }
  }, [isOpen]);

  // use effect here cuz `filterSearch` need another render cycle to update after submitted
  //
  // if filterObject doesn't require values other than `locale`, `equal`, and `range`,
  // then this might be moved into the onClick event and be completed in one render cycle
  useEffect(() => {
    if (isSubmitted && payload) {
      const { startIndex, size, ...others } = filterSearch || {};
      payload.widgetConfig.dataSourceList.forEach((item) => {
        if (item.mode === "TAG" && item.value === "Alltags") {
          item.value = undefined;
        }
      });
      (async () => {
        const commonPayload = {
          ...payload,
          widgetConfig: {
            ...payload.widgetConfig,
            filterObject: hasFilterConditions ? others : undefined,
          },
        };

        let maintainRes: AxiosResponse<OrganizationReport>;
        if (isEditing) {
          maintainRes = await updateOrgReport({
            ...commonPayload,
            organizationReportId:
              selectedReport?.organizationReportId as string,
          });
        } else {
          maintainRes = await createOrgReportSave(commonPayload);
        }

        const getRes = await getOrgReportDetail({
          organizationId,
          organizationReportId: maintainRes.data.organizationReportId,
        });

        if (setReportChartShow) setReportChartShow(true);
        if (setSelectedReport) setSelectedReport(getRes.data);
        if (reportListMutate) reportListMutate();
        closeDialog();
        if (closeReportDialog) closeReportDialog();
      })();

      // reset dialog states
      setIsSubmitted(false);
      setPayload(null);
    }
  }, [
    closeDialog,
    closeReportDialog,
    createOrgReportSave,
    filterSearch,
    getOrgReportDetail,
    hasFilterConditions,
    isEditing,
    isSubmitted,
    organizationId,
    payload,
    reportListMutate,
    selectedReport?.organizationReportId,
    serviceModuleValue,
    setReportChartShow,
    setSelectedReport,
    updateOrgReport,
  ]);

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      fullWidth
      maxWidth={"sm"}
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle>{wordLibrary?.["save list"] ?? "儲存清單"}</DialogTitle>
      <DialogContent sx={{ position: "relative" }}>
        <Stack spacing={3} sx={{ marginTop: 2, marginBottom: 2 }}>
          <Grid container sx={{ alignItems: "center" }} spacing={3}>
            <Grid item xs={12}>
              <Controller
                control={control}
                name={`organizationReportName`}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    id="report-save-dialog-input"
                    data-tid="report-save-dialog-input"
                    fullWidth
                    required
                    onChange={onChange}
                    value={value}
                    label={wordLibrary?.["list name"] ?? "清單名稱"}
                    placeholder={wordLibrary?.["list name"] ?? "清單名稱"}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                control={control}
                name="hasFixedResult"
                render={({ field: { onChange, value } }) => (
                  <FormControlLabel
                    control={<Switch checked={value} onChange={onChange} />}
                    label={wordLibrary?.["lock data"] ?? "封存資料"}
                    labelPlacement="end"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Box flexGrow={1} />
        <DialogCloseButton disabled={false} onClick={closeDialog} rounded>
          {wordLibrary?.cancel ?? "取消"}
        </DialogCloseButton>

        <DialogConfirmButton
          loading={
            isCreatingReportSave || isUpdatingReport || isGettingReportDetail
          }
          disabled={
            !reportName ||
            isCreatingReportSave ||
            isUpdatingReport ||
            isGettingReportDetail
          }
          rounded
          onClick={() => {
            const values = getValues();
            const {
              reportVariables,
              filterConditions,
              reportChartType,
              organizationReportName,
              hasFixedResult,
            } = values;
            const dataSourceList = getReportResultApiPayloadDataSourceList({
              serviceModuleValue: serviceModuleValue as ServiceModuleValue,
              reportVariables,
            });

            setHasFilterConditions(
              filterConditions.filter((f) => !!f.filterId).length !== 0
            );
            const filterValuesGrouped = getFilterValuesFromFilterConditionForms(
              {
                defaultFilterValues: defaultFilterValues ?? {},
                filterConditions,
              }
            );
            const fValues = filterConditions
              .filter((f) => !!f.filterValue)
              .reduce<Value>(
                (a, filter) => ({
                  ...a,
                  [filter.filterId]: filter.filterValue as ValueType,
                }),
                {}
              );

            if (onFilterValuesSubmit) onFilterValuesSubmit(filterValuesGrouped);
            if (onSubmitFilterValue)
              onSubmitFilterValue({
                ...(detailedDefaultFilterValues ?? {}),
                ...fValues,
              });

            setPayload({
              organizationId,
              organizationReportName: organizationReportName || "",
              reportChartType: `${String(
                reportChartType.type1 || ""
              ).toUpperCase()}_CHART`,
              serviceModuleValue: serviceModuleValue || "",
              hasFixedResult: String(hasFixedResult).toUpperCase(),
              isPublic: 0,
              widgetConfig: { dataSourceList },
            });

            setIsSubmitted(true);
          }}
        >
          {wordLibrary?.confirm ?? "確認"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default OrgReportSaveDialog;
