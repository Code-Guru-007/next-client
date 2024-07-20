import React, { FC } from "react";

import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Iconify from "minimal/components/iconify/iconify";

const DialogFullPageCloseButton: FC<IconButtonProps> = function (props) {
  const { ...other } = props;

  return (
    <>
      <IconButton {...other}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </>
  );
};

export default DialogFullPageCloseButton;
