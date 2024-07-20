import { styled } from "@mui/material/styles";

import MultiEmail from "@eGroupAI/material/MultiEmailField";

const MultiEmailField = styled(MultiEmail)(({ theme }) => ({
  background: "transparent",
  "&.react-multi-email": {
    borderRadius: 8,
    maxWidth: "100%",
    "-webkit-box-flex": "1",
    "-ms-flex": "1 0 auto",
    flex: "1 0 auto",
    outline: 0,
    "-webkit-tap-highlight-color": "rgba(255, 255, 255, 0)",
    textAlign: "left",
    lineHeight: "1.21428571em",
    // padding: "0.4em 0.5em",
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.grey[300]}`,
    color: "rgba(0, 0, 0, 0.87)",
    position: "relative",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    alignContent: "flex-start",
  },
  "&.react-multi-email > span[data-placeholder]": {
    display: "none",
    paddingLeft: "15px",
    paddingRight: "120px",
    lineHeight: "1.21428571em",
    position: "absolute",
  },
  "&.react-multi-email.focused": {
    borderColor: theme.palette.text.primary,
    background: theme.palette.background.paper,
  },

  "&.react-multi-email.empty > span[data-placeholder]": {
    display: "inline",
    color: theme.palette.grey[500],
  },
  "&.react-multi-email.focused > span[data-placeholder]": {
    display: "none",
  },

  "&.react-multi-email > input": {
    flex: "1",
    width: "auto !important",
    outline: "none !important",
    border: "0 none !important",
    display: "inline-block !important",
    lineHeight: "1",
    verticalAlign: "baseline !important",
    padding: "18px 23px 15px 23px",
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRadius: 8,
    fontSize: "1.025rem",
  },

  "&.react-multi-email [data-tag]": {
    lineHeight: "1",
    verticalAlign: "baseline",
    margin: "3px",
    backgroundColor: theme.palette.grey[600],
    backgroundImage: "none",
    color: theme.palette.grey[300],
    textTransform: "none",
    border: "0 solid transparent",
    borderRadius: 8,
    "-webkit-transition": "background 0.1s ease",
    "-o-transition": "background 0.1s ease",
    transition: "background 0.1s ease",
    fontSize: "0.8125rem",
    display: "flex",
    alignItems: "center",
    padding: 10,
    justifyContent: "flex-start",
    maxWidth: "100%",
  },

  "&.react-multi-email [data-tag] [data-tag-item]": {
    maxWidth: "100%",
    overflow: "hidden",
  },
  "&.react-multi-email [data-tag]:first-child": {
    marginLeft: "5px",
  },
  "&.react-multi-email [data-tag] [data-tag-handle]": {
    marginLeft: "0.833em",
    cursor: "pointer",
    borderRadius: "100%",
    background: theme.palette.grey[400],
    width: 16,
    height: 16,
    color: theme.palette.grey[700],
    display: "flex",
    justifyContent: "center",
    fontSize: 16,
  },
}));

export default MultiEmailField;
