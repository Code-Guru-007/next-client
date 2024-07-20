/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { forwardRef, useEffect, useRef, useState } from "react";
import {
  ClickAwayListener,
  ClickAwayListenerProps,
  InputBase,
} from "@mui/material";

import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  inputSizer: {
    "&::before, &::after": {
      boxSizing: "border-box",
    },
    display: "inline-grid",
    verticalAlign: "top",
    alignItems: "center",
    position: "relative",
    border: "none",
    width: "auto",

    "&::after": {
      width: "auto",
      gridArea: "1 / 2",
      font: "inherit",
      margin: 0,
      resize: "none",
      appearance: "none",
      border: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50px",
      letterSpacing: "0.5px",
      padding: "2px 6px 2px 6px",
      fontStyle: "normal",
      fontWeight: 400,
      fontSize: "15px",
      lineHeight: "22.5px",

      content: "attr(data-value)",
      visibility: "hidden",
      whiteSpace: "pre-wrap",
    },
  },
  inputBox: {
    width: "auto",
    gridArea: "1 / 2",
    font: "inherit",
    margin: 0,
    resize: "none",
    appearance: "none",
    borderRadius: "35px",
    display: "inline-flex",
    "& .MuiInputBase-input": {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "35px",
      letterSpacing: "0.5px",
      padding: "2px 6px 2px 6px",
      fontStyle: "normal",
      fontWeight: 400,
      fontSize: "15px",
      lineHeight: "22.5px",
      backgroundColor: theme.palette.background.default,
      marginLeft: "-9px",
    },
  },
  valueSpan: {
    marginLeft: "-3px",
    marginRight: "5px",
  },
}));

export interface EditableLabelProp {
  value?: string;
  maxWidth?: number;
  shortenValue?: string;
  shortenValueLength?: number;
  showTooltip?: boolean;
  onClickAway?: ClickAwayListenerProps["onClickAway"];
  isEditName?: boolean;
  setIsEditName?: React.Dispatch<React.SetStateAction<boolean>>;
  onSaveName?: (value: string | undefined) => void | Promise<void | string>;
  isUpdating?: boolean;
  isSelected?: boolean;
}

const EditableLabel = forwardRef<HTMLDivElement, EditableLabelProp>(
  (prop, ref) => {
    const classes = useStyles(prop);
    const {
      value: valueProp,
      isEditName: isEditProp = false,
      setIsEditName,
      onSaveName,
      isUpdating: isUpdatingProp = false,
      isSelected = false,
    } = prop;
    const inputEl = useRef<HTMLInputElement | null>(null);
    const [keyPressed, setKeyPressed] = useState<string>("");
    const [isEdit, setIsEdit] = useState<boolean>(isEditProp);
    useEffect(() => {
      setIsEdit(isEditProp);
    }, [isEditProp]);

    useEffect(() => {
      if (isEdit && inputEl && inputEl.current) inputEl.current.focus();
    }, [isEdit, inputEl]);

    const [value, setValue] = useState<string>(valueProp as string);

    useEffect(() => {
      setValue(valueProp as string);
    }, [valueProp]);

    const handleClickAway = () => {
      if (keyPressed === " ") return;
      if (value === "") return;
      if (value === valueProp) {
        if (setIsEditName) setIsEditName(false);
        return;
      }
      if (onSaveName) {
        const promise = onSaveName(value);
        if (promise) {
          promise
            .then((res) => {
              if (res === "success") {
                if (setIsEditName) setIsEditName(false);
              }
            })
            .catch(() => {});
        }
        if (setIsEditName) setIsEditName(false);
      }
    };

    const handleInputChange = (e) => {
      setValue(e.target.value);
    };

    useEffect(() => {
      if (isEdit && inputEl && inputEl.current) inputEl.current.focus();
    }, [isEdit]);

    const handleClickInput = (e) => {
      e.stopPropagation();
      if (isSelected) {
        if (setIsEditName) setIsEditName(true);
      }
    };

    const handleMouseDoubleClick = (e) => {
      e.stopPropagation();
      if (isSelected) {
        if (setIsEditName) setIsEditName(true);
      }
    };

    if (isEdit)
      return (
        <ClickAwayListener onClickAway={handleClickAway}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleClickAway();
            }}
            style={{ display: "inline-flex" }}
          >
            <span className={classes.inputSizer} data-value={value}>
              <InputBase
                value={value}
                disabled={isUpdatingProp}
                className={classes.inputBox}
                onChange={handleInputChange}
                onClick={handleClickInput}
                onKeyPress={(e) => setKeyPressed(e.key)}
                inputProps={{ size: 1, ref: inputEl }}
                id={`filterview-${value}-input`}
                data-tid={`filterview-${value}-input`}
              />
            </span>
          </form>
        </ClickAwayListener>
      );
    return (
      <span
        ref={ref}
        onDoubleClick={handleMouseDoubleClick}
        className={classes.valueSpan}
      >
        {value}
      </span>
    );
  }
);

export default EditableLabel;
