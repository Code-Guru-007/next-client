import { makeStyles } from "@mui/styles";

export const useTableRWDStyles = makeStyles((theme) => ({
  tableRowRWD: {
    display: "block",
    padding: "10px 0px",
    boxShadow: "0px -2px 4px -2px rgb(0 0 0 / 20%)",
    "& .MuiTableCell-root": {
      display: "flex",
      justifyContent: "space-between",
      width: `calc(100vw - 33px - ${
        window.innerWidth - document.body.clientWidth
      }px)`,
    },
    cursor: "pointer",
  },
  columnCell: {
    color: theme.palette.primary.main,
    width: "25%",
    textAlign: "left",
    padding: "2px 3px",
    wordWrap: "break-word",
  },
  rowCell: {
    width: "75%",
    textAlign: "right",
    padding: "2px 3px",
    wordWrap: "break-word",
  },
  checkBox: {
    width: "50px",
    paddingLeft: "0px",
    justifyContent: "left",
    "& .MuiCheckbox-root": {
      padding: "3px 2px",
    },
  },
}));
