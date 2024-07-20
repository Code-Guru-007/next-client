import React, { FC, useEffect, useRef, useState, SetStateAction } from "react";

import makeStyles from "@mui/styles/makeStyles";
import useControlled from "@eGroupAI/hooks/useControlled";
import clsx from "clsx";
import { useSelector } from "react-redux";

import Typography from "@eGroupAI/material/Typography";
import CheckboxWithLabel from "@eGroupAI/material/CheckboxWithLabel";
import Button, { ButtonProps } from "@eGroupAI/material/Button";
import { TextField, Autocomplete } from "@mui/material";
import EnhancePopover from "@eGroupAI/material/EnhancePopover";
import styled from "@mui/styles/styled";
import IconButton from "@eGroupAI/material/IconButton";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { format, toDate, DateVariant } from "@eGroupAI/utils/dateUtils";
import NewDateRangePicker from "@eGroupAI/material-lab/NewDateRangePicker";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import StyledSlider from "./StyledSlider";
import StyledPopper from "./StyledPopper";
import { Item, Option, Value } from "./types";
import { optionToValueType, optionsToValue } from "./utils";

const useStyles = makeStyles((theme) => ({
  popover: {
    "& .MuiEnhancePopover-paper": {
      maxHeight: "calc(100vh - 335px)",
      maxWidth: 550,
      minWidth: 300,
      paddingBottom: 65.5,
    },
    "& .MuiEnhancePopover-container": {
      display: "flex",
      maxHeight: "calc(100vh - 400px)",
      flexDirection: "column",
    },
  },
  enhancePopoverFullHeight: {
    "& .MuiEnhancePopover-paper": {
      maxHeight: "calc(100vh - 335px)",
    },
  },
  header: {
    padding: "30px 30px 12px 24px",
    position: "relative",
    lineHeight: "50px",
  },
  closeIcon: {
    position: "absolute",
    color: theme.palette.grey[300],
    top: 16,
    right: 16,
    "&:hover": {
      backgroundColor: theme.palette.grey[600],
    },
    "& .MuiSvgIcon-root": {
      fontWeight: 900,
    },
  },
  container: {
    display: "flex",
    flexDirection: "column",
    padding: "3px 24px 35px",
    maxHeight: "calc(100vh - 490px)",
    overflowY: "auto",
    minWidth: "10rem",
    maxWidth: "100%",
    gap: theme.spacing(1),
    [theme.breakpoints.down("md")]: {
      width: "100%",
      alignItems: "center",
    },
  },
  actions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "flex-end",
    padding: "12px 32px 13px",
    background: theme.palette.common.white,
  },
  item: {
    width: "100%",
    padding: "18px 0px 0px 0px",
  },
  optionContent: {
    display: "flex",
    flexWrap: "wrap",
    width: "100%",
    padding: "10px 0px 0px 0px",
    margin: 0,
    gap: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      width: "300px",
    },
  },
  vertical: {
    flexDirection: "column",
  },
  numberRange: {
    padding: theme.spacing(0, 1),
    width: "100%",
  },
  multiText: {
    paddingTop: theme.spacing(1),
    width: "100%",
  },
  checkbox: {
    "&.MuiFormControlLabel-root": {
      margin: 0,
    },
    "& .MuiTypography-root": {
      color: theme.palette.grey[100],
    },
    "& span.MuiCheckbox-root": {
      padding: "2px",
      marginLeft: "-4px",
      marginRight: "4px",
    },
  },
  textfield: {},
}));

export interface FilterDropDownProps
  extends Omit<
    ButtonProps,
    "onChange" | "onSubmit" | "value" | "defaultValue"
  > {
  options: Option[];
  defaultRangeNumberMinValue?: number | null;
  defaultRangeNumberMaxValue?: number | null;
  value?: Value;
  savedValue?: Value;
  defaultValue?: Value;
  onChange?: (value: Value) => void;
  onSubmit?: (value: Value) => void;
  onClear?: (e: React.MouseEvent<HTMLButtonElement>, value: Value) => void;
  onSave?: (value: Value) => void;
  onCancel?: (value: Value) => void;
}

const StyledButton = styled(Button)(() => ({
  display: "flex",
  justifyContent: "space-between",
  minWidth: 138,
}));

