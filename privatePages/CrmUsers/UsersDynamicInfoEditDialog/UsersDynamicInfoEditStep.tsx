/* eslint-disable no-underscore-dangle */
import React, {
  FC,
  useEffect,
  useState,
  useCallback,
  useMemo,
  RefObject,
} from "react";
import { AxiosPromise } from "axios";
import { useSelector } from "react-redux";

import { Table } from "interfaces/utils";
import { BatchUpdateOrgUserColumnApiPayload } from "interfaces/payloads";
import { OrganizationColumn, OrganizationUser } from "interfaces/entities";

import { ColumnType, FilterSearch } from "@eGroupAI/typings/apis";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import useOrgDynamicColumnsFilterSearch from "utils/useOrgDynamicColumnsFilterSearch";

import useStaticColumns from "utils/useStaticColumns";
import useUpdateUserApiPayload from "utils/useUpdateUserApiPayload";

import Grid from "@eGroupAI/material/Grid";
import DynamicField, {
  Values,
  RemarkValues,
  MultiSelectMode,
} from "components/DynamicField";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { SNACKBAR } from "components/App";

import GroupLabel from "components/GroupLabel";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import getOrgColumnGroupByGroup from "utils/getOrgColumnsGroupByGroup";
import { Button } from "@eGroupAI/material";
import { DynamicValueType } from "interfaces/form";

export const DIALOG = "UserDynamicInfoEditStep";
export interface UserDynamicInfoEditStepProps {
  onConfirm?: (
    payload: Omit<BatchUpdateOrgUserColumnApiPayload, "organizationId">
  ) => Promise<void | string> | void;
  closeDialog?: () => void;
  defaultValues?: Values;
  submitBtnRef?: RefObject<HTMLButtonElement>;
  loading?: boolean;
  selectedUsers?: OrganizationUser[];
  selectedColumns?: OrganizationColumn[];
  isAllColumns?: boolean;
  dynamicColumnsFilterObject?: FilterSearch;
}

export type OptionType = {
  optionId: string;
  label: string;
  value: string;
};

