import { styled } from "@mui/material/styles";
import EgDateTimePicker from "@eGroupAI/material-lab/DateTimePicker";

const DateTimePicker = styled(EgDateTimePicker)(({ theme }) => ({
  background: theme.palette.grey[100],

  "& .MuiDateTimePicker-timePicker": {
    margin: 0,
    gap: 0,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
}));

export default DateTimePicker;
