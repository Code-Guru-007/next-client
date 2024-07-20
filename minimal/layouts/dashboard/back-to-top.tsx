import React, { useState, useEffect } from "react";

import { makeStyles, useTheme } from "@mui/styles";
import clsx from "clsx";
import Fab from "@eGroupAI/material/Fab";
import { useSettingsContext } from "minimal/components/settings";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useSelector } from "react-redux";
import { getLastUpdateTime } from "redux/articleBulletinLastUpdateTime/selectors";

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
  const articleUpdateTime = useSelector(getLastUpdateTime);
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
      style={{ position: "fixed", bottom: articleUpdateTime && 70 }}
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