const UserDynamicInfoEditStep: FC<UserDynamicInfoEditStepProps> = function (
  props
) {
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);

  const {
    defaultValues,
    selectedColumns,
    submitBtnRef,
    onConfirm,
    closeDialog,
    isAllColumns,
    dynamicColumnsFilterObject,
  } = props;

  const organizationId = useSelector(getSelectedOrgId);
  const [values, setValues] = useState<Values>({});
  const [remarkValues, setRemarkValues] = useState<RemarkValues>({});
  const [errors, setErrors] = useState<{ [name: string]: string | undefined }>(
    {}
  );
  const [columnTargetValues, setColumnTargetValues] = useState<RemarkValues>(
    {}
  );
  const [dynamicOptions, setDynamicOptions] = useState<{
    [name: string]: OptionType[] | undefined;
  }>({});
  const [multiSelectMode, setMultiSelectMode] =
    useState<MultiSelectMode>("OVERWRITE_ALL");

  const wordLibrary = useSelector(getWordLibrary);

  const staticColumns = useStaticColumns(Table.USERS, "isEdit");

  const { data: orgColumns } = useOrgDynamicColumns({
    organizationId,
  });

  const { data: filteredOrgColumns } = useOrgDynamicColumnsFilterSearch(
    {
      organizationId,
    },
    {
      ...dynamicColumnsFilterObject,
    },
    {
      columnTable: "ORGANIZATION_USER",
    },
    undefined,
    !dynamicColumnsFilterObject
  );

  const getUpdatePayload = useUpdateUserApiPayload(
    undefined,
    orgColumns?.source
  );

  const { excute: checkUniqueValue } = useAxiosApiWrapper(
    apis.org.checkUniqueValue,
    "None"
  );

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
      }));

      setDynamicOptions((prev) => ({
        ...prev,
        [el.columnId]: elOption,
      }));
      return null;
    });
  }, [orgColumns?.source, staticColumns]);

  const orgColumnsGroupByGroup = useMemo(
    () => getOrgColumnGroupByGroup(filteredOrgColumns?.source),
    [filteredOrgColumns?.source]
  );

  const selectedColumnsGroupByGroup = useMemo(
    () =>
      getOrgColumnGroupByGroup(
        selectedColumns?.filter((column) => column !== undefined)
      ),
    [selectedColumns]
  );

  const handleChange = useCallback((name: string, value?: DynamicValueType) => {
    setValues((val) => ({
      ...val,
      [name]: value?.value,
    }));
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
        if (setColumnTargetValues)
          setColumnTargetValues((prev = {}) => {
            const columnTargetValueList = prev[colId] || [];
            const idxOfValueList = columnTargetValueList.findIndex(
              (el) => el?.organizationOptionId === optionId
            );
            if (idxOfValueList === -1) {
              return {
                ...prev,
                [colId]: [
                  ...columnTargetValueList,
                  {
                    organizationOptionId: optionId,
                    organizationOptionName: optionName,
                    columnTargetValueRemark: value ?? undefined,
                  },
                ],
              };
            }
            const newColumnTargetValueList = [...columnTargetValueList];
            newColumnTargetValueList[idxOfValueList] = {
              organizationOptionId: optionId,
              organizationOptionName: optionName,
              columnTargetValueRemark: value ?? undefined,
            };
            return { ...prev, [colId]: newColumnTargetValueList };
          });
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

  const checkValid = () => {
    const isValid =
      Object.values(errors).filter((v) => typeof v !== "undefined").length ===
      0;
    if (!isValid) {
      openSnackbar({
        message: "請正確填寫內容",
        severity: "error",
      });
    }
    return isValid;
  };

  const uniqueValueCheck = async (
    payload: Omit<BatchUpdateOrgUserColumnApiPayload, "organizationId">
  ) => {
    let isUnique = true;
    const { dynamicColumnTargetList } = payload;
    const promises = dynamicColumnTargetList?.reduce<AxiosPromise[]>((a, b) => {
      const column = filteredOrgColumns?.source.find(
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
    }, []);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = checkValid();
    if (isValid) {
      const payload: Omit<
        BatchUpdateOrgUserColumnApiPayload,
        "organizationId"
      > = getUpdatePayload(
        values,
        undefined,
        undefined,
        remarkValues,
        undefined,
        true,
        undefined,
        undefined,
        columnTargetValues,
        multiSelectMode
      );
      const isUniqueValueValid = await uniqueValueCheck(payload);

      if (isUniqueValueValid) {
        const { dynamicColumnTargetRemoveList: list, ...others } = payload;
        const dynamicColumnRemoveList =
          list?.map(({ columnTargetId }) => ({ columnId: columnTargetId })) ||
          [];
        const batchPayload = { ...others, dynamicColumnRemoveList };
        if (onConfirm) {
          const r = await onConfirm(batchPayload);
          if (r === "success") {
            setValues({});
            setRemarkValues({});
            if (closeDialog) closeDialog();
          }
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {isAllColumns &&
          Object.keys(orgColumnsGroupByGroup).map((key) => (
            <React.Fragment key={key}>
              {key !== "none" && (
                <Grid item xs={12}>
                  <GroupLabel
                    label={
                      orgColumnsGroupByGroup[key][0].organizationColumnGroup
                        ?.columnGroupName
                    }
                  />
                </Grid>
              )}
              {orgColumnsGroupByGroup[key]?.map((el) => (
                <Grid
                  item
                  xs={12}
                  key={el.columnId}
                  sx={{ "& .MuiTypography-root": { padding: "6px 0px" } }}
                >
                  <DynamicField
                    value={values[el.columnId]}
                    errorState={errors[el.columnId]}
                    handleChange={handleChange}
                    handleErrors={handleErrors}
                    name={el.columnId}
                    type={el.columnType}
                    label={el.columnName}
                    fullWidth
                    options={dynamicOptions[el.columnId]}
                    isEditor={el.isEditor === 1}
                    min={el.columnNumberMin}
                    max={el.columnNumberMax}
                    editorTemplateContent={el.columnEditorTemplateContent}
                    hasValidator={el.hasValidator === 1}
                    validator={el.columnValidatorRegex}
                    hasRemark={el.hasValueRemark === 1}
                    requiredRemark={el.isRequiredValueRemark === 1}
                    required={el.isRequired === 1}
                    numberUnit={el.columnNumberUnit}
                    numberDecimal={el.columnNumberOfDecimal}
                    handleChangeRemark={handleChangeRemark}
                    isRelatedServiceModule={el.isRelatedServiceModule}
                    columnRelatedServiceModuleValue={
                      el.columnRelatedServiceModuleValue
                    }
                    setMultiSelectMode={setMultiSelectMode}
                    setColumnTargetValues={setColumnTargetValues}
                  />
                </Grid>
              ))}
            </React.Fragment>
          ))}
        {!isAllColumns &&
          selectedColumns?.length !== 0 &&
          Object.keys(selectedColumnsGroupByGroup).map((key) => (
            <React.Fragment key={key}>
              {key !== "none" && (
                <Grid item xs={12}>
                  <GroupLabel
                    label={
                      selectedColumnsGroupByGroup[key][0]
                        .organizationColumnGroup?.columnGroupName
                    }
                  />
                </Grid>
              )}
              {selectedColumnsGroupByGroup[key]?.map((el) => (
                <Grid
                  item
                  xs={12}
                  key={el.columnId}
                  sx={{ "& .MuiTypography-root": { padding: "6px 0px" } }}
                >
                  <DynamicField
                    value={values[el.columnId]}
                    errorState={errors[el.columnId]}
                    handleChange={handleChange}
                    handleErrors={handleErrors}
                    name={el.columnId}
                    type={el.columnType}
                    label={el.columnName}
                    fullWidth
                    options={dynamicOptions[el.columnId]}
                    isEditor={el.isEditor === 1}
                    min={el.columnNumberMin}
                    max={el.columnNumberMax}
                    editorTemplateContent={el.columnEditorTemplateContent}
                    hasValidator={el.hasValidator === 1}
                    validator={el.columnValidatorRegex}
                    hasRemark={el.hasValueRemark === 1}
                    requiredRemark={el.isRequiredValueRemark === 1}
                    required={el.isRequired === 1}
                    numberUnit={el.columnNumberUnit}
                    numberDecimal={el.columnNumberOfDecimal}
                    handleChangeRemark={handleChangeRemark}
                    isRelatedServiceModule={el.isRelatedServiceModule}
                    columnRelatedServiceModuleValue={
                      el.columnRelatedServiceModuleValue
                    }
                    setMultiSelectMode={setMultiSelectMode}
                    setColumnTargetValues={setColumnTargetValues}
                  />
                </Grid>
              ))}
            </React.Fragment>
          ))}
      </Grid>
      <Button ref={submitBtnRef} sx={{ display: "none" }} type="submit">
        {wordLibrary?.save ?? "儲存"}
      </Button>
    </form>
  );
};

export default UserDynamicInfoEditStep;
