import React, { FC } from "react";
import clsx from "clsx";

import { makeStyles } from "@mui/styles";

import Button, { ButtonProps } from "@eGroupAI/material/Button";

interface StyledButtonProps extends Omit<ButtonProps, "size"> {
  /**
   * size of button
   * @default medium
   */
  size?: "large" | "medium" | "small";
}

const useStyles = makeStyles({
  sizeLarge: {
    padding: "17px 40px",
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: "22px",
    lineHeight: "33px",
  },
  sizeSmall: {},
});

const StyledButton: FC<StyledButtonProps> = function StyledButton(props) {
  const classes = useStyles(props);
  const { size = "medium", ...others } = props;
  return (
    <Button
      className={clsx({
        [classes.sizeLarge]: size === "large",
        [classes.sizeSmall]: size === "small",
      })}
      {...others}
    />
  );
};

export default StyledButton;
