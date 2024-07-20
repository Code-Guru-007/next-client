import React, { useState, useEffect } from "react";

import { getMonth, getYear, setMonth, setYear } from "date-fns";

import {
  Box,
  Grid,
  IconButton,
  MenuItem,
  styled,
  Typography,
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { egPalette, palette } from "@eGroupAI/material/stylesheet/themeOptions";

const styles = createStyles({
  iconContainer: {
    padding: 5,
  },
  icon: {
    padding: 10,
    "&:hover": {
      background: "none",
    },
  },
});

const MONTHS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

const generateYears = (relativeTo: Date, count: number) => {
  const half = Math.floor(count / 2);
  return Array(count)
    .fill(0)
    .map((y, i) => relativeTo.getFullYear() - half + i);
};

export interface HeaderProps extends WithStyles<typeof styles> {
  date: Date;
  setDate: (date: Date) => void;
  nextDisabled: boolean;
  prevDisabled: boolean;
  onClickNext: () => void;
  onClickPrevious: () => void;
}

const Header: React.FC<HeaderProps> = ({
  date,
  classes,
  setDate,
  nextDisabled,
  prevDisabled,
  onClickNext,
  onClickPrevious,
}) => {
  const [value, setValue] = useState(MONTHS[new Date(date).getMonth()]);
  const [isShow, setIsShow] = useState(false);
  const [valueYear, setValueYear] = useState(date.getFullYear());
  const [isShowYear, setIsShowYear] = useState(false);

  useEffect(() => {
    setValue(MONTHS[new Date(date).getMonth()]);
  }, [date]);

  const StyledIconButton = styled(IconButton)(({ theme }) => ({
    padding: 10,
    "&:hover": {
      background: "none",
    },
    "& .MuiSvgIcon-root": {
      color: theme.palette.action,
      fontSize: "1.375",
    },
    "& .MuiList-root": {
      color: "red",
    },
  }));

  const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    color: theme.palette.grey[500],
    "&:hover": {
      background: palette.lightGrey.lightestGrey,
    },
  }));

  const style = {
    month: {
      padding: "7px 13px ",
      borderRadius: "35px",
      color: egPalette.darkGrey[0],
      fontWeight: 500,
      fontSize: "15px",
      background: palette.lightGrey.lightGrey,
      maxWidth: "150px",
      border: isShow ? `1px solid ${palette.primary.dark}` : "",
    },
    year: {
      padding: "7px 13px ",
      borderRadius: "35px",
      color: "#9e9e9e",
      fontWeight: 500,
      fontSize: "15px",
      background: "#f5f5f5",
      maxWidth: "150px",
      border: isShowYear ? `1px solid ${palette.primary.dark}` : "",
    },

    svg: {
      verticalAlign: "middle",
      color: " rgb(158, 158, 158)",
      fontWeight: "normal",
      fontSize: "22px",
      stroke: palette.lightGrey.white,
    },
  };

  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item className={classes.iconContainer}>
        <StyledIconButton
          disabled={prevDisabled}
          onClick={onClickPrevious}
          size="large"
        >
          <ChevronLeft color={prevDisabled ? "disabled" : "action"} />
        </StyledIconButton>
      </Grid>
      <Grid item>
        <Typography
          onClick={() => {
            setIsShowYear(!isShowYear);
          }}
          style={style.year}
        >
          {getYear(date)}
          {isShowYear ? (
            <ExpandLessIcon style={style.svg} />
          ) : (
            <ExpandMoreIcon style={style.svg} />
          )}
        </Typography>
        <Typography
          sx={{
            position: "absolute",
            height: 282,
            overflow: "auto",
            background: palette.lightGrey.white,
            boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.16)",
            zIndex: 2,
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {isShowYear && (
            <Box
              sx={{
                position: "relative",
                right: 0,
                width: "83px",
              }}
            >
              {generateYears(date, 30).map((year) => (
                <StyledMenuItem
                  style={{
                    background: year === valueYear ? "#DEEAFB" : "",
                    fontSize: "15px",
                    fontWeight: 500,
                  }}
                  key={year}
                  value={year}
                  onClick={() => {
                    setValueYear(year);
                    setDate(setYear(date, year));
                    setIsShowYear(!isShowYear);
                  }}
                >
                  {year}
                </StyledMenuItem>
              ))}
            </Box>
          )}
        </Typography>
      </Grid>
      <Grid item>
        <Typography
          onClick={() => {
            setIsShow(!isShow);
          }}
          style={style.month}
        >
          {MONTHS[getMonth(date)]}
          {isShow ? (
            <ExpandLessIcon style={style.svg} />
          ) : (
            <ExpandMoreIcon style={style.svg} />
          )}
        </Typography>
        <Typography
          sx={{
            position: "absolute",
            height: 282,
            overflow: "auto",
            background: palette.lightGrey.white,
            boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.16)",
            zIndex: 2,
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {isShow && (
            <Box
              sx={{
                position: "relative",
                right: 0,
                width: "83px",
              }}
            >
              {MONTHS.map((month, idx) => (
                <StyledMenuItem
                  style={{
                    background: month === value ? "#DEEAFB" : "",
                    fontSize: "15px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                  key={month}
                  value={idx}
                  onClick={() => {
                    setDate(setMonth(date, idx));
                    setIsShow(!isShow);
                  }}
                >
                  {month}
                </StyledMenuItem>
              ))}
            </Box>
          )}
        </Typography>
      </Grid>
      <Grid item className={classes.iconContainer}>
        <StyledIconButton
          disabled={nextDisabled}
          onClick={onClickNext}
          size="large"
        >
          <ChevronRight color={nextDisabled ? "disabled" : "action"} />
        </StyledIconButton>
      </Grid>
    </Grid>
  );
};

export default withStyles(styles, {
  name: "MuiEgHeader",
})(Header);
