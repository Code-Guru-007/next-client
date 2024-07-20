import React, { FC, useState } from "react";

import DatePicker, { DatePickerProps } from "@eGroupAI/material-lab/DatePicker";
import { Typography, CircularProgress } from "@eGroupAI/material";

import IconButton from "@mui/material/IconButton";
import HistoryRounded from "@mui/icons-material/HistoryRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";

import { ColumnType } from "@eGroupAI/typings/apis";
import styled from "@mui/styles/styled";
import { makeStyles, useTheme } from "@mui/styles";

import clsx from "clsx";
import { format } from "@eGroupAI/utils/dateUtils";
import { DynamicValueType } from "interfaces/form";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { DIALOG as OUTSIDE_CLICK_DIALOG } from "components/ConfirmOutsideClickDialog";

const StyledIconHoverButton = styled(IconButton)(() => ({
  padding: "7px 8px 7px 7px",
  position: "absolute",
  right: "-30px",
  backgroundColor: "transparent",
  "&:hover": {
    filter: "none",
  },
}));

const StyledIconButton = styled(IconButton)(() => ({
  backgroundColor: "transparent",
  padding: "1px",
  "&:hover": {
    backgroundColor: "transparent",
  },
}));

const useStyles = makeStyles(() => ({
  typographyDiv: {
    display: "flex",
    position: "relative",
    alignItems: "center",
    border: "none",
    width: "fit-content",
    minWidth: "90px",
  },
  pointer: {
    cursor: "pointer",
  },
  datePicker: {
    minWidth: 100,
  },
  withActionDatePicker: {
    padding: "4px 8px !important",
    display: "flex",
  },
}));

export interface DatePickterWithActionProps extends DatePickerProps {
  value?: Date | null;
  name: string;
  columnType: ColumnType;
  isTime?: boolean;
  label?: string;
  boldText?: boolean;
  showHistoryIcon?: boolean;
  maxDate?: string | Date;
  minDate?: string | Date;
  format?: (val: React.ReactNode) => React.ReactNode;
  onClickHistory?: (event: any) => void;
  handleOnChange?: (
    name: string,
    value?: DynamicValueType
  ) => void | Promise<string | void>;
  writable?: boolean;
}

const DatePickerWithAction: FC<DatePickterWithActionProps> = function (props) {
  const {
    value: valueProp,
    name,
    isTime = false,
    format: formatValue,
    boldText,
    showHistoryIcon,
    onClickHistory,
    handleOnChange: handleOnChangeProp,
    writable = true,
    ...others
  } = props;

  const {
    openDialog: openConfirmDialog,
    closeDialog: closeConfirmDialog,
    setDialogStates: setConfirmDialogStates,
  } = useReduxDialog(OUTSIDE_CLICK_DIALOG);

  const classes = useStyles(props);
  const theme = useTheme();

  const [tempValue, setTempValue] = useState(valueProp);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isHover, setIsHover] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleClickValue = () => {
    if (!writable) return;
    setIsEdit(true);
  };

  const handleValueChange = (date?: Date | null) => {
    setTempValue(date);
  };

  const handleSave = () => {
    if (
      format(tempValue, "yyyy-MM-dd hh:mm") ===
      format(valueProp, "yyyy-MM-dd hh:mm")
    ) {
      setIsEdit(false);
      closeConfirmDialog();
      return;
    }
    if (handleOnChangeProp) {
      let dateStrToSave: string | undefined;
      if (!isTime) {
        dateStrToSave = format(tempValue, "yyyy-MM-dd");
      } else {
        dateStrToSave = tempValue?.toISOString();
      }
      const promise = handleOnChangeProp(name, { value: dateStrToSave });
      if (promise) {
        setLoading(true);
        promise
          .then((res) => {
            if (res === "success") {
              setLoading(false);
              setIsEdit(false);
              closeConfirmDialog();
            } else {
              setLoading(false);
              closeConfirmDialog();
            }
          })
          .catch(() => {});
      } else {
        setIsEdit(false);
      }
    }
  };

  const handleCancel = () => {
    setTempValue(valueProp);
    setIsEdit(false);
  };

  const handleOutsideClick = () => {
    openConfirmDialog({
      primary: "您想儲存變更嗎？",
      // message: "valueProp",
      isLoading: loading,
      onConfirm: () => {
        setConfirmDialogStates({ isLoading: true });
        handleSave();
      },
      onClose: () => {
        handleCancel();
        closeConfirmDialog();
      },
    });
  };

  return (
    <>
      {!isEdit && (
        <span
          className={clsx(classes.typographyDiv, writable && classes.pointer)}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          onClick={handleClickValue}
          role="button"
          tabIndex={0}
          onKeyDown={handleClickValue}
        >
          {isTime && valueProp ? (
            <Typography
              weight={boldText ? "bold" : "regular"}
              sx={{
                minWidth: "200px",
                minHeight: "35px",
                wordBreak: "break-word",
                fontSize: 14,
                borderRadius: "5px",
                padding: "6px",
              }}
            >
              {formatValue ? formatValue(valueProp) : valueProp || ""}
            </Typography>
          ) : (
            <>
              {valueProp ? (
                <Typography
                  weight={boldText ? "bold" : "regular"}
                  sx={{
                    minWidth: "200px",
                    minHeight: "35px",
                    wordBreak: "break-word",
                    fontSize: 14,
                    borderRadius: "5px",
                    padding: "6px",
                  }}
                >
                  {formatValue ? formatValue(valueProp) : valueProp || ""}
                </Typography>
              ) : (
                <Typography
                  weight={boldText ? "bold" : "regular"}
                  sx={{
                    minWidth: "200px",
                    minHeight: "35px",
                    wordBreak: "break-word",
                    border: writable ? "1px solid gray" : "none",
                    fontSize: 14,
                    borderRadius: "5px",
                    padding: "6px",
                  }}
                >
                  {formatValue ? formatValue(valueProp) : valueProp || ""}
                </Typography>
              )}
            </>
          )}
          {isHover && showHistoryIcon && (
            <StyledIconHoverButton onClick={onClickHistory}>
              <HistoryRounded />
            </StyledIconHoverButton>
          )}
        </span>
      )}
      {isEdit && writable && (
        <ClickAwayListener onClickAway={handleOutsideClick}>
          <div className={clsx(classes.typographyDiv, classes.pointer)}>
            <DatePicker
              className={clsx(classes.withActionDatePicker, classes.datePicker)}
              value={tempValue}
              name={name}
              isTime={isTime}
              enableAction
              hiddenLabel
              onChange={handleValueChange}
              onSave={handleSave}
              {...others}
            />
            <StyledIconButton
              onClick={handleSave}
              sx={{
                marginLeft: "16px",
              }}
              id={`confirm-btn-${name}`}
              data-tid={`confirm-btn-${name}`}
            >
              {loading && <CircularProgress size={20} sx={{ ml: "10px" }} />}
              {!loading && (
                <CheckCircleRoundedIcon
                  sx={{
                    color: theme.palette.success.main,
                  }}
                />
              )}
            </StyledIconButton>
            <StyledIconButton onClick={handleCancel} id={`${name}-cancel-btn`}>
              {!loading && (
                <CancelRoundedIcon
                  sx={{
                    color: theme.palette.error.main,
                  }}
                />
              )}
            </StyledIconButton>
          </div>
        </ClickAwayListener>
      )}
    </>
  );
};

export default DatePickerWithAction;
