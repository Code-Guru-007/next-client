import Radio from "@mui/material/Radio";
import { styled } from "@mui/styles";

export default styled(Radio)(({ theme }) => ({
  color: theme.palette.grey[300],
  "&.MuiRadio-root:hover": {
    color: theme.palette.primary.main,
    backgroundColor: "transparent",
  },
  ".MuiFormControlLabel-root:has(&):hover": {
    "& .MuiRadio-root": {
      color: theme.palette.primary.main,
      backgroundColor: "transparent",
    },
    "& .MuiRadio-root.Mui-checked": {
      "& span>:nth-child(1)": {
        filter: "drop-shadow(0px 0px 4px rgba(61, 165, 217, 0.7))",
      },
      "& span>:nth-child(2)": {
        filter: "drop-shadow(0px 0px 3px rgba(61, 165, 217, 0.7))",
      },
    },
  },
  "&.Mui-checked": {
    color: theme.palette.primary.main,
  },
  "& .MuiTouchRipple-root": {
    width: 0,
    height: 0,
  },
  "&.MuiRadio-root.Mui-checked:hover": {
    "& span>:nth-child(1)": {
      filter: "drop-shadow(0px 0px 4px rgba(61, 165, 217, 0.7))",
    },
    "& span>:nth-child(2)": {
      filter: "drop-shadow(0px 0px 3px rgba(61, 165, 217, 0.7))",
    },
  },
}));
