import React, { forwardRef } from "react";
import * as MuiBtn from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { Theme, useTheme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { styled } from "@mui/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Badge from "@mui/material/Badge";
import IconButton from "@eGroupAI/material/IconButton";
import clsx from "clsx";
import { Color } from "../types";

const MuiButton = MuiBtn.default;

export interface ButtonProps<D = React.ElementType>
  extends Omit<MuiBtn.ButtonProps, "color"> {
  loading?: boolean;
  rounded?: boolean;
  color?: Color | string;
  textColor?: Color | string;
  component?: D;
  selected?: boolean;
  selectedNumber?: number;
  onCancelSelectClick?: () => void;
}

const getStyles = (
  theme: Theme,
  color: ButtonProps["color"],
  textColor: ButtonProps["textColor"]
) => {
  const colors = {
    default: theme.palette.grey[700],
    primary: theme.palette.primary.main,
    error: theme.palette.error.main,
    success: theme.palette.success.main,
    info: theme.palette.info.main,
  };
  let btnColor;
  if (Object.keys(colors).includes(color as string))
    btnColor = colors[color as string];
  else btnColor = color;

  return {
    color: textColor === "default" ? btnColor : textColor,
    "&:hover": {
      backgroundColor: "inherit",
    },
    "&.MuiButton-text:hover": {
      color: color === "default" ? colors.primary : colors[color as string],
    },

    "&.Mui-disabled": {
      opacity: 0.5,
    },
    "&.MuiButton-outlined": {
      borderColor: "currentColor",
      "& .MuiCircularProgress-svg": {
        color: textColor === "default" ? theme.palette.primary.main : textColor,
      },
    },
    "&.MuiButton-outlined:hover": {
      backgroundColor: btnColor,
      color: textColor === "default" ? theme.palette.grey[100] : textColor,
    },
    "&.MuiButton-outlined.Mui-disabled": {
      opacity: 0.5,
      borderColor: btnColor,
      color: textColor === "default" ? btnColor : textColor,
    },
    "&.MuiButton-contained": {
      color: textColor === "default" ? theme.palette.grey[100] : textColor,
      backgroundColor: btnColor,
      "& .MuiCircularProgress-svg": {
        color: textColor === "default" ? theme.palette.grey[100] : textColor,
      },
    },
    "&.MuiButton-contained:hover": {
      boxShadow: `0px 0px 6px ${btnColor}`,
    },
    "&.MuiButton-contained.Mui-disabled": {
      opacity: 0.5,
      color: textColor === "default" ? theme.palette.grey[100] : textColor,
    },
  };
};

const useStyles = makeStyles(
  (theme: Theme) => ({
    root: {
      fontSize: "0.9375rem",
      lineHeight: "1.40625rem",
      textTransform: "none",
      boxShadow: "none",
      fontWeight: 500,

      "& .MuiSvgIcon-root": {
        width: "15px",
        height: "15px",
      },
    },
    rounded: {
      // borderRadius: 10000,
      fontWeight: 400,
    },
    sizeMedium: {
      fontSize: "1.25rem",
    },
    sizeLarge: {
      fontSize: "1.5rem",
    },
    colorDefault: () => getStyles(theme, "default", "default"),
    colorPrimary: () => getStyles(theme, "primary", "default"),
    colorError: () => getStyles(theme, "error", "default"),
    colorSuccess: () => getStyles(theme, "success", "default"),
    colorInfo: () => getStyles(theme, "info", "default"),
    colorCustome: (props: ButtonProps) =>
      getStyles(theme, props.color, props.textColor),
    colorWhite: {
      color: ({ textColor }: ButtonProps) =>
        textColor === "default" ? theme.palette.common.white : textColor,
      "&.Mui-disabled": {
        color: theme.palette.grey[600],
      },
      "&.MuiButton-outlined": {
        borderColor: "currentColor",
      },
      "&.MuiButton-outlined.Mui-disabled": {
        borderColor: theme.palette.grey[600],
      },
      "&.MuiButton-contained": {
        color: ({ textColor }: ButtonProps) =>
          textColor === "default" ? theme.palette.primary.main : textColor,
        backgroundColor: theme.palette.common.white,
      },
      "&.MuiButton-contained.Mui-disabled": {
        color: ({ textColor }: ButtonProps) =>
          textColor === "default" ? theme.palette.grey[100] : textColor,
        backgroundColor: theme.palette.grey[600],
      },
    },
    colorInherit: {
      color: "inherit",

      "&.Mui-disabled": {
        opacity: 0.5,
      },
      "&.MuiButton-outlined": {
        borderColor: "currentColor",
      },
      "&.MuiButton-outlined.Mui-disabled": {
        borderColor: "currentColor",
      },
      "&.MuiButton-contained": {
        backgroundColor: theme.palette.common.white,
      },
      "&.MuiButton-contained.Mui-disabled": {
        opacity: 0.5,
      },
    },
    selected: {
      "& .MuiBadge-badge": {
        fontSize: "10px",
        lineHeight: "15px",
        fontWeight: 400,
      },
      "&.Mui-disabled": {
        opacity: 0.5,
      },
      "&.MuiButton-outlined": {
        borderColor: "currentColor",
      },
      "&.MuiButton-outlined.Mui-disabled": {
        borderColor: "currentColor",
      },
      "&.MuiButton-contained": {
        backgroundColor: theme.palette.primary.main,
      },
      "&.MuiButton-contained.Mui-disabled": {
        opacity: 0.5,
      },
      "& .MuiSvgIcon-root": {
        width: "15px",
        height: "15px",
      },
    },
    loading: {
      "&.MuiButton-contained": {
        padding: "9px 16px",
      },
      "&.MuiButton-outlined": {
        padding: "8px 15px",
        pointerEvents: "none",
      },
      "&.MuiButton-contained:hover": {
        boxShadow: "none",
      },
      "& .MuiButton-endIcon": {
        margin: 0,
        paddingLeft: "10px",
      },
    },
  }),
  { name: "MuiEgButton" }
);

const StyledBadge = styled(Badge)(({ theme }) => ({
  width: "18px",
  height: "18px",
  "& .MuiBadge-badge": {
    position: "relative",
    width: "18px",
    height: "18px",
    lineHeight: "18px",
    alignItem: "center",
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.grey[700],
    transform: "none",
    webkitTransform: "none",
  },
}));

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const theme = useTheme();
  const classes = useStyles(props);

  const {
    className,
    color = "default",
    rounded,
    selected,
    onCancelSelectClick,
    selectedNumber = 0,
    size,
    loading,
    disabled,
    startIcon,
    endIcon,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    textColor,
    ...other
  } = props;

  const colors = {
    default: theme.palette.grey[700],
    primary: theme.palette.primary.main,
    error: theme.palette.error.main,
    success: theme.palette.success.main,
    info: theme.palette.info.main,
  };

  return (
    <MuiButton
      className={clsx(
        classes.root,
        {
          [classes.rounded]: rounded,
          [classes.colorDefault]: color === "default" || color === "grey",
          [classes.colorPrimary]: color === "primary",
          [classes.colorWhite]: color === "white",
          [classes.colorInfo]: color === "info",
          [classes.colorSuccess]: color === "success",
          [classes.colorError]: color === "error",
          [classes.colorInherit]: color === "inherit",
          [classes.colorCustome]: !Object.keys(colors).includes(color),
          [classes.selected]: selected,
          [classes.sizeMedium]: size === "medium",
          [classes.sizeLarge]: size === "large",
          [classes.loading]: loading,
        },
        className
      )}
      ref={ref}
      startIcon={
        startIcon ||
        (selected && <StyledBadge showZero badgeContent={selectedNumber} />)
      }
      endIcon={
        endIcon ||
        (selected ? (
          <IconButton
            color="white"
            size="small"
            component="span"
            onClick={onCancelSelectClick}
            sx={{
              padding: "1.5px",
            }}
          >
            <CloseRoundedIcon sx={{ color: theme.palette.grey[300] }} />
          </IconButton>
        ) : (
          loading && <CircularProgress color="inherit" size={16} />
        ))
      }
      disabled={disabled || loading}
      {...other}
    />
  );
});

export default Button;
