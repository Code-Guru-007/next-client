import React, { forwardRef } from "react";
import Button, { ButtonProps } from "@eGroupAI/material/Button";
import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import clsx from "clsx";

interface SigninButtonProps extends ButtonProps {
  /**
   * size of button
   * @default medium
   */
  size?: "small" | "medium";
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderRadius: "1000px",
    padding: "15px",
    backgroundColor: "#05C7F2",
    color: theme.palette.common.white,
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: "24px",
    lineHeight: "36px",
    textTransform: "none",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      boxShadow: "none",
    },
  },
  mediumSize: {
    padding: "15px",
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: "24px",
    lineHeight: "36px",
  },
  smallSize: {
    padding: "11px",
    fontStyle: "normal",
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: "18px",
  },
}));

const SigninButton = forwardRef<HTMLButtonElement, SigninButtonProps>(
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

export default SigninButton;
