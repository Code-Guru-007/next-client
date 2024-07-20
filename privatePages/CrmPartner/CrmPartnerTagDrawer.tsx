import React, { FC, ReactElement } from "react";

import Stack from "@mui/material/Stack";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";

import Iconify from "minimal/components/iconify";

export interface CrmPartnerTagDrawerProps {
  isOpen?: boolean;
  onClickAway?: () => void;
  children: ReactElement;
}

const CrmPartnerTagDrawer: FC<CrmPartnerTagDrawerProps> = (props) => {
  const { isOpen = false, onClickAway, children } = props;

  const handleClose = () => {
    if (onClickAway) onClickAway();
  };

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, pr: 1, pl: 2.5 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Tag
      </Typography>

      <IconButton onClick={handleClose}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  return (
    <Drawer
      open={isOpen}
      onClose={handleClose}
      anchor="right"
      PaperProps={{
        sx: { width: 380 },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "transparent",
        },
      }}
    >
      {renderHead}
      <Divider sx={{ borderStyle: "dashed" }} />
      <Box sx={{ marginTop: 2 }}>{children}</Box>
    </Drawer>
  );
};

export default CrmPartnerTagDrawer;
