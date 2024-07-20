import React, { FC, HTMLAttributes } from "react";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import Box from "@eGroupAI/material/Box";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    marginTop: theme.spacing(3),
    gap: theme.spacing(1),
  },
}));

export type EditSectionActionsProps = HTMLAttributes<HTMLDivElement>;

const EditSectionActions: FC<EditSectionActionsProps> = function (props) {
  const classes = useStyles();
  const { className, children, ...other } = props;

  return (
    <div className={clsx(className, classes.root)} {...other}>
      <Box flexGrow={1} />
      {children}
    </div>
  );
};

export default EditSectionActions;
