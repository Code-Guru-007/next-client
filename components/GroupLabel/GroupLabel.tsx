import React, { FC } from "react";

import { Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";

import Box from "@eGroupAI/material/Box";
import { Typography } from "@eGroupAI/material";
import clsx from "clsx";

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: "flex",
    position: "relative",
    marginBottom: 2,
  },
  ribbon: {
    backgroundColor: theme.palette.primary.main,
    padding: "10px",
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
  },
  label: {
    color: theme.palette.common.white,
    display: "inline-flex",
  },
  borderLine: {
    position: "absolute",
    borderBottom: `1px solid ${theme.palette.primary.main}`,
    bottom: "0px",
    width: "100%",
  },
}));

interface Props {
  label: string;
  dataGroupId?: string;
}

const GroupLabel: FC<Props> = ({ label, dataGroupId }) => {
  const classes = useStyles();

  return (
    <Box className={classes.wrapper}>
      <Box
        className={clsx(classes.ribbon, "groupLabelBox")}
        data-groupid={dataGroupId}
      >
        <Typography className={clsx(classes.label, "groupLabel")}>
          {label}
        </Typography>
      </Box>
      <Box className={classes.borderLine} />
    </Box>
  );
};

export default GroupLabel;
