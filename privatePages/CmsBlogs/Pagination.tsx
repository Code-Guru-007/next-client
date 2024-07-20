import React, { FC } from "react";

import { makeStyles, useTheme } from "@mui/styles";
import { useMediaQuery } from "@mui/material";
import MuiPagination from "@eGroupAI/material/Pagination";
import PaginationItem from "@eGroupAI/material/PaginationItem";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    fontWeight: 600,

    "& .Mui-selected": {
      color: theme.palette.common.white,
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

interface Props {
  count: number;
  pageNum: number;
  onChange: (val: number) => void;
}

const Pagination: FC<Props> = function (props) {
  const { count, pageNum, onChange } = props;
  const classes = useStyles();
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div className={classes.root}>
      <MuiPagination
        page={pageNum}
        count={count}
        variant="outlined"
        size={isDownSm ? "small" : "large"}
        onChange={(_, page) => onChange(page)}
        // renderItem={(item) => <PaginationItem {...item} />}
        renderItem={() => <PaginationItem />}
      />
    </div>
  );
};

export default Pagination;
