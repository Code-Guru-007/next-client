import React, { forwardRef, ReactNode } from "react";
import {
  StandardTextFieldProps,
  FilledTextFieldProps,
  OutlinedTextFieldProps,
  CircularProgress,
  InputAdornment,
  TextField,
  useTheme,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

export interface BaseTextLoadingProps {
  /**
   * Set TextField in loading status
   */
  loading?: boolean;
  /**
   * Customized Loading Adornment
   */
  loadingAdornment?: ReactNode;
}

export type StandardTextLoadingProps = BaseTextLoadingProps &
  StandardTextFieldProps;
export type FilledTextLoadingProps = BaseTextLoadingProps &
  FilledTextFieldProps;
export type OutlinedTextLoadingProps = BaseTextLoadingProps &
  OutlinedTextFieldProps;

export type TextLoadingProps =
  | StandardTextLoadingProps
  | FilledTextLoadingProps
  | OutlinedTextLoadingProps;

export const useStyles = makeStyles(
  (theme) => ({
    select: {
      maxWidth: "550px",
      width: "550px",
      height: "56px",
      background: theme.palette.grey[500],
      borderRadius: "26px",
      fontFamily: theme.typography.fontFamily,
      fontSize: "15px",
      fontWeight: 400,
      margin: "10px 0 30px 0px",
      "& .MuiInputLabel-root": {
        display: "none",
      },
      "& div, p": {
        color: theme.palette.grey[300],
      },
      ".MuiOutlinedInput-root:hover fieldset, & .Mui-focused fieldset, .Mui-focused .MuiOutlinedInput-notchedOutline":
        {
          borderColor: theme.palette.primary.main,
          borderWidth: "1px",
          borderRadius: "26px",
        },
      "& fieldset": {
        borderColor: theme.palette.grey[300],
        borderWidth: "1px",
        borderRadius: "26px",
      },
      "& .css-1i4f5ak-MuiInputBase-root-MuiOutlinedInput-root": {
        paddingLeft: "30px",
      },
    },
  }),
  {
    name: "MuiEgReactSelect",
  }
);

const TextLoading = forwardRef<HTMLDivElement, TextLoadingProps>(
  (props, ref) => {
    const {
      loading,
      loadingAdornment: loadingAdornmentProp,
      InputProps,
      select,
      ...other
    } = props;
    const theme = useTheme();
    const classes = useStyles(props);
    const { endAdornment: endAdornmentProp, ...otherInputProps } =
      InputProps || {};
    // set default loading endAdornment
    const loadingAdornment = loadingAdornmentProp || (
      <InputAdornment
        position="end"
        style={{ marginRight: select ? "54.77px" : 0 }}
      >
        <CircularProgress
          size={32}
          sx={{ color: theme.palette.primary.main }}
          thickness={2}
        />
      </InputAdornment>
    );

    const menuStyle = {
      sx: {
        width: "500px",
        marginLeft: "25px",
        "& .MuiPaper-root": {
          maxWidth: "500px",
        },
        "& .Mui-selected, & .Mui-selected:hover, & li:hover": {
          backgroundColor: theme.palette.grey[600],
        },
      },
    };

    const DropdownIndicator = (evt) => {
      const { className } = evt;
      return (
        <svg
          className={className}
          width="13"
          height="8"
          viewBox="0 0 13 8"
          fill="none"
          style={{ position: "absolute", top: "auto", right: "25.51px" }}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.48001 7.05936C6.33677 7.05743 6.19958 7.00173 6.09601 6.90346L0.640008 1.6147C0.590784 1.56588 0.551861 1.50781 0.525519 1.44387C0.499176 1.37994 0.485943 1.31142 0.486595 1.24235C0.487247 1.17327 0.50177 1.10502 0.529315 1.04158C0.556859 0.978146 0.596871 0.920806 0.647008 0.872917C0.749161 0.774304 0.885644 0.71856 1.02811 0.717266C1.17057 0.715971 1.30806 0.769226 1.41201 0.865966L6.48001 5.77838L11.549 0.865966C11.652 0.763797 11.7914 0.706008 11.937 0.705099C12.0828 0.70385 12.2232 0.759478 12.328 0.860008C12.379 0.909436 12.4195 0.96853 12.447 1.03378C12.4748 1.09841 12.4888 1.16807 12.488 1.23834C12.4871 1.30891 12.4719 1.37856 12.4434 1.4432C12.4149 1.50784 12.3736 1.56615 12.322 1.6147L6.86601 6.90346C6.76199 7.00228 6.62396 7.05803 6.48001 7.05936Z"
            fill={theme.palette.grey[300]}
          />
        </svg>
      );
    };

    const endAdornment = loading ? loadingAdornment : endAdornmentProp;
    return (
      <TextField
        className={select ? classes.select : ""}
        ref={ref}
        InputProps={{
          endAdornment,
          ...otherInputProps,
        }}
        select={select}
        SelectProps={{
          IconComponent: (evt) => DropdownIndicator(evt),
          MenuProps: menuStyle,
        }}
        {...other}
      />
    );
  }
);

export default TextLoading;
