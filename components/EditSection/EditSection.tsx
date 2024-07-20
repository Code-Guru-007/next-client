import { styled } from "@mui/material/styles";
import Paper, { PaperProps } from "@eGroupAI/material/Paper";

export type EditSectionProps = PaperProps;

const EditSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1, 3, 3, 3),
  borderRadius: 16,
  boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.16)",
}));

export default EditSection;
