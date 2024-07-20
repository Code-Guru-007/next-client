import React, { forwardRef, useState, useRef, useEffect } from "react";
import warning from "warning";
import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
  Theme,
  useTheme,
  CircularProgress,
  useMediaQuery,
  InputBaseComponentProps,
  Tooltip,
} from "@mui/material";
import { ColumnType } from "@eGroupAI/typings/apis";

import Grid from "@eGroupAI/material/Grid";
import Typography from "@eGroupAI/material/Typography";
import IconButton from "@mui/material/IconButton";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";

import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";

import makeStyles from "@mui/styles/makeStyles";
import styled from "@mui/styles/styled";
import createStyles from "@mui/styles/createStyles";
import clsx from "clsx";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { DIALOG as OUTSIDE_CLICK_DIALOG } from "components/ConfirmOutsideClickDialog";
import { Edit } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import ClickAwayListener from "@mui/material/ClickAwayListener";

const StyledIconHoverButton = styled(IconButton)(() => ({
  padding: "7px 8px 7px 7px",
  position: "absolute",
  right: "-35px",
  backgroundColor: "transparent",
  "&:hover": {
    filter: "none",
  },
}));

const StyledIconButton = styled(IconButton)(() => ({
  backgroundColor: "transparent",
  padding: "1px",
  "&:hover": {
    backgroundColor: "transparent",
  },
}));

export interface BaseTextFieldProps {
  /**
   * Set success color.
   */
  success?: boolean;
  /**
   * Set warning color.
   */
  warning?: boolean;
  /**
   * Set variant outlined rounded.
   */
  rounded?: boolean;
  /**
   * Set variant outlined shadowed.
   */
  shadowed?: boolean;
  /**
   * enable Action of TextField.
   * @default false
   */
  enableAction?: boolean;
  writable?: boolean;
  /**
   * fire callback onChangeWithAction when set value in the WithAction TextFieldProps
   */
  onChangeWithAction?: (finalValue: unknown) => void | Promise<void | string>;
  /**
   * set HelperText color to white against on blue background
   * @default false
   */
  showHistoryIcon?: boolean;
  onClickHistory?: (event: any) => void;
  helperTextWhite?: boolean;
  boldTextWithAction?: boolean;
  columnType?: ColumnType;
  /**
   * if type is number, set decimal
   */
  numberDecimal?: number;
  /**
   * if the type is number, the unit of number
   */
  numberUnit?: string;
  /**
   * TextField InputProps
   */
  InputProps?: InputBaseComponentProps["InputProps"];
  width?: string;
  isEditableShow?: boolean;
}

export interface CustomSizedMuiTextFieldProps
  extends Omit<MuiTextFieldProps, "size"> {
  /**
   * set custom sizes of TextField only for eGroup/material/TextField
   * @default medium
   */
  size?: "small" | "medium" | "large";
  capitalize?: boolean;
}

export type TextFieldProps = BaseTextFieldProps & CustomSizedMuiTextFieldProps;

