import React, { useContext, useEffect, useMemo, useState } from "react";
import { ServiceModuleValue, Table } from "interfaces/utils";
import { useReduxDialog } from "@eGroupAI/redux-modules";

import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@eGroupAI/material/DialogActions";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import { makeStyles, useTheme } from "@mui/styles";
import { useSelector } from "react-redux";
import { Divider } from "@mui/material";

import useOrgChartVariables from "utils/useOrgChartVariables";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import {
  DataTableContext,
  TableFilterConditionGroup,
} from "@eGroupAI/material-module/DataTable";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { ChartReportDataSource } from "interfaces/payloads";
import { OrgChartReportFormInput, ReportValueMapping } from "interfaces/form";
import {
  ChartTimeGranularity,
  ChartTypes,
  FilterCondition,
  FilterSearch,
  OrgChartReportMode,
  ColumnType,
} from "@eGroupAI/typings/apis";
import {
  FilterDropDownProps,
  Value,
  ValueType,
} from "@eGroupAI/material-lab/FilterDropDown";
import { FilterValues } from "utils/useDataTableFilterColumns";
import { optionToValueType } from "@eGroupAI/material-lab/FilterDropDown/utils";

import { CHART_IDS } from "components/ReportChart/types";
import { OrgChartReportVariableData } from "interfaces/entities";
import OrgChartReportForm, {
  FORM as ChartReportForm,
  OrgChartReportFormProps,
} from "./OrgChartReportForm";
import OrgChartReportDialogContext from "./OrgChartReportDialogContext";
import {
  getFilterValuesFromFilterConditionForms,
  getReportResultApiPayloadDataSourceList,
} from "./utils";
import { DIALOG as REPORT_SAVE_DIALOG } from "./OrgReportSaveDialog";

export const DIALOG = "ReportDialog";

export interface ReportDialogProps {
  serviceModuleValue: keyof typeof moduleToTableMap;
  filterConditionGroups?: TableFilterConditionGroup[];
  onFilterValuesSubmit?: (values: FilterValues) => void;
  FilterDropDownProps?: Omit<FilterDropDownProps, "options" | "value">;
  filterSearch?: FilterSearch;
}

export interface ReportDialogStates {
  isEditing?: boolean;
}

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

const moduleToTableMap = {
  [ServiceModuleValue.ARTICLE]: Table.ARTICLES,
  [ServiceModuleValue.CRM_USER]: Table.USERS,
  [ServiceModuleValue.BULLETIN]: Table.BULLETIN,
  [ServiceModuleValue.CRM_PARTNER]: Table.PARTNERS,
} as const;

const chartTypeMap: Record<
  CHART_IDS.LINE_CHART | CHART_IDS.BAR_CHART | CHART_IDS.PIE_CHART,
  ChartTypes
> = {
  [CHART_IDS.LINE_CHART]: ChartTypes.LINE,
  [CHART_IDS.BAR_CHART]: ChartTypes.BAR,
  [CHART_IDS.PIE_CHART]: ChartTypes.PIE,
};

