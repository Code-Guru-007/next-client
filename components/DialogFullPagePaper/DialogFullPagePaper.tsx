import { styled } from "@mui/material/styles";
import Paper from "@eGroupAI/material/Paper";

const DialogFullPagePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderRadius: 20,
  boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.16)",
}));

export default DialogFullPagePaper;