const useStyles = makeStyles(
  (theme: Theme) =>
    createStyles({
      root: {},
      loader: {
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
      },
      rounded: {
        "& .MuiOutlinedInput-root": {
          borderRadius: 25,
        },
      },
      shadowed: {
        "& .MuiOutlinedInput-root": {
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[5],
        },
        "& .MuiOutlinedInput-notchedOutline": {
          border: "none",
        },
      },
      success: {
        "& .MuiFormLabel-root": {
          color: theme.palette.success.main,
        },
        "& .MuiInputBase-root": {
          color: theme.palette.success.main,
          caretColor: theme.palette.success.main,
        },
        "& .Mui-disabled": {
          color: theme.palette.success.light,
        },
        "& .MuiInput-underline:after, & .MuiInput-underline:before": {
          borderBottomColor: theme.palette.success.main,
        },
        "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
          borderBottomColor: theme.palette.success.main,
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.success.main,
        },
        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.success.main,
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
          {
            borderColor: theme.palette.success.main,
          },
      },
      warning: {
        "& .MuiFormLabel-root": {
          color: theme.palette.warning.main,
        },
        "& .MuiInputBase-root": {
          color: theme.palette.warning.main,
          caretColor: theme.palette.warning.main,
        },
        "& .Mui-disabled": {
          color: theme.palette.warning.light,
        },
        "& .MuiInput-underline:after, & .MuiInput-underline:before": {
          borderBottomColor: theme.palette.warning.main,
        },
        "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
          borderBottomColor: theme.palette.warning.main,
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.warning.main,
        },
        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.warning.main,
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
          {
            borderColor: theme.palette.warning.main,
          },
      },
      error: {
        "& .MuiFormLabel-root": {
          color: theme.palette.error.main,
        },
        "& .MuiInputBase-root": {
          color: theme.palette.error.main,
          caretColor: theme.palette.error.main,
        },
        "& .Mui-disabled": {
          color: theme.palette.error.light,
        },
        "& .MuiInput-underline:after, & .MuiInput-underline:before": {
          borderBottomColor: theme.palette.error.main,
        },
        "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
          borderBottomColor: theme.palette.error.main,
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.error.main,
        },
        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.error.main,
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
          {
            borderColor: theme.palette.error.main,
          },
        "& .MuiOutlinedInput-root.MuiInputBase-root .MuiOutlinedInput-notchedOutline":
          {
            borderColor: theme.palette.error.main,
          },
      },
      typography: {
        "&::before, &::after": {
          boxSizing: "border-box",
        },
        display: "inline-flex",
        verticalAlign: "center",
        alignItems: "center",
        position: "relative",
        border: "none",
        width: "fit-content",
        minWidth: "200px",
      },
      pointer: {
        cursor: "pointer",
      },
      inputSizer: {
        "&::before, &::after": {
          boxSizing: "border-box",
        },

        display: "inline-grid",
        verticalAlign: "top",
        alignItems: "center",
        position: "relative",
        border: "none",
        width: "auto",
        minWidth: "200px",
        maxWidth: "50vw",

        "&::after": {
          [theme.breakpoints.down("sm")]: {
            width: "200px",
          },
          gridArea: "1 / 2",
          font: "inherit",
          margin: 0,
          resize: "none",
          appearance: "none",
          border: "none",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50px",
          letterSpacing: "inherit",
          padding: "8.5px 14px 8.5px 14px",
          fontStyle: "normal",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "18px",

          content: "attr(data-value)",
          visibility: "hidden",
          whiteSpace: "pre-wrap",
        },
      },
      inputBox: {
        width: "auto",
        minWidth: "200px",
        maxWidth: "50vw",
        gridArea: "1 / 2",
        font: "inherit",
        margin: 0,
        resize: "none",
        appearance: "none",
        display: "inline-flex",
      },
      helperText: {
        color: (props: TextFieldProps) =>
          props.helperTextWhite
            ? theme.palette.grey[700]
            : theme.palette.grey[300],
        fontWeight: 400,
        fontSize: "13px",
        paddingTop: "11px",
        margin: 0,
        display: "flex",
      },
      helperTextPaddingSmall: {
        paddingLeft: "19px",
      },
      helperTextPaddingMedium: {
        paddingLeft: "30px",
      },
      helperTextPaddingLarge: {
        paddingLeft: "36px",
      },
      helperTextIconWrapper: {
        display: "flex",
        padding: "5px 0px",
        "& .MuiSvgIcon-root path": {
          width: "15px",
          height: "15px",
        },
      },
      helperTextMessageWrapper: {
        display: "flex",
        lineHeight: "20px",
        fontSize: "13px",
        boxSizing: "border-box",
        padding: "5px 0px 5px 7px",
        fontWeight: "400",
      },
      smallSize: {
        "&.MuiEgTextField-smallSize .MuiInputBase-root input": {
          fontSize: "0.9375rem",
          fontWeight: "400",
          lineHeight: "1.4275rem",
          padding: "9px 18.5px 8px 18.5px",
          borderWidth: "0.5px",
        },
        "&.MuiEgTextField-smallSize .MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-animated":
          {
            position: "absolute",
            transform: "translate(18.5px, 9px) scale(1)",
          },
        "&.MuiEgTextField-smallSize .MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-animated.Mui-focused":
          {
            position: "absolute",
            transform: "translate(14px, -9px) scale(0.75)",
          },
        "&.MuiEgTextField-smallSize .MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-animated.MuiFormLabel-filled":
          {
            position: "absolute",
            transform: "translate(14px, -9px) scale(0.75)",
          },
      },
      mediumSize: {
        "&.MuiEgTextField-mediumSize .MuiInputBase-root input": {
          fontSize: "0.9375rem",
          fontWeight: "400",
          lineHeight: "1.4375rem",
          padding: "17px 30px 16px 16.5px",
          borderWidth: "0.5px",
        },
        "&.MuiEgTextField-mediumSize .MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-animated":
          {
            position: "absolute",
            transform: "translate(16.5px, 17px) scale(1)",
          },
        "&.MuiEgTextField-mediumSize .MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-animated.Mui-focused":
          {
            position: "absolute",
            transform: "translate(14px, -9px) scale(0.75)",
          },
        "&.MuiEgTextField-mediumSize .MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-animated.MuiFormLabel-filled":
          {
            position: "absolute",
            transform: "translate(14px, -9px) scale(0.75)",
          },
      },
      largeSize: {
        "&.MuiEgTextField-largeSize .MuiInputBase-root input": {
          fontSize: "1rem",
          fontWeight: "400",
          lineHeight: "1.5rem",
          padding: "23px 36px 21px 36px",
          borderWidth: "0.5px",
        },
        "&.MuiEgTextField-largeSize .MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-animated":
          {
            position: "absolute",
            transform: "translate(36px, 23px) scale(1)",
          },
        "&.MuiEgTextField-largeSize .MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-animated.Mui-focused":
          {
            position: "absolute",
            transform: "translate(14px, -9px) scale(0.75)",
          },
        "&.MuiEgTextField-largeSize .MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-animated.MuiFormLabel-filled":
          {
            position: "absolute",
            transform: "translate(14px, -9px) scale(0.75)",
          },
      },
    }),
  { name: "MuiEgTextField" }
);

