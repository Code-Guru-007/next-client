import React, { FC, useState, useEffect, useCallback, useRef } from "react";
import { List, ListItem, Box, useTheme, Tooltip } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useSettingsContext } from "minimal/components/settings";
import { useSelector } from "react-redux";
import { getOpenStatus } from "redux/froalaEditor/selectors";

const useStyles = makeStyles((theme) => ({
  parentDiv: {
    fontSize: "15px",
    marginTop: "11px",
    position: "fixed",
    top: "calc(50% - 50px)",
    width: "32px",
    maxHeight: "66vh",
    overflow: "hidden",
    transform: "translateY(-50%)",
    transition: "all 500ms ease",
    cursor: "pointer",
    zIndex: 999,
    "&:hover": {
      width: "175px",
    },

    "&:hover $contentList": {
      display: "block",
      opacity: 1,
      transform: "translateX(10px)",
    },
    "&:hover $styledList": {
      opacity: 0,
      display: "none",
    },
  },
  styledList: {
    position: "relative",
    width: "32px",
    marginTop: "7px",
    opacity: 1,
    userSelect: "none",
    listStyle: "none",
  },
  styledListItem: {
    borderBottom: `2px solid ${theme.palette.grey[400]}`,
    marginLeft: "4px",
    position: "relative",
    boxSizing: "border-box",
    height: "0px",
    paddingInline: "0px",
  },
  contentList: {
    display: "none",
    maxHeight: "66vh",
    overflow: "auto",
    width: "200px",
    boxSizing: "border-box",
    opacity: 0,
    padding: "0px 21px",
    marginLeft: "-15px",
  },
  contentListItem: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    position: "relative",
    boxSizing: "border-box",
    paddingInline: "0px",
    display: "inline-block",
    "&:hover": {
      color: `${theme.palette.primary.main} !important`,
    },
  },
}));

export interface EditorNavigationProps {
  editorRef?: React.RefObject<HTMLDivElement>;
  title: string;
  content?: string;
}

export interface Data {
  id: number;
  text: string;
  tagName: string;
}

const EditorNavigation: FC<EditorNavigationProps> = ({
  editorRef,
  title,
  content,
}) => {
  const [toc, setToc] = React.useState<Data[]>([]);
  const [selectedId, setSelectedId] = React.useState(0);
  const classes = useStyles();
  const theme = useTheme();
  const settings = useSettingsContext();
  const isMini = settings.themeLayout === "mini";
  const openStatus = useSelector(getOpenStatus);

  const [openTooltip, setOpenTooltip] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const isMouseOverRef = useRef(false);

  const handleTooltipOpen = (tooltip) => {
    isMouseOverRef.current = true;
    timerRef.current = setTimeout(() => {
      if (isMouseOverRef.current) {
        setOpenTooltip(tooltip);
      }
    }, 2000);
  };

  const handleTooltipClose = () => {
    setOpenTooltip(null);
    isMouseOverRef.current = false;
    clearTimeout(timerRef.current);
  };

  const markToc = useCallback(() => {
    if (editorRef?.current && title?.length) {
      const titles = Array.from(
        editorRef.current.querySelectorAll("h1, h2, strong")
      );
      const titleData = [{ id: 0, tagName: "TITLE", text: title }];

      const filteredNodes = titles.filter((node) => {
        const closestParent = node.closest("li, table");
        return !(
          (node.tagName === "STRONG" &&
            (node.closest("h1") || node.closest("h2"))) ||
          (closestParent &&
            (closestParent.tagName === "LI" ||
              closestParent.tagName === "TABLE"))
        );
      });

      setToc([
        ...titleData,
        ...filteredNodes.map((title, index) => ({
          id: index + 1,
          tagName: title.tagName || "",
          text: title.textContent || "",
        })),
      ]);
    }
  }, [editorRef, title]);

  useEffect(() => {
    setTimeout(() => {
      markToc();
    }, 100);
  }, [editorRef, title, content, markToc, openStatus]);

  const handleClick = (id: number) => {
    if (editorRef?.current) {
      const allNodes = Array.from(
        editorRef?.current?.querySelectorAll("h1, h2, strong")
      );
      if (!allNodes) return;

      const filteredNodes = allNodes.filter((node) => {
        const closestParent = node.closest("li, table");
        return !(
          (node.tagName === "STRONG" &&
            (node.closest("h1") || node.closest("h2"))) ||
          (closestParent &&
            (closestParent.tagName === "LI" ||
              closestParent.tagName === "TABLE"))
        );
      });

      const element =
        id === 0
          ? document.querySelector(".fr-element.fr-view")
          : filteredNodes?.[id - 1];

      if (element)
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      setSelectedId(id);
    }
  };

  const getWidth = (tagName) => {
    switch (tagName) {
      case "TITLE":
        return "28px";
      case "H1":
        return "21px";
      case "STRONG":
        return "7px";
      default:
        return "14px";
    }
  };

  const regex =
    // eslint-disable-next-line no-control-regex
    /[\u00A0\u2000-\u200A\u2028\u2029\u200B\u2060\uFEFF\u0009\u000A\u000D]/g;

  return (
    <Box
      className={classes.parentDiv}
      sx={{
        left: { lg: isMini ? 90 : 290 },
        backgroundColor: { xs: theme.palette.common.white, md: "transparent" },
      }}
    >
      <List className={classes.contentList}>
        {toc.map(
          (item) =>
            item.text.replace(regex, "").length > 0 && (
              <Tooltip
                title={item.text}
                open={openTooltip === item.id}
                onClose={handleTooltipClose}
                key={item.id}
              >
                <ListItem
                  onMouseEnter={() => handleTooltipOpen(item.id)}
                  onMouseLeave={handleTooltipClose}
                  className={classes.contentListItem}
                  key={item.id}
                  onClick={() => handleClick(item.id)}
                  style={{
                    paddingLeft: (() => {
                      if (item.tagName === "H2") return "16px";
                      if (item.tagName === "STRONG") return "32px";
                      return "0px";
                    })(),
                    fontWeight: item.tagName === "TITLE" ? 600 : 400,
                    color:
                      item.id === selectedId
                        ? theme.palette.primary.main
                        : theme.palette.grey[600],
                  }}
                >
                  {item.text}
                </ListItem>
              </Tooltip>
            )
        )}
      </List>
      <List className={classes.styledList}>
        {toc.map(
          (item) =>
            item.text.replace(regex, "").length > 0 && (
              <ListItem
                className={classes.styledListItem}
                key={item.id}
                style={{
                  width: getWidth(item.tagName),
                  borderBottomColor:
                    item.id === selectedId
                      ? theme.palette.primary.main
                      : theme.palette.grey[400],
                }}
              />
            )
        )}
      </List>
    </Box>
  );
};

export default React.memo(EditorNavigation);