const FilterDropDown: FC<FilterDropDownProps> = (props) => {
  const classes = useStyles();
  const {
    onClick,
    options,
    defaultRangeNumberMinValue = null,
    defaultRangeNumberMaxValue = null,
    value: valueProp,
    savedValue: savedValueProp,
    defaultValue,
    onChange,
    onSubmit,
    onClear,
    onSave,
    onCancel,
    ...other
  } = props;

  const btnRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useControlled({
    controlled: valueProp
      ? optionsToValue(
          options,
          defaultRangeNumberMinValue,
          defaultRangeNumberMaxValue,
          valueProp
        )
      : undefined,
    default: optionsToValue(
      options,
      defaultRangeNumberMinValue,
      defaultRangeNumberMaxValue,
      defaultValue
    ),
  });
  const [savedValue, setSavedValue] = useState(value);

  const wordLibrary = useSelector(getWordLibrary);
  const paperEl = useRef<HTMLDivElement>(null);
  const containerEl = useRef<HTMLDivElement>(null);
  const [shouldFullHeight, setShouldFullHeight] = useState(false);

  useEffect(() => {
    setSavedValue(savedValueProp as SetStateAction<Value>);
  }, [savedValueProp]);

  useEffect(() => {
    if (isOpen && containerEl.current && paperEl.current) {
      setShouldFullHeight(
        containerEl.current.scrollHeight > paperEl.current.offsetHeight
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    setValue(savedValue);
    if (onCancel) onCancel(savedValue);
    setIsOpen(false);
  };

  const renderOptionContent = (option: Option) => {
    const { type, filterId, items } = option;
    const fieldValue =
      value[filterId] ||
      optionToValueType(
        option,
        defaultRangeNumberMinValue,
        defaultRangeNumberMaxValue
      );

    switch (type) {
      case "CHOICEMULTI":
        return items?.map((item) => (
          <CheckboxWithLabel
            className={classes.checkbox}
            key={item.value}
            label={item.label}
            value={item.value}
            checked={(fieldValue as string[]).includes(item.value)}
            MuiCheckboxProps={{
              color: "primary",
              onChange: (e, checked) => {
                const prevCheckboxValues = fieldValue as string[];
                let nextCheckboxValues: string[] = [];
                if (checked) {
                  nextCheckboxValues = [...prevCheckboxValues, e.target.value];
                } else {
                  nextCheckboxValues = prevCheckboxValues.filter(
                    (el) => el !== e.target.value
                  );
                }
                const next = {
                  ...value,
                  [filterId]: nextCheckboxValues,
                };
                if (onChange) {
                  onChange(next);
                }
                setValue(next);
              },
            }}
          />
        ));
      case "DATETIME_RANGE":
        return (
          <NewDateRangePicker
            showTime
            value={{
              startDate: toDate(fieldValue[0] as DateVariant),
              endDate: toDate(fieldValue[1] as DateVariant),
            }}
            defaultStartDate={toDate(fieldValue[0] as DateVariant) as Date}
            defaultStartTime={format(fieldValue[0] as DateVariant, "hh:mm aaa")}
            defaultEndDate={toDate(fieldValue[1] as DateVariant) as Date}
            defaultEndTime={format(fieldValue[0] as DateVariant, "hh:mm aaa")}
            variant="standard"
            size="small"
            onChange={(dateRange) => {
              if (
                typeof dateRange[0] === "object" &&
                typeof dateRange[1] === "object"
              ) {
                const next = {
                  ...value,
                  [filterId]: [
                    format(dateRange[0], "yyyy-MM-dd hh:mm") as string,
                    format(dateRange[1], "yyyy-MM-dd hh:mm") as string,
                  ],
                };
                if (onChange) {
                  onChange(next);
                }
                setValue(next);
              }
            }}
          />
        );
      case "DATE_RANGE":
        return (
          <NewDateRangePicker
            value={{
              startDate: toDate(fieldValue[0] as DateVariant),
              endDate: toDate(fieldValue[1] as DateVariant),
            }}
            defaultStartDate={toDate(fieldValue[0] as DateVariant) as Date}
            defaultEndDate={toDate(fieldValue[1] as DateVariant) as Date}
            variant="standard"
            size="small"
            onChange={(dateRange) => {
              if (
                typeof dateRange[0] === "object" &&
                typeof dateRange[1] === "object"
              ) {
                const next = {
                  ...value,
                  [filterId]: [
                    format(dateRange[0], "yyyy-MM-dd") as string,
                    format(dateRange[1], "yyyy-MM-dd") as string,
                  ],
                };
                if (onChange) {
                  onChange(next);
                }
                setValue(next);
              }
            }}
          />
        );
      case "NUMBER_RANGE": {
        if (!items) return undefined;
        const min = Number(items[0]?.value);
        const max = Number(items[1]?.value);
        return (
          <div className={classes.numberRange}>
            <StyledSlider
              value={fieldValue as number[]}
              min={min}
              max={max}
              onChange={(_, newValue) => {
                const next = {
                  ...value,
                  [filterId]: newValue as number[],
                };
                if (onChange) {
                  onChange(next);
                }
                setValue(next);
              }}
              valueLabelDisplay="auto"
            />
            <TextField
              label={items[0]?.label}
              value={fieldValue[0]}
              variant="standard"
              inputProps={{
                min,
              }}
              onChange={(e) => {
                const from = Number(e.target.value);
                const to = fieldValue[1] as number;
                if (from >= min && to <= max) {
                  const next = {
                    ...value,
                    [filterId]: [from, to],
                  };
                  if (onChange) {
                    onChange(next);
                  }
                  setValue(next);
                }
              }}
              type="number"
            />
            <TextField
              label={items[1]?.label}
              value={fieldValue[1]}
              variant="standard"
              inputProps={{
                max,
              }}
              onChange={(e) => {
                const from = fieldValue[0] as number;
                const to = Number(e.target.value);
                if (from >= min && to <= max) {
                  const next = {
                    ...value,
                    [filterId]: [from, to],
                  };
                  if (onChange) {
                    onChange(next);
                  }
                  setValue(next);
                }
              }}
              type="number"
            />
          </div>
        );
      }
      case "CHOICEMULTI_TEXT": {
        if (!items) {
          return <Typography>查無選項資料</Typography>;
        }
        return (
          <div className={classes.multiText}>
            <Autocomplete
              options={items}
              multiple
              disableCloseOnSelect
              PopperComponent={StyledPopper}
              isOptionEqualToValue={(option, value) =>
                option.value === value.value
              }
              value={fieldValue as Item[]}
              getOptionLabel={(option) => option.label || ""}
              noOptionsText="查無選項資料"
              renderInput={(params) => (
                <TextField
                  variant="outlined"
                  {...params}
                  fullWidth
                  size="small"
                />
              )}
              onChange={(e, v) => {
                const next = {
                  ...value,
                  [filterId]: v,
                };
                if (onChange) {
                  onChange(next);
                }
                setValue(next);
              }}
            />
          </div>
        );
      }
      default:
        return undefined;
    }
  };

  return (
    <>
      <StyledButton
        ref={btnRef}
        onClick={(e) => {
          if (onClick) {
            onClick(e);
          }
          setIsOpen(true);
        }}
        {...other}
      />
      <EnhancePopover
        open={isOpen}
        anchorEl={btnRef.current}
        onCloseClick={handleClose}
        onClickAway={(e) => {
          if (!btnRef.current?.contains(e.target as Node)) {
            handleClose();
          }
        }}
        PaperProps={{
          ref: paperEl,
        }}
        className={clsx(classes.popover, {
          [classes.enhancePopoverFullHeight]: shouldFullHeight,
        })}
      >
        <div className={classes.header}>
          <Typography fontWeight={500} variant="h4" color="text">
            {other.children}
          </Typography>
          <IconButton
            color="white"
            size="small"
            onClick={handleClose}
            className={classes.closeIcon}
          >
            <CloseRoundedIcon />
          </IconButton>
        </div>
        <div ref={containerEl} className={classes.container}>
          {options.map((option) => (
            <div key={option.filterId} className={classes.item}>
              <Typography
                gutterBottom
                fontWeight={400}
                variant="body1"
                color="text"
              >
                {option.filterName}
              </Typography>
              <div
                className={clsx(
                  classes.optionContent,
                  options.length === 1 && classes.vertical
                )}
              >
                {renderOptionContent(option)}
              </div>
            </div>
          ))}
        </div>
        <div className={classes.actions}>
          <Button
            color="grey"
            variant="contained"
            rounded
            onClick={() => {
              handleClose();
            }}
            sx={{ mr: 1 }}
          >
            {wordLibrary?.close ?? "關閉"}
          </Button>
          <Button
            color="error"
            variant="contained"
            rounded
            onClick={(e) => {
              if (onClear) onClear(e, defaultValue as Value);
            }}
            sx={{ mr: 1 }}
          >
            {wordLibrary?.clear ?? "清除"}
          </Button>
          <Button
            color="primary"
            variant="contained"
            rounded
            onClick={() => {
              setSavedValue(value);
              if (onSubmit) onSubmit(value);
              if (onSave) onSave(value);
              setIsOpen(false);
            }}
          >
            {wordLibrary?.save ?? "儲存"}
          </Button>
        </div>
      </EnhancePopover>
    </>
  );
};

export default FilterDropDown;
