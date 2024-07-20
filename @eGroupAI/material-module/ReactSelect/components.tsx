import React from "react";
import clsx from "clsx";
import { components } from "react-select";
import { Fade, Typography, TextField, Chip, MenuItem } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import { egPalette } from "@eGroupAI/material/stylesheet/themeOptions";

const NoOptionsMessage = (props: any) => {
  const { innerProps, children, selectProps } = props;
  return (
    <Typography
      color="textSecondary"
      className={selectProps.classes.noOptionsMessage}
      {...innerProps}
    >
      {children}
    </Typography>
  );
};

const inputComponent = (props: any) => {
  const { inputRef, ...other } = props;
  return <div ref={inputRef} {...other} />;
};

const Control = (props: any) => {
  const { selectProps, isFocused, hasValue, innerRef, innerProps, children } =
    props;
  const { InputLabelProps, InputProps, inputProps, variant, ...other } =
    selectProps.MuiTextFieldProps || {};
  const { inputValue } = selectProps;
  const { isMulti } = props;
  const isFilled = variant === "filled";
  const isOutlined = variant === "outlined";
  const isStandard = !isFilled && !isOutlined;
  return (
    <TextField
      InputLabelProps={{
        shrink: isFocused || hasValue || inputValue !== "",
        ...InputLabelProps,
      }}
      InputProps={{
        inputComponent,
        ...InputProps,
        className: clsx(
          selectProps.classes.input,
          {
            [selectProps.classes.single]: !isMulti,
          },
          {
            [selectProps.classes.multi]: isMulti,
          },
          {
            [selectProps.classes.multiStandard]: isMulti && isStandard,
          },
          {
            [selectProps.classes.multiFilled]: isMulti && isFilled,
          },
          {
            [selectProps.classes.multiOutlined]: isMulti && isOutlined,
          }
        ),
        inputRef: innerRef,
        children,
        ...inputProps,
        ...innerProps,
      }}
      variant={variant}
      {...other}
    />
  );
};

const Option = (props: any) => {
  const { innerRef, isFocused, isSelected, innerProps, children } = props;
  return (
    <MenuItem
      buttonRef={innerRef}
      selected={isFocused}
      component="div"
      sx={{
        fontSize: "15px",
        fontWeight: isSelected ? 500 : 400,
        width: "-webkit-fill-available",
        padding: "5px 15px",
        "&.Mui-selected, &.Mui-selected:hover": {
          backgroundColor: egPalette.text[6],
        },
      }}
      {...innerProps}
    >
      <Typography
        sx={{
          width: "100%",
          whiteSpace: "nowrap",
          overflowX: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {children}
      </Typography>
    </MenuItem>
  );
};

const Placeholder = (props: any) => {
  const { children, selectProps, isFocused, innerProps } = props;
  if (children === "Select...") return null;
  const hasLabel =
    selectProps.MuiTextFieldProps && selectProps.MuiTextFieldProps.label;
  return (
    <Fade in={isFocused || !hasLabel}>
      <Typography
        color="textSecondary"
        className={selectProps.classes.placeholder}
        {...innerProps}
      >
        {children}
      </Typography>
    </Fade>
  );
};

const ValueContainer = (props: any) => {
  const { children, selectProps } = props;
  return <div className={selectProps.classes.valueContainer}>{children}</div>;
};

const SingleValue = (props: any) => {
  const { selectProps, innerProps, children } = props;
  return (
    <Typography className={selectProps.classes.singleValue} {...innerProps}>
      {children}
    </Typography>
  );
};

const MultiValue = (props: any) => {
  const { selectProps, removeProps, children } = props;
  const { variant } = selectProps.MuiTextFieldProps || {};
  const { isFocused } = props;
  const isFilled = variant === "filled";
  return (
    <Chip
      {...selectProps.ChipProps}
      tabIndex={-1}
      label={children}
      size="small"
      className={clsx(selectProps.classes.chip, {
        [selectProps.classes.chipFocused]: isFocused,
      })}
      color={isFilled ? "primary" : undefined}
      onDelete={removeProps.onClick}
      deleteIcon={<CancelIcon fontSize="small" {...removeProps} />}
    />
  );
};

const ClearIndicator = (props: any) => {
  const { selectProps, ...others } = props;
  return (
    components.ClearIndicator && (
      <components.ClearIndicator
        className={selectProps.classes.indicator}
        {...others}
      />
    )
  );
};
const DropdownIndicator = (props: any) => {
  const { selectProps, ...others } = props;
  return (
    components.DropdownIndicator && (
      <components.DropdownIndicator
        className={selectProps.classes.indicator}
        {...others}
      />
    )
  );
};
const IndicatorSeparator = (props: any) => {
  const { selectProps } = props;

  return <span className={selectProps.classes.separator} />;
};
export default {
  Control,
  ClearIndicator,
  DropdownIndicator,
  IndicatorSeparator,
  NoOptionsMessage,
  Option,
  Placeholder,
  ValueContainer,
  SingleValue,
  MultiValue,
};
