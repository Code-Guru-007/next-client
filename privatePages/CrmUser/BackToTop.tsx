import React, { useState, useEffect } from "react";

import { makeStyles, useTheme } from "@mui/styles";
import clsx from "clsx";
import Fab from "@eGroupAI/material/Fab";
import { useSettingsContext } from "minimal/components/settings";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

const useStyles = makeStyles((theme) => ({
  root: {
    visibility: "hidden",
    bottom: 20,
    zIndex: theme.zIndex.appBar,
    transition: "opacity 0.6s",
    opacity: 0,
  },
  show: {
    visibility: "visible",
    opacity: 1,
  },
  closeIcon: {
    color: theme.palette.common.black,
    transform: "rotate(90deg) translate(6px, 0)",
  },
  left: {
    left: "20px",
  },
  right: {
    right: "20px",
  },
}));

const BackToTop = function () {
  const classes = useStyles();
  const theme = useTheme();
  const [show, setShow] = useState(false);
  const settings = useSettingsContext();
  const rtl = settings.themeDirection === "rtl";

  useEffect(() => {
    const scrollHandler = () => {
      const scrollTop = document.getElementById("scroll-section")?.scrollTop;
      if (scrollTop && scrollTop > 0) {
        setShow(true);
      } else {
        setShow(false);
      }
    };
    document
      .getElementById("scroll-section")
      ?.addEventListener("scroll", scrollHandler);

    return () => {
      document
        .getElementById("scroll-section")
        ?.removeEventListener("scroll", scrollHandler);
    };
  }, []);

  return (
    <Fab
      onClick={() => {
        document.getElementById("scroll-section")?.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      }}
      className={clsx(classes.root, {
        [classes.show]: show,
        [classes.left]: rtl,
        [classes.right]: !rtl,
      })}
      style={{ position: "fixed" }}
      sx={{
        background: theme.palette.background.paper,
        "&:hover": {
          background: theme.palette.primary.dark,
          boxShadow: theme.shadows[10],
        },
      }}
    >
      <ArrowBackIosIcon className={classes.closeIcon} />
    </Fab>
  );
};

export default BackToTop;
