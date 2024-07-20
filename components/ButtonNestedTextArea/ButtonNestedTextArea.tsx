import React, { FC, ReactNode, useState, useEffect } from "react";

import InputBase, { InputBaseProps } from "@mui/material/InputBase";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import Box from "@eGroupAI/material/Box";
import Button, { ButtonProps } from "@eGroupAI/material/Button";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

export interface ButtonNestedTextAreaProps
  extends Omit<InputBaseProps, "startAdorment" | "endAdorment"> {
  nestedButton?: ReactNode;
  collapsable?: boolean;
  onCancel?: () => void;
  onOkay?: () => void;
  cancelButtonProps?: Omit<ButtonProps, "onClick">;
  okayButtonProps?: Omit<ButtonProps, "onClick">;
  cancelButtonText?: string;
  okayButtonText?: string;
}

const useStyles = makeStyles((theme) => ({
  inputField: {
    position: "relative",
    border: "1px solid",
    borderColor: theme.palette.grey[300],
    padding: "10px 10px 50px 10px",
    transition: "all 0.5s",
    borderRadius: "8px",
    "& .MuiInputBase-input": {
      transition: "height 0.5s",
    },
  },
  unCollapsedInputField: {
    borderRadius: "8px",
    padding: "20px",
  },
  nestedChild: {
    display: "inline-flex",
    justifyContent: "space-between",
    bottom: "12px",
    right: "12px",
    position: "absolute",
    transition: "all 0.5s",
  },
  nestedChildCollapsable: {
    visibility: "hidden",
    opacity: 0,
  },
  unCollapsedNestedChild: {
    visibility: "visible",
    opacity: 1,
  },
}));

const ButtonNestedTextArea: FC<ButtonNestedTextAreaProps> = (props) => {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    collapsable = false,
    onCancel,
    onOkay,
    cancelButtonProps,
    okayButtonProps,
    cancelButtonText = `${wordLibrary?.cancel ?? "取消"}`,
    okayButtonText = `${wordLibrary?.save ?? "儲存"}`,
    ...others
  } = props;
  const classes = useStyles(props);

  const [minRows, setMinRows] = useState<number>(collapsable ? 1 : 6);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  useEffect(() => {
    if (collapsable) {
      setMinRows(isCollapsed ? 1 : 6);
    }
  }, [collapsable, isCollapsed]);

  const handleCollapse = () => {
    if (collapsable) {
      setIsCollapsed(true);
    }
  };

  const handleUnCollapse = () => {
    if (collapsable) {
      setIsCollapsed(false);
    }
  };

  const handlCancel = (e) => {
    e.stopPropagation();
    e.preventDefault();
    handleCollapse();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <InputBase
      className={clsx(classes.inputField, {
        [classes.unCollapsedInputField]: !isCollapsed,
      })}
      rows={minRows}
      fullWidth
      multiline
      endAdornment={
        <Box
          className={clsx(classes.nestedChild, {
            [classes.nestedChildCollapsable]: collapsable,
            [classes.unCollapsedNestedChild]: !isCollapsed,
          })}
        >
          <Button {...cancelButtonProps} onClick={handlCancel}>
            {cancelButtonText}
          </Button>
          <Button
            {...okayButtonProps}
            onClick={() => {
              if (onOkay) onOkay();
            }}
          >
            {okayButtonText}
          </Button>
        </Box>
      }
      onClick={handleUnCollapse}
      {...others}
    />
  );
};

export default ButtonNestedTextArea;
