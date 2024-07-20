import { Alert } from "@mui/material";
import { AlertProps } from "@mui/lab";

import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";

export type AlertBaseProps = AlertProps;

export default withStyles(() =>
  createStyles({
    root: {
      borderRadius: 0,
      "&:has(.MuiAlert-icon)": {
        padding: "10px 24px 10px 16px",
      },
      padding: "10px 24px 10px 20px",
    },

    message: {
      fontStyle: "normal",
      fontWeight: 400,
      fontSize: "15px",
      lineHeight: "23px",
    },
    action: {
      "& .MuiButton-root": {
        textTransform: "none",
        fontWeight: 400,
        fontSize: "12px",
        lineHeight: "18px",
        padding: "7px 18px",
      },
      "& .MuiSvgIcon-root": {
        width: "20px",
        height: "20px",
      },
    },
  })
)(Alert);
