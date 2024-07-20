import React, { forwardRef } from "react";
import InputBase from "../../material/InputBase";

export interface DateInputMaskProp {
  value?: string;
  onChange?: (v: string) => void;
  onClick: (e: React.MouseEvent) => void;
  onSave?: () => void;
  name?: string;
  required?: boolean;
}

const DateInputMask = forwardRef<HTMLInputElement, DateInputMaskProp>(
  (props, ref) => {
    const {
      value = "",
      onChange,
      onSave,
      onClick: setShowPopper,
      ...others
    } = props;

    const formatDateValue = (value) => {
      const trimValue = value.replace(/\D/g, "");
      let formatedValue;
      if (trimValue.length === 1) {
        formatedValue = `${trimValue}___-__-__`;
      } else if (trimValue.length === 2) {
        formatedValue = `${trimValue}__-__-__`;
      } else if (trimValue.length === 3) {
        formatedValue = `${trimValue}_-__-__`;
      } else if (trimValue.length === 4) {
        formatedValue = `${trimValue}-__-__`;
      } else if (trimValue.length === 5) {
        formatedValue = `${trimValue.slice(0, 4)}-${trimValue.slice(4)}_-__`;
      } else if (trimValue.length === 6) {
        formatedValue = `${trimValue.slice(0, 4)}-${trimValue.slice(4)}-__`;
      } else if (trimValue.length === 7) {
        formatedValue = `${trimValue.slice(0, 4)}-${trimValue.slice(
          4,
          6
        )}-${trimValue.slice(6)}_`;
      } else if (trimValue.length === 8) {
        formatedValue = `${trimValue.slice(0, 4)}-${trimValue.slice(
          4,
          6
        )}-${trimValue.slice(6)}`;
      }
      return formatedValue;
    };

    const convertString = (a) => {
      let result = a;
      for (let index = a.length - 1; index > 0; index--) {
        if (a[index] === "_" || a[index] === "-") {
          result = result.slice(0, index);
        } else {
          break;
        }
      }
      return result;
    };

    const handleOnChange = (e) => {
      let input = e.target.value;
      // Remove any non-digit characters
      input = input.replace(/\D/g, "");

      if (input.length <= 4) {
        if (input[0] < 3 || input[0] === undefined) {
          if (onChange) {
            onChange(formatDateValue(input));
          }
        }
      } else if (input.length <= 6) {
        if (input[4] < 2) {
          if (input[5] === undefined) {
            if (onChange) {
              onChange(
                formatDateValue(`${input.slice(0, 4)}-${input.slice(4)}`)
              );
            }
          } else if (Number(input[4]) === 1 && input[5] < 3) {
            if (onChange) {
              onChange(
                formatDateValue(`${input.slice(0, 4)}-${input.slice(4)}`)
              );
            }
          } else if (Number(input[4]) === 0) {
            if (onChange && Number(input[5]) !== 0) {
              onChange(
                formatDateValue(`${input.slice(0, 4)}-${input.slice(4)}`)
              );
            }
          }
        }
      } else if (input[6] < 4) {
        if (input[7] === undefined) {
          if (onChange) {
            onChange(
              formatDateValue(
                `${input.slice(0, 4)}-${input.slice(4, 6)}-${input.slice(6, 8)}`
              )
            );
          }
        } else if (Number(input[6]) === 3 && input[7] < 2) {
          // file deepcode ignore DuplicateIfBody: <please specify a reason of ignoring this>
          if (onChange) {
            onChange(
              formatDateValue(
                `${input.slice(0, 4)}-${input.slice(4, 6)}-${input.slice(6, 8)}`
              )
            );
          }
        } else if (input[6] < 3) {
          if (Number(input[6]) === 0) {
            if (Number(input[7]) !== 0) {
              if (onChange) {
                onChange(
                  formatDateValue(
                    `${input.slice(0, 4)}-${input.slice(4, 6)}-${input.slice(
                      6,
                      8
                    )}`
                  )
                );
              }
            }
          } else if (onChange) {
            onChange(
              formatDateValue(
                `${input.slice(0, 4)}-${input.slice(4, 6)}-${input.slice(6, 8)}`
              )
            );
          }
        }
      }
    };

    const handleKeyDown = (e) => {
      if (e.keyCode === 13 && onSave) {
        onSave();
      }
    };

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
        <InputBase
          inputRef={ref}
          value={convertString(value)}
          onChange={handleOnChange}
          onKeyDown={handleKeyDown}
          sx={{
            width: "120px",
            fontSize: "15px",
            display: "flex",
            justifyContent: "center",
          }}
          placeholder="____-__-__"
          id={`date-input-mask-${others.name}`}
          data-tid={`date-input-mask-${others.name}`}
          {...others}
        />
      </div>
    );
  }
);

export default DateInputMask;
