import React, { FC, useMemo, useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import isMobilePhone from "validator/lib/isMobilePhone";
import { string } from "yup";
import { ColumnType, DateRangeLimit } from "@eGroupAI/typings/apis";
import { format } from "@eGroupAI/utils/dateUtils";

import Grid from "@eGroupAI/material/Grid";
import Button from "@eGroupAI/material/Button";
import FormControl from "@eGroupAI/material/FormControl";
import Popover from "@eGroupAI/material/Popover";
import FormLabel from "@eGroupAI/material/FormLabel";
import RadioGroup from "@eGroupAI/material/RadioGroup";
import Box from "@eGroupAI/material/Box";
import Typography from "@eGroupAI/material/Typography";
import InputAdornment from "@eGroupAI/material/InputAdornment";
import { DropDown, FormGroup } from "@eGroupAI/material";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import { IconOption } from "@eGroupAI/material/DropDown";

import MuiTextField from "@mui/material/TextField";
import { IconButton } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import DatePicker from "@eGroupAI/material-lab/DatePicker";
import { makeStyles, useTheme } from "@mui/styles";
import clsx from "clsx";
import { SNACKBAR } from "components/App";
import FroalaEditor from "components/FroalaEditor";
import { OrganizationColumn } from "interfaces/entities";
import { ServiceModuleValue } from "interfaces/utils";
import { DynamicValueType } from "interfaces/form";

import apis from "utils/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import ColumnDescription from "components/ColumnDescription";
import DynamicFormControlRadio from "./DynamicFormControlRadio";
import DynamicFormControlCheckbox from "./DynamicFormControlCheckbox";
import ChoiceOneDropdown from "./ChoiceOneDropdown";
import DynamicFileDropzone from "./DynamicFileDropzone";

const useStyles = makeStyles(() => ({
  datepicker: {
    minWidth: 100,
  },
  dialogsCloseBtn: {
    borderRadius: 20,
  },
  dialogConfirmBtn: {
    borderRadius: 20,
  },
  nextField: {
    paddingLeft: 30,
    paddingTop: 10,
  },
  btnResetOptions: {
    padding: 0,
    marginTop: 10,
  },
  dropDown: {
    width: "fit-content",
    backgroundColor: "rgba(145, 158, 171, 0.08)",
  },
}));

export type MultiSelectMode =
  | "OVERWRITE_ALL"
  | "ADD_SELECTED_OPTIONS"
  | "REMOVE_SELECTED_OPTIONS";

export type Values = {
  [name: string]: string | number | null | undefined;
};

export type RemarkValues = {
  [columnId: string]: {
    organizationOptionId: string;
    organizationOptionName: string;
    columnTargetValueRemark?: string;
  }[];
};

export type RemarkValue = {
  organizationOptionId: string;
  organizationOptionName: string;
  columnTargetValueRemark?: string;
}[];

export interface DynamicFieldProps {
  descr?: string;
  value?: string | number | null | undefined;
  handleChange: (
    name: string,
    value?: DynamicValueType
  ) => void | Promise<void>;

  handleErrors?: (name: string, error?: string) => void;
  type: ColumnType;
  verifyType?: string;
  dateRangeLimit?: DateRangeLimit;
  name: string;
  format?: (val: React.ReactNode) => React.ReactNode;
  label?: string;
  labelFlag?: boolean;
  labelPadding?: "small" | "medium" | "large" | "none";
  filePath?: string;
  fileName?: string;
  options?: {
    optionId: string;
    label: string;
    value: string;
    nextColumnId?: string;
  }[];
  required?: boolean;
  isAutoFill?: boolean;
  fullWidth?: boolean;
  variant?: "standard" | "outlined";
  errorState?: string | undefined;
  isEditor?: boolean;
  editorTemplateContent?: string;
  min?: number;
  max?: number;
  hasValidator?: boolean;
  validator?: string;
  hasRemark?: boolean;
  requiredRemark?: boolean;
  numberUnit?: string;
  numberDecimal?: number;
  remarkList?: RemarkValue;
  setMultiSelectMode?: React.Dispatch<React.SetStateAction<MultiSelectMode>>;
  setColumnTargetValues?: React.Dispatch<React.SetStateAction<RemarkValues>>;
  handleChangeRemark?: (
    type: ColumnType,
    name: string,
    optionId: string,
    optionName: string,
    value?: string
  ) => void;
  isRelatedServiceModule?: boolean;
  columnRelatedServiceModuleValue?: string;
  hasNextColumn?: boolean;
  selectedNextColumnIds?: {
    [parentKey: string]: string | undefined;
  };
  setSelectedNextColumnIds?: React.Dispatch<
    React.SetStateAction<{
      [parentKey: string]: string | undefined;
    }>
  >;
  nextColumnInfo?: OrganizationColumn;
  optionsNextColumns?: OrganizationColumn[];
  preview?: boolean;
  organizationIdforShareShortUrl?: string;
  capitalize?: boolean;
  maxOptionBeSelected?: number;
  minOptionBeSelected?: number;
}

export type CheckboxArray = {
  optionId: string;
  label: string;
  value: string;
  isChecked: boolean;
}[];

const today = new Date();
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const DynamicField: FC<DynamicFieldProps> = function (props) {
  const {
    descr = "",
    value,
    handleChange,
    handleErrors,
    type,
    verifyType,
    dateRangeLimit,
    label,
    labelFlag = true,
    filePath,
    fileName,
    name,
    options,
    required,
    isAutoFill,
    fullWidth,
    variant,
    errorState,
    isEditor = false,
    min,
    max,
    editorTemplateContent,
    hasValidator = false,
    validator,
    hasRemark = false,
    remarkList,
    requiredRemark = false,
    numberUnit,
    numberDecimal,
    handleChangeRemark,
    setColumnTargetValues,
    isRelatedServiceModule,
    columnRelatedServiceModuleValue,
    hasNextColumn,
    setSelectedNextColumnIds,
    preview = false,
    organizationIdforShareShortUrl,
    capitalize,
    maxOptionBeSelected = 0,
    minOptionBeSelected = 0,
    setMultiSelectMode,
  } = props;

  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);
  const [autoFill, setAutoFill] = useState(isAutoFill);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const wordLibrary = useSelector(getWordLibrary);
  const [error, setError] = useState(errorState);
  const classes = useStyles();
  const theme = useTheme();
  const [checkboxStates, setCheckboxStates] = useState(() =>
    options
      ?.map((option) => ({
        optionId: option.optionId,
        label: option.label,
        value: option.value,
        checked: ((value as string) || "").indexOf(option.value) !== -1,
      }))
      .filter((s) => s.label && s.value)
  );

  const multipleEditOption = [
    {
      value: "OVERWRITE_ALL",
      text: wordLibrary?.overwrite_all ?? "覆蓋選項",
    },
    {
      value: "ADD_SELECTED_OPTIONS",
      text: wordLibrary?.add_selected_options ?? "新增選項",
    },
    {
      value: "REMOVE_SELECTED_OPTIONS",
      text: wordLibrary?.remove_selected_options ?? "移除選項",
    },
  ];

  const [targetValue, setTargetValue] = useState<
    string | number | null | undefined
  >(value || "");

  const [virtualFieldValue, setVirtualFieldValue] = useState<
    string | undefined
  >(editorTemplateContent || "");

  const [disableCheckbutton, setDisableCheckbutton] = useState<boolean>(false);
  const [checkedNum, setCheckedNum] = useState<number>(0);

  useEffect(() => {
    if (checkedNum === 0) {
      if (handleErrors) handleErrors(name, undefined);
    } else if (maxOptionBeSelected !== 0 && minOptionBeSelected !== 0) {
      if (checkedNum < minOptionBeSelected) {
        setDisableCheckbutton(false);
        if (handleErrors)
          handleErrors(name, `您必須至少選擇 ${minOptionBeSelected} 個選項`);
      } else if (checkedNum >= maxOptionBeSelected) {
        setDisableCheckbutton(true);
        if (handleErrors) handleErrors(name, undefined);
      } else {
        setDisableCheckbutton(false);
        if (handleErrors) handleErrors(name, undefined);
      }
    } else if (maxOptionBeSelected !== 0) {
      if (checkedNum < maxOptionBeSelected) {
        setDisableCheckbutton(false);
      } else {
        setDisableCheckbutton(true);
      }
    } else if (minOptionBeSelected !== 0) {
      if (checkedNum < minOptionBeSelected) {
        if (handleErrors)
          handleErrors(name, `您必須至少選擇 ${minOptionBeSelected} 個選擇`);
      } else if (handleErrors) handleErrors(name, undefined);
    } else setDisableCheckbutton(false);
  }, [
    checkedNum,
    maxOptionBeSelected,
    minOptionBeSelected,
    name,
    handleErrors,
  ]);

  useEffect(() => {
    setAutoFill(true);
  }, [checkboxStates]);

  useEffect(() => {
    setTargetValue(value);
  }, [value]);

  useEffect(() => {
    if (autoFill)
      setCheckboxStates(
        options
          ?.map((option) => ({
            optionId: option.optionId,
            label: option.label,
            value: option.value,
            checked: String(value).split(",").includes(option.value),
          }))
          .filter((s) => s.label && s.value)
      );
    else
      setCheckboxStates(
        options
          ?.map((option) => ({
            optionId: option.optionId,
            label: option.label,
            value: option.value,
            checked: false,
          }))
          .filter((s) => s.label && s.value)
      );
  }, [options, value, autoFill]);

  useEffect(() => {
    setError(errorState);
  }, [errorState]);

  const checkedValues = useMemo(
    () => checkboxStates?.filter((s) => s.checked).map((s) => s.value),
    [checkboxStates]
  );

  useEffect(() => {
    if (checkedValues !== undefined) {
      setCheckedNum(checkedValues.length);
    } else setCheckedNum(0);
  }, [checkedValues]);

  const labelWithHelpIcon = useMemo(
    () => (
      <>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {label}
          {descr !== undefined && descr !== "" && (
            <IconButton
              aria-label="help"
              sx={{ color: "#637381" }}
              onClick={handlePopoverOpen}
            >
              <HelpOutlineIcon sx={{ fontSize: "18px" }} />
            </IconButton>
          )}
        </Box>
        <Popover
          id="mouse-over-popover"
          sx={{
            pointerEvents: "none",
          }}
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          onClose={handlePopoverClose}
          PaperProps={{
            style: { pointerEvents: "auto" },
          }}
        >
          <ColumnDescription descr={descr} handleClose={handlePopoverClose} />
        </Popover>
      </>
    ),
    [descr, label, anchorEl, open]
  );
  const handleVerify = useCallback(
    (text: string) => {
      switch (verifyType) {
        case "MOBILE":
          if (!required && text === "") {
            setError("");
            if (handleErrors) handleErrors(name, undefined);
            return;
          }
          if (isMobilePhone(text)) {
            setError("");
            if (handleErrors) handleErrors(name, undefined);
          } else {
            setError("電話格式錯誤");
            if (handleErrors) handleErrors(name, "電話格式錯誤");
          }
          break;
        case "EMAIL":
          string()
            .email()
            .validate(text)
            .then(() => {
              setError("");
              if (handleErrors) handleErrors(name, undefined);
            })
            .catch(() => {
              setError("Email 格式錯誤");
              if (handleErrors) handleErrors(name, "Email 格式錯誤");
            });
          break;
        default:
          break;
      }
    },
    [handleErrors, name, required, verifyType]
  );

  const handleRequired = useCallback(
    (v?: string) => {
      if (!required) {
        setError("");
        if (handleErrors) handleErrors(name, undefined);
        return;
      }
      if (v) {
        setError("");
        if (handleErrors) handleErrors(name, undefined);
      } else {
        const errorMessage =
          wordLibrary?.["this field is required"] ?? "此為必填欄位。";
        document
          .getElementsByName(name)[0]
          ?.scrollIntoView({ behavior: "smooth" });

        openSnackbar({
          message: "此為必填欄位。",
          severity: "error",
        });
        setError(errorMessage || "");
        if (handleErrors) {
          handleErrors(name, errorMessage || "");
        }
      }
    },
    [handleErrors, name, required, wordLibrary, openSnackbar]
  );

  const handleValidate = useCallback(
    (v) => {
      if (hasValidator && validator) {
        const validatorString = validator.replace(/\\\\/g, "\\");
        const regEx = new RegExp(validatorString);
        if (!regEx.test(v)) {
          setError("格式錯誤");
          if (handleErrors) handleErrors(name, "格式錯誤");
        } else {
          setError("");
          if (handleErrors) handleErrors(name, undefined);
        }
      }
    },
    [handleErrors, name, validator, setError, hasValidator]
  );

  const handleRemarkChange = useCallback(
    (type, colId, optionId, optionName, remarkValue) => {
      if (handleChangeRemark)
        handleChangeRemark(type, colId, optionId, optionName, remarkValue);
    },
    [handleChangeRemark]
  );

  switch (type) {
    case ColumnType.TEXT: {
      return (
        <FormControl
          error={!!error}
          onInvalid={(e) => {
            if (required) {
              const errorMessage = wordLibrary?.required ?? "此為必填欄位。";
              setError(errorMessage || "");
              e.preventDefault();
            }
          }}
          id={`editable-text-input-${name}`}
          data-tid={`editable-text-input-${name}`}
          sx={{ mt: 1, mb: 1 }}
        >
          {labelFlag && (
            <FormLabel
              sx={{
                "&.MuiFormLabel-root.Mui-focused": {
                  color: theme.palette.text.disabled,
                },
                mb: 2,
              }}
            >
              {labelWithHelpIcon}
            </FormLabel>
          )}
          <MuiTextField
            name={name}
            value={autoFill ? targetValue : ""}
            fullWidth={fullWidth}
            variant={variant}
            onChange={(e) => {
              const v = e.target.value;
              setAutoFill(true);
              handleChange(name, { value: v });
              setTargetValue(v);
            }}
            onFocus={(e) => {
              if (e.target.value) {
                setTargetValue(e.target.value);
              }
            }}
            onBlur={(e) => {
              const v = e.target.value;
              handleRequired(v);
              handleVerify(v);
              if (v) {
                handleValidate(v);
              }
            }}
            inputProps={{
              style: {
                textTransform: capitalize ? "capitalize" : undefined,
              },
            }}
            onInvalid={() => {
              const errorMessage = wordLibrary?.required ?? "此為必填欄位。";
              setError(errorMessage || "");
            }}
            required={required}
            helperText={error}
            error={!!error}
          />
        </FormControl>
      );
    }

    case ColumnType.CHOICE_ONE:
      return (
        <>
          <FormControl
            error={!!error}
            onInvalid={() => {
              if (required) {
                const errorMessage = wordLibrary?.required ?? "此為必填欄位。";
                setError(errorMessage || "");
              }
            }}
            sx={{ mt: 1, mb: 1 }}
          >
            {labelFlag && (
              <FormLabel
                sx={{
                  "&.MuiFormLabel-root.Mui-focused": {
                    color: theme.palette.text.disabled,
                  },
                  mb: 2,
                }}
              >
                {labelWithHelpIcon}
              </FormLabel>
            )}
            <RadioGroup
              row
              value={autoFill ? targetValue : ""}
              onChange={(e) => {
                const { value } = e.target;
                setAutoFill(true);
                setTargetValue(value);
                handleRequired(value);
                handleChange(name, { value });
                if (setColumnTargetValues)
                  setColumnTargetValues((prev) => ({
                    ...prev,
                    [name]: [
                      {
                        organizationOptionId:
                          options?.find((o) => o.value === e.target.value)
                            ?.optionId || "",
                        organizationOptionName:
                          options?.find((o) => o.value === e.target.value)
                            ?.label || "",
                      },
                    ],
                  }));
                if (setSelectedNextColumnIds && value !== "") {
                  setSelectedNextColumnIds((prev) => ({
                    ...prev,
                    [name]: options?.find((o) => o.value === value)
                      ?.nextColumnId,
                  }));
                }
              }}
            >
              <Grid container spacing={2}>
                {options?.map((el) => (
                  <DynamicFormControlRadio
                    targetValue={autoFill ? (targetValue as string) : ""}
                    key={el.optionId || el.label}
                    name={name}
                    value={el.value}
                    label={el.label}
                    required={!targetValue ? required : false}
                    hasRemark={hasRemark}
                    requiredRemark={requiredRemark}
                    defaultRemark={
                      autoFill
                        ? remarkList?.find(
                            (remark) =>
                              remark?.organizationOptionId === el.optionId
                          )?.columnTargetValueRemark
                        : ""
                    }
                    handleRemarkChange={(name, value) => {
                      handleRequired(el.value);
                      handleRemarkChange(
                        ColumnType.CHOICE_ONE,
                        name,
                        el.optionId,
                        el.label,
                        value
                      );
                    }}
                    id={`${name}-choice-one-${el.optionId}`}
                    data-tid={`${name}-choice-one-${el.optionId}`}
                  />
                ))}
              </Grid>
              {targetValue && (
                <Button
                  onClick={() => {
                    setTargetValue("");
                    handleRequired(undefined);
                    handleChange(name, undefined);
                    if (setColumnTargetValues)
                      setColumnTargetValues((prev) => ({
                        ...prev,
                        [name]: [],
                      }));
                    if (setSelectedNextColumnIds)
                      setSelectedNextColumnIds((prev) => ({
                        ...prev,
                        [name]: "",
                      }));
                  }}
                  className={classes.btnResetOptions}
                  id={`${name}-btn-reset-options`}
                  data-tid={`${name}-btn-reset-options`}
                >
                  {wordLibrary?.["clear selected items"] ?? "清除選取的項目"}
                </Button>
              )}
            </RadioGroup>
          </FormControl>
        </>
      );
    case ColumnType.CHOICE_ONE_DROPDOWN:
      return (
        <>
          <ChoiceOneDropdown
            name={name}
            value={targetValue as string}
            label={labelFlag ? label : ""}
            error={error}
            options={options}
            variant={variant}
            handleVerify={handleVerify}
            handleRequired={handleRequired}
            handleChange={handleChange}
            setColumnTargetValues={setColumnTargetValues}
            handleTargetValue={setTargetValue}
            setSelectedNextColumnIds={setSelectedNextColumnIds}
            setError={setError}
            hasRemark={hasRemark}
            requiredRemark={requiredRemark}
            hasNextColumn={hasNextColumn}
            isRelatedServiceModule={isRelatedServiceModule}
            columnRelatedServiceModuleValue={columnRelatedServiceModuleValue}
            remarkList={remarkList}
            handleRemarkChange={(colId, optionId, optionName, value) => {
              handleRemarkChange(
                ColumnType.CHOICE_ONE_DROPDOWN,
                colId,
                optionId,
                optionName,
                value
              );
            }}
            required={required}
            preview={preview}
          />
        </>
      );
    case ColumnType.CHOICE_MULTI:
      return (
        <FormControl
          error={!!error}
          onInvalid={(e) => {
            if (required) {
              const errorMessage = wordLibrary?.required ?? "此為必填欄位。";
              document
                .getElementsByName(name)[0]
                ?.scrollIntoView({ behavior: "smooth" });

              openSnackbar({
                message: "此為必填欄位。",
                severity: "error",
              });
              setError(errorMessage || "");
              e.preventDefault();
            }
          }}
          sx={{ mt: 1, mb: 1 }}
        >
          <Box sx={{ display: "flex" }}>
            {labelFlag && (
              <FormLabel
                sx={{
                  "&.MuiFormLabel-root.Mui-focused": {
                    color: theme.palette.text.disabled,
                  },
                  mr: 3,
                  display: "flex",
                }}
              >
                {labelWithHelpIcon}
              </FormLabel>
            )}
            {setMultiSelectMode && (
              <DropDown
                options={multipleEditOption}
                text="Overwrite All"
                className={classes.dropDown}
                select
                onChange={(option) => {
                  if (!Array.isArray(option) && setMultiSelectMode)
                    setMultiSelectMode(
                      (option as IconOption)?.value as MultiSelectMode
                    );
                }}
              />
            )}
          </Box>
          <FormGroup row>
            <Grid container spacing={2}>
              {checkboxStates?.map((el) => (
                <DynamicFormControlCheckbox
                  data-tid={`${name}-choice-multi-${el.optionId}`}
                  key={el.optionId}
                  disable={
                    disableCheckbutton &&
                    !(autoFill ? checkedValues?.includes(el.value) : false)
                  }
                  targetValue={autoFill ? (targetValue as string) : ""}
                  name={name}
                  value={el.value as string}
                  label={el.label}
                  checked={autoFill ? checkedValues?.includes(el.value) : false}
                  required={required && checkedValues?.length === 0}
                  handleChange={(checked, newvalue) => {
                    const newStates = checkboxStates?.map((state) => ({
                      optionId: state.optionId,
                      label: state.label,
                      value: state.value,
                      checked:
                        newvalue === state.value ? checked : state.checked,
                    }));
                    setCheckboxStates(newStates);
                    const value = newStates
                      .filter((s) => s.checked)
                      .map((s) => s.value)
                      .join(",");
                    setTargetValue(value);
                    handleRequired(value);
                    handleChange(name, { value });

                    const columnTargetValueListChecked = newStates.filter(
                      (s) => s.checked
                    );
                    if (setColumnTargetValues) {
                      setColumnTargetValues((prev) => {
                        const prevColumnTargetValueList = prev[name] || [];
                        const newColumnTargetValueList: RemarkValue = [];

                        columnTargetValueListChecked.forEach((valueChecked) => {
                          const prevValue = prevColumnTargetValueList?.find(
                            (v) =>
                              v.organizationOptionId === valueChecked.optionId
                          );
                          newColumnTargetValueList.push({
                            ...prevValue,
                            organizationOptionId: valueChecked.optionId,
                            organizationOptionName: valueChecked.label,
                          });
                        });
                        return {
                          ...prev,
                          [name]: newColumnTargetValueList,
                        };
                      });
                    }
                  }}
                  hasRemark={hasRemark}
                  defaultRemark={
                    autoFill
                      ? remarkList?.find(
                          (remark) =>
                            remark?.organizationOptionId === el.optionId
                        )?.columnTargetValueRemark
                      : ""
                  }
                  requiredRemark={requiredRemark}
                  handleRemarkChange={(name, value) => {
                    handleRemarkChange(
                      ColumnType.CHOICE_MULTI,
                      name,
                      el.optionId,
                      el.label,
                      value
                    );
                  }}
                  remarkError={error}
                />
              ))}
            </Grid>
          </FormGroup>
        </FormControl>
      );
    case ColumnType.DATE:
      return (
        <FormControl
          error={!!error}
          onInvalid={() => {
            if (required) {
              const errorMessage = wordLibrary?.required ?? "此為必填欄位。";
              setError(errorMessage || "");
            }
          }}
        >
          <DatePicker
            name={name}
            className={clsx(classes.datepicker)}
            label={labelWithHelpIcon}
            hiddenLabel={!labelFlag}
            value={autoFill && targetValue ? new Date(targetValue) : null}
            onChange={(date) => {
              try {
                const v = format(date, "yyyy-MM-dd");
                setAutoFill(true);
                setTargetValue(v);
                handleRequired(v);
                handleChange(name, { value: v });
              } catch (error) {
                apis.tools.createLog({
                  function:
                    "DynamicField[columnType==='DATE']: DatePicker onChange",
                  browserDescription: window.navigator.userAgent,
                  jsonData: {
                    data: error,
                    deviceInfo: getDeviceInfo(),
                  },
                  level: "ERROR",
                });
              }
            }}
            maxDate={
              dateRangeLimit === DateRangeLimit.DISABLE_FEATURE
                ? today
                : undefined
            }
            minDate={
              dateRangeLimit === DateRangeLimit.DISABLE_PAST
                ? yesterday
                : undefined
            }
            variant={variant}
            required={required}
            error={!!error}
          />
        </FormControl>
      );
    case ColumnType.DATETIME:
      return (
        <FormControl
          error={!!error}
          onInvalid={() => {
            if (required) {
              const errorMessage = wordLibrary?.required ?? "此為必填欄位。";
              setError(errorMessage || "");
            }
          }}
        >
          <DatePicker
            name={name}
            isTime
            className={clsx(classes.datepicker)}
            label={labelWithHelpIcon}
            hiddenLabel={!labelFlag}
            value={autoFill && targetValue ? new Date(targetValue) : null}
            onChange={(date) => {
              try {
                setAutoFill(true);
                const v = date?.toISOString();
                setTargetValue(v);
                handleRequired(v);
                handleChange(name, { value: v });
              } catch (error) {
                apis.tools.createLog({
                  function:
                    "DynamicField[columnType==='DATETIME']: DatePicker onChange",
                  browserDescription: window.navigator.userAgent,
                  jsonData: {
                    data: error,
                    deviceInfo: getDeviceInfo(),
                  },
                  level: "ERROR",
                });
              }
            }}
            maxDate={
              dateRangeLimit === DateRangeLimit.DISABLE_FEATURE
                ? today
                : undefined
            }
            minDate={
              dateRangeLimit === DateRangeLimit.DISABLE_PAST
                ? yesterday
                : undefined
            }
            variant={variant}
            required={required}
            error={!!error}
          />
        </FormControl>
      );
    case ColumnType.TEXT_MULTI:
      return (
        <FormControl
          error={!!error}
          onInvalid={() => {
            if (required) {
              const errorMessage = wordLibrary?.required ?? "此為必填欄位。";
              setError(errorMessage || "");
            }
          }}
        >
          {!isEditor && (
            <MuiTextField
              id={`${name}-multi-text-input`}
              data-tid={`${name}-multi-text-input`}
              multiline
              label={labelFlag ? labelWithHelpIcon : ""}
              value={autoFill ? targetValue : ""}
              fullWidth={fullWidth}
              variant={variant}
              onChange={(e) => {
                const v = e.target.value;
                setAutoFill(true);
                setTargetValue(v);
              }}
              onBlur={(e) => {
                const v = e.target.value;
                handleRequired(v);
                handleVerify(v);
                handleChange(name, { value: v });
              }}
              onInvalid={() => {
                const errorMessage = wordLibrary?.required ?? "此為必填欄位。";
                setError(errorMessage || "");
              }}
              name={name}
              required={required}
              error={!!error}
              helperText={error}
            />
          )}
          {isEditor && (
            <>
              <Typography component="h5" color="textSecondary">
                {label}
              </Typography>
              <Box>
                <FroalaEditor
                  id={`${name}-multi-text-input`}
                  data-tid={`${name}-multi-text-input`}
                  filePathType={ServiceModuleValue.CMS}
                  model={(targetValue || editorTemplateContent) as string}
                  onModelChange={(model) => {
                    setTargetValue(model);
                    handleRequired(model);
                    handleVerify(model);
                    handleChange(name, { value: model });
                    setVirtualFieldValue(model);
                  }}
                  config={{
                    toolbarSticky: true,
                    heightMin: 300,
                    placeholderText:
                      wordLibrary?.["edit description"] ?? "編輯說明",
                    quickInsertEnabled: false,
                    imageOutputSize: false,
                  }}
                />
                {!!error && (
                  <Typography color="error" sx={{ fontSize: "12px", mt: 1 }}>
                    此為必填欄位。
                  </Typography>
                )}
                <input
                  name={name}
                  required={required}
                  value={virtualFieldValue}
                  style={{
                    position: "absolute",
                    top: "30px",
                    left: "20px",
                    maxWidth: "140px",
                    zIndex: -1,
                  }}
                />
              </Box>
            </>
          )}
        </FormControl>
      );
    case ColumnType.NUMBER:
      return (
        <FormControl
          error={!!error}
          onInvalid={() => {
            if (required) {
              const errorMessage = wordLibrary?.required ?? "此為必填欄位。";
              setError(errorMessage || "");
            }
          }}
          sx={{ mt: 1, mb: 1 }}
        >
          {labelFlag && (
            <FormLabel
              sx={{
                "&.MuiFormLabel-root.Mui-focused": {
                  color: theme.palette.text.disabled,
                },
                mb: 2,
              }}
            >
              {labelWithHelpIcon}
            </FormLabel>
          )}
          <MuiTextField
            id={`${name}-number-input`}
            data-tid={`${name}-number-input`}
            name={name}
            value={autoFill ? targetValue : ""}
            fullWidth={fullWidth}
            variant={variant}
            onChange={(e) => {
              const v = e.target.value;
              setAutoFill(true);
              setTargetValue(v);
            }}
            onBlur={(e) => {
              const v = e.target.value;
              handleRequired(v);
              handleVerify(v);
              if (numberDecimal) {
                handleChange(name, {
                  value: String(
                    Math.floor(Number(v) * 10 ** numberDecimal) /
                      10 ** numberDecimal
                  ),
                });
              } else {
                handleChange(name, { value: v });
              }
            }}
            onInvalid={() => {
              const errorMessage = wordLibrary?.required ?? "此為必填欄位。";
              setError(errorMessage || "");
            }}
            required={required}
            error={!!error}
            helperText={error}
            InputProps={{
              endAdornment: numberUnit && (
                <InputAdornment position="end">{numberUnit}</InputAdornment>
              ),
              inputProps: {
                min,
                max,
                step: "any",
              },
            }}
          />
        </FormControl>
      );
    case ColumnType.FILE:
      return (
        <FormControl
          error={!!error}
          onInvalid={() => {
            if (required && setError) setError("此為必填欄位。");
          }}
        >
          <DynamicFileDropzone
            data-tid={`${name}-file-dropzone`}
            name={name}
            label={labelFlag ? labelWithHelpIcon : ""}
            error={error}
            required={required}
            handleChange={(name, value) => {
              handleRequired(value);
              handleVerify(value || "");
              handleChange(name, { value });
            }}
            filePath={filePath}
            fileName={fileName}
            organizationIdforShareShortUrl={organizationIdforShareShortUrl}
          />
        </FormControl>
      );
    default:
      return null;
  }
};

export default React.memo(DynamicField);
