import React, { FC } from "react";

import IconButton from "@mui/material/IconButton";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";

import Box from "@eGroupAI/material/Box";
import FroalaEditorView from "components/FroalaEditorView";

export interface ColumnDescriptionProps {
  descr?: string;
  handleClose?: () => void;
}

const ColumnDescription: FC<ColumnDescriptionProps> = function (props) {
  const { descr, handleClose } = props;

  return (
    <Box sx={{ padding: "20px", zIndex: "999" }} maxWidth="md">
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ alignItems: "center", display: "flex" }}>
          <HelpOutlineIcon sx={{ mr: "16px" }} />
          {"說明"}
        </Box>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ mt: "10px" }}>
        <FroalaEditorView model={descr} />
      </Box>
    </Box>
  );
};

export default React.memo(ColumnDescription);
