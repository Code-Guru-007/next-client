import React, { FC } from "react";

import makeStyles from "@mui/styles/makeStyles";
import FormControl from "@mui/material/FormControl";

import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import { Grid, useTheme, useMediaQuery } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";

const useStyles = makeStyles((theme) => ({
  perpage: {
    position: "relative",
    width: 78,
    height: 36,
    padding: 0,
    // borderRadius: 1000,
    color: theme.palette.grey[500],
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.grey[500],
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "& div.MuiSelect-select": {
      zIndex: 1,
    },
  },
  selectPage: {
    color: theme.palette.grey[500],
    "&.Mui-selected": {
      color: theme.palette.grey[500],
      backgroundColor: theme.palette.primary.dark,
    },
  },
  caption: {
    fontSize: "15px",
    color: theme.palette.grey[500],
    marginLeft: "20px",
    lineHeight: "40px",
    fontWeight: 500,
  },
}));
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 160,
      width: 78,
    },
  },
};

const dropDownIcon = () => (
  <ArrowBackIosNewRoundedIcon
    fontSize="small"
    style={{
      padding: 2,
      transform: "rotate(270deg)",
      position: "absolute",
      right: "10px",
      zIndex: 0,
    }}
  />
);

export interface SelectePerPageProps {
  onRowsPerPageChange: (event: SelectChangeEvent<number>) => void;
  rowsPerPage: number;
  count: number;
  page: number;
}

const SelectPerPage: FC<SelectePerPageProps> = (props: SelectePerPageProps) => {
  const theme = useTheme();
  const classes = useStyles();
  const { onRowsPerPageChange, rowsPerPage, count, page } = props;

  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));
  const ref = React.useRef<HTMLDivElement>(null);

  const handleOnOpen = () => {
    if (ref.current) ref.current.classList.add("Mui-focused");
  };

  const handleOnClose = () => {
    if (ref.current) ref.current.classList.remove("Mui-focused");
  };

  return (
    <Grid item sx={{ m: 1, p: 1 }}>
      <FormControl>
        <Select
          ref={ref}
          displayEmpty
          value={rowsPerPage}
          onChange={onRowsPerPageChange}
          onOpen={handleOnOpen}
          onClose={handleOnClose}
          input={<OutlinedInput ref={ref} />}
          IconComponent={dropDownIcon}
          MenuProps={MenuProps}
          inputProps={{ "aria-label": "Without label" }}
          className={classes.perpage}
          name="perpage"
        >
          {[10, 25, 50, 100].map((p) => (
            <MenuItem key={p} value={p} className={classes.selectPage}>
              {p}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {!isDownSm && (
        <Typography variant="caption" className={classes.caption}>
          {`顯示第 ${count === 0 ? 0 : page * rowsPerPage + 1} 筆到第 ${
            count > (page + 1) * rowsPerPage ? (page + 1) * rowsPerPage : count
          } 筆記錄，總共 ${count} 項記錄`}
        </Typography>
      )}
      {isDownSm && <></>}
    </Grid>
  );
};

export default SelectPerPage;
