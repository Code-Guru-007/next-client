/* eslint-disable no-nested-ternary */
import { styled } from "@mui/material/styles";

import TimelineDot from "@mui/lab/TimelineDot";

const StyledTimelineDot = styled(TimelineDot)(({ theme, color }) => ({
  width: 36,
  height: 36,
  backgroundColor: "transparent",
  border: "8px solid",
  borderRadius: "50%",
  borderColor:
    color && color !== "success" && color !== "grey"
      ? theme.palette[color].main
      : color === "success"
      ? theme.palette.primary.main
      : color === "grey"
      ? theme.palette.grey[500]
      : theme.palette.primary.main,
  [theme.breakpoints.down("md")]: {
    width: 12,
    height: 12,
    borderWidth: 4,
  },
}));

export default StyledTimelineDot;
