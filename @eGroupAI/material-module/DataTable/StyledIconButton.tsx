import React from "react";
import { useTheme } from "@mui/material";
import IconButton, { IconButtonProps } from "@eGroupAI/material/IconButton";

const StyledIconButton = (props: IconButtonProps) => {
  const theme = useTheme();
  return (
    <IconButton
      color="default"
      sx={{
        color: theme.palette.grey[300],
        padding: "8px",
        left: "-3px",
        backgroundColor: "transparent",
        "&:hover": {
          backgroundColor: "transparent",
        },
      }}
      {...props}
    />
  );
};

export default StyledIconButton;
