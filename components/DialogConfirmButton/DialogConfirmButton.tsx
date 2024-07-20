import React, { FC } from "react";
import Button, { ButtonProps } from "@eGroupAI/material/Button";

export type DialogConfirmButtonProps = ButtonProps;

const DialogConfirmButton: FC<DialogConfirmButtonProps> = function ({
  children = "確認",
  loading = false,
  id = "dialog-confirm-button",
  ...props
}) {
  return (
    <Button
      variant="contained"
      disabled={loading}
      loading={loading}
      {...props}
      id={id}
    >
      {children}
    </Button>
  );
};

export default DialogConfirmButton;
