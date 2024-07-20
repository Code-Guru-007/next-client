import { styled } from "@mui/material/styles";
import EgMenu from "@eGroupAI/material/Menu";

const Menu = styled(EgMenu)(({ theme }) => ({
  "& .MuiPaper-root": {
    boxShadow: "0 3px 16px 0 rgba(10, 75, 109, 0.08)",
    minWidth: "10rem",
  },
  "& .MuiListItemIcon-root": {
    minWidth: "unset",
    marginRight: theme.spacing(1),
    color: "#d1d3e2",
  },
}));

export default Menu;
