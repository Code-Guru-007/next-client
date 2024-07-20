import { styled } from "@mui/material/styles";
import EgNewDateRangePicker from "@eGroupAI/material-lab/NewDateRangePicker";

const NewDateRangePicker = styled(EgNewDateRangePicker)(() => ({
  "& .MuiNewDateRangePicker-block": {
    // gap: 0,
  },
  "& .MuiTimePicker-root": {
    // gap: 0,
  },
  "& .MuiNewDateRangePicker-date": {
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
  },
  "& .MuiNewDateRangePicker-autocomplete": {
    "& .MuiOutlinedInput-root": {},

    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
  },
}));

export default NewDateRangePicker;
