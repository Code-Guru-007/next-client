import { styled } from "@mui/styles";
import Checkbox from "@eGroupAI/material/Checkbox";

export default styled(Checkbox)({
  "&:not(.Mui-checked) .MuiSvgIcon-root": {
    color: "white",
    stroke: "white",
  },
  "& .MuiTypography-root": {
    color: "white",
  },
});
