import React, { forwardRef } from "react";
import Button, { ButtonProps } from "@eGroupAI/material/Button";
import { buttonClasses } from "@mui/material/Button";
import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import clsx from "clsx";

interface ThirdPartyButtonProps extends ButtonProps {
  /**
   * size of button
   * @default medium
   */
  size?: "small" | "medium";
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderRadius: "1000px",
    backgroundColor: theme.palette.common.white,
    color: theme.palette.primary.main,

    textTransform: "none",
    "&:hover": {
      backgroundColor: theme.palette.grey[600],
      boxShadow: "none",
    },
  },
  mediumSize: {
    padding: "13px",
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: "20px",
    lineHeight: "30px",
    [`& .${buttonClasses.startIcon}`]: {
      "& .MuiSvgIcon-root": {
        width: "40px",
        height: "40px",
      },
    },
  },
  smallSize: {
    padding: "6px",
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: "12px",
    lineHeight: "18px",
    [`& .${buttonClasses.startIcon}`]: {
      "& .MuiSvgIcon-root": {
        width: "28px",
        height: "28px",
      },
    },
  },
}));

const ThirdPartyButton = forwardRef<HTMLButtonElement, ThirdPartyButtonProps>(
  (props, ref) => {
    const classes = useStyles(props);
    const { size = "medium", ...others } = props;

    return (
      <Button
        ref={ref}
        disableRipple
        disableFocusRipple
        variant="contained"
        className={clsx(classes.root, {
          [classes.mediumSize]: size === "medium",
          [classes.smallSize]: size === "small",
        })}
        {...others}
      />
    );
  }
);

export default ThirdPartyButton;
