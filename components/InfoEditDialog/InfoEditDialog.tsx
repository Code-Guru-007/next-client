import React, { FC, useState, useEffect, useRef } from "react";
import { isEqual } from "lodash";

import { ColumnType } from "@eGroupAI/typings/apis";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { makeStyles } from "@mui/styles";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";

import Button from "@eGroupAI/material/Button";
import FormControl from "@eGroupAI/material/FormControl";
import FormGroup from "@eGroupAI/material/FormGroup";
import RadioGroup from "@eGroupAI/material/RadioGroup";
import Box from "@eGroupAI/material/Box";
import Grid from "@eGroupAI/material/Grid";
import Dialog from "@eGroupAI/material/Dialog";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { DynamicValueType, NextColumnValues } from "interfaces/form";

import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import DynamicFormControlRadio from "components/DynamicField/DynamicFormControlRadio";
import DynamicFormControlCheckbox from "components/DynamicField/DynamicFormControlCheckbox";
import ChoiceOneDropdown from "components/DynamicField/ChoiceOneDropdown";
import { DynamicColumnTarget, OrgColumnRelatedData } from "interfaces/entities";
import DynamicField from "components/DynamicField/DynamicField";
import { DIALOG as OUTSIDE_CLICK_DIALOG } from "components/ConfirmOutsideClickDialog";

export const DIALOG = "InfoEditDialog";

export type RemarkValue = {
  organizationOptionId: string;
  organizationOptionName: string;
  columnTargetValueRemark?: string;
};

export type OptionType = {
  optionId: string;
  label: string;
  value: string;
  nextColumnId?: string;
};

export interface InfoEditDialogProps {
  name: string;
  type: ColumnType;
  value?: string;
  label?: string;
  options?: OptionType[];
  columnTargetValueList?: RemarkValue[];
  onConfirm?: (
    name: string,
    value?: DynamicValueType,
    remarkValues?: RemarkValue[],
    nextColumnValue?: NextColumnValues,
    nextColumnRemarkValues?: { [nextColumnId: string]: RemarkValue[] },
    columnTargetValueList?: RemarkValue[],
    nextColumnTargetValueList?: { [nextColumnId: string]: RemarkValue[] }
  ) => void | Promise<void | string>;
  writable?: boolean;
  hasRemark?: boolean;
  requiredRemark?: boolean;
  required?: boolean;
  remarkList?: RemarkValue[];
  isRelatedServiceModule?: boolean;
  columnRelatedServiceModuleValue?: string;
  hasNextColumn?: boolean;
  nextColumnTargets?: DynamicColumnTarget[];
  dynamicOptions?: {
    [name: string]: OptionType[] | undefined;
  };
  defaultNextColumnTarget?: DynamicColumnTarget;
  columnTargetRelatedTargetId?: string;
  selectedDropdownOption?: OrgColumnRelatedData | null;
  minOptionBeSelected?: number;
  maxOptionBeSelected?: number;
}

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
  btnResetOptions: {
    padding: "16px 0 0 16px",
  },
}));

const INFOEDITFORM = "InfoEditForm";

