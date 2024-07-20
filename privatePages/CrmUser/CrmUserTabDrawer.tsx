import React, { FC } from "react";

import { useRouter } from "next/router";
import Stack from "@mui/material/Stack";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ResponsiveTabs from "components/ResponsiveTabs";

import Iconify from "minimal/components/iconify";

export interface TabDataItem {
  label: string;
  value: string;
}

export interface CrmUserTabDrawerProps {
  isOpen?: boolean;
  onClickAway?: () => void;
  tabValue?: string;
  tabData?: TabDataItem[];
}

const CrmUserTabDrawer: FC<CrmUserTabDrawerProps> = (props) => {
  const { isOpen = false, onClickAway, tabValue, tabData } = props;

  const { query, push, pathname } = useRouter();

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
        目錄
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
        sx: { width: 320 },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "transparent",
        },
      }}
    >
      {renderHead}
      <ResponsiveTabs
        value={tabValue}
        tabData={tabData}
        onChange={(value) => {
          push({
            pathname,
            query: {
              ...query,
              tab: value,
            },
          });
        }}
        isDrawer
      />
      <Divider sx={{ borderStyle: "dashed" }} />
    </Drawer>
  );
};

export default CrmUserTabDrawer;
