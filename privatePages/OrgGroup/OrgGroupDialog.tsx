/* eslint-disable no-underscore-dangle */
import React, { FC, useEffect, useState, useCallback, useMemo } from "react";

import { AxiosPromise } from "axios";
import { useSelector } from "react-redux";
import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import DialogActions from "@mui/material/DialogActions";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import useStaticColumns from "utils/useStaticColumns";
import { Table } from "interfaces/utils";
import { UpdateOrgGroupApiPayload } from "interfaces/payloads";
import { OrganizationGroup } from "interfaces/entities";
import useOrgGroupApiPayload from "utils/useOrgGroupApiPayload";
import PermissionValid from "components/PermissionValid";

import Dialog from "@eGroupAI/material/Dialog";
import DialogCloseButton from "components/DialogCloseButton";
import DynamicField, { Values, RemarkValues } from "components/DynamicField";

import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import { Button, CircularProgress } from "@eGroupAI/material";
import { SNACKBAR } from "components/App";
import { ColumnType } from "@eGroupAI/typings/apis";
import { DynamicValueType } from "interfaces/form";

import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import getOrgColumnGroupByGroup from "utils/getOrgColumnsGroupByGroup";
import getRequiredDynamicFieldList from "utils/getRequiredDynamicFields";
import clsx from "clsx";

import DynamicFieldsForm from "components/DynamicFieldsForm";
import { useSettingsContext } from "minimal/components/settings";
import DialogFullPageContainer from "components/DialogFullPageContainer/DialogFullPageContainer";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export const DIALOG = "OrgGroupDialog";

