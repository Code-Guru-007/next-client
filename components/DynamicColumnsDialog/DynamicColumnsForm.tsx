import React, { FC, useEffect, useState, useRef } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import {
  FormProvider,
  Controller,
  useFormContext,
  useFieldArray,
} from "react-hook-form";
import { useSelector } from "react-redux";

import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import { SNACKBAR } from "components/App";
import Typography from "@eGroupAI/material/Typography";
import Grid from "@eGroupAI/material/Grid";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import FroalaEditor from "components/FroalaEditor";
import {
  ColumnType,
  ColumnRelatedServiceModuleValue,
} from "@eGroupAI/typings/apis";
import Autocomplete, {
  createFilterOptions,
} from "@eGroupAI/material/Autocomplete";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import MenuItem from "@mui/material/MenuItem";
import Form from "components/Form";
import useSetFormIsDirty, { SetFormIsDirty } from "utils/useSetFormIsDirty";
import { ColumnGroup, OrganizationColumn } from "interfaces/entities";
import { DynamicColumnsFormInput } from "interfaces/form";
import {
  ColumnTypeMap,
  ServiceModuleValue,
  ColumnRelatedServiceModuleValueMap,
} from "interfaces/utils";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import { CircularProgress, autocompleteClasses } from "@mui/material";
import { styled } from "@mui/styles";

import DynamicColumnOptionFieldArray from "./DynamicColumnOptionFieldArray";

const optionsFilter = createFilterOptions<ColumnGroup>({
  ignoreCase: true,
});

const StyledAutocompleteListBox = styled("div")(({ theme }) => ({
  [`& .${autocompleteClasses.groupLabel}`]: {
    paddingLeft: "16px",
    backgroundImage: "url(/assets/cyan-blur.png), url(/assets/red-blur.png)",
    backgroundRepeat: "no-repeat, no-repeat",
    backgroundPosition:
      theme.direction === "rtl"
        ? "top left, right bottom"
        : "top right, left bottom",
  },
  [`& .${autocompleteClasses.option}`]: {
    paddingLeft: "16px",
  },
}));

export const FORM = "DynamicColumnsForm";

export interface DynamicColumnsFormProps {
  column?: OrganizationColumn;
  defaultValues?: DynamicColumnsFormInput;
  previewValue?: DynamicColumnsFormInput;
  setFormIsDirty?: SetFormIsDirty;
  serviceModuleValue: ServiceModuleValue;
  columnNameError: boolean;
  setColumnNameError: React.Dispatch<React.SetStateAction<boolean>>;
  dynamicFieldTypeEnable: boolean | undefined;
  onSubmit: (valuesParam?: DynamicColumnsFormInput) => Promise<void>;
  columnGroups: ColumnGroup[];
  isLoadingGroups: boolean;
}

