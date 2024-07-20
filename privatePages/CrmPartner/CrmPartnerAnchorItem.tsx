import React, { FC } from "react";

import { useTheme } from "@mui/material/styles";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import ListItemText from "@mui/material/ListItemText";

import Box from "@eGroupAI/material/Box";

export interface Item {
  id: number;
  text: string;
}

export interface Data {
  id: string;
  title: string;
  items: Item[];
}

export interface CrmPartnerAnchorItemProps {
  data: Data;
  offset?: number;
  handleScrollTo?: (groupId?: string) => void;
}

const CrmPartnerAnchorItem: FC<CrmPartnerAnchorItemProps> = (props) => {
  const { data, handleScrollTo: handleScrollToProp } = props;
  const theme = useTheme();

  const handleScrollTo = (e, targetElId: string) => {
    e.preventDefault();
    const el = document.querySelector(`[data-groupId="${targetElId}"]`);

    if (el) {
      const scrollTop = window.scrollY;
      let topOffset = 76; // default header height
      const header = document.querySelector("header");
      // Get the height of the header
      if (header) topOffset = header.offsetHeight;
      if (scrollTop !== undefined) {
        window.scrollTo({
          top: el.getBoundingClientRect().top + scrollTop - topOffset,
          left: 0,
          behavior: "smooth",
        });
      }
    } else if (handleScrollToProp) {
      handleScrollToProp(targetElId);
    }
  };

  return (
    <ListItemButton
      onClick={(e) => {
        handleScrollTo(e, `${data.id}`);
      }}
      sx={{
        py: 1.5,
        borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          top: 16,
          left: 0,
          width: 0,
          height: 0,
          position: "absolute",
          borderRight: "10px solid transparent",
          borderTop: `10px solid ${theme.palette.primary.main}`,
        }}
      />

      <ListItemText
        disableTypography
        primary={
          <Typography variant="subtitle2" sx={{ fontSize: 13, mt: 0.5 }}>
            {data.title.split(":")[0]}
          </Typography>
        }
        sx={{ display: "flex", flexDirection: "column-reverse" }}
      />
    </ListItemButton>
  );
};

export default CrmPartnerAnchorItem;
