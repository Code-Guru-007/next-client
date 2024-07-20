import React, { FC } from "react";

import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";

import {
  ClickAwayListener,
  Fade,
  IconButtonProps,
  Popover,
  PopoverProps,
  ClickAwayListenerProps,
} from "@mui/material";

const useStyles = makeStyles(
  (theme) => ({
    root: {
      marginTop: 5,
      zIndex: theme.zIndex.snackbar,
      [theme.breakpoints.down("md")]: {
        minWidth: "100vw",
        minHeight: "100vh",
      },
    },
    paper: {
      [theme.breakpoints.down("md")]: {
        maxWidth: "100%",
        maxHeight: "100%",
      },
      boxShadow: "0px 3px 5px -1px rgb(0 0 0 / 20%)",
      maxHeight: "100%",
      overflowY: "hidden",
      padding: "8px",
    },
    container: {
      display: "flex",
      [theme.breakpoints.down("md")]: {
        width: "100%",
        maxHeight: "100%",
      },
      [theme.breakpoints.down("sm")]: {
        width: "350px",
      },
    },
    close: {
      position: "fixed",
      right: 5,
      top: 5,
    },
  }),
  { name: "MuiEnhancePopover" }
);

export interface EnhancePopoverProps extends PopoverProps {
  open: boolean;
  onClickAway: ClickAwayListenerProps["onClickAway"];
  onCloseClick?: IconButtonProps["onClick"];
}

const EnhancePopover: FC<EnhancePopoverProps> = (props) => {
  const classes = useStyles();
  const {
    className,
    anchorOrigin,
    transformOrigin,
    PaperProps,
    open,
    onClickAway,
    onCloseClick,
    anchorEl,
    children,
    ...other
  } = props;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      className={clsx(className, classes.root)}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
        ...anchorOrigin,
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
        ...transformOrigin,
      }}
      PaperProps={{
        elevation: 6,
        className: classes.paper,
        ...PaperProps,
      }}
      TransitionComponent={Fade}
      {...other}
    >
      <ClickAwayListener onClickAway={onClickAway}>
        <div className={classes.container}>{children}</div>
      </ClickAwayListener>
    </Popover>
  );
};

export default EnhancePopover;
