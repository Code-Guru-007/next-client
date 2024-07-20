import React from "react";

import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";

import Typography from "@eGroupAI/material/Typography";
import IconButton from "@eGroupAI/material/IconButton";
import Box from "@eGroupAI/material/Box";
import CloseIcon from "@mui/icons-material/Close";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "flex-end",
    padding: theme.spacing(2, 2),
  },
  btn: {
    background: theme.palette.grey[600],
    color: theme.palette.grey[300],
  },
}));

const DialogHeader = (props) => {
  const { className, title, onClose } = props;
  const classes = useStyles();
  return (
    <div className={clsx(className, classes.root)}>
      <Typography variant="h4" color="text">
        {title}
      </Typography>
      <Box flexGrow={1} />
      <div>
        <IconButton className={classes.btn} size="large" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default DialogHeader;
