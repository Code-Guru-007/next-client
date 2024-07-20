import styled from "@mui/styles/styled";
import DialogTitle from "@eGroupAI/material/DialogTitle";

const StyledDialogTitle = styled(DialogTitle)(() => ({
  "&.MuiDialogTitle-root": {
    fontSize: "1.5rem",
  },
}));

export default StyledDialogTitle;
