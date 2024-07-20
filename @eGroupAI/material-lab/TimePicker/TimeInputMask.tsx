import React, { forwardRef, useEffect, useState } from "react";
import InputMask, { Props as InputMaskProps } from "react-input-mask-3.0";
import { InputBase } from "@eGroupAI/material";

export interface TimeInputMaskProp extends Omit<InputMaskProps, "onChange"> {
  value?: string;
  changeDropList?: (v: string) => void;
  onClick: (e: React.MouseEvent) => void;
  onChange?: (v: string) => void;
  enableOnBlurChange?: boolean;
  onSave?: () => void;
}

const TimeInputMask = forwardRef<HTMLInputElement, TimeInputMaskProp>(
  (props, ref) => {
    const {
      value: valueProp,
      changeDropList,
      onClick: setShowPopper,
      onChange,
      onSave,
      enableOnBlurChange = false,
    } = props;

    const [time, setTime] = useState<string>(
      ((valueProp as string) || "00:00").replaceAll(":", " : ")
    );

    const startsWithTwo = time?.replaceAll(":", " : ")[0] === "2";
    const maskRegExps = [
      /[0-2]/,
      startsWithTwo ? /[0-3]/ : /\d/,
      " ",
      ":",
      " ",
      /[0-5]/,
      /\d/,
    ];

    const handleInput = ({ target: { value } }) => {
      setTime(value);
      if (!enableOnBlurChange && onChange) onChange(value);
    };

    const handleOnBlur = () => {
      if (enableOnBlurChange && onChange) onChange(time);
    };

    const handleKeyDown = (e) => {
      if (e.keyCode === 13 && onSave) {
        onSave();
      }
    };

    useEffect(() => {
      setTime((valueProp as string).replaceAll(":", " : "));
    }, [valueProp]);

    useEffect(() => {
      if (changeDropList) changeDropList(time);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [time]);

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (setShowPopper) setShowPopper(e);
        }}
        role="button"
        tabIndex={0}
        aria-hidden
      >
        <InputMask
          mask={maskRegExps}
          value={time}
          onChange={handleInput}
          onBlur={handleOnBlur}
          placeholder="__ : __"
        >
          <InputBase
            inputRef={ref}
            onKeyDown={handleKeyDown}
            sx={{
              width: "62px",
              fontSize: "15px",
              display: "flex",
              justifyContent: "center",
            }}
            id={`time-input-mask`}
            data-tid={`time-input-mask`}
          />
        </InputMask>
      </div>
    );
  }
);

export default React.memo(TimeInputMask);
