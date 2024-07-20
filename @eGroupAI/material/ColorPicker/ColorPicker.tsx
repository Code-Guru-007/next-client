import React, { FC, useState, useEffect } from "react";
import { SketchPicker } from "react-color";

import { ButtonBase, Popper, ClickAwayListener, Box } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  pickerBtnWrapper: {
    display: "inline-block",
    padding: "4.5px",
    border: `solid 1px ${theme.palette.grey[300]}`,
    borderRadius: "1000px",
  },
  pickerBtn: {
    color: theme.palette.common.white,
    fontFamily: "Poppins",
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: "15px",
    lineHeight: "22px",
    padding: "10px 18px",
    borderRadius: "1000px",
  },
  colorPickerPopper: {
    zIndex: 1301,
    paddingLeft: "30px",
  },
}));

export interface ColorPickerProps {
  color?: string;
  onChange?: (color: string) => void;
  text?: string;
}

const ColorPicker: FC<ColorPickerProps> = (props) => {
  const { color: colorProp = "#000000", onChange, text = "Color" } = props;
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [color, setColor] = useState<string>(colorProp);

  const handleToggleColorPicker = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleCloseColorPicker = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    setColor(colorProp);
  }, [colorProp]);

  const open = Boolean(anchorEl);
  const id = open ? "simple-popper" : undefined;

  return (
    <>
      <Box className={classes.pickerBtnWrapper}>
        <ButtonBase
          className={classes.pickerBtn}
          sx={{
            backgroundColor: color,
          }}
          aria-describedby={id}
          type="button"
          onClick={handleToggleColorPicker}
          id="color-picker-select-button"
        >
          {text}
        </ButtonBase>
      </Box>
      <ClickAwayListener onClickAway={handleCloseColorPicker}>
        <Popper
          className={classes.colorPickerPopper}
          id={id}
          open={open}
          anchorEl={anchorEl}
          placement="right-start"
          modifiers={[
            {
              name: "preventOverflow",
              enabled: true,
              options: {
                altAxis: true,
                altBoundary: true,
                tether: true,
                rootBoundary: "document",
                padding: 8,
              },
            },
          ]}
        >
          <SketchPicker
            color={color}
            onChange={(color) => {
              if (onChange) onChange(color.hex);
            }}
          />
        </Popper>
      </ClickAwayListener>
    </>
  );
};

export default ColorPicker;
