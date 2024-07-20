import { FC, MouseEvent } from "react";

import makeStyles from "@mui/styles/makeStyles";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { Grid, useTheme, useMediaQuery } from "@mui/material";

import SelectPerPage from "./SelectPerPage";

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
  container: {
    display: "flex",
    justifyContent: "end",
    alignItems: "center",
  },
  containerRWD: { width: "100%" },
  densibleStyledPaginationSelectRows: {
    display: "flex",
    alignItems: "center",
  },
}));

export interface StyledPaginationBarProps {
  page: number;
  rowsPerPage: number;
  count: number;
  onPageChange: (
    event: MouseEvent<HTMLButtonElement> | null,
    page: number
  ) => void;
  // ToDo: Cause can't solve this type, can use any temporarily
  onRowsPerPageChange: any;
}

const StyledPaginationBar: FC<StyledPaginationBarProps> = (props) => {
  const theme = useTheme();
  const classes = useStyles(props);
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));

  const { page, rowsPerPage, count, onPageChange, onRowsPerPageChange } = props;

  const pageCount =
    count % rowsPerPage === 0
      ? count / rowsPerPage
      : Math.floor(count / rowsPerPage) + 1;

  const handlePageChange = (e, p) => {
    onPageChange(e, p - 1);
  };

  return (
    <Grid container className={classes.container}>
      {!isDownSm && (
        <Grid container className={classes.container}>
          <Grid item>
            <SelectPerPage
              onRowsPerPageChange={onRowsPerPageChange}
              rowsPerPage={rowsPerPage}
              count={count}
              page={page}
            />
          </Grid>
          <Grid item>
            <Pagination
              onChange={handlePageChange}
              count={pageCount}
              renderItem={(item) => (
                <PaginationItem
                  components={{
                    previous: ArrowBackIosNewRoundedIcon,
                    next: ArrowForwardIosRoundedIcon,
                  }}
                  {...item}
                  variant="text"
                  color="primary"
                />
              )}
              color="primary"
              page={page + 1}
              className={classes.pagination}
            />
          </Grid>
        </Grid>
      )}
      {isDownSm && (
        <Grid item className={classes.containerRWD}>
          <Pagination
            onChange={handlePageChange}
            count={pageCount}
            renderItem={(item) => (
              <PaginationItem
                components={{
                  previous: ArrowBackIosNewRoundedIcon,
                  next: ArrowForwardIosRoundedIcon,
                }}
                {...item}
                variant="text"
                color="primary"
              />
            )}
            color="primary"
            page={page + 1}
            className={classes.paginationRWD}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default StyledPaginationBar;
