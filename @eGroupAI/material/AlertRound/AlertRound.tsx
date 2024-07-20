import { Alert } from "@mui/material";
import { AlertProps } from "@mui/lab";

import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";

export type AlertBaseProps = AlertProps;

export default withStyles(() =>
  createStyles({
    root: {
      display: "inline-flex",
      borderRadius: 1000,
      padding: "4px 16px",
      minWidth: ({ roundSize }) => (roundSize === "small" ? "174px" : "296px"),
    },

    message: {
      fontStyle: "normal",
      fontWeight: 400,
      fontSize: "15px",
      lineHeight: "22px",
    },

    icon: {
      padding: "9px 0px",
      "& .MuiSvgIcon-root": {
        width: "20px",
        height: "22px",
      },
      "& .material-icons": {
        fontSize: "20px",
      },
    },
  })
)(Alert);
