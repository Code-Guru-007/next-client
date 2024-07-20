import React, { FC, useState } from "react";

import { makeStyles, styled, useTheme } from "@mui/styles";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";

import { NewDateRangePickerProps } from "@eGroupAI/material-lab/NewDateRangePicker";
import Typography from "@eGroupAI/material/Typography";
import Box from "@eGroupAI/material/Box";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@eGroupAI/material/CircularProgress";
import { ColumnType } from "@eGroupAI/typings/apis";

import NewDateRangePicker from "components/NewDateRangePicker/NewDateRangePicker";
import { format, toDate, DateVariant } from "@eGroupAI/utils/dateUtils";
import { DurationValueType } from "interfaces/form";
import clsx from "clsx";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { DIALOG as OUTSIDE_CLICK_DIALOG } from "components/ConfirmOutsideClickDialog";

export type RecordTarget = {
  key?: string;
  type?: ColumnType;
  name?: string;
  permission?: {
    readable?: boolean;
    writable?: boolean;
    deletable?: boolean;
  };
};

const StyledIconHoverButton = styled(IconButton)(() => ({
  padding: "7px 8px 7px 7px",
  position: "absolute",
  right: "-40px",
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

const useStyles = makeStyles({
  fieldWrapper: {
    "&::before, &::after": {
      boxSizing: "border-box",
    },
    display: "inline-flex",
    verticalAlign: "center",
    alignItems: "center",
    position: "relative",
    border: "none",
    width: "fit-content",
    minWidth: "67px",
  },
  pointer: {
    cursor: "pointer",
  },
});

export interface NewDateRangePickerWithActionProps {
  value: string[];
  name: string;
  columnType: ColumnType;
  label?: string;
  boldText?: boolean;
  showHistoryIcon?: boolean;
  format?: (val: React.ReactNode) => React.ReactNode;
  onClickHistory?: (event: any) => void;
  handleOnChange?: (
    name: string,
    value?: DurationValueType
  ) => void | Promise<string | void>;
  writable?: boolean;
  dateRangePickerProps?: NewDateRangePickerProps;
}

const NewDateRangePickerWithAction: FC<NewDateRangePickerWithActionProps> = (
  props
) => {
  const {
    name,
    boldText,
    showHistoryIcon,
    value,
    onClickHistory,
    handleOnChange,
    dateRangePickerProps,
    writable,
  } = props;
  const classes = useStyles();
  const theme = useTheme();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isHover, setIsHover] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [tempValue, setTempValue] = useState<string[]>(value);
  const {
    openDialog: openConfirmDialog,
    closeDialog: closeConfirmDialog,
    setDialogStates: setConfirmDialogStates,
  } = useReduxDialog(OUTSIDE_CLICK_DIALOG);

  const handleClickValue = () => {
    if (!writable) return;
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
  };
  const handleSave = () => {
    if (
      format(value[0], "PP pp") === format(tempValue[0], "PP pp") &&
      format(value[1], "PP pp") === format(tempValue[1], "PP pp")
    ) {
      setIsEditMode(false);
      closeConfirmDialog();
      return;
    }
    if (handleOnChange) {
      const promise = handleOnChange(name, { value: tempValue });
      if (promise) {
        setLoading(true);
        promise
          .then((res) => {
            if (res === "success") {
              setLoading(false);
              setIsEditMode(false);
              closeConfirmDialog();
            } else {
              setLoading(false);
              closeConfirmDialog();
            }
          })
          .catch(() => {});
      } else {
        setIsEditMode(false);
      }
    }
  };

  const handleChangeDateRange = (range) => {
    const startDate = range[0];
    const endDate = range[1];
    setTempValue([
      startDate ? startDate.toISOString() : "",
      endDate ? endDate.toISOString() : "",
    ]);
  };

  const handleOutsideClick = () => {
    openConfirmDialog({
      primary: "您想儲存變更嗎？",
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
      {!isEditMode && (
        <span
          role="button"
          className={clsx(classes.fieldWrapper, writable && classes.pointer)}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          onClick={handleClickValue}
          tabIndex={0}
          onKeyDown={handleClickValue}
        >
          {isHover ? (
            <Typography
              weight={boldText ? "bold" : "regular"}
              sx={{
                minWidth: "67px",
                minHeight: "21px",
                fontSize: 14,
                borderRadius: "5px",
              }}
            >
              {format(value[0], "PP pp")} ~ {format(value[1], "PP pp")}
            </Typography>
          ) : (
            <Typography
              weight={boldText ? "bold" : "regular"}
              sx={{
                minWidth: "67px",
                minHeight: "21px",
                fontSize: 14,
              }}
            >
              {format(value[0], "PP pp")} ~ {format(value[1], "PP pp")}
            </Typography>
          )}
          {isHover && showHistoryIcon && (
            <StyledIconHoverButton onClick={onClickHistory}>
              <HistoryRoundedIcon fontSize="medium" />
            </StyledIconHoverButton>
          )}
        </span>
      )}
      {isEditMode && writable && (
        <ClickAwayListener onClickAway={handleOutsideClick}>
          <Box display="flex">
            <NewDateRangePicker
              defaultStartDate={toDate(value[0] as DateVariant) as Date}
              defaultEndDate={toDate(value[1] as DateVariant) as Date}
              defaultStartTime={format(value[0], "HH:mm")}
              defaultEndTime={format(value[1], "HH:mm")}
              onChange={handleChangeDateRange}
              {...dateRangePickerProps}
            />
            <StyledIconButton
              onClick={handleSave}
              sx={{
                marginLeft: "16px",
              }}
              id={`${name}-confirm-btn`}
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
            <StyledIconButton
              onClick={handleCancel}
              id={`cancel-btn-${name}`}
              data-tid={`cancel-btn-${name}`}
            >
              {!loading && (
                <CancelRoundedIcon
                  sx={{
                    color: theme.palette.error.main,
                  }}
                />
              )}
            </StyledIconButton>
          </Box>
        </ClickAwayListener>
      )}
    </>
  );
};

export default NewDateRangePickerWithAction;
