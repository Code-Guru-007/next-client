import { styled } from "@mui/material/styles";
import EgTimePicker from "@eGroupAI/material-lab/TimePicker";

const TimePicker = styled(EgTimePicker)(({ theme }) => ({
  "& .MuiAutocomplete-root": {
    background: theme.palette.grey[100],
  },

  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
}));

export default TimePicker;
