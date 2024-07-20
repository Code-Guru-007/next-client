import React, { FC, HTMLAttributes, ReactNode } from "react";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import Typography from "@eGroupAI/material/Typography";
import Box from "@eGroupAI/material/Box";
import { SxProps, Theme } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
    padding: "20px 0 0 0",
  },
}));

export interface EditSectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  primary?: ReactNode;
  sx?: SxProps<Theme>;
}

const EditSectionHeader: FC<EditSectionHeaderProps> = function (props) {
  const classes = useStyles();
  const { className, primary, children, sx, ...other } = props;

  return (
    <div className={clsx(className, classes.root)} {...other}>
      <Typography variant="h4" sx={{ ...sx }}>
        {primary}
      </Typography>
      <Box flexGrow={1} />
      <div>{children}</div>
    </div>
  );
};

export default EditSectionHeader;
