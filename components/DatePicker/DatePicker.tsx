import { styled } from "@mui/material/styles";
import EgDatePicker from "@eGroupAI/material-lab/DatePicker";

const DatePicker = styled(EgDatePicker)(() => ({
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
}));

export default DatePicker;
