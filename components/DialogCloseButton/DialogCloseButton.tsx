import React, { FC } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import Button, { ButtonProps } from "@eGroupAI/material/Button";

export type DialogCloseButtonProps = ButtonProps;

const DialogCloseButton: FC<DialogCloseButtonProps> = function (props) {
  const { children, id = "dialog-close-button", ...other } = props;
  const wordLibrary = useSelector(getWordLibrary);

  return (
    <Button variant="outlined" color="inherit" {...other} id={id}>
      {children || (wordLibrary?.cancel ?? "取消")}
    </Button>
  );
};

export default DialogCloseButton;
