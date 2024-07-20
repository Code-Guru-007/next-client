import React, { FC } from "react";

import Stack from "@mui/material/Stack";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import Iconify from "minimal/components/iconify";
import Scrollbar from "minimal/components/scrollbar";
import AnchorItem, { Data } from "./ShareContentAnchorItem";

export interface ShareContentDrawerProps {
  isOpen?: boolean;
  onClickAway?: () => void;
  contentRef?: React.RefObject<HTMLDivElement>;
}

const ShareContentDrawer: FC<ShareContentDrawerProps> = (props) => {
  const { isOpen = false, onClickAway, contentRef } = props;

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
        Content
      </Typography>

      <IconButton onClick={handleClose}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  const renderAnchorItem = () => {
    const tags = contentRef?.current?.querySelectorAll("h1, h2");
    const result: Data[] = [];
    let h1Index = -1;
    tags?.forEach((el, index) => {
      const tag = el;
      if (tag.tagName === "H1") {
        h1Index += 1;
        result.push({
          id: h1Index,
          title: tag.textContent || "",
          items: [],
        });
        // force update element id
        tag.id = `${h1Index}`;
      } else if (tag.tagName === "H2") {
        result[h1Index]?.items.push({
          id: index,
          text: tag.textContent || "",
        });
        // force update element id
        tag.id = `${h1Index}-${index}`;
      }
    });
    const sideTitle = result.map((data) => (
      <AnchorItem key={data.id} data={data} />
    ));

    return (
      <>
        <Typography variant="subtitle1" sx={{ px: 2.5, mt: 3, mb: 1 }}>
          Titles
        </Typography>
        <Scrollbar sx={{ height: 1 }}>{sideTitle}</Scrollbar>
      </>
    );
  };

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
      <Divider sx={{ borderStyle: "dashed" }} />
      {renderAnchorItem()}
    </Drawer>
  );
};

export default ShareContentDrawer;
