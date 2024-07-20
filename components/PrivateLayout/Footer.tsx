import React, { VFC } from "react";

import { makeStyles } from "@mui/styles";

import Typography from "@eGroupAI/material/Typography";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.common.white,
    padding: "4px 0",
  },
  text: {
    fontWeight: 400,
    fontSize: 10,
    lineHeight: "15px",
    color: theme.palette.grey[100],
  },
}));

const Footer: VFC = function () {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography variant="body2" align="center" className={classes.text}>
        Privacy · Terms · Cookies · eGroupAI © 2022
      </Typography>
    </div>
  );
};

export default Footer;