const DynamicColumnsForm: FC<DynamicColumnsFormProps> = function (props) {
  const {
    defaultValues,
    column,
    setFormIsDirty,
    previewValue,
    columnNameError,
    setColumnNameError,
    dynamicFieldTypeEnable,
    onSubmit,
    columnGroups,
    serviceModuleValue,
    isLoadingGroups,
  } = props;

  const { excute: createOrgDynamicColumnGroup, isLoading: isCreatingNewGroup } =
    useAxiosApiWrapper(apis.org.createOrgDynamicColumnGroup, "Create");

  const matchMutate = useSwrMatchMutate();

  const organizationId = useSelector(getSelectedOrgId);
  const methods = useFormContext<DynamicColumnsFormInput>();
  const { control, register, reset, formState, watch, setValue, handleSubmit } =
    methods;
  const [optSettings, setOptSettings] = useState<boolean>();
  const [nextSettings, setNextSettings] = useState<boolean>();
  const errorRef = useRef(false);
  const wordLibrary = useSelector(getWordLibrary);

  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);

  useEffect(() => {
    const optState = !!column?.isRelatedServiceModule;
    setOptSettings(optState);
  }, [column]);

  const { fields } = useFieldArray({
    control,
    name: "organizationColumnList",
  });

  useEffect(() => {
    if (
      (previewValue?.organizationColumnList.length === 0 || !previewValue) &&
      defaultValues
    ) {
      reset(defaultValues);
    }
    if (previewValue?.organizationColumnList.length !== 0) {
      reset(previewValue);
    }
    if (previewValue?.organizationColumnList[0]?.isRelatedServiceModule === 1)
      setOptSettings(true);
  }, [defaultValues, previewValue, reset]);

  useSetFormIsDirty({
    isDirty: formState.isDirty,
    setFormIsDirty,
  });

  return (
    <FormProvider {...methods}>
      <Form
        id={FORM}
        onSubmit={handleSubmit((values) => {
          if (!errorRef.current) onSubmit(values);
          else
            openSnackbar({
              message: "Please fill out all information correctly.",
              severity: "error",
            });
        })}
      >
        <Grid container spacing={2}>
          {fields.map((el, index) => {
            const columnType = watch(
              `organizationColumnList.${index}.columnType`
            );
            const hasValidator = watch(
              `organizationColumnList.${index}.hasValidator`
            );
            const groupId = watch(
              `organizationColumnList.${index}.organizationColumnGroup.columnGroupId`
            );
            const isEditor = watch(`organizationColumnList.${index}.isEditor`);

            let minMaxError = false;
            let orgOptionMinError = false;
            let orgOptionMaxError = false;

            const maxValue = watch(
              `organizationColumnList.${index}.maxOptionBeSelected`
            );
            const minValue = watch(
              `organizationColumnList.${index}.minOptionBeSelected`
            );

            const orgOptionList = watch(
              `organizationColumnList.${index}.organizationOptionList`
            );

            if (maxValue && minValue && minValue > maxValue) {
              minMaxError = true;
            } else minMaxError = false;
            if (orgOptionList && maxValue && maxValue > orgOptionList?.length) {
              orgOptionMaxError = true;
            }
            if (orgOptionList && minValue && minValue > orgOptionList?.length) {
              orgOptionMinError = true;
            }

            let minErrorMessage = "";
            let maxErrorMessage = "";

            if (minMaxError) {
              minErrorMessage = "請輸入小於最大值的數值";
              maxErrorMessage = "請輸入大於最小值的數值";
            }
            if (orgOptionMaxError) {
              maxErrorMessage = "請輸入小於選項數量的數值";
            }
            if (orgOptionMinError) {
              minErrorMessage = "請輸入小於選項數量的數值";
            }

            if (minMaxError || orgOptionMaxError || orgOptionMinError)
              errorRef.current = true;
            else errorRef.current = false;

            return (
              <React.Fragment key={el.id}>
                <input
                  type="hidden"
                  {...register(`organizationColumnList.${index}.columnId`)}
                />
                <input
                  type="hidden"
                  {...register(`organizationColumnList.${index}.columnTable`)}
                />
                <Grid item xs={12}>
                  <Typography
                    variant="h5"
                    color="textSecondary"
                    sx={{ marginLeft: "15px" }}
                  >
                    {wordLibrary?.["dynamic field name"] ?? "動態欄位名稱"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name={`organizationColumnList.${index}.columnName`}
                    render={({ field }) => (
                      <TextField
                        value={field.value}
                        onChange={(e) => {
                          setColumnNameError(e.target.value === "");
                          field.onChange(e);
                        }}
                        error={columnNameError && field.value === ""}
                        helperText={
                          columnNameError
                            ? `${
                                wordLibrary?.[
                                  "please enter the dynamic field name"
                                ] ?? "請輸入動態欄位名稱"
                              }`
                            : ""
                        }
                        required
                        fullWidth
                        label={wordLibrary?.["field name"] ?? "欄位名稱"}
                        sx={{ color: "text.primary" }}
                      />
                    )}
                  />
                </Grid>
                {/* comment here for froala editor */}
                <Grid item xs={12}>
                  <Typography
                    variant="h5"
                    color="textSecondary"
                    sx={{ marginLeft: "15px" }}
                  >
                    {wordLibrary?.["dynamic field description"] ?? "描述"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name={`organizationColumnList.${index}.columnDescription`}
                    render={({ field }) => (
                      <FroalaEditor
                        filePathType={serviceModuleValue}
                        model={field.value}
                        onModelChange={(model) => {
                          field.onChange(model);
                          setValue(
                            `organizationColumnList.${index}.columnDescription`,
                            model
                          );
                        }}
                        config={{
                          toolbarSticky: true,
                          heightMin: 300,
                          placeholderText:
                            wordLibrary?.["dynamic field description"] ??
                            "描述",
                          quickInsertEnabled: false,
                          imageOutputSize: false,
                        }}
                      />
                    )}
                  />
                </Grid>
                {/* end of  froala editor */}
                <Grid item xs={12}>
                  <Typography
                    variant="h5"
                    color="textSecondary"
                    sx={{ marginLeft: "15px" }}
                  >
                    {wordLibrary?.["dynamic field type"] ?? "動態欄位類型"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name={`organizationColumnList.${index}.columnType`}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={wordLibrary?.["field type"] ?? "欄位類型"}
                        select
                        fullWidth
                        disabled={dynamicFieldTypeEnable ? false : !!column}
                      >
                        <MenuItem value={ColumnType.TEXT}>
                          {`${
                            wordLibrary?.text ?? ColumnTypeMap[ColumnType.TEXT]
                          }`}
                        </MenuItem>
                        <MenuItem value={ColumnType.TEXT_MULTI}>
                          {`${
                            wordLibrary?.["multi-line text"] ??
                            ColumnTypeMap[ColumnType.TEXT_MULTI]
                          }`}
                        </MenuItem>
                        <MenuItem value={ColumnType.CHOICE_MULTI}>
                          {`${
                            wordLibrary?.["multiple choice"] ??
                            ColumnTypeMap[ColumnType.CHOICE_MULTI]
                          }`}
                        </MenuItem>
                        <MenuItem value={ColumnType.CHOICE_ONE}>
                          {`${
                            wordLibrary?.["single choice"] ??
                            ColumnTypeMap[ColumnType.CHOICE_ONE]
                          }`}
                        </MenuItem>
                        <MenuItem value={ColumnType.CHOICE_ONE_DROPDOWN}>
                          {`${
                            wordLibrary?.["dropdown single choice"] ??
                            ColumnTypeMap[ColumnType.CHOICE_ONE_DROPDOWN]
                          }`}
                        </MenuItem>
                        <MenuItem value={ColumnType.DATE}>
                          {`${
                            wordLibrary?.date ?? ColumnTypeMap[ColumnType.DATE]
                          }`}
                        </MenuItem>
                        <MenuItem value={ColumnType.DATETIME}>
                          {`${
                            wordLibrary?.["date and time"] ??
                            ColumnTypeMap[ColumnType.DATETIME]
                          }`}
                        </MenuItem>
                        <MenuItem value={ColumnType.NUMBER}>
                          {`${
                            wordLibrary?.number ??
                            ColumnTypeMap[ColumnType.NUMBER]
                          }`}
                        </MenuItem>
                        <MenuItem value={ColumnType.FILE}>
                          {`${
                            wordLibrary?.file ?? ColumnTypeMap[ColumnType.FILE]
                          }`}
                        </MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="h5"
                    color="textSecondary"
                    sx={{ marginLeft: "15px" }}
                  >
                    {wordLibrary?.["dynamic field group"] ?? "動態欄位群組"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name={`organizationColumnList.${index}.organizationColumnGroup.columnGroupId`}
                    render={({ field }) => (
                      <Autocomplete
                        size="medium"
                        options={columnGroups}
                        defaultValue={
                          columnGroups?.filter(
                            (item) => item.columnGroupId === field.value
                          )[0]
                        }
                        value={columnGroups?.find(
                          (option) => option.columnGroupId === field.value
                        )}
                        loadingText={isLoadingGroups || isCreatingNewGroup}
                        renderInput={({ InputProps, ...others }) => (
                          <TextField
                            variant="outlined"
                            placeholder={
                              wordLibrary?.["dynamic field group"] ??
                              "動態欄位群組"
                            }
                            InputProps={{
                              ...InputProps,
                              startAdornment: isCreatingNewGroup && (
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                              ),
                            }}
                            {...others}
                          />
                        )}
                        isOptionEqualToValue={(option, value) =>
                          option?.columnGroupId === value?.columnGroupId
                        }
                        getOptionLabel={(option) => {
                          // Value selected with enter, right from the input
                          if (typeof option === "string") {
                            return option;
                          }
                          // Add "xxx" option created dynamically
                          if (option?.inputValue) {
                            return option.inputValue;
                          }
                          // Regular option
                          return option.columnGroupName;
                        }}
                        groupBy={() =>
                          wordLibrary?.[
                            "select an option or create a new one"
                          ] ?? "選擇或新增一個動態欄位群組"
                        }
                        ListboxComponent={StyledAutocompleteListBox}
                        noOptionsText="查無欄位群組"
                        filterOptions={(options, state) => {
                          const filtered = optionsFilter(options, state);
                          const { inputValue } = state;
                          const isExisting = options.some(
                            (option) =>
                              option.columnGroupName.toLowerCase() ===
                              inputValue.toLowerCase()
                          );
                          if (inputValue !== "" && !isExisting) {
                            filtered.push({
                              inputValue,
                              columnGroupName: `${inputValue}`,
                              columnGroupId: "",
                              columnGroupCreateDate: "",
                              columnGroupUpdateDate: "",
                              creator: {
                                loginCheck: false,
                                organizationMemberCheck: false,
                              },
                              updater: {
                                loginCheck: false,
                                organizationMemberCheck: false,
                              },
                              serviceModuleValue,
                              organizationColumnList: [],
                              organizationColumnListCount: 1,
                              organizationTagTargetList: [],
                            });
                          }
                          return filtered;
                        }}
                        renderOption={(props, option) => {
                          if (option?.inputValue)
                            return (
                              <li {...props}>
                                <b>
                                  <Typography fontWeight={600}>
                                    {wordLibrary?.create ?? "新增"}
                                  </Typography>
                                </b>
                                <Typography variant="inherit" sx={{ ml: 1 }}>
                                  {option.columnGroupName}
                                </Typography>
                              </li>
                            );
                          return <li {...props}>{option.columnGroupName}</li>;
                        }}
                        onChange={(event, newOption) => {
                          if (typeof newOption === "string") {
                            field.onChange(newOption);
                          } else if (newOption && newOption?.inputValue) {
                            createOrgDynamicColumnGroup({
                              organizationId,
                              columnGroupName: newOption.inputValue,
                              organizationColumnList: column
                                ? [{ columnId: column.columnId }]
                                : [],
                              organizationTagList: [],
                              serviceModuleValue,
                            })
                              .then(async (res) => {
                                await matchMutate(
                                  new RegExp(
                                    `^/organizations/${organizationId}/search/column-groups\\?`,
                                    "g"
                                  )
                                );
                                if (res.data.columnGroupId) {
                                  field.onChange(res.data.columnGroupId);
                                }
                              })
                              .catch(() => {});
                          } else {
                            const columnGroupId = newOption?.columnGroupId;
                            if (columnGroupId) {
                              field.onChange(columnGroupId);
                            } else {
                              field.onChange("");
                            }
                          }
                        }}
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Grid container justifyContent="space-between">
                    <Grid item display="flex" marginY="auto">
                      <Typography
                        variant="h5"
                        color="textSecondary"
                        sx={{ marginLeft: "15px" }}
                      >
                        {wordLibrary?.required ?? "必填"}
                      </Typography>
                    </Grid>
                    <Grid item display="flex">
                      <Controller
                        control={control}
                        name={`organizationColumnList.${index}.isRequired`}
                        render={({ field }) => (
                          <Switch
                            {...field}
                            checked={Boolean(field.value)}
                            onChange={(e) => {
                              field.onChange(Number(e.target.checked));
                              if (e.target.checked) {
                                setValue(
                                  `organizationColumnList.${index}.isRelatedServiceModule`,
                                  0
                                );
                                setOptSettings(false);
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                {columnType === ColumnType.CHOICE_MULTI && (
                  <>
                    <Grid item xs={12}>
                      <Grid container justifyContent="space-between">
                        <Grid item display="flex" marginY="auto">
                          <Typography
                            variant="h5"
                            color="textSecondary"
                            sx={{ marginLeft: "15px" }}
                          >
                            {wordLibrary?.remark ?? "備註"}
                          </Typography>
                        </Grid>

                        <Grid item display="flex">
                          <Controller
                            control={control}
                            name={`organizationColumnList.${index}.hasValueRemark`}
                            render={({ field }) => (
                              <Switch
                                {...field}
                                checked={Boolean(field.value)}
                                onChange={(e) => {
                                  field.onChange(Number(e.target.checked));
                                  if (!e.target.checked) {
                                    setValue(
                                      `organizationColumnList.${index}.isRequiredValueRemark`,
                                      0
                                    );
                                  }
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container justifyContent="space-between">
                        <Grid item display="flex" marginY="auto">
                          <Typography
                            variant="h5"
                            color="textSecondary"
                            sx={{ marginLeft: "15px" }}
                          >
                            {wordLibrary?.["remarks required"] ?? "備註必填"}
                          </Typography>
                        </Grid>

                        <Grid item display="flex">
                          <Controller
                            control={control}
                            name={`organizationColumnList.${index}.isRequiredValueRemark`}
                            render={({ field }) => (
                              <Switch
                                {...field}
                                checked={Boolean(field.value)}
                                onChange={(e) => {
                                  field.onChange(Number(e.target.checked));
                                  if (e.target.checked) {
                                    setValue(
                                      `organizationColumnList.${index}.hasValueRemark`,
                                      1
                                    );
                                  }
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid
                        container
                        justifyContent="space-around"
                        alignItems="center"
                      >
                        <Typography>填答需選擇</Typography>
                        <Grid item display="flex">
                          <Controller
                            control={control}
                            name={`organizationColumnList.${index}.minOptionBeSelected`}
                            render={({ field }) => (
                              <TextField
                                value={
                                  minValue ? Number(field.value) : undefined
                                }
                                type="number"
                                error={minMaxError || orgOptionMinError}
                                onChange={(e) => {
                                  field.onChange(e);
                                }}
                                required={false}
                                helperText={
                                  minMaxError || orgOptionMinError
                                    ? minErrorMessage
                                    : wordLibrary?.[
                                        "the minimum number of options that can be selected"
                                      ] ?? "請輸入必選的最小選項數"
                                }
                                label="最小值"
                                sx={{ color: "text.primary", width: "150px" }}
                              />
                            )}
                          />
                        </Grid>
                        <Typography>~</Typography>
                        <Grid item display="flex">
                          <Controller
                            control={control}
                            name={`organizationColumnList.${index}.maxOptionBeSelected`}
                            render={({ field }) => (
                              <TextField
                                value={
                                  maxValue ? Number(field.value) : undefined
                                }
                                type="number"
                                error={minMaxError || orgOptionMaxError}
                                onChange={(e) => {
                                  field.onChange(e);
                                }}
                                required={false}
                                helperText={
                                  minMaxError || orgOptionMaxError
                                    ? maxErrorMessage
                                    : wordLibrary?.[
                                        "the maximum number of options that can be selected"
                                      ] ?? "請輸入可選的最大選項數"
                                }
                                label="最大值"
                                sx={{ color: "text.primary", width: "150px" }}
                              />
                            )}
                          />
                        </Grid>
                        <Typography>個選項</Typography>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography
                        variant="h5"
                        sx={{ fontSize: "20px" }}
                        color="textSecondary"
                      >
                        {wordLibrary?.["option settings"] ?? "選項設定"}
                      </Typography>
                      <DndProvider backend={HTML5Backend}>
                        <DynamicColumnOptionFieldArray
                          index={index}
                          columnId={column?.columnId}
                        />
                      </DndProvider>
                    </Grid>
                  </>
                )}
                {columnType === ColumnType.CHOICE_ONE && (
                  <>
                    <Grid item xs={12}>
                      <Grid container justifyContent="space-between">
                        <Grid item display="flex" marginY="auto">
                          <Typography
                            variant="h5"
                            color="textSecondary"
                            sx={{ marginLeft: "15px" }}
                          >
                            {wordLibrary?.remark ?? "備註"}
                          </Typography>
                        </Grid>

                        <Grid item display="flex">
                          <Controller
                            control={control}
                            name={`organizationColumnList.${index}.hasValueRemark`}
                            render={({ field }) => (
                              <Switch
                                {...field}
                                checked={Boolean(field.value)}
                                onChange={(e) => {
                                  field.onChange(Number(e.target.checked));
                                  if (!e.target.checked) {
                                    setValue(
                                      `organizationColumnList.${index}.isRequiredValueRemark`,
                                      0
                                    );
                                  }
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container justifyContent="space-between">
                        <Grid item display="flex" marginY="auto">
                          <Typography
                            variant="h5"
                            color="textSecondary"
                            sx={{ marginLeft: "15px" }}
                          >
                            {wordLibrary?.["remarks required"] ?? "備註必填"}
                          </Typography>
                        </Grid>

                        <Grid item display="flex">
                          <Controller
                            control={control}
                            name={`organizationColumnList.${index}.isRequiredValueRemark`}
                            render={({ field }) => (
                              <Switch
                                {...field}
                                checked={Boolean(field.value)}
                                onChange={(e) => {
                                  field.onChange(Number(e.target.checked));
                                  if (e.target.checked) {
                                    setValue(
                                      `organizationColumnList.${index}.hasValueRemark`,
                                      1
                                    );
                                  }
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container justifyContent="space-between">
                        <Grid item display="flex" marginY="auto">
                          <Typography
                            variant="h5"
                            color="textSecondary"
                            sx={{ marginLeft: "15px" }}
                          >
                            {wordLibrary?.[
                              "is there another field to fill in"
                            ] ?? "有下一個要填寫的欄位嗎"}
                          </Typography>
                        </Grid>

                        <Grid item display="flex">
                          <Controller
                            control={control}
                            name={`organizationColumnList.${index}.hasNextColumn`}
                            render={({ field }) => {
                              setNextSettings(Boolean(field.value));
                              return (
                                <Switch
                                  {...field}
                                  checked={Boolean(field.value)}
                                  onChange={(e) => {
                                    field.onChange(Number(e.target.checked));
                                    if (e.target.checked) {
                                      setValue(
                                        `organizationColumnList.${index}.isRelatedServiceModule`,
                                        0
                                      );
                                      setOptSettings(false);
                                      setNextSettings(true);
                                    } else setNextSettings(false);
                                  }}
                                />
                              );
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography
                        variant="h5"
                        sx={{ fontSize: "20px" }}
                        color="textSecondary"
                      >
                        {wordLibrary?.["option settings"] ?? "選項設定"}
                      </Typography>
                      <DndProvider backend={HTML5Backend}>
                        <DynamicColumnOptionFieldArray
                          index={index}
                          columnId={column?.columnId}
                          nextSettings={nextSettings}
                          organizationId={organizationId}
                          groupId={groupId}
                        />
                      </DndProvider>
                    </Grid>
                  </>
                )}
                {columnType === ColumnType.CHOICE_ONE_DROPDOWN && (
                  <>
                    <Grid item xs={12}>
                      <Grid container justifyContent="space-between">
                        <Grid item display="flex" marginY="auto">
                          <Typography
                            variant="h5"
                            color="textSecondary"
                            sx={{ marginLeft: "15px" }}
                          >
                            {wordLibrary?.remark ?? "備註"}
                          </Typography>
                        </Grid>

                        <Grid item display="flex">
                          <Controller
                            control={control}
                            name={`organizationColumnList.${index}.hasValueRemark`}
                            render={({ field }) => (
                              <Switch
                                {...field}
                                checked={Boolean(field.value)}
                                onChange={(e) => {
                                  field.onChange(Number(e.target.checked));
                                  if (!e.target.checked) {
                                    setValue(
                                      `organizationColumnList.${index}.isRequiredValueRemark`,
                                      0
                                    );
                                  }
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container justifyContent="space-between">
                        <Grid item display="flex" marginY="auto">
                          <Typography
                            variant="h5"
                            color="textSecondary"
                            sx={{ marginLeft: "15px" }}
                          >
                            {wordLibrary?.["remarks required"] ?? "備註必填"}
                          </Typography>
                        </Grid>

                        <Grid item display="flex">
                          <Controller
                            control={control}
                            name={`organizationColumnList.${index}.isRequiredValueRemark`}
                            render={({ field }) => (
                              <Switch
                                {...field}
                                checked={Boolean(field.value)}
                                onChange={(e) => {
                                  field.onChange(Number(e.target.checked));
                                  if (e.target.checked) {
                                    setValue(
                                      `organizationColumnList.${index}.hasValueRemark`,
                                      1
                                    );
                                  }
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container justifyContent="space-between">
                        <Grid item display="flex" marginY="auto">
                          <Typography
                            variant="h5"
                            color="textSecondary"
                            sx={{ marginLeft: "15px" }}
                          >
                            {wordLibrary?.["is it related data"] ??
                              "是否關聯資料?"}
                          </Typography>
                        </Grid>

                        <Grid item display="flex">
                          <Controller
                            control={control}
                            name={`organizationColumnList.${index}.isRelatedServiceModule`}
                            render={({ field }) => (
                              <Switch
                                {...field}
                                checked={Boolean(field.value)}
                                onChange={(e) => {
                                  field.onChange(Number(e.target.checked));
                                  if (e.target.checked) {
                                    setValue(
                                      `organizationColumnList.${index}.isRequired`,
                                      0
                                    );
                                    setValue(
                                      `organizationColumnList.${index}.hasNextColumn`,
                                      0
                                    );
                                    setNextSettings(false);
                                  }
                                  setOptSettings(!optSettings);
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container justifyContent="space-between">
                        <Grid item display="flex" marginY="auto">
                          <Typography
                            variant="h5"
                            color="textSecondary"
                            sx={{ marginLeft: "15px" }}
                          >
                            {wordLibrary?.[
                              "is there another field to fill in"
                            ] ?? "有下一個要填寫的欄位嗎"}
                          </Typography>
                        </Grid>

                        <Grid item display="flex">
                          <Controller
                            control={control}
                            name={`organizationColumnList.${index}.hasNextColumn`}
                            render={({ field }) => {
                              setNextSettings(Boolean(field.value));
                              return (
                                <Switch
                                  {...field}
                                  checked={Boolean(field.value)}
                                  onChange={(e) => {
                                    field.onChange(Number(e.target.checked));
                                    if (e.target.checked) {
                                      setValue(
                                        `organizationColumnList.${index}.isRelatedServiceModule`,
                                        0
                                      );
                                      setOptSettings(false);
                                      setNextSettings(true);
                                    } else setNextSettings(false);
                                  }}
                                />
                              );
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    {optSettings && (
                      <Grid item xs={12}>
                        <Controller
                          control={control}
                          name={`organizationColumnList.${index}.columnRelatedServiceModuleValue`}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label={
                                wordLibrary?.["related data"] ?? "關聯資料"
                              }
                              select
                              fullWidth
                            >
                              <MenuItem
                                value={ColumnRelatedServiceModuleValue.CRM_User}
                              >
                                {
                                  ColumnRelatedServiceModuleValueMap[
                                    ColumnRelatedServiceModuleValue.CRM_User
                                  ]
                                }
                              </MenuItem>
                              <MenuItem
                                value={
                                  ColumnRelatedServiceModuleValue.CRM_Partner
                                }
                              >
                                {
                                  ColumnRelatedServiceModuleValueMap[
                                    ColumnRelatedServiceModuleValue.CRM_Partner
                                  ]
                                }
                              </MenuItem>
                              <MenuItem
                                value={
                                  ColumnRelatedServiceModuleValue.HRM_Member
                                }
                              >
                                {
                                  ColumnRelatedServiceModuleValueMap[
                                    ColumnRelatedServiceModuleValue.HRM_Member
                                  ]
                                }
                              </MenuItem>
                              <MenuItem
                                value={ColumnRelatedServiceModuleValue.Event}
                              >
                                {
                                  ColumnRelatedServiceModuleValueMap[
                                    ColumnRelatedServiceModuleValue.Event
                                  ]
                                }
                              </MenuItem>
                              <MenuItem
                                value={ColumnRelatedServiceModuleValue.Bulletin}
                              >
                                {
                                  ColumnRelatedServiceModuleValueMap[
                                    ColumnRelatedServiceModuleValue.Bulletin
                                  ]
                                }
                              </MenuItem>
                              <MenuItem
                                value={ColumnRelatedServiceModuleValue.Article}
                              >
                                {
                                  ColumnRelatedServiceModuleValueMap[
                                    ColumnRelatedServiceModuleValue.Article
                                  ]
                                }
                              </MenuItem>
                            </TextField>
                          )}
                        />
                      </Grid>
                    )}
                    {!optSettings && (
                      <Grid item xs={12}>
                        <Typography
                          variant="h5"
                          sx={{ fontSize: "20px" }}
                          color="textSecondary"
                        >
                          {wordLibrary?.["option settings"] ?? "選項設定"}
                        </Typography>
                        <DndProvider backend={HTML5Backend}>
                          <DynamicColumnOptionFieldArray
                            index={index}
                            columnId={column?.columnId}
                            nextSettings={nextSettings}
                            organizationId={organizationId}
                            groupId={groupId}
                          />
                        </DndProvider>
                      </Grid>
                    )}
                  </>
                )}
                {columnType === ColumnType.TEXT_MULTI && (
                  <>
                    <Grid item xs={12}>
                      <Grid container justifyContent="space-between">
                        <Grid item display="flex" marginY="auto">
                          <Typography
                            variant="h5"
                            color="textSecondary"
                            sx={{ marginLeft: "15px" }}
                          >
                            {wordLibrary?.["set as editor"] ?? "設定為編輯器"}
                          </Typography>
                        </Grid>

                        <Grid item display="flex">
                          <Controller
                            control={control}
                            name={`organizationColumnList.${index}.isEditor`}
                            render={({ field }) => (
                              <Switch
                                {...field}
                                checked={Boolean(field.value)}
                                onChange={(e) => {
                                  field.onChange(Number(e.target.checked));
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    {Boolean(isEditor) && (
                      <>
                        <Controller
                          control={control}
                          name={`organizationColumnList.${index}.columnEditorTemplateContent`}
                          render={({ field }) => (
                            <FroalaEditor
                              filePathType={ServiceModuleValue.CMS}
                              model={field.value}
                              onModelChange={(model) => {
                                field.onChange(model);
                              }}
                              config={{
                                toolbarSticky: true,
                                heightMin: 300,
                                placeholderText: "預設內容",
                                quickInsertEnabled: false,
                                imageOutputSize: false,
                              }}
                            />
                          )}
                        />
                      </>
                    )}
                  </>
                )}
                {columnType === ColumnType.NUMBER && (
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} marginBottom={2}>
                        <Typography
                          variant="h5"
                          color="textSecondary"
                          sx={{ marginLeft: "15px", fontSize: "20px" }}
                        >
                          {wordLibrary?.["number settings"] ?? "數字設定"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container justifyContent="space-between">
                          <Grid item xs={5}>
                            <Grid container>
                              <Grid item xs={12}>
                                <Typography
                                  variant="h5"
                                  color="textSecondary"
                                  sx={{ marginLeft: "15px" }}
                                >
                                  {wordLibrary?.["minimum value"] ?? "最小值"}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Controller
                                  control={control}
                                  name={`organizationColumnList.${index}.columnNumberMin`}
                                  render={({ field }) => (
                                    <TextField {...field} />
                                  )}
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item xs={5}>
                            <Grid container>
                              <Grid item xs={12}>
                                <Typography
                                  variant="h5"
                                  color="textSecondary"
                                  sx={{ marginLeft: "15px" }}
                                >
                                  {wordLibrary?.["maximum value"] ?? "最大值"}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Controller
                                  control={control}
                                  name={`organizationColumnList.${index}.columnNumberMax`}
                                  render={({ field }) => (
                                    <TextField {...field} />
                                  )}
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container justifyContent="space-between">
                          <Grid item xs={5}>
                            <Grid container>
                              <Grid item xs={12}>
                                <Typography
                                  variant="h5"
                                  color="textSecondary"
                                  sx={{ marginLeft: "15px" }}
                                >
                                  {wordLibrary?.["allow decimal places"] ??
                                    "允許小數點第幾位"}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Controller
                                  control={control}
                                  name={`organizationColumnList.${index}.columnNumberOfDecimal`}
                                  render={({ field }) => (
                                    <TextField {...field} select fullWidth>
                                      <MenuItem value={1}>1</MenuItem>
                                      <MenuItem value={2}>2</MenuItem>
                                      <MenuItem value={3}>3</MenuItem>
                                    </TextField>
                                  )}
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item xs={5}>
                            <Grid container>
                              <Grid item xs={12}>
                                <Typography
                                  variant="h5"
                                  color="textSecondary"
                                  sx={{ marginLeft: "15px" }}
                                >
                                  {wordLibrary?.organization ?? "單位"}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Controller
                                  control={control}
                                  name={`organizationColumnList.${index}.columnNumberUnit`}
                                  render={({ field }) => (
                                    <TextField {...field} />
                                  )}
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
                {columnType === ColumnType.TEXT && (
                  <>
                    <Grid item xs={12}>
                      <Grid container justifyContent="space-between">
                        <Grid item display="flex" marginY="auto">
                          <Typography
                            variant="h5"
                            color="textSecondary"
                            sx={{ marginLeft: "15px" }}
                          >
                            {wordLibrary?.["unique value"] ?? "唯一值"}
                          </Typography>
                        </Grid>

                        <Grid item display="flex">
                          <Controller
                            control={control}
                            name={`organizationColumnList.${index}.isUniqueValue`}
                            render={({ field }) => (
                              <Switch
                                {...field}
                                checked={Boolean(field.value)}
                                onChange={(e) => {
                                  field.onChange(Number(e.target.checked));
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container justifyContent="space-between">
                        <Grid item display="flex" marginY="auto">
                          <Typography
                            variant="h5"
                            color="textSecondary"
                            sx={{ marginLeft: "15px" }}
                          >
                            {wordLibrary?.["validate format"] ?? "驗證格式"}
                          </Typography>
                        </Grid>

                        <Grid item display="flex">
                          <Controller
                            control={control}
                            name={`organizationColumnList.${index}.hasValidator`}
                            render={({ field }) => (
                              <Switch
                                {...field}
                                checked={Boolean(field.value)}
                                onChange={(e) => {
                                  field.onChange(Number(e.target.checked));
                                  if (e.target.checked) {
                                    setTimeout(() => {
                                      (
                                        document.querySelector(
                                          `input[name="organizationColumnList.${index}.columnValidatorRegex"]`
                                        ) as HTMLInputElement | null
                                      )?.focus();
                                    }, 100);
                                  }
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    {Boolean(hasValidator) && (
                      <>
                        <Grid item xs={12}>
                          <Typography
                            variant="h5"
                            sx={{ ml: "15px" }}
                            color="textSecondary"
                          >
                            {wordLibrary?.format ?? "格式"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Controller
                            control={control}
                            name={`organizationColumnList.${index}.columnValidatorRegex`}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                placeholder={
                                  wordLibrary?.[
                                    "please enter a regex pattern"
                                  ] ?? "請輸入regex格式"
                                }
                              />
                            )}
                          />
                        </Grid>
                      </>
                    )}
                  </>
                )}
                <Grid item xs={12}>
                  <Grid container justifyContent="space-between">
                    <Grid item display="flex" marginY="auto">
                      <Typography
                        variant="h5"
                        color="textSecondary"
                        sx={{ marginLeft: "15px" }}
                      >
                        {wordLibrary?.isCommentEnabled ??
                          "是否開放針對欄位的留言?"}
                      </Typography>
                    </Grid>
                    <Grid item display="flex">
                      <Controller
                        control={control}
                        name={`organizationColumnList.${index}.isCommentEnabled`}
                        render={({ field }) => (
                          <Switch
                            {...field}
                            checked={String(field.value) === "TRUE"}
                            onChange={(e) => {
                              field.onChange(
                                e.target.checked ? "TRUE" : "FALSE"
                              );
                              if (e.target.checked) {
                                setValue(
                                  `organizationColumnList.${index}.isCommentEnabled`,
                                  "TRUE"
                                );
                              } else {
                                setValue(
                                  `organizationColumnList.${index}.isCommentEnabled`,
                                  "FALSE"
                                );
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </React.Fragment>
            );
          })}
        </Grid>
      </Form>
    </FormProvider>
  );
};

export default DynamicColumnsForm;