const ReportDialog = function (props: ReportDialogProps) {
  const {
    serviceModuleValue,
    filterConditionGroups,
    onFilterValuesSubmit,
    FilterDropDownProps: { onSubmit: onSubmitFilterValue } = {},
    filterSearch,
  } = props;
  const classes = useStyles();
  const theme = useTheme();

  const organizationId = useSelector(getSelectedOrgId);
  const wordLibrary = useSelector(getWordLibrary);

  const { setReportChartShow, selectedReport, setSelectedReport } =
    useContext(DataTableContext);

  const defaultFilterValues = useMemo(
    () =>
      filterConditionGroups
        ?.map((c, i) => ({ [i]: {} }))
        .reduce((a, b) => ({ ...a, ...b }), {}) as FilterValues,
    [filterConditionGroups]
  );

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

  const { excute: postGetChartReportResult, isLoading: isGettingReportResult } =
    useAxiosApiWrapper(apis.org.postGetChartReportResult, "None");

  const [isValidateForm, setIsValidateForm] = useState<boolean>(false);
  const [submitClicked, setSubmitClicked] = useState<boolean>(false);
  const [dataSourceListPayload, setDataSourceListPayload] = useState<
    ChartReportDataSource[]
  >([]);

  const [userChartType, setUserChartType] = useState<ChartTypes>();
  const [timeGranularity, setTimeGranularity] =
    useState<ChartTimeGranularity>();
  const [axisName, setAxisName] = useState<{ [key: string]: string }>();
  const [valueMapping, setValueMapping] =
    useState<{ [key: string]: ReportValueMapping[] }>();

  const [isFilterObjectOnPayload, setIsFilterObjectOnPayload] =
    useState<boolean>(false);

  const { isOpen, closeDialog, isEditing } = useReduxDialog<ReportDialogStates>(
    `${DIALOG}-${serviceModuleValue}`
  );

  const { openDialog: openReportSaveDialog } =
    useReduxDialog(REPORT_SAVE_DIALOG);

  const { data: orgChartVariables } = useOrgChartVariables(
    {
      organizationId,
      tableModule: moduleToTableMap[serviceModuleValue],
    },
    undefined,
    undefined,
    !isOpen
  );

  const allTagValue = {
    mode: OrgChartReportMode.TAG,
    value: "Alltags",
    name: "All tags",
    columnType: ColumnType.CHOICE_MULTI,
  };
  const tagSection = orgChartVariables?.find(
    (section) => section.reportVariableModeName === "標籤"
  );
  if (tagSection) {
    const isValuePresent = tagSection.reportVariableDataList.some(
      (tag) => tag.value === allTagValue.value
    );
    if (!isValuePresent) {
      tagSection.reportVariableDataList.unshift(allTagValue);
    }
  }
  const tagSectionIndex = orgChartVariables?.findIndex(
    (section) => section.reportVariableModeName === "標籤"
  );
  if (orgChartVariables && tagSection) {
    if (tagSectionIndex !== -1 && tagSectionIndex !== undefined) {
      orgChartVariables[tagSectionIndex] = tagSection;
    } else {
      orgChartVariables.push(tagSection);
    }
  }

  const [isAbleToSave, setIsAbleToSave] = useState<boolean>(false);

  const customContextValues = useMemo(
    () => ({
      orgChartVariables,
      filterConditionGroups,
      isValidateForm,
      setIsAbleToSave,
      filterSearch,
      dataSourceListPayload,
      closeReportDialog: closeDialog,
      defaultFilterValues,
      detailedDefaultFilterValues,
    }),
    [
      filterConditionGroups,
      orgChartVariables,
      isValidateForm,
      setIsAbleToSave,
      filterSearch,
      dataSourceListPayload,
      closeDialog,
      defaultFilterValues,
      detailedDefaultFilterValues,
    ]
  );

  useEffect(() => {
    if (submitClicked && serviceModuleValue && filterSearch) {
      const { startIndex, size, ...others } = filterSearch || {};
      postGetChartReportResult({
        organizationId,
        serviceModuleValue,
        widgetConfig: {
          dataSourceList: dataSourceListPayload,
          filterObject: isFilterObjectOnPayload ? { ...others } : undefined,
        },
      }).then((res) => {
        if (res.data) {
          setSelectedReport?.({
            organizationReportId: undefined,
            reportChartType: userChartType as ChartTypes,
            reportResult: res.data,
          });
          setReportChartShow?.(true);
          setIsFilterObjectOnPayload(false);
          closeDialog();
        }
      });
      setSubmitClicked(false);
      setIsValidateForm(false);
    }
  }, [
    closeDialog,
    dataSourceListPayload,
    filterSearch,
    organizationId,
    postGetChartReportResult,
    serviceModuleValue,
    submitClicked,
    setReportChartShow,
    userChartType,
    timeGranularity,
    axisName,
    valueMapping,
    isFilterObjectOnPayload,
    setSelectedReport,
  ]);

  useEffect(() => {
    if (!isOpen) {
      setIsValidateForm(false);
      setSubmitClicked(false);
    }
  }, [isOpen]);

  const orgChartVariablesMap = useMemo(
    () =>
      orgChartVariables
        ?.flatMap((vars) => vars.reportVariableDataList)
        .reduce((prev, curr) => {
          if (!prev[curr.mode]) prev[curr.mode] = {};
          prev[curr.mode][curr.value] = curr;
          return prev;
        }, {} as Record<OrgChartReportMode, Record<string, OrgChartReportVariableData>>),
    [orgChartVariables]
  );

  const filterConditionGroupsMap = useMemo(
    () =>
      filterConditionGroups
        ?.flatMap((group) =>
          group.filterConditionList.map((fc) => ({
            ...fc,
            filterGroupName: group.filterConditionGroupName,
          }))
        )
        .reduce((prev, curr) => {
          prev[curr.columnId] = curr;
          return prev;
        }, {} as Record<FilterCondition["columnId"], FilterCondition>),
    [filterConditionGroups]
  );

  const formDefaultValues: OrgChartReportFormProps["defaultValues"] =
    isEditing && selectedReport?.organizationReportId
      ? {
          reportChartType: {
            type1: chartTypeMap[selectedReport.reportChartType],
          },
          reportVariables:
            selectedReport.widgetConfig.dataSourceList
              ?.map(
                ({ mode, value, timeGranularity, valueMapping, ...rest }) => ({
                  mode,
                  value,
                  name: orgChartVariablesMap?.[mode]?.[value].name,
                  columnType: orgChartVariablesMap?.[mode]?.[value].columnType,
                  timeGranularity: timeGranularity as ChartTimeGranularity,
                  valueMapping:
                    valueMapping &&
                    Object.entries(valueMapping).map(([name, alias]) => ({
                      label: name,
                      alias,
                      value: filterConditionGroupsMap?.[value]?.dataList?.find(
                        (data) => data.name === name
                      )?.value,
                    })),
                  ...rest,
                })
              )
              .filter((v) => !!v) ?? [],
          filterConditions: [
            ...(selectedReport.widgetConfig.filterObject?.equal
              ?.filter((filterCondition) => !!filterCondition.columnId)
              .map((filterCondition) => ({
                ...(filterConditionGroupsMap?.[
                  filterCondition.columnId as string
                ] ?? {}),
                filterValue: filterCondition.value,
                items: filterConditionGroupsMap?.[
                  filterCondition.columnId as string
                ]?.dataList?.map((data) => ({
                  label: data.name,
                  value: data.value,
                })),
              })) ?? []),
            ...(selectedReport.widgetConfig.filterObject?.range
              ?.filter((filterCondition) => !!filterCondition.columnId)
              .map((filterCondition) => ({
                ...(filterConditionGroupsMap?.[
                  filterCondition.columnId as string
                ] ?? {}),
                filterValue: [
                  filterCondition.from as string,
                  filterCondition.to as string,
                ],
              })) ?? []),
          ],
          organizationReportName: selectedReport.organizationReportName,
          hasFixedResult:
            selectedReport.hasFixedResult.toLowerCase() === "true",
        }
      : undefined;

  return (
    <OrgChartReportDialogContext.Provider value={customContextValues}>
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
        <DialogTitle
          onClickClose={closeDialog}
          sx={{
            p: 3,
            "& .MuiTypography-root ~ .MuiBox-root": {
              position: "relative",
              top: 0,
              right: 0,
            },
          }}
        >
          {wordLibrary?.["chart options"] ?? "報表設定"}
        </DialogTitle>
        <DialogContent sx={{ position: "relative", pb: 3 }}>
          <OrgChartReportForm
            serviceModuleValue={serviceModuleValue}
            defaultValues={formDefaultValues}
            onFilterValuesSubmit={onFilterValuesSubmit}
            onSubmitFilterValue={onSubmitFilterValue}
            onSubmit={(values: OrgChartReportFormInput) => {
              const { reportVariables, filterConditions, reportChartType } =
                values;

              setIsFilterObjectOnPayload(
                filterConditions.filter((f) => !!f.filterId).length !== 0
              );
              setUserChartType(reportChartType.type1);
              if (
                reportVariables?.[0]?.columnType?.includes("DATE") ||
                reportVariables?.[1]?.columnType?.includes("DATE")
              ) {
                setTimeGranularity(
                  reportVariables?.[0]?.timeGranularity ||
                    reportVariables?.[1]?.timeGranularity ||
                    ChartTimeGranularity.YEARLY
                );
              }
              setAxisName(
                reportVariables?.reduce<{ [key: string]: string }>(
                  (a, b, index) => {
                    if (b.value && b.axisName)
                      return { ...a, [String(index + 1)]: b.axisName };
                    return { ...a };
                  },
                  {}
                )
              );
              setValueMapping(
                reportVariables?.reduce<{
                  [key: string]: ReportValueMapping[];
                }>((a, b, index) => {
                  if (b.value && b.valueMapping)
                    return { ...a, [String(index + 1)]: b.valueMapping };
                  return { ...a };
                }, {})
              );

              const dataSourceList = getReportResultApiPayloadDataSourceList({
                serviceModuleValue: serviceModuleValue as ServiceModuleValue,
                reportVariables,
              });

              dataSourceList.forEach((item) => {
                if (item.mode === "TAG" && item.value === "Alltags") {
                  item.value = undefined;
                }
              });

              setDataSourceListPayload(dataSourceList);

              const filterValuesGrouped =
                getFilterValuesFromFilterConditionForms({
                  defaultFilterValues,
                  filterConditions,
                });
              const fValues = filterConditions
                .filter((f) => !!f.filterValue)
                .reduce<Value>(
                  (a, filter) => ({
                    ...a,
                    [filter.filterId]: filter.filterValue as ValueType,
                  }),
                  {}
                );

              if (onFilterValuesSubmit)
                onFilterValuesSubmit(filterValuesGrouped);
              if (onSubmitFilterValue)
                onSubmitFilterValue({
                  ...detailedDefaultFilterValues,
                  ...fValues,
                });

              setSubmitClicked(true);
            }}
            isEditing={isEditing}
          />
        </DialogContent>
        <Divider sx={{ borderStyle: "dashed" }} />
        <DialogActions sx={{ p: 3 }}>
          <DialogCloseButton onClick={closeDialog} disabled={false} rounded />
          <DialogCloseButton
            disabled={!isAbleToSave}
            onClick={openReportSaveDialog}
            rounded
            id="report-form-save-button"
            data-tid="report-form-save-button"
          >
            {wordLibrary?.store ?? "儲存"}
          </DialogCloseButton>

          {!isEditing && (
            <DialogConfirmButton
              type="submit"
              loading={isGettingReportResult}
              disabled={isGettingReportResult}
              rounded
              form={ChartReportForm}
              onClick={() => {
                if (setSelectedReport) setSelectedReport(undefined);
                setIsValidateForm(true);
              }}
            >
              {wordLibrary?.apply ?? "套用"}
            </DialogConfirmButton>
          )}
        </DialogActions>
      </Dialog>
    </OrgChartReportDialogContext.Provider>
  );
};

export default ReportDialog;
