import React, { FC } from "react";

import EditSectionHeader from "components/EditSectionHeader";
import IconButton from "components/IconButton/StyledIconButton";
import Iconify from "minimal/components/iconify";
import EditSectionDialog from "components/EditSectionDialog";

import { EditorBaseProps } from "./typings";

const EditorBase: FC<EditorBaseProps> = function (props) {
  const {
    onEditClose,
    primary,
    children,
    isOpen = false,
    handleClose,
    handleOpen,
    ...other
  } = props;

  return (
    <>
      <EditSectionDialog
        {...other}
        primary={primary}
        open={isOpen}
        onClose={() => {
          if (handleClose) {
            handleClose();
          }
          if (onEditClose) {
            onEditClose();
          }
        }}
      />
      <EditSectionHeader primary={primary}>
        <IconButton onClick={handleOpen}>
          <Iconify icon="solar:pen-bold" />
        </IconButton>
      </EditSectionHeader>
      {children}
    </>
  );
};

export default EditorBase;
