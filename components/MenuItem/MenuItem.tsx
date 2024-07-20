import styled from "@mui/styles/styled";
import MenuItem from "@mui/material/MenuItem";

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  color: theme.palette.text.primary,
  "&.Mui-selected": {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.primary.lighter,
  },
}));

export default StyledMenuItem;
