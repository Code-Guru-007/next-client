import React, { useState, useRef, useEffect } from "react";
import { setMonth, setYear, getMonth, getYear } from "date-fns";

import {
  Box,
  Grid,
  IconButton,
  MenuItem,
  styled,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { egPalette, palette } from "@eGroupAI/material/stylesheet/themeOptions";

const useStyles = makeStyles({
  iconContainer: {
    padding: 5,
  },
  onlyDate: {
    borderRadius: "50px",
    backgroundColor: "#F1F1F1",
    color: "#9E9E9E",
    width: 88,
    height: "39.72px",
    fontSize: 15,
    lineHeight: "39.72px",
    fontWeight: 500,
    textAlign: "center",
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

const generateDefaultYears = (focusedYear) =>
  Array(16)
    .fill(0)
    .map((el, i) => focusedYear + i - 9);

export interface HeaderProps {
  date: Date;
  minDate: Date;
  maxDate: Date;
  disableYearMonth: boolean;
  setDate: (date: Date) => void;
  nextDisabled: boolean;
  prevDisabled: boolean;
  onClickNext: () => void;
  onClickPrevious: () => void;
}

const Header: React.FC<HeaderProps> = (props) => {
  const classes = useStyles();
  const {
    date,
    minDate,
    maxDate,
    disableYearMonth,
    setDate,
    nextDisabled,
    prevDisabled,
    onClickNext,
    onClickPrevious,
  } = props;

  const [currentMonth] = useState(new Date().getMonth());
  const [currentYear] = useState(new Date().getFullYear());

  const [isShow, setIsShow] = useState(false);
  const [valueYear, setValueYear] = useState(date.getFullYear());
  const [valueMonth, setValueMonth] = useState(date.getMonth());
  const [isShowYear, setIsShowYear] = useState(false);
  const [isDisablePrev] = useState(prevDisabled || disableYearMonth);
  const [isDisableNext] = useState(nextDisabled || disableYearMonth);
  const [years, setYears] = useState<number[]>(generateDefaultYears(valueYear));
  const scrollParentRef = useRef<HTMLDivElement>(null);

  const loadYears = (e) => {
    if (e.target.scrollTop < 69) {
      const newYears = [
        ...Array(4)
          .fill(0)
          .map((el, i) => (years[0] || valueYear) - 4 + i),
        ...years,
      ].slice(0, 16);
      setYears(newYears);
      e.target.scrollTop = 207;
    }

    if (e.target.scrollTop > 241.5) {
      const newYears = [
        ...years,
        ...Array(4)
          .fill(0)
          .map((el, i) => (years[years.length - 1] || valueYear) + i + 1),
      ].slice(-16);
      setYears(newYears);
      e.target.scrollTop = 138;
    }
  };

  useEffect(() => {
    if (scrollParentRef.current) {
      scrollParentRef.current.scrollTop = 276;
    }
  }, [isShowYear]);

  useEffect(() => {
    if (valueYear !== date.getFullYear()) setValueYear(date.getFullYear());
    if (valueMonth !== date.getMonth()) setValueMonth(date.getMonth());
  }, [date]);

  useEffect(() => {
    setYears(generateDefaultYears(valueYear));
  }, [valueYear]);

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
    test: {
      padding: "7px 13px ",
      borderRadius: "35px",
      color: egPalette.darkGrey[0],
      fontWeight: 500,
      fontSize: "15px",
      background: palette.lightGrey.lightGrey,
      maxWidth: "150px",
      border: isShow ? `1px solid ${palette.primary.dark}` : "",
    },
    test2: {
      padding: "7px 13px ",
      borderRadius: "35px",
      color: egPalette.darkGrey[0],
      fontWeight: 500,
      fontSize: "15px",
      background: palette.lightGrey.lightGrey,
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
          disabled={isDisablePrev}
          onClick={onClickPrevious}
          size="large"
          sx={{
            fontWeight: "normal",
          }}
        >
          <ChevronLeft color={isDisablePrev ? "disabled" : "action"} />
        </StyledIconButton>
      </Grid>
      <Grid item>
        {!disableYearMonth ? (
          <>
            <Typography
              onClick={() => {
                if (minDate.getFullYear() !== maxDate.getFullYear()) {
                  setIsShowYear(!isShowYear);
                }
              }}
              sx={style.test2}
            >
              {getYear(date)}
              {isShowYear ? (
                <ExpandLessIcon sx={style.svg} />
              ) : (
                <ExpandMoreIcon sx={style.svg} />
              )}
            </Typography>
            <Box
              ref={scrollParentRef}
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
              onScroll={loadYears}
            >
              {isShowYear && (
                <Box
                  sx={{
                    position: "relative",
                    right: 0,
                    width: "83px",
                  }}
                >
                  {years.map((year) => (
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
            </Box>
          </>
        ) : (
          <div className={classes.onlyDate}>{currentYear}</div>
        )}
      </Grid>
      <Grid item>
        {!disableYearMonth ? (
          <>
            <Typography
              onClick={() => {
                setIsShow(!isShow);
              }}
              sx={style.test}
            >
              {MONTHS[getMonth(date)]}
              {isShow ? (
                <ExpandLessIcon sx={style.svg} />
              ) : (
                <ExpandMoreIcon sx={style.svg} />
              )}
            </Typography>
            <Typography
              sx={{
                position: "absolute",
                height: 282,
                overflow: "auto",
                background: "#FFFFFF",
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
                        background: idx === valueMonth ? "#DEEAFB" : "",
                        fontSize: "15px",
                        fontWeight: 500,
                      }}
                      key={month}
                      value={idx}
                      onClick={() => {
                        setValueMonth(idx + 1);
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
          </>
        ) : (
          <div className={classes.onlyDate}>{MONTHS[currentMonth]}</div>
        )}
      </Grid>
      <Grid item className={classes.iconContainer}>
        <StyledIconButton
          disabled={isDisableNext}
          onClick={onClickNext}
          size="large"
          sx={{
            fontWeight: "normal",
          }}
        >
          <ChevronRight color={isDisableNext ? "disabled" : "action"} />
        </StyledIconButton>
      </Grid>
    </Grid>
  );
};

export default Header;
