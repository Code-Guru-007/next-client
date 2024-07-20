import React, { FC, useCallback } from "react";

import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import ListItemText from "@mui/material/ListItemText";

export interface Item {
  id: number;
  text: string;
}

export interface Data {
  id: number;
  title: string;
  items: Item[];
}

export interface ArticleContentAnchorItemProps {
  data: Data;
}

const ArticleContentAnchorItem: FC<ArticleContentAnchorItemProps> = (props) => {
  const { data } = props;

  const handleScrollTo = useCallback((e, targetElId: string) => {
    e.preventDefault();
    const el = document.getElementById(targetElId);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 125;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, []);

  return (
    <>
      <ListItemButton
        sx={{
          p: 0,
          borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
        }}
      >
        <ListItemText
          disableTypography
          primary={
            <Typography variant="subtitle2" sx={{ fontSize: 13, m: 0 }}>
              {data.title}
            </Typography>
          }
          sx={{
            display: "flex",
            flexDirection: "column-reverse",
            p: "8px 16px",
            width: "100%",
          }}
          onClick={(e) => {
            handleScrollTo(e, `${data.id}`);
          }}
        />
      </ListItemButton>
      <ul style={{ marginTop: "8px" }}>
        {data.items.map((el) => (
          <li key={`${data.id}-${el.id}`}>
            <ListItemButton
              sx={{
                p: 0,
                borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
              }}
            >
              <ListItemText
                disableTypography
                primary={
                  <Typography variant="subtitle2" sx={{ fontSize: 13, m: 0 }}>
                    {el.text}
                  </Typography>
                }
                sx={{
                  display: "flex",
                  flexDirection: "column-reverse",
                  p: "6px 12px",
                  width: "100%",
                }}
                onClick={(e) => {
                  handleScrollTo(e, `${data.id}-${el.id}`);
                }}
              />
            </ListItemButton>
          </li>
        ))}
      </ul>
    </>
  );
};

export default ArticleContentAnchorItem;