const TextField = forwardRef<HTMLDivElement, TextFieldProps>((props, ref) => {
  const theme = useTheme();
  const classes = useStyles(props);
  const {
    openDialog: openConfirmDialog,
    closeDialog: closeConfirmDialog,
    setDialogStates: setConfirmDialogStates,
    isOpen,
  } = useReduxDialog(OUTSIDE_CLICK_DIALOG);
  const wordLibrary = useSelector(getWordLibrary);

  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    className,
    success,
    warning: warningProp,
    error,
    rounded = false,
    shadowed = false,
    variant,
    size = "medium",
    helperText,
    enableAction = false,
    writable = true,
    placeholder,
    value: valueProp,
    name,
    columnType,
    onChange: onChangeProp,
    onChangeWithAction,
    showHistoryIcon = false,
    onClickHistory,
    required,
    boldTextWithAction,
    numberDecimal,
    numberUnit = "",
    capitalize,
    width,
    isEditableShow = false,
    ...others
  } = props;

  warning(
    variant !== "outlined" ? !rounded : true,
    "TextField should not use rounded when variant is not outlined!"
  );
  warning(
    variant !== "outlined" ? !shadowed : true,
    "TextField should not use shadowed when variant is not outlined!"
  );
  warning(
    enableAction ? onChangeWithAction !== undefined : true,
    "TextField should be given value when enableAction usage!"
  );

  const [fieldError, setFieldError] = useState<boolean>(false);

  const renderHelperText = () => {
    if (error && helperText) {
      return (
        <>
          <div className={classes.helperTextIconWrapper}>
            <ErrorRoundedIcon fontSize="small" />
          </div>
          <div className={classes.helperTextMessageWrapper}>{helperText}</div>
        </>
      );
    }
    return helperText;
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const inputEl = useRef<HTMLInputElement>(null);
  const sizerEl = useRef<HTMLSpanElement>(null);
  const [finalValue, setFinalValue] = useState(valueProp);
  const [inputValue, setInputValue] = useState(valueProp);

  useEffect(() => {
    setFinalValue(valueProp);
    setInputValue(valueProp);
  }, [valueProp]);

  const handleInputChange = (e) => {
    if (columnType === ColumnType.NUMBER) {
      const value =
        e.target.value !== "" && numberDecimal
          ? String(
              Math.floor(Number(e.target.value) * 10 ** numberDecimal) /
                10 ** numberDecimal
            )
          : e.target.value;
      setInputValue(value);
      const { min, max } = others.InputProps.inputProps;
      if (
        value !== "" &&
        (Math.floor(Number(value)) < Math.floor(Number(min)) ||
          Math.floor(Number(value)) > Math.floor(Number(max)))
      ) {
        setFieldError(true);
      } else {
        setFieldError(false);
      }

      if (required) setFieldError(true);

      if (onChangeProp) onChangeProp(e);
    } else {
      const { value } = e.target;
      const transformedValue = capitalize
        ? value.charAt(0).toUpperCase() + value.slice(1)
        : value;
      setInputValue(transformedValue);
      if (onChangeProp) onChangeProp(e);
    }
  };

  const [isHover, setIsHover] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const handleMouseEnter = () => {
    setIsHover(true);
  };
  const handleMouseLeave = () => {
    setIsHover(false);
  };
  const handleOnEdit = () => {
    if (!writable) return;
    setIsEdit(true);
  };

  const handleConfirmClick = (event) => {
    event.preventDefault();
    handleSetFinalValue();
  };

  const handleCancelClick = (event) => {
    event.preventDefault();
    handleOnClose();
  };

  const handleSetFinalValue = () => {
    if (finalValue === inputValue) {
      setIsEdit(false);
      setIsHover(false);
      closeConfirmDialog();
      return;
    }
    if ((inputValue as string) === "" && required) {
      closeConfirmDialog();
      return;
    }
    if (onChangeWithAction) {
      const promise = onChangeWithAction(inputValue);
      if (promise) {
        setIsLoading(true);
        promise
          .then((result) => {
            if (result === "success") {
              setFinalValue(inputValue);
              setIsLoading(false);
            } else if (result === "failed") {
              setIsLoading(false);
            } else if (!result) {
              setIsLoading(false);
              setIsEdit(false);
            }
            closeConfirmDialog();
          })
          .catch(() => {});
      } else {
        setFinalValue(inputValue);
      }
    }
  };

  const handleOnClose = () => {
    if (finalValue === inputValue) {
      setIsEdit(false);
      setIsHover(false);
      return;
    }
    setInputValue(finalValue);
    setIsEdit(false);
    setIsHover(false);
  };

  useEffect(() => {
    if (isEdit && inputEl.current) inputEl.current?.focus();
  }, [isEdit]);

  useEffect(() => {
    setIsEdit(false);
    setIsHover(false);
  }, [finalValue]);

  const handleOutsideClick = () => {
    openConfirmDialog({
      primary: "您想儲存變更嗎？",
      message: inputValue,
      isLoading,
      onConfirm: () => {
        setConfirmDialogStates({ isLoading: true });
        handleSetFinalValue();
      },
      onClose: () => {
        handleOnClose();
        closeConfirmDialog();
      },
    });
  };

  if (enableAction) {
    return (
      <>
        {!isEdit && (
          <span
            className={clsx(classes.typography, writable && classes.pointer)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleOnEdit}
            role="button"
            tabIndex={0}
            onKeyDown={handleOnEdit}
          >
            {String(finalValue) !== "" ? (
              <Typography
                weight={boldTextWithAction ? "bold" : "regular"}
                sx={{
                  minWidth: "200px",
                  minHeight: "35px",
                  wordBreak: "break-word",
                  fontSize: 14,
                  padding: "6px",
                }}
                id={`editable-text-${name}`}
                data-tid={`editable-text-${name}`}
              >
                {String(finalValue) + numberUnit}
              </Typography>
            ) : (
              <Typography
                weight={boldTextWithAction ? "bold" : "regular"}
                sx={{
                  minWidth: "200px",
                  minHeight: "35px",
                  wordBreak: "break-word",
                  border: writable ? "1px solid gray" : "none",
                  borderRadius: "5px",
                  padding: "6px",
                  fontSize: 14,
                }}
                id={`${name}-editable-text-empty`}
              >
                {String(finalValue)}
              </Typography>
            )}
            {isHover && showHistoryIcon && (
              <StyledIconHoverButton
                onClick={(event) => {
                  event.stopPropagation();
                  if (onClickHistory) onClickHistory(event);
                }}
                id={`${name}-history-btn`}
              >
                <HistoryRoundedIcon fontSize="medium" />
              </StyledIconHoverButton>
            )}
            {isEditableShow && (
              <Tooltip
                onClick={handleOnEdit}
                title={wordLibrary?.edit ?? "編輯"}
              >
                <IconButton sx={{ mt: 1 }}>
                  <Edit />
                </IconButton>
              </Tooltip>
            )}
          </span>
        )}
        {isEdit && writable && !isOpen && (
          <ClickAwayListener onClickAway={handleOutsideClick}>
            <Grid container alignItems="center" width={width || "auto"}>
              <Grid item>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSetFinalValue();
                  }}
                  style={{
                    display: "inline-flex",
                  }}
                >
                  <span
                    ref={sizerEl}
                    className={classes.inputSizer}
                    data-value={`${inputValue as string}`}
                  >
                    {!isDownSm && (
                      <MuiTextField
                        type={
                          columnType === ColumnType.NUMBER
                            ? "number"
                            : undefined
                        }
                        onChange={handleInputChange}
                        className={classes.inputBox}
                        placeholder={placeholder}
                        value={inputValue as string}
                        name={name}
                        size="small"
                        error={fieldError}
                        InputProps={{
                          ...others.InputProps,
                          inputProps: {
                            ...others.InputProps?.inputProps,
                            size: "1",
                            style: {
                              textTransform: capitalize
                                ? "capitalize"
                                : undefined,
                            },
                            ref: inputEl,
                            id: `${name}-input`,
                          },
                        }}
                      />
                    )}
                    {isDownSm && (
                      <MuiTextField
                        type={
                          columnType === ColumnType.NUMBER
                            ? "number"
                            : undefined
                        }
                        onChange={handleInputChange}
                        className={classes.inputBox}
                        InputProps={{
                          ...others.InputProps,
                          style: {
                            textTransform: capitalize
                              ? "capitalize"
                              : undefined,
                          },
                          inputProps: {
                            ...others.InputProps?.inputProps,
                            size: "small",
                            ref: inputEl,
                            id: `${name}-input`,
                          },
                        }}
                        placeholder={placeholder}
                        value={inputValue as string}
                        name={name}
                        error={fieldError}
                        size="small"
                        multiline
                      />
                    )}
                  </span>
                </form>
              </Grid>
              <Grid item display="flex">
                <StyledIconButton
                  onMouseDown={handleConfirmClick}
                  disabled={
                    (required && (inputValue as string) === "") || fieldError
                  }
                  sx={{
                    marginLeft: "16px",
                  }}
                  id={`${name}-confirm-btn`}
                >
                  {isLoading && <CircularProgress size={20} />}
                  {!isLoading && (
                    <CheckCircleRoundedIcon
                      sx={{
                        color:
                          (required && (inputValue as string) === "") ||
                          fieldError
                            ? theme.palette.grey[300]
                            : theme.palette.success.main,
                      }}
                    />
                  )}
                </StyledIconButton>
                {!isLoading && (
                  <Grid item>
                    <StyledIconButton
                      onMouseDown={handleCancelClick}
                      disabled={required && (finalValue as string) === ""}
                      id={`${name}-cancel-btn`}
                    >
                      <CancelRoundedIcon
                        sx={{
                          color:
                            required && (finalValue as string) === ""
                              ? theme.palette.grey[300]
                              : theme.palette.error.main,
                        }}
                      />
                    </StyledIconButton>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </ClickAwayListener>
        )}
      </>
    );
  }
  return (
    <MuiTextField
      ref={ref}
      className={clsx(className, {
        [classes.success]: success,
        [classes.warning]: warningProp,
        [classes.error]: error,
        [classes.rounded]: rounded,
        [classes.shadowed]: shadowed,
        [classes.smallSize]: size === "small",
        [classes.mediumSize]: size === "medium",
        [classes.largeSize]: size === "large",
      })}
      classes={classes}
      variant={variant}
      FormHelperTextProps={{
        className: clsx(classes.helperText, {
          [classes.helperTextPaddingSmall]: size === "small",
          [classes.helperTextPaddingMedium]: size === "medium",
          [classes.helperTextPaddingLarge]: size === "large",
        }),
      }}
      helperText={renderHelperText()}
      placeholder={placeholder}
      onChange={handleInputChange}
      value={valueProp}
      required={required}
      name={name}
      sx={{
        margin: "6px 0",
      }}
      {...others}
    />
  );
});

export default TextField;
