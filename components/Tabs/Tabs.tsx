import { styled } from "@mui/material/styles";
import EgTabs from "@eGroupAI/material/Tabs";

const Tabs = styled(EgTabs)(({ theme }) => ({
  padding: "0 1.25rem",
  // borderRadius: "0.35rem",
  // boxShadow: "0 .15rem 1.75rem 0 rgba(58, 59, 69, .15)",
  boxShadow: "rgba(145, 158, 171, 0.08) 0px -2px 0px 0px inset",

  [theme.breakpoints.down("sm")]: {
    "& .MuiTabs-flexContainer": {
      flexWrap: "wrap",
      "& .MuiButtonBase-root": {
        width: "100%",
        maxWidth: "unset",
      },
      "& .Mui-selected": {
        borderBottom: `3px solid ${theme.palette.primary.main}`,
      },
    },
    "& .MuiTabs-indicator": {
      display: "none",
    },
  },
}));

export default Tabs;
