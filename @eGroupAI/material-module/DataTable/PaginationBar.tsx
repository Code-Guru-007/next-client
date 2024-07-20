import { FC, MouseEvent } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import makeStyles from "@mui/styles/makeStyles";
import TablePagination from "@mui/material/TablePagination";
import { Grid, useTheme, useMediaQuery } from "@mui/material";
import clsx from "clsx";

import { CustomPaginationActions } from "./CustomPaginationTool";

type Values = {
  page: number;
  rowsPerPage: number;
};

const useStyles = makeStyles((theme) => ({
  pagination: {
    "& .MuiPaginationItem-text": {
      color: theme.palette.grey[500],
    },
    "& .Mui-selected": {
      color: "white",
    },
  },
  paginationRWD: {
    margin: 0,
    "& .MuiPaginationItem-root": {
      margin: 0,
    },
    "& .MuiPaginationItem-text": {
      color: theme.palette.grey[500],
      margin: 0,
    },
    "& .MuiPagination-ul": {
      justifyContent: "center",
    },
    "& .Mui-selected": {
      color: "white",
    },
  },
  container: { justifyContent: "end", alignItems: "center" },
  containerRWD: { width: "100%" },
}));

export interface PaginationBarProps {
  page: number;
  rowsPerPage: number;
  count: number;
  onPageChange: (
    event: MouseEvent<HTMLButtonElement> | null,
    page: number
  ) => void;
  // ToDo: Cause can't solve this type, can use any temporarily
  onRowsPerPageChange: any;
  isTablePagination?: boolean;
}

export interface PaginationProps {
  onChange: (
    event: MouseEvent<HTMLButtonElement> | null,
    values: Values
  ) => void;
  count: number;
}

const PaginationBar: FC<PaginationBarProps> = (props) => {
  const wordLibrary = useSelector(getWordLibrary);
  const theme = useTheme();
  const classes = useStyles(props);
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    page,
    rowsPerPage,
    count,
    onPageChange,
    onRowsPerPageChange,
    isTablePagination,
  } = props;

  const handlePageChange = (e, p) => {
    onPageChange(e, p);
  };

  return (
    <Grid
      container
      className={clsx(
        classes.container,
        "tour_target-data_table-footer-pagination"
      )}
    >
      {!isDownSm && (
        <Grid container className={classes.container}>
          {isTablePagination && (
            <Grid item>
              <TablePagination
                component="div"
                count={count}
                page={page}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={onRowsPerPageChange}
                labelRowsPerPage={wordLibrary?.["rows per page"] ?? "每頁筆數"}
                showFirstButton
                showLastButton
                SelectProps={{
                  inputProps: { id: "table-rowsPerPage-select" },
                }}
                ActionsComponent={CustomPaginationActions}
              />
            </Grid>
          )}
        </Grid>
      )}
      {isDownSm && isTablePagination && (
        <Grid item className={classes.containerRWD}>
          <TablePagination
            component="div"
            count={count}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
            labelRowsPerPage={wordLibrary?.["rows per page"] ?? "每頁筆數"}
            showFirstButton
            showLastButton
            SelectProps={{
              inputProps: { id: "table-rowsPerPage-select" },
            }}
            ActionsComponent={CustomPaginationActions}
            sx={{ "& .MuiInputBase-root": { mx: 1 } }}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default PaginationBar;
