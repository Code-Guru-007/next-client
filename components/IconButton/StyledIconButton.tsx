import { styled } from "@mui/styles";
import IconButton from "@eGroupAI/material/IconButton";

export default styled(IconButton)(({ theme }) => ({
  color: "#9E9E9E",
  backgroundColor: "transparent",
  padding: "8px",
  "&:hover": {
    backgroundColor: theme.palette.grey[300],
  },
}));
