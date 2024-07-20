import React, { FC } from "react";
import { makeStyles } from "@mui/styles";

import Typography from "@eGroupAI/material/Typography";

const useStyles = makeStyles(() => ({
  root: {},
}));

interface TitleGroupProps {
  type: string;
  title: string;
}

const TitleGroup: FC<TitleGroupProps> = function (props) {
  const classes = useStyles();
  const { type, title } = props;

  return (
    <div className={classes.root}>
      <Typography component="h2" variant="h5" fontWeight={700}>
        {type}
      </Typography>
      <Typography
        component="h1"
        variant="h3"
        fontWeight={700}
        color="primary"
        gutterBottom
      >
        {title}
      </Typography>
    </div>
  );
};

export default TitleGroup;
