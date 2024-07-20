import React, { forwardRef } from "react";
import { Paper, PaperProps } from "@mui/material";

import { WithStyles } from "@mui/styles";
import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";

const styles = () =>
  createStyles({
    root: {
      boxShadow: "0 3px 16px 0 rgba(10, 75, 109, 0.08)",
    },
  });

export type SegmentProps = PaperProps;

const Segment = forwardRef<
  HTMLDivElement,
  SegmentProps & WithStyles<typeof styles>
>((props, ref) => {
  const { elevation, ...other } = props;
  return <Paper ref={ref} elevation={0} {...other} />;
});

export default withStyles(styles, {
  name: "MuiEgSegment",
})(Segment);