const useStyles = makeStyles(() => ({
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
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface OrgGroupDialogProps {
  onConfirm?: (
    payload: Omit<
      UpdateOrgGroupApiPayload,
      "organizationId" | "organizationGroupId"
    >
  ) => void;
  defaultValues?: Values;
  loading?: boolean;
  orgGroup?: OrganizationGroup;
}

export type OptionType = {
  optionId: string;
  label: string;
  value: string;
};

const OrgGroupDialog: FC<OrgGroupDialogProps> = function (props) {
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);

  const { onConfirm, defaultValues, loading, orgGroup } = props;
  const classes = useStyles();
  const settings = useSettingsContext();
  const theme = useTheme();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);

  const organizationId = useSelector(getSelectedOrgId);
  const [
    shouldRenderAllFieldsForValidation,
    setShouldRenderAllFieldsForValidation,
  ] = useState<boolean>(false);
  const [values, setValues] = useState<Values>({});
  const [relatedTargetId, setRelatedTargetId] = useState<string>();
  const [remarkValues, setRemarkValues] = useState<RemarkValues>({});
  const [errors, setErrors] = useState<{ [name: string]: string | undefined }>(
    {}
  );
  const [isMoreRendering, setIsMoreRendering] = useState<boolean>(false);
  const [shouldSubmitAgain, setShouldSubmitAgain] = useState<boolean>(false);
  const [shouldSubmitAgainNow, setShouldSubmitAgainNow] =
    useState<boolean>(false);

  const [dynamicOptions, setDynamicOptions] = useState<{
    [name: string]: OptionType[] | undefined;
  }>({});

  const staticColumns = useStaticColumns(Table.ORGANIZATION_GROUP, "isEdit");
  const wordLibrary = useSelector(getWordLibrary);

  const { data: orgColumns } = useOrgDynamicColumns(
    {
      organizationId,
    },
    {
      columnTable: "ORGANIZATION_GROUP",
    }
  );

  const getUpdatePayload = useOrgGroupApiPayload(
    orgGroup?.dynamicColumnTargetList,
    orgColumns?.source
  );

  const { excute: checkUniqueValue, isLoading: isChecking } =
    useAxiosApiWrapper(apis.org.checkUniqueValue, "None");

  useEffect(() => {
    if (defaultValues) {
      setValues(defaultValues);
    }
  }, [defaultValues]);

  useEffect(() => {
    staticColumns?.map((el) => {
      if (el.sortKey && el.columnType) {
        const elOption = el.keyValueMap
          ? Object.keys(el.keyValueMap).map((key) => ({
              optionId: key,
              label: key,
              value: el.keyValueMap ? el.keyValueMap[key] || "" : "",
            }))
          : undefined;

        setDynamicOptions((prev) => ({
          ...prev,
          [el?.sortKey as string]: elOption,
        }));
      }
      return null;
    });

    orgColumns?.source.map((el) => {
      const elOption = el.organizationOptionList?.map((o) => ({
        optionId: o.organizationOptionId,
        label: o.organizationOptionName,
        value: o.organizationOptionName,
        nextColumnId: o.organizationOptionNextColumnId,
      }));

      setDynamicOptions((prev) => ({
        ...prev,
        [el.columnId]: elOption,
      }));
      return null;
    });
  }, [orgColumns?.source, staticColumns]);

  const orgColumnsGroupByGroup = useMemo(
    () => getOrgColumnGroupByGroup(orgColumns?.source),
    [orgColumns?.source]
  );

  const requiredDynamicFields = useMemo(
    () => getRequiredDynamicFieldList(orgColumns?.source),
    [orgColumns?.source]
  );

  const handleChange = useCallback((name: string, value?: DynamicValueType) => {
    setValues((val) => ({
      ...val,
      [name]: value?.value,
    }));
    setRelatedTargetId(value?.targetId);
  }, []);

  const handleChangeRemark = useCallback(
    (
      type: ColumnType,
      colId: string,
      optionId: string,
      optionName: string,
      value?: string
    ) => {
      const remarkOfCol = remarkValues[colId] || [];
      const idx = remarkOfCol?.findIndex(
        (el) => el.organizationOptionId === optionId
      );
      if (type === ColumnType.CHOICE_MULTI) {
        if (idx === -1) {
          remarkOfCol?.push({
            organizationOptionId: optionId,
            organizationOptionName: optionName,
            columnTargetValueRemark: value,
          });
        } else if (remarkOfCol && idx >= 0) {
          remarkOfCol[idx] = {
            organizationOptionId: optionId,
            organizationOptionName: optionName,
            columnTargetValueRemark: value,
          };
        }
      }
      if (
        type === ColumnType.CHOICE_ONE ||
        type === ColumnType.CHOICE_ONE_DROPDOWN
      ) {
        remarkOfCol[0] = {
          organizationOptionId: optionId,
          organizationOptionName: optionName,
          columnTargetValueRemark: value,
        };
      }
      setRemarkValues((prev) => ({
        ...prev,
        [colId]: remarkOfCol || [],
      }));
    },
    [remarkValues]
  );

  const handleErrors = useCallback((name: string, error?: string) => {
    setErrors((err) => ({
      ...err,
      [name]: error,
    }));
  }, []);

  const checkValid = useCallback(() => {
    const isValid =
      Object.values(errors).filter((v) => typeof v !== "undefined").length ===
      0;
    if (!isValid) {
      const validErrElementName = Object.keys(errors)[0];
      document
        .getElementsByName(validErrElementName ?? "")[0]
        ?.scrollIntoView({ behavior: "smooth" });

      openSnackbar({
        message: "請填寫正確內容",
        severity: "error",
      });
    }
    return isValid;
  }, [errors, openSnackbar]);

  const uniqueValueCheck = useCallback(
    async (
      payload: Omit<
        UpdateOrgGroupApiPayload,
        "organizationId" | "organizationGroupId"
      >
    ) => {
      let isUnique = true;
      const { dynamicColumnTargetList } = payload;
      const promises = dynamicColumnTargetList?.reduce<AxiosPromise[]>(
        (a, b) => {
          const column = orgColumns?.source.find(
            (col) => col.columnId === b.organizationColumn.columnId
          );
          if (column && column.isUniqueValue === 1) {
            return [
              ...a,
              checkUniqueValue({
                organizationId,
                columnId: b.organizationColumn.columnId,
                columnTargetValue: b.columnTargetValue as string,
              }),
            ];
          }
          return a;
        },
        []
      );

      if (promises) {
        const resp = await Promise.all(promises);
        resp.forEach((el) => {
          const columnId = el?.config?.url?.split("/")[3];
          if (columnId && !el.data) {
            setErrors({
              ...errors,
              [columnId]: "必須為唯一值",
            });
            isUnique = false;
          }
        });
      }
      if (!isUnique) {
        openSnackbar({
          message: "請輸入唯一值",
          severity: "error",
        });
      }
      return isUnique;
    },
    [checkUniqueValue, errors, openSnackbar, orgColumns?.source, organizationId]
  );

  const handleCloseDialog = () => {
    closeDialog();
    setValues({});
    setRemarkValues({});
    setErrors({});
  };

  const onSubmit = useCallback(
    async (e?: React.BaseSyntheticEvent) => {
      e?.preventDefault();
      const isValid = checkValid();
      if (isValid) {
        const payload: Omit<
          UpdateOrgGroupApiPayload,
          "organizationId" | "organizationGroupId"
        > = getUpdatePayload(
          values,
          defaultValues,
          relatedTargetId,
          remarkValues,
          orgGroup?.organizationGroupId
        );
        const isUniqueValueValid = await uniqueValueCheck(payload);
        if (isUniqueValueValid) {
          if (onConfirm) {
            onConfirm(payload);
          }
          setValues({});
          setRemarkValues({});
        }
      }
    },
    [
      checkValid,
      defaultValues,
      getUpdatePayload,
      onConfirm,
      orgGroup?.organizationGroupId,
      relatedTargetId,
      remarkValues,
      uniqueValueCheck,
      values,
    ]
  );

  const triggerRenderAllFields = useCallback(() => {
    const elements = requiredDynamicFields.map(
      (el) => document.getElementsByName(el.columnId)[0]
    );
    if (elements.includes(undefined)) {
      setIsMoreRendering(true);
      setShouldRenderAllFieldsForValidation(true);
      if (shouldRenderAllFieldsForValidation) return false;
      return true;
    }
    return false;
  }, [requiredDynamicFields, shouldRenderAllFieldsForValidation]);

  const handleClickConfirm = useCallback(() => {
    const result = triggerRenderAllFields();
    setShouldSubmitAgain(result);
    if (!result) {
      document.getElementById("submitButton")?.click();
      setShouldSubmitAgain(false);
      setShouldSubmitAgainNow(false);
      setIsMoreRendering(false);
    } else {
      openSnackbar({
        message: "必填欄位尚未填寫",
        severity: "warning",
        transitionDuration: { exit: 3000 },
      });
    }
  }, [openSnackbar, triggerRenderAllFields]);

  useEffect(() => {
    if (!isOpen) {
      setShouldRenderAllFieldsForValidation(false);
      setShouldSubmitAgain(false);
      setShouldSubmitAgainNow(false);
      setIsMoreRendering(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (shouldSubmitAgain && shouldSubmitAgainNow) {
      handleClickConfirm();
    }
  }, [handleClickConfirm, shouldSubmitAgain, shouldSubmitAgainNow]);

  return (
    <Dialog
      open={isOpen}
      onClose={handleCloseDialog}
      fullWidth
      maxWidth="md"
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={handleCloseDialog}>
        {orgGroup
          ? `${wordLibrary?.edit ?? "編輯"}`
          : `${wordLibrary?.add ?? "新增"}`}
        資訊
      </DialogTitle>
      <DialogFullPageContainer id="column-dialog" sx={{ maxHeight: 480 }}>
        <form onSubmit={onSubmit}>
          <Stack spacing={3} sx={{ px: 3, overflow: "auto" }}>
            <div
              className={clsx(
                classes.loader,
                isMoreRendering && classes.showLoader,
                {
                  [classes.lightOpacity]: settings.themeMode === "light",
                  [classes.darkOpacity]: settings.themeMode !== "light",
                }
              )}
            >
              <CircularProgress />
            </div>

            <Card sx={{ width: "100%" }}>
              <CardHeader title="" />
              <Stack spacing={3} sx={{ p: 3 }}>
                {staticColumns?.map((el) => {
                  if (el.sortKey && el.columnType) {
                    return (
                      <Stack spacing={1.5} key={el.id}>
                        <Typography variant="subtitle2">
                          {el.columnName} {el.isEditFix === 1 && "*"}
                        </Typography>
                        <DynamicField
                          key={el.id}
                          value={values[el.sortKey]}
                          errorState={errors[el.sortKey]}
                          handleChange={handleChange}
                          handleErrors={handleErrors}
                          name={el.sortKey}
                          type={el.columnType}
                          verifyType={el.verifyType_}
                          dateRangeLimit={el.dateRangeLimit_}
                          required={el.isEditFix === 1}
                          options={dynamicOptions[el.sortKey]}
                          fullWidth
                        />
                      </Stack>
                    );
                  }
                  return undefined;
                })}
              </Stack>
            </Card>
            <DynamicFieldsForm
              orgColumns={orgColumns?.source || []}
              orgColumnsGroupByGroup={orgColumnsGroupByGroup}
              values={values}
              errors={errors}
              handleChange={handleChange}
              handleErrors={handleErrors}
              dynamicOptions={dynamicOptions}
              handleChangeRemark={handleChangeRemark}
              isOpen={isOpen}
              remarkValues={remarkValues}
              shouldRenderAll={shouldRenderAllFieldsForValidation}
              setIsMoreRendering={setIsMoreRendering}
              setShouldSubmitAgainNow={setShouldSubmitAgainNow}
            />
            <Button sx={{ display: "none" }} id="submitButton" type="submit">
              submit
            </Button>
          </Stack>
        </form>
      </DialogFullPageContainer>
      <DialogActions>
        <DialogCloseButton onClick={handleCloseDialog} />
        <PermissionValid shouldBeOrgOwner modulePermissions={["CREATE"]}>
          <LoadingButton
            variant="contained"
            loading={loading || isChecking}
            disabled={loading || isChecking}
            onClick={handleClickConfirm}
          >
            {wordLibrary?.save ?? "儲存"}
          </LoadingButton>
        </PermissionValid>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(OrgGroupDialog);