const InfoEditDialog: FC<InfoEditDialogProps> = function (props) {
  const {
    name,
    type,
    value: oldV,
    label,
    options,
    columnTargetValueList: columnTargetValueListProp,
    onConfirm,
    writable = true,
    hasRemark = false,
    requiredRemark = false,
    required = false,
    remarkList,
    isRelatedServiceModule = false,
    columnRelatedServiceModuleValue,
    columnTargetRelatedTargetId,
    hasNextColumn,
    nextColumnTargets,
    dynamicOptions,
    defaultNextColumnTarget,
    selectedDropdownOption,
    minOptionBeSelected = 0,
    maxOptionBeSelected = 0,
  } = props;

  const theme = useTheme();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG + name);
  const oldValue = oldV?.toString();

  const classes = useStyles();
  const [value, setValue] = useState<string | undefined>(
    oldValue?.toString() as string
  );
  const [columnTargetValueList, setColumnTargetValueList] = useState<
    RemarkValue[]
  >(columnTargetValueListProp || []);

  const [targetId, setTargetId] = useState<string | undefined>(
    isRelatedServiceModule ? columnTargetRelatedTargetId : undefined
  );
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [remarkValues, setRemarkValues] = useState<RemarkValue[]>(
    remarkList || []
  );
  const [remarkError, setRemarkError] = useState<string>("");
  const wordLibrary = useSelector(getWordLibrary);

  const submitRef = useRef<HTMLInputElement>(null);

  const [disableCheckbutton, setDisableCheckbutton] = useState<boolean>(false);
  const [checkedNum, setCheckedNum] = useState<number>(0);
  const [disableSaveButton, setDisableSaveButton] = useState<boolean>(false);

  useEffect(() => {
    if (minOptionBeSelected !== 0 && checkedNum < minOptionBeSelected) {
      setDisableCheckbutton(false);
      setDisableSaveButton(true);
    } else if (maxOptionBeSelected !== 0 && checkedNum >= maxOptionBeSelected) {
      setDisableCheckbutton(true);
      setDisableSaveButton(false);
    } else {
      setDisableCheckbutton(false);
      setDisableSaveButton(false);
    }
  }, [checkedNum, maxOptionBeSelected, minOptionBeSelected]);

  const {
    openDialog: openConfirmDialog,
    closeDialog: closeConfirmDialog,
    setDialogStates: setConfirmDialogStates,
    isOpen: isConfirmDialogOpen,
  } = useReduxDialog(OUTSIDE_CLICK_DIALOG);

  useEffect(() => {
    if (isOpen) setValue(oldValue as string);
  }, [oldValue, isOpen]);

  useEffect(() => {
    if (columnTargetValueListProp)
      setColumnTargetValueList(columnTargetValueListProp || []);
  }, [columnTargetValueListProp]);

  useEffect(() => {
    setCheckedValues((oldValue as string).split(",") || []);
  }, [isOpen, oldValue]);

  useEffect(() => {
    setCheckedNum(checkedValues.length);
  }, [checkedValues]);

  useEffect(() => {
    if (isRelatedServiceModule) return;
    const values: string[] = [];
    const columnTargetValueIds: string[] = [];
    options?.forEach(({ optionId, value }) => {
      if (checkedValues.includes(value)) {
        values.push(value);
        columnTargetValueIds.push(optionId);
      }
    });
    const v = values?.join(",");
    setValue(v);

    setColumnTargetValueList((prevList) => {
      const newList: RemarkValue[] = [];
      columnTargetValueIds.forEach((id) => {
        const prevValue = prevList?.find((v) => v.organizationOptionId === id);
        if (prevValue) {
          newList.push(prevValue);
        } else {
          newList.push({
            organizationOptionId: id,
            organizationOptionName: options?.find((o) => o.optionId === id)
              ?.value as string,
            columnTargetValueRemark: remarkList?.find(
              (r) => r.organizationOptionId === id
            )?.columnTargetValueRemark,
          });
        }
      });
      return newList;
    });
  }, [checkedValues, options, remarkList, isRelatedServiceModule]);

  useEffect(() => {
    setRemarkValues(remarkList || []);
    setColumnTargetValueList(remarkList || []);
  }, [remarkList]);

  // ... next column variable setting ...
  const [nextColumnTarget, setNextColumnTarget] = useState<
    DynamicColumnTarget | undefined
  >(defaultNextColumnTarget);

  const [nextColumnValue, setNextColumnValue] = useState<
    string | number | undefined
  >(nextColumnTarget?.columnTargetValue);

  const [nextColumnRemarkValues, setNextColumnRemarkValues] = useState<
    RemarkValue[]
  >(nextColumnTarget?.columnTargetValueRemarkList || []);
  const [nextColumnTargetValueList, setNextColumnTargetValueList] = useState<
    RemarkValue[]
  >(nextColumnTarget?.columnTargetValueRemarkList || []);

  const [nextColumnRemarkError, setNextColumnRemarkError] = useState<{
    [colId: string]: string | undefined;
  }>({});

  useEffect(() => {
    setNextColumnValue(nextColumnTarget?.columnTargetValue);
  }, [nextColumnTarget?.columnTargetValue]);

  useEffect(() => {
    setNextColumnRemarkValues(
      (nextColumnTarget?.columnTargetValueRemarkList as RemarkValue[]) || []
    );
    setNextColumnTargetValueList(
      (nextColumnTarget?.columnTargetValueList as RemarkValue[]) || []
    );
  }, [nextColumnTarget]);

  const handleReset = () => {
    setValue(undefined);
    setNextColumnTarget(undefined);
    setRemarkValues(remarkList || []);
    setColumnTargetValueList(columnTargetValueListProp || []);
    setNextColumnRemarkValues([]);
    setNextColumnTargetValueList([]);
  };

  const handleValidate = () => {
    let isValid = true;
    if (
      !!value &&
      requiredRemark &&
      remarkValues.filter((r) => r.columnTargetValueRemark).length !==
        value.split(",").length
    ) {
      const errorMessage =
        wordLibrary?.["this field is required"] ?? "此為必填欄位。";
      setRemarkError(errorMessage || ""); // 使用預設值或空字串
      isValid = false;
    }

    if (
      nextColumnTarget &&
      !!nextColumnValue &&
      nextColumnTarget.organizationColumn.isRequiredValueRemark &&
      nextColumnRemarkValues.filter((r) => r.columnTargetValueRemark).length !==
        (nextColumnValue as string).split(",").length
    ) {
      const errorMessage =
        wordLibrary?.["this field is required"] ?? "此為必填欄位。";
      setNextColumnRemarkError({
        [nextColumnTarget.organizationColumn.columnId]: errorMessage,
      }); // 使用預設值或空字串
      isValid = false;
    }

    if (submitRef.current) submitRef.current.click();
    return isValid;
  };

  const handleConfirm = async () => {
    if (
      onConfirm &&
      (value !== oldValue ||
        !isEqual(remarkList, remarkValues) ||
        !isEqual(defaultNextColumnTarget, {
          ...nextColumnTarget,
          columnTargetValue: nextColumnValue,
        }) ||
        !isEqual(
          defaultNextColumnTarget?.columnTargetValueRemarkList,
          nextColumnRemarkValues
        ))
    ) {
      setLoading(true);
      const values = {
        value,
        targetId,
      };

      const nextColumnValueParam = nextColumnTarget
        ? {
            [nextColumnTarget.organizationColumn.columnId]: nextColumnValue,
          }
        : undefined;
      const otherNextColumnValues = nextColumnTargets
        ?.filter(
          (nColTarget) =>
            nColTarget.organizationColumn.columnId !==
            nextColumnTarget?.organizationColumn.columnId
        )
        ?.reduce(
          (a, col) => ({
            ...a,
            [col.organizationColumn.columnId]: col.columnTargetValue,
          }),
          {}
        );

      const nextColumnValuesParam = {
        ...nextColumnValueParam,
        ...otherNextColumnValues,
      };

      const nextColumnRemarkValuesParam = nextColumnTarget
        ? {
            [nextColumnTarget.organizationColumn.columnId]:
              nextColumnRemarkValues,
          }
        : undefined;

      const nextColumnTargetValueListParam = nextColumnTarget
        ? {
            [nextColumnTarget.organizationColumn.columnId]:
              nextColumnTargetValueList,
          }
        : undefined;

      const result = await onConfirm(
        name,
        values,
        remarkValues,
        nextColumnValuesParam,
        nextColumnRemarkValuesParam,
        columnTargetValueList,
        nextColumnTargetValueListParam
      );
      if (result === "success") {
        closeDialog();
        handleReset();
      }
      setLoading(false);
      closeConfirmDialog();
      return;
    }
    closeDialog();
    handleReset();
    setLoading(false);
    closeConfirmDialog();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleConfirm();
  };

  const handleChangeRemarkValue = (optionId, optionName, value) => {
    setRemarkError("");
    if (
      type === ColumnType.CHOICE_ONE ||
      type === ColumnType.CHOICE_ONE_DROPDOWN
    ) {
      setRemarkValues([
        {
          organizationOptionId: optionId,
          columnTargetValueRemark: value,
          organizationOptionName: optionName,
        },
      ]);
      setColumnTargetValueList([
        {
          organizationOptionId: optionId,
          organizationOptionName: optionName,
          columnTargetValueRemark: value ?? undefined,
        },
      ]);
    }
    if (type === ColumnType.CHOICE_MULTI) {
      const idx = remarkValues.findIndex(
        (el) => el?.organizationOptionId === optionId
      );

      if (idx === -1) {
        if (value) {
          setRemarkValues([
            ...remarkValues,
            {
              organizationOptionId: optionId,
              columnTargetValueRemark: value,
              organizationOptionName: optionName,
            },
          ]);
        }
      } else {
        const newRemarkValues = [...remarkValues];
        if (value) {
          newRemarkValues[idx] = {
            organizationOptionId: optionId,
            columnTargetValueRemark: value,
            organizationOptionName: optionName,
          };
          setRemarkValues(newRemarkValues);
        } else {
          newRemarkValues.splice(idx, 1);
          setRemarkValues(newRemarkValues);
        }
      }

      const idxOfValueList = columnTargetValueList.findIndex(
        (el) => el?.organizationOptionId === optionId
      );
      if (idxOfValueList === -1) {
        setColumnTargetValueList([
          ...columnTargetValueList,
          {
            organizationOptionId: optionId,
            organizationOptionName: optionName,
            columnTargetValueRemark: value ?? undefined,
          },
        ]);
      } else {
        const newColumnTargetValueList = [...columnTargetValueList];
        newColumnTargetValueList[idxOfValueList] = {
          organizationOptionId: optionId,
          organizationOptionName: optionName,
          columnTargetValueRemark: value ?? undefined,
        };
        setColumnTargetValueList(newColumnTargetValueList);
      }
    }
  };

  const handleChangeNextColumnRemarkValue = (
    type,
    _,
    optionId,
    optionName,
    value
  ) => {
    if (nextColumnTarget)
      setNextColumnRemarkError({
        [nextColumnTarget.organizationColumn.columnId]: "",
      });
    if (
      type === ColumnType.CHOICE_ONE ||
      type === ColumnType.CHOICE_ONE_DROPDOWN
    ) {
      setNextColumnRemarkValues([
        {
          organizationOptionId: optionId,
          columnTargetValueRemark: value,
          organizationOptionName: optionName,
        },
      ]);
      setNextColumnTargetValueList([
        {
          organizationOptionId: optionId,
          organizationOptionName: optionName,
          columnTargetValueRemark: value ?? undefined,
        },
      ]);
    }
    if (type === ColumnType.CHOICE_MULTI) {
      const idx = nextColumnRemarkValues.findIndex(
        (el) => el?.organizationOptionId === optionId
      );

      if (idx === -1) {
        if (value) {
          setNextColumnRemarkValues([
            ...nextColumnRemarkValues,
            {
              organizationOptionId: optionId,
              columnTargetValueRemark: value,
              organizationOptionName: optionName,
            },
          ]);
        }
      } else {
        const newRemarkValues = [...nextColumnRemarkValues];
        if (value) {
          newRemarkValues[idx] = {
            organizationOptionId: optionId,
            columnTargetValueRemark: value,
            organizationOptionName: optionName,
          };
          setNextColumnRemarkValues(newRemarkValues);
        } else {
          newRemarkValues.splice(idx, 1);
          setNextColumnRemarkValues(newRemarkValues);
        }
      }

      const idxOfValueList = nextColumnTargetValueList.findIndex(
        (el) => el?.organizationOptionId === optionId
      );
      if (idxOfValueList === -1) {
        setNextColumnTargetValueList([
          ...nextColumnTargetValueList,
          {
            organizationOptionId: optionId,
            organizationOptionName: optionName,
            columnTargetValueRemark: value ?? undefined,
          },
        ]);
      } else {
        const newNextColumnTargetValueList = [...nextColumnTargetValueList];
        newNextColumnTargetValueList[idxOfValueList] = {
          organizationOptionId: optionId,
          organizationOptionName: optionName,
          columnTargetValueRemark: value ?? undefined,
        };
        setNextColumnTargetValueList(newNextColumnTargetValueList);
      }
    }
  };

  const handleNextFieldChange = (columnId, value) => {
    setNextColumnValue(value ? value.value : undefined);
  };

  const handleOutsideClick = () => {
    openConfirmDialog({
      primary: "您想儲存變更嗎？",
      isLoading: loading,
      onConfirm: () => {
        setConfirmDialogStates({ isLoading: true });
        if (handleValidate()) {
          handleConfirm();
        }
      },
      onClose: () => {
        closeConfirmDialog();
      },
    });
  };

  useEffect(() => {
    if (isOpen) {
      setNextColumnTarget(defaultNextColumnTarget);
      setNextColumnValue(defaultNextColumnTarget?.columnTargetValue);
    }
  }, [defaultNextColumnTarget, isOpen]);

  const renderContent = () => {
    switch (type) {
      case ColumnType.CHOICE_ONE:
        return (
          <FormControl sx={{ paddingTop: 2 }}>
            <RadioGroup
              row
              value={value || ""}
              onChange={(e) => {
                setValue(e.target.value);
                setColumnTargetValueList([
                  {
                    organizationOptionId:
                      options?.find((o) => o.value === e.target.value)
                        ?.optionId || "",
                    organizationOptionName:
                      options?.find((o) => o.value === e.target.value)?.label ||
                      "",
                  },
                ]);
                setNextColumnTarget(
                  nextColumnTargets?.find(
                    (next) =>
                      next.organizationColumn.columnId ===
                      options?.find((o) => o.value === e.target.value)
                        ?.nextColumnId
                  )
                );
              }}
            >
              <Grid container spacing={2}>
                {options?.map((el) => (
                  <DynamicFormControlRadio
                    targetValue={value || ""}
                    key={el.label}
                    name={el.optionId}
                    value={el.value}
                    label={el.label}
                    hasRemark={hasRemark}
                    requiredRemark={requiredRemark}
                    handleRemarkChange={(name, value) => {
                      handleChangeRemarkValue(name, el.label, value);
                    }}
                    required={!value ? required : false}
                    defaultRemark={
                      remarkList?.find(
                        (remark) => remark?.organizationOptionId === el.optionId
                      )?.columnTargetValueRemark
                    }
                    remarkError={remarkError}
                  />
                ))}

                <Button
                  disabled={!writable}
                  onClick={handleReset}
                  className={classes.btnResetOptions}
                >
                  {wordLibrary?.["clear selected items"] ?? "清除選取的項目"}
                </Button>
              </Grid>
            </RadioGroup>

            {nextColumnTarget && dynamicOptions && (
              <Grid
                item
                xs={12}
                key={name}
                sx={{ "& .MuiTypography-root": { padding: "6px 0px" } }}
              >
                <Box style={{ padding: "10px 0 0 30px" }}>
                  <DynamicField
                    value={nextColumnValue}
                    errorState={
                      nextColumnRemarkError[
                        nextColumnTarget.organizationColumn.columnId
                      ]
                    }
                    handleChange={handleNextFieldChange}
                    name={nextColumnTarget.organizationColumn.columnId}
                    type={nextColumnTarget.organizationColumn.columnType}
                    label={nextColumnTarget.organizationColumn.columnName}
                    fullWidth
                    options={
                      dynamicOptions[
                        nextColumnTarget.organizationColumn.columnId
                      ]
                    }
                    isEditor={
                      nextColumnTarget.organizationColumn.isEditor === 1
                    }
                    editorTemplateContent={
                      nextColumnTarget.organizationColumn
                        .columnEditorTemplateContent
                    }
                    min={nextColumnTarget.organizationColumn.columnNumberMin}
                    max={nextColumnTarget.organizationColumn.columnNumberMax}
                    hasValidator={
                      nextColumnTarget.organizationColumn.hasValidator === 1
                    }
                    validator={
                      nextColumnTarget.organizationColumn.columnValidatorRegex
                    }
                    hasRemark={
                      nextColumnTarget.organizationColumn.hasValueRemark === 1
                    }
                    requiredRemark={
                      nextColumnTarget.organizationColumn
                        .isRequiredValueRemark === 1
                    }
                    remarkList={nextColumnTarget.columnTargetValueRemarkList}
                    required={
                      nextColumnTarget.organizationColumn.isRequired === 1
                    }
                    numberUnit={
                      nextColumnTarget.organizationColumn.columnNumberUnit
                    }
                    numberDecimal={
                      nextColumnTarget.organizationColumn.columnNumberOfDecimal
                    }
                    isRelatedServiceModule={Boolean(
                      nextColumnTarget.organizationColumn.isRelatedServiceModule
                    )}
                    columnRelatedServiceModuleValue={
                      nextColumnTarget.organizationColumn
                        .columnRelatedServiceModuleValue
                    }
                    hasNextColumn={
                      nextColumnTarget.organizationColumn.hasNextColumn === 1
                    }
                    handleChangeRemark={handleChangeNextColumnRemarkValue}
                  />
                </Box>
              </Grid>
            )}
          </FormControl>
        );

      case ColumnType.CHOICE_MULTI:
        return (
          <FormControl sx={{ paddingTop: 2 }}>
            <FormGroup row>
              <Grid container spacing={2}>
                {options?.map(
                  (el, index) =>
                    el.label &&
                    el.value && (
                      <DynamicFormControlCheckbox
                        targetValue={value || ""}
                        required={required && index === 0 && value === ""}
                        name={el.optionId}
                        key={el.label}
                        checked={checkedValues.includes(el.value)}
                        value={el.value}
                        label={el.label}
                        disable={
                          !checkedValues.includes(el.value) &&
                          disableCheckbutton
                        }
                        handleChange={(checked, value) => {
                          let next = [...checkedValues];
                          if (!checkedValues.includes(value) && checked) {
                            next.push(value);
                          } else if (!checked) {
                            next = next.filter((v) => v !== value);
                          }
                          setCheckedValues(next.filter((v) => v !== ""));
                        }}
                        hasRemark={hasRemark}
                        requiredRemark={requiredRemark}
                        handleRemarkChange={(name, v) => {
                          handleChangeRemarkValue(name, el.label, v);
                        }}
                        defaultRemark={
                          remarkList?.find(
                            (remark) =>
                              remark?.organizationOptionId === el.optionId
                          )?.columnTargetValueRemark
                        }
                        remarkError={remarkError}
                      />
                    )
                )}
              </Grid>
            </FormGroup>
          </FormControl>
        );

      case ColumnType.CHOICE_ONE_DROPDOWN:
        return (
          <Box paddingTop={2}>
            <ChoiceOneDropdown
              name={name}
              columnTargetRelatedTargetId={columnTargetRelatedTargetId}
              selectedDropdownOption={selectedDropdownOption}
              value={value as string}
              label={label}
              options={options}
              hasRemark={hasRemark}
              requiredRemark={requiredRemark}
              handleChange={(_, newValue, relatedTargetOption) => {
                setValue(newValue?.value);
                setColumnTargetValueList([
                  {
                    organizationOptionId: isRelatedServiceModule
                      ? relatedTargetOption?.targetId || ""
                      : options?.find((o) => o.value === newValue?.value)
                          ?.optionId || "",
                    organizationOptionName: isRelatedServiceModule
                      ? relatedTargetOption?.targetInformationList?.join(
                          ", "
                        ) || ""
                      : options?.find((o) => o.value === newValue?.value)
                          ?.label || "",
                  },
                ]);
                setTargetId(newValue?.targetId);
              }}
              handleRemarkChange={(_, optionId, optionName, value) => {
                handleChangeRemarkValue(optionId, optionName, value);
              }}
              remarkError={remarkError}
              remarkList={remarkList}
              required={required}
              isRelatedServiceModule={isRelatedServiceModule}
              columnRelatedServiceModuleValue={columnRelatedServiceModuleValue}
              hasNextColumn={hasNextColumn}
              nextColumnTargets={nextColumnTargets}
              setNextColumnTarget={setNextColumnTarget}
            />

            {nextColumnTarget && dynamicOptions && (
              <Grid
                item
                xs={12}
                key={name}
                sx={{ "& .MuiTypography-root": { padding: "6px 0px" } }}
              >
                <Box style={{ padding: "10px 0 0 30px" }}>
                  <DynamicField
                    value={nextColumnValue}
                    errorState={
                      nextColumnRemarkError[
                        nextColumnTarget.organizationColumn.columnId
                      ]
                    }
                    handleChange={handleNextFieldChange}
                    name={nextColumnTarget.organizationColumn.columnId}
                    type={nextColumnTarget.organizationColumn.columnType}
                    label={nextColumnTarget.organizationColumn.columnName}
                    fullWidth
                    options={
                      dynamicOptions[
                        nextColumnTarget.organizationColumn.columnId
                      ]
                    }
                    isEditor={
                      nextColumnTarget.organizationColumn.isEditor === 1
                    }
                    editorTemplateContent={
                      nextColumnTarget.organizationColumn
                        .columnEditorTemplateContent
                    }
                    min={nextColumnTarget.organizationColumn.columnNumberMin}
                    max={nextColumnTarget.organizationColumn.columnNumberMax}
                    hasValidator={
                      nextColumnTarget.organizationColumn.hasValidator === 1
                    }
                    validator={
                      nextColumnTarget.organizationColumn.columnValidatorRegex
                    }
                    hasRemark={
                      nextColumnTarget.organizationColumn.hasValueRemark === 1
                    }
                    requiredRemark={
                      nextColumnTarget.organizationColumn
                        .isRequiredValueRemark === 1
                    }
                    remarkList={nextColumnTarget.columnTargetValueRemarkList}
                    required={
                      nextColumnTarget.organizationColumn.isRequired === 1
                    }
                    numberUnit={
                      nextColumnTarget.organizationColumn.columnNumberUnit
                    }
                    numberDecimal={
                      nextColumnTarget.organizationColumn.columnNumberOfDecimal
                    }
                    isRelatedServiceModule={Boolean(
                      nextColumnTarget.organizationColumn.isRelatedServiceModule
                    )}
                    columnRelatedServiceModuleValue={
                      nextColumnTarget.organizationColumn
                        .columnRelatedServiceModuleValue
                    }
                    hasNextColumn={
                      nextColumnTarget.organizationColumn.hasNextColumn === 1
                    }
                    handleChangeRemark={handleChangeNextColumnRemarkValue}
                  />
                </Box>
              </Grid>
            )}
          </Box>
        );
      default:
        break;
    }
    return undefined;
  };

  return (
    <Dialog
      open={isOpen && !isConfirmDialogOpen}
      onClose={() => {
        handleOutsideClick();
        closeDialog();
      }}
      maxWidth="md"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={closeDialog}>
        {label}
        {required ? <span style={{ color: "red" }}> *</span> : ""}
      </DialogTitle>
      <DialogContent sx={{ paddingTop: "10px" }}>
        <form onSubmit={handleSubmit} id={INFOEDITFORM}>
          <Grid item xs={12}>
            {renderContent()}
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <DialogCloseButton onClick={closeDialog} />
        <DialogConfirmButton
          loading={loading}
          disabled={!writable || loading || disableSaveButton}
          type="button"
          onClick={() => {
            handleValidate();
          }}
        >
          {wordLibrary?.save ?? "儲存"}
        </DialogConfirmButton>
        <input
          ref={submitRef}
          type="submit"
          form={INFOEDITFORM}
          style={{ display: "none" }}
        />
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(InfoEditDialog);
