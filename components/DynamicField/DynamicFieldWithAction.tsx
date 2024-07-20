import React, { FC, useState, useCallback, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import isMobilePhone from "validator/lib/isMobilePhone";
import { string } from "yup";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";

import { ColumnType, DateRangeLimit } from "@eGroupAI/typings/apis";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import TextField from "@eGroupAI/material/TextField";
import { Typography } from "@eGroupAI/material";
import IconButton from "@mui/material/IconButton";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { makeStyles } from "@mui/styles";
import styled from "@mui/styles/styled";
import InputAdornment from "@eGroupAI/material/InputAdornment";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import InfoEditDialog, {
  DIALOG as EDIT_DIALOG,
  RemarkValue,
} from "components/InfoEditDialog";
import { OpenInNewRounded } from "@mui/icons-material";
import DatePickerWithAction from "components/DatePicker/DatePickerWithAction";
import NewDateRangePickerWithAction from "components/NewDateRangePickerWithAction";
import MultilineTextFieldWithAction from "components/MultilineTextFieldWithAction";
import UploadFileWithAction from "components/UploadFileWithAction";
import { SNACKBAR } from "components/App";
import {
  DynamicColumnTarget,
  OptionType,
  OrgColumnRelatedData,
  UploadFile,
} from "interfaces/entities";
import { DurationValueType, NextColumnValues } from "interfaces/form";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import moduleRouteMapping from "utils/moduleRouteMapping";
import { RecordTarget } from "components/InfoHistoryDialog";

const useStyles = makeStyles(() => ({
  buttonDiv: {
    width: "fit-content",
    display: "flex",
    position: "relative",
    alignItems: "center",
  },
  datepicker: {
    minWidth: 100,
  },
  withActionDatePicker: {
    padding: "4px 8px !important",
    display: "flex",
    justifyContent: "flex-start !important",
  },
}));

export type CheckboxArray = {
  label: string;
  value: string;
  isChecked: boolean;
}[];

const StyledIconHoverButton = styled(IconButton)(() => ({
  padding: "7px 8px 7px 7px",
  position: "absolute",
  right: "-30px",
  backgroundColor: "transparent",
  "&:hover": {
    filter: "none",
  },
}));

export type Values = {
  [name: string]: string | number | null | undefined;
};

export const DIALOG = "ChoiceModal";

export interface DynamicFieldWithActionProps {
  value: string[] | string | number | null | undefined;
  handleOpenEditDialog?: (
    name: string,
    columnType: ColumnType,
    value: string | number | null | undefined,
    label?: string
  ) => void;
  handleClickHistory?: (r?: RecordTarget) => void;
  handleChange: (
    name: string,
    value?: DurationValueType,
    remarkValues?: RemarkValue[],
    nextColumnValues?: NextColumnValues,
    nextColumnRemarkValues?: { [nextColumnId: string]: RemarkValue[] },
    columnTargetValueList?: RemarkValue[],
    nextColumnTargetValueList?: { [nextColumnId: string]: RemarkValue[] }
  ) => void | Promise<void | string>;
  handleErrors?: (name: string, error?: string) => void;
  verifyType?: string;
  dateRangeLimit?: DateRangeLimit;
  name: string;
  columnType: ColumnType;
  format?: (val: React.ReactNode) => React.ReactNode;
  label?: string;
  options?: OptionType[];
  required?: boolean;
  variant?: "standard" | "outlined";
  errorState?: string | undefined;
  minDate?: Date | string;
  maxDate?: Date | string;
  boldText?: boolean;
  showHistoryIcon?: boolean;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
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
  remarkList?: RemarkValue[];
  uploadFile?: UploadFile;
  isUniqueValue?: boolean;
  isRelatedServiceModule?: boolean;
  columnRelatedServiceModuleValue?: string;
  columnTargetRelatedTargetId?: string;
  hasNextColumn?: boolean;
  nextColumnTargets?: DynamicColumnTarget[];
  dynamicOptions?: {
    [name: string]: OptionType[] | undefined;
  };
  capitalize?: boolean;
  hideMultiTextBorder?: boolean;
  choiceOneDropdownPadding?: boolean;
  selectedDropdownOption?: OrgColumnRelatedData | null;
  maxOptionBeSelected?: number;
  minOptionBeSelected?: number;
  id?: string;
  testId?: string;
  width?: string;
  isEditableShow?: boolean;
}

const DynamicFieldWithAction: FC<DynamicFieldWithActionProps> = function (
  props
) {
  const classes = useStyles(props);

  const {
    value,
    handleClickHistory: handleClickHistoryProp,
    options,
    handleChange: handleChangeProp,
    handleErrors,
    verifyType,
    label,
    name,
    columnType,
    required,
    format: formatValue,
    errorState,
    showHistoryIcon = true,
    boldText = false,
    writable = false,
    readable = false,
    deletable = false,
    minDate,
    maxDate,
    isEditor = false,
    min,
    max,
    hasValidator = false,
    validator,
    hasRemark = false,
    requiredRemark = false,
    numberUnit,
    numberDecimal,
    remarkList,
    uploadFile,
    isUniqueValue = false,
    isRelatedServiceModule = false,
    columnRelatedServiceModuleValue,
    columnTargetRelatedTargetId,
    hasNextColumn,
    nextColumnTargets,
    dynamicOptions,
    capitalize,
    hideMultiTextBorder,
    choiceOneDropdownPadding,
    selectedDropdownOption,
    maxOptionBeSelected = 0,
    minOptionBeSelected = 0,
    id,
    width,
    isEditableShow,
  } = props;

  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const [error, setError] = useState(errorState);
  const [isHover, setIsHover] = useState<boolean>(false);
  const { openDialog: openEditDialog } = useReduxDialog(EDIT_DIALOG + name);
  const { openSnackbar } = useReduxSnackbar(SNACKBAR);

  const [isRemarkedValue, setIsRemarkedValue] = useState<boolean>(
    Boolean(remarkList?.length !== 0 && hasRemark)
  );

  useEffect(() => {
    if (hasRemark && remarkList) {
      setIsRemarkedValue(true);
    }
    return () => setIsRemarkedValue(false);
  }, [hasRemark, remarkList]);

  const remarkedValue = useMemo(() => {
    if (
      hasRemark &&
      isRemarkedValue &&
      remarkList &&
      (value || remarkList[0]?.organizationOptionId)
    ) {
      if (
        !isRelatedServiceModule ||
        columnType !== ColumnType.CHOICE_ONE_DROPDOWN
      ) {
        const splitedValues = String(value).split(",");
        const remarkedValue = splitedValues
          .map((optionValue) => {
            const remark = remarkList?.filter(
              (remark) => remark.organizationOptionName === optionValue
            )[0]?.columnTargetValueRemark;
            return `${optionValue}${remark ? ": " : ""}${remark || ""}`;
          })
          .join(",");
        return remarkedValue;
      }
      const remark = remarkList?.filter(
        (remark) => remark.organizationOptionName === value
      )[0]?.columnTargetValueRemark;
      return `${value}${remark ? ": " : ""}${
        remarkList[0]?.columnTargetValueRemark || ""
      }`;
    }
    return value;
  }, [
    hasRemark,
    isRemarkedValue,
    remarkList,
    value,
    isRelatedServiceModule,
    columnType,
  ]);

  let maxDateForBirth: Date | undefined;
  if (columnType === "DATE" && name === "organizationUserBirth") {
    maxDateForBirth = new Date();
  }

  const { excute: checkUniqueValue } = useAxiosApiWrapper(
    apis.org.checkUniqueValue,
    "None"
  );

  const handleValueClick = useCallback(() => {
    if (writable) {
      openEditDialog();
    }
  }, [openEditDialog, writable]);

  const handleClickHistory = useCallback(
    (e) => {
      e.stopPropagation();
      if (handleClickHistoryProp)
        handleClickHistoryProp({
          key: name,
          type: columnType,
          name: label,
          permission: { readable, writable, deletable },
        });
    },
    [
      handleClickHistoryProp,
      name,
      columnType,
      label,
      readable,
      writable,
      deletable,
    ]
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
    (v: string | undefined) => {
      if (!required) return;
      if (v) {
        setError("");
        if (handleErrors) handleErrors(name, undefined);
      } else {
        const errorMessage = wordLibrary?.required ?? "此為必填欄位。";
        setError(errorMessage || "");
        if (handleErrors) {
          handleErrors(name, errorMessage || "");
        }
      }
    },
    [handleErrors, name, required, wordLibrary]
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

  const handleUniqueCheck = useCallback(
    async (columnId, value) => {
      const resp = await checkUniqueValue({
        organizationId,
        columnId,
        columnTargetValue: value,
      });

      return resp.data;
    },
    [checkUniqueValue, organizationId]
  );

  const handleConfirm = async (name, v) => {
    if (isUniqueValue) {
      const isUniqueValue = await handleUniqueCheck(name, v);
      if (!isUniqueValue) {
        openSnackbar({
          message: "請輸入唯一值",
          severity: "error",
        });
        return "failed";
      }
    }

    if (error) {
      openSnackbar({
        message: error,
        severity: "error",
      });
      return "failed";
    }
    return handleChangeProp(name, { value: v });
  };

  const handleOpenPageRelatedTarget = () => {
    const url =
      moduleRouteMapping[
        (columnRelatedServiceModuleValue as string) || ""
      ][0] || "";
    if (url === "") return;
    if (columnRelatedServiceModuleValue && columnTargetRelatedTargetId && url)
      window.open(`${url}/${columnTargetRelatedTargetId}`, "_blank");
  };

  switch (columnType) {
    case ColumnType.TEXT:
      return (
        <TextField
          width={width}
          isEditableShow={isEditableShow}
          capitalize={capitalize}
          value={value || ""}
          onClickHistory={handleClickHistory}
          onChange={(e) => {
            const v = e.target.value;
            handleRequired(v);
            handleVerify(v);
            handleValidate(v);
          }}
          onInvalid={() => {
            const errorMessage = wordLibrary?.required ?? "此為必填欄位。";
            setError(errorMessage || "");
          }}
          required={required}
          error={!!error}
          onChangeWithAction={(v) => handleConfirm(name, v as string)}
          name={name}
          columnType={columnType}
          enableAction
          writable={writable}
          showHistoryIcon={showHistoryIcon}
          boldTextWithAction={boldText}
          id={id}
        />
      );
    case ColumnType.CHOICE_ONE:
      return (
        <div
          className={classes.buttonDiv}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          <span
            onClick={handleValueClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleValueClick();
              }
            }}
            style={{
              justifyContent: "flex-start",
              padding: 0,
              cursor: writable ? "pointer" : "default",
            }}
            role="button"
            tabIndex={0}
          >
            {remarkedValue ? (
              <Typography
                weight={boldText ? "bold" : "regular"}
                sx={{
                  minWidth: "200px",
                  minHeight: "35px",
                  textAlign: "left",
                  wordBreak: "break-word",
                  padding: "6px",
                  fontSize: 14,
                }}
              >
                {formatValue
                  ? formatValue(remarkedValue || value)
                  : remarkedValue || value || " "}
              </Typography>
            ) : (
              <Typography
                weight={boldText ? "bold" : "regular"}
                sx={{
                  minWidth: "200px",
                  minHeight: "35px",
                  textAlign: "left",
                  wordBreak: "break-word",
                  border: writable ? "1px solid gray" : "none",
                  borderRadius: "6px",
                  fontSize: 14,
                }}
              >
                {formatValue
                  ? formatValue(remarkedValue || value)
                  : remarkedValue || value || " "}
              </Typography>
            )}
          </span>
          {isHover && (
            <StyledIconHoverButton onClick={handleClickHistory}>
              <HistoryRoundedIcon fontSize="medium" />
            </StyledIconHoverButton>
          )}
          {options && (
            <InfoEditDialog
              name={name}
              type={columnType}
              value={(value as string) || ""}
              label={label}
              options={options}
              onConfirm={handleChangeProp}
              writable={writable}
              hasRemark={hasRemark}
              requiredRemark={requiredRemark}
              required={required}
              remarkList={remarkList}
              hasNextColumn={hasNextColumn}
              nextColumnTargets={nextColumnTargets}
              dynamicOptions={dynamicOptions}
              defaultNextColumnTarget={nextColumnTargets?.find(
                (next) =>
                  next.organizationColumn &&
                  next.organizationColumn.columnId ===
                    options.find((o) => o.value === value)?.nextColumnId
              )}
            />
          )}
        </div>
      );
    case ColumnType.CHOICE_MULTI:
      return (
        <div
          className={classes.buttonDiv}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          <span
            onClick={handleValueClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleValueClick();
              }
            }}
            style={{
              justifyContent: "flex-start",
              padding: 0,
              cursor: writable ? "pointer" : "default",
            }}
            role="button"
            tabIndex={0}
          >
            {remarkedValue || value ? (
              <Typography
                weight={boldText ? "bold" : "regular"}
                sx={{
                  minWidth: "200px",
                  minHeight: "35px",
                  textAlign: "left",
                  wordBreak: "break-word",
                  fontSize: 14,
                }}
              >
                {formatValue
                  ? formatValue(remarkedValue || value)
                  : remarkedValue || value || " "}
              </Typography>
            ) : (
              <Typography
                weight={boldText ? "bold" : "regular"}
                sx={{
                  minWidth: "200px",
                  minHeight: "35px",
                  textAlign: "left",
                  wordBreak: "break-word",
                  border: writable ? "1px solid gray" : "none",
                  borderRadius: "5px",
                  fontSize: 14,
                }}
              >
                {formatValue
                  ? formatValue(remarkedValue || value)
                  : remarkedValue || value || " "}
              </Typography>
            )}
          </span>
          {isHover && (
            <StyledIconHoverButton onClick={handleClickHistory}>
              <HistoryRoundedIcon fontSize="medium" />
            </StyledIconHoverButton>
          )}
          {options && (
            <InfoEditDialog
              name={name}
              type={columnType}
              value={(value as string) || ""}
              label={label}
              options={options}
              onConfirm={handleChangeProp}
              writable={writable}
              hasRemark={hasRemark}
              requiredRemark={requiredRemark}
              required={required}
              remarkList={remarkList}
              minOptionBeSelected={minOptionBeSelected}
              maxOptionBeSelected={maxOptionBeSelected}
            />
          )}
        </div>
      );
    case ColumnType.CHOICE_ONE_DROPDOWN:
      return (
        <div
          className={classes.buttonDiv}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          <span
            onClick={handleValueClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleValueClick();
              }
            }}
            style={{
              justifyContent: "flex-start",
              padding: 0,
              cursor: writable ? "pointer" : "default",
            }}
            role="button"
            tabIndex={0}
          >
            {remarkedValue || value ? (
              <Typography
                weight={boldText ? "bold" : "regular"}
                sx={{
                  minWidth: "200px",
                  minHeight: "35px",
                  textAlign: "left",
                  wordBreak: "break-word",
                  fontSize: 14,
                  padding: choiceOneDropdownPadding ? "6px" : "0px",
                }}
              >
                {formatValue
                  ? formatValue(remarkedValue || value)
                  : remarkedValue || value || " "}
              </Typography>
            ) : (
              <Typography
                weight={boldText ? "bold" : "regular"}
                sx={{
                  minWidth: "200px",
                  minHeight: "35px",
                  textAlign: "left",
                  wordBreak: "break-word",
                  border: writable ? "1px solid gray" : "none",
                  borderRadius: "5px",
                  fontSize: 14,
                }}
              >
                {formatValue
                  ? formatValue(remarkedValue || value)
                  : remarkedValue || value || " "}
              </Typography>
            )}
          </span>
          {columnTargetRelatedTargetId !== "" &&
            Boolean(columnRelatedServiceModuleValue) && (
              <IconButton onClick={handleOpenPageRelatedTarget}>
                <OpenInNewRounded fontSize="small" />
              </IconButton>
            )}
          {isHover && (
            <StyledIconHoverButton onClick={handleClickHistory}>
              <HistoryRoundedIcon fontSize="medium" />
            </StyledIconHoverButton>
          )}
          {options && (
            <InfoEditDialog
              name={name}
              type={columnType}
              value={(value as string) || ""}
              label={label}
              options={options}
              onConfirm={handleChangeProp}
              writable={writable}
              hasRemark={hasRemark}
              requiredRemark={requiredRemark}
              required={required}
              selectedDropdownOption={selectedDropdownOption}
              remarkList={remarkList}
              isRelatedServiceModule={isRelatedServiceModule}
              columnRelatedServiceModuleValue={columnRelatedServiceModuleValue}
              columnTargetRelatedTargetId={columnTargetRelatedTargetId}
              hasNextColumn={hasNextColumn}
              nextColumnTargets={nextColumnTargets}
              dynamicOptions={dynamicOptions}
              defaultNextColumnTarget={nextColumnTargets?.find(
                (next) =>
                  next.organizationColumn &&
                  next.organizationColumn.columnId ===
                    options.find((o) => o.value === value)?.nextColumnId
              )}
            />
          )}
        </div>
      );
    case ColumnType.DATE:
      return (
        <DatePickerWithAction
          value={value ? new Date(value as string) : null}
          maxDate={maxDateForBirth || maxDate}
          name={name}
          columnType={columnType}
          boldText
          showHistoryIcon={showHistoryIcon}
          format={formatValue}
          handleOnChange={handleChangeProp}
          onClickHistory={handleClickHistory}
          writable={writable}
        />
      );
    case ColumnType.DATETIME:
      return (
        <DatePickerWithAction
          value={value ? new Date(value as string) : null}
          name={name}
          columnType={columnType}
          isTime
          boldText
          showHistoryIcon={showHistoryIcon}
          format={formatValue}
          handleOnChange={handleChangeProp}
          onClickHistory={handleClickHistory}
          writable={writable}
        />
      );
    case ColumnType.DATERANGE:
      return (
        <NewDateRangePickerWithAction
          value={value as string[]}
          name={name}
          columnType={columnType}
          dateRangePickerProps={{
            minDate,
            maxDate,
          }}
          boldText
          showHistoryIcon
          handleOnChange={handleChangeProp}
          onClickHistory={handleClickHistory}
          writable={writable}
        />
      );
    case ColumnType.DATETIMERANGE:
      return (
        <NewDateRangePickerWithAction
          value={value as string[]}
          name={name}
          columnType={columnType}
          dateRangePickerProps={{
            showTime: true,
            minDate,
            maxDate,
          }}
          boldText
          showHistoryIcon
          handleOnChange={handleChangeProp}
          onClickHistory={handleClickHistory}
          writable={writable}
        />
      );
    case ColumnType.TEXT_MULTI:
      return (
        <MultilineTextFieldWithAction
          hideMultiTextBorder={hideMultiTextBorder}
          value={value as string}
          name={name}
          boldText
          handleOnChange={handleChangeProp}
          isEditor={isEditor}
          onClickHistory={handleClickHistory}
          required={required}
          writable={writable}
        />
      );
    case ColumnType.FILE:
      return (
        <UploadFileWithAction
          value={value as string}
          name={name}
          handleOnChange={handleChangeProp}
          onClickHistory={handleClickHistory}
          showHistoryIcon={showHistoryIcon}
          uploadFile={uploadFile}
          boldText={boldText}
          readable={readable}
          writable={writable}
          deletable={deletable}
        />
      );
    case ColumnType.NUMBER:
      return (
        <TextField
          onClickHistory={handleClickHistory}
          onChange={(e) => {
            const v = e.target.value;
            handleRequired(v);
            handleVerify(v);
          }}
          onInvalid={() => {
            const errorMessage = wordLibrary?.required ?? "此為必填欄位。";
            setError(errorMessage || "");
          }}
          required={required}
          error={!!error}
          numberDecimal={numberDecimal}
          onChangeWithAction={(v) =>
            handleChangeProp(name, { value: v as string })
          }
          enableAction
          name={name}
          columnType={columnType}
          value={value || ""}
          writable={writable}
          showHistoryIcon={showHistoryIcon}
          boldTextWithAction={boldText}
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
          numberUnit={numberUnit}
        />
      );
    default:
      return null;
  }
};

export default React.memo(DynamicFieldWithAction);
