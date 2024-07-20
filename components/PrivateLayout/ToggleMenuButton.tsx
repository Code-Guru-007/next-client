import React, { FC } from "react";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import IconButton from "components/IconButton/StyledIconButton";
import { IconButtonProps } from "@eGroupAI/material/IconButton";
import { Menu } from "@mui/icons-material";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: "50%",
    padding: 8,
  },
  close: {
    color: theme.palette.common.black,
  },
  open: {
    color: theme.palette.common.white,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    background: `${theme.palette.primary.light} !important`,
  },
}));

export interface ToggleMenuButtonProps extends IconButtonProps {
  isOpen?: boolean;
}

const ToggleMenuButton: FC<ToggleMenuButtonProps> = function (props) {
  const { className, isOpen, ...other } = props;
  const classes = useStyles();
  return (
    <IconButton
      className={clsx(className, classes.root, {
        [classes.open]: isOpen,
        [classes.close]: !isOpen,
      })}
      {...other}
    >
      {isOpen ? <Menu /> : <Menu />}
    </IconButton>
  );
};
export default ToggleMenuButton;
