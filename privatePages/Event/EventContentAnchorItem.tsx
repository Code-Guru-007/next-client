import React, { FC, useCallback } from "react";

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
  id: number;
  title: string;
  items: Item[];
}

export interface EventContentAnchorItemProps {
  data: Data;
}

const EventContentAnchorItem: FC<EventContentAnchorItemProps> = (props) => {
  const { data } = props;
  const theme = useTheme();

  const handleScrollTo = useCallback((e, targetElId: string) => {
    e.preventDefault();
    const el = document.getElementById(targetElId);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 64;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, []);

  return (
    <ListItemButton
      sx={{
        display: "block",
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
            {data.title}
          </Typography>
        }
        sx={{ display: "flex", flexDirection: "column-reverse" }}
        onClick={(e) => {
          handleScrollTo(e, `${data.id}`);
        }}
      />
      <ul>
        {data.items.map((el) => (
          <li key={`${data.id}-${el.id}`}>
            <ListItemText
              disableTypography
              primary={
                <Typography variant="subtitle2" sx={{ fontSize: 13, mt: 0.5 }}>
                  {el.text}
                </Typography>
              }
              sx={{ display: "flex", flexDirection: "column-reverse" }}
              onClick={(e) => {
                handleScrollTo(e, `${data.id}-${el.id}`);
              }}
            />
          </li>
        ))}
      </ul>
    </ListItemButton>
  );
};

export default EventContentAnchorItem;
