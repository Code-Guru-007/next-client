import React, { useEffect, useState } from "react";
import { SliderProps as MuiSliderProps, TextField } from "@eGroupAI/material";
import { makeStyles } from "@mui/styles";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import StyledSlider from "./StyledSlider";
import { Value } from "./types";

const useStyles = makeStyles(() => ({
  textFields: {
    display: "flex",
    justifyContent: "space-between",
  },
}));

interface NumberRangeSliderProps {
  min?: number;
  max?: number;
  valueLabelDisplay?: MuiSliderProps["valueLabelDisplay"];
  showSliderBar?: boolean;
  switchEnabled?: boolean;
}

interface NumberRangeInputProps {
  name: string;
  defaultValue?: number[];
  label?: string;
  className?: string;
  onClick?: (value: React.SetStateAction<number>) => void;
  isClearNumberRange?: boolean;
  onClearNumberRange?: React.Dispatch<React.SetStateAction<boolean>>;
  setFilterOptionsTempValue?: React.Dispatch<React.SetStateAction<Value>>;
}

export type NumberRangeProps = NumberRangeSliderProps & NumberRangeInputProps;

const NumberRange = (props: NumberRangeProps) => {
  const wordLibrary = useSelector(getWordLibrary);
  const classes = useStyles();
  const {
    min,
    max,
    showSliderBar,
    name,
    defaultValue,
    className,
    isClearNumberRange,
    onClearNumberRange,
    setFilterOptionsTempValue,
  } = props;

  const [range, setRange] = useState<string[] | number[] | undefined>(
    defaultValue
  );

  const [from, setFrom] = useState<string | number | undefined>(
    range ? range[0] : ""
  );
  const [to, setTo] = useState<string | number | undefined>(
    range ? range[1] : ""
  );

  useEffect(() => {
    if (setFilterOptionsTempValue)
      setFilterOptionsTempValue((prev) => ({
        ...prev,
        [name as string]: [(from as number) || null, (to as number) || null],
      }));
  }, [name, setFilterOptionsTempValue, from, to]);

  useEffect(() => {
    if (isClearNumberRange) {
      setRange(undefined);
      setFrom("");
      setTo("");
      if (onClearNumberRange) onClearNumberRange(false);
    }
  }, [isClearNumberRange, onClearNumberRange]);

  return (
    <div className={className}>
      {showSliderBar && (
        <StyledSlider
          value={range as number[]}
          min={min}
          max={max}
          onChange={(_, newValue) => {
            setRange(newValue as number[]);
          }}
          valueLabelDisplay="off"
        />
      )}
      <div className={classes.textFields}>
        <TextField
          name={`${name}-from`}
          value={from}
          placeholder={wordLibrary?.["minimum value"] ?? "最小值"}
          variant="standard"
          inputProps={{ style: { textAlign: "center" } }}
          onChange={(e) => {
            const from = Number(e.target.value);
            const to = Number(range ? range[1] : undefined);
            setRange([from, to]);
            setFrom(from);
          }}
          onBlur={(e) => {
            const from = Number(e.target.value);
            const to = Number(range ? range[1] : undefined);
            if (from > to) {
              setRange([from, from]);
              setTo(from);
            }
          }}
          type="number"
        />
        <TextField
          name={`${name}-to`}
          value={to}
          placeholder={wordLibrary?.["maximum value"] ?? "最大值"}
          variant="standard"
          inputProps={{ style: { textAlign: "center" } }}
          onChange={(e) => {
            const from = Number(range && range[0]);
            const to = Number(e.target.value);
            setRange([from, to]);
            setTo(to);
          }}
          onBlur={(e) => {
            const from = Number(range && range[0]);
            const to = Number(e.target.value);
            if (from > to) {
              setRange([to, to]);
              setFrom(to);
            }
          }}
          type="number"
        />
      </div>
    </div>
  );
};

export default NumberRange;
