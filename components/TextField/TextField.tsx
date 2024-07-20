import { styled } from "@mui/material/styles";
import MuiTextField from "@eGroupAI/material/TextField";

const TextField = styled(MuiTextField)(() => ({
  background: "transparent",

  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
}));

export default TextField;
