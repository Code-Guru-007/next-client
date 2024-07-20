import React, { useState, useEffect } from "react";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import Fab from "@eGroupAI/material/Fab";
import { useSettingsContext } from "minimal/components/settings";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "fixed",
    bottom: 20,
    visibility: "hidden",
    zIndex: theme.zIndex.appBar,
    background: theme.palette.common.white,
    transition: "opacity 0.6s",
    opacity: 0,

    "&:hover": {
      background: theme.palette.common.white,
    },
  },
  show: {
    visibility: "visible",
    opacity: 1,
  },
  closeIcon: {
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
  const [show, setShow] = useState(false);
  const settings = useSettingsContext();
  // const backTopLeftRightStyle =
  //   settings.themeDirection === "rtl" ? { left: "20px" } : { right: "20px" };
  const rtl = settings.themeDirection === "rtl";

  useEffect(() => {
    const scrollHandler = () => {
      if (window.scrollY > 0) {
        setShow(true);
      } else {
        setShow(false);
      }
    };
    window.addEventListener("scroll", scrollHandler);

    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  }, []);

  return (
    <Fab
      onClick={() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }}
      className={clsx(classes.root, {
        [classes.show]: show,
        [classes.left]: rtl,
        [classes.right]: !rtl,
      })}
      // sx={{ "&": backTopLeftRightStyle }}
    >
      <ArrowBackIosIcon className={classes.closeIcon} />
    </Fab>
  );
};

export default BackToTop;
