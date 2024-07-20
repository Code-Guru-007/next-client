import React, { FC, useEffect } from "react";

import { makeStyles, useTheme } from "@mui/styles";
import { styled } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import Badge, { BadgeProps } from "@mui/material/Badge";

import DataTableRow from "@eGroupAI/material-module/DataTable/DataTableRow";
import DataTableCell from "@eGroupAI/material-module/DataTable/DataTableCell";
import StyledTypography from "@eGroupAI/material-module/DataTable/StyledTypography";
import { useTableRWDStyles } from "@eGroupAI/material-module/DataTable/useTableRWDStyles";
import { TextListItemWrapper } from "@eGroupAI/material-module/DataTable/DataTableTextListItem";

import { format } from "@eGroupAI/utils/dateUtils";
import { MessageItem } from "@eGroupAI/typings/apis";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  width: "-webkit-fill-available",
  "& .MuiBadge-badge": {
    backgroundColor: theme.palette.primary.main,
    right: 20,
    top: 14,
  },
}));

const useStyles = makeStyles(() => ({
  tableRow: {
    cursor: "pointer",
    "& .MuiTableCell-root:first-child": {
      maxWidth: "300px",
      whiteSpace: "normal",
    },
    "& .MuiTableCell-root": {
      verticalAlign: "middle",
      lineBreak: "anywhere",
      whiteSpace: "normal",
      height: "auto",
      padding: "8px 16px",
      overflow: "hidden",
    },
  },
}));

interface Props {
  row: MessageItem;
  handleClick: (e) => void;
}

const MessagesDataTableRow: FC<Props> = function (props) {
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));
  const { row, handleClick } = props;
  const classes = useStyles();
  const tableRWDClasses = useTableRWDStyles();
  const searchWord = localStorage.getItem("searchWord");

  useEffect(() => {
    const tbodyElement = document?.getElementsByClassName(
      "MuiTableBody-root"
    )[0] as HTMLElement;
    if (tbodyElement) {
      const regex = searchWord ? new RegExp(searchWord, "gi") : null;

      const highlightText = (node: HTMLElement) => {
        const walker = document.createTreeWalker(
          node,
          NodeFilter.SHOW_TEXT,
          null
        );
        let textNode = walker.nextNode();
        const nodesToReplace: { oldNode: Node; newNode: Node }[] = [];
        while (textNode) {
          if (
            textNode.nodeValue &&
            regex?.test(textNode.nodeValue.toLowerCase())
          ) {
            const span = document.createElement("span");
            span.innerHTML = textNode.nodeValue.replace(
              regex,
              `<span style="color: #ec623f;">${searchWord}</span>`
            );
            nodesToReplace.push({ oldNode: textNode, newNode: span });
          }
          textNode = walker.nextNode();
        }
        nodesToReplace.forEach(({ oldNode, newNode }) => {
          oldNode?.parentNode?.replaceChild(newNode, oldNode);
        });
      };

      const removeHighlight = (node: HTMLElement) => {
        const spans = node.querySelectorAll('span[style="color: #ec623f;"]');
        spans.forEach((span) => {
          const parent = span.parentNode;
          if (parent) {
            parent.replaceChild(
              document.createTextNode(span.textContent || ""),
              span
            );
            parent.normalize();
          }
        });
      };

      removeHighlight(tbodyElement);
      if (searchWord && searchWord.trim()) {
        highlightText(tbodyElement);
      }
    }
  }, [searchWord]);
  return (
    <>
      {!isDownSm && (
        <DataTableRow className={classes.tableRow} onClick={handleClick} hover>
          <DataTableCell>
            <TextListItemWrapper>
              {row.isRead === 0 ? (
                <StyledBadge variant="dot">
                  <StyledTypography variant="body2">
                    {row.messageInfo.messageInfoTitle}
                  </StyledTypography>
                </StyledBadge>
              ) : (
                <StyledTypography variant="body2">
                  {row.messageInfo.messageInfoTitle}
                </StyledTypography>
              )}
            </TextListItemWrapper>
          </DataTableCell>
          <DataTableCell>
            <TextListItemWrapper>
              <StyledTypography variant="body2">
                {row.messageCreateDate &&
                  format(
                    zonedTimeToUtc(
                      new Date(row.messageCreateDate),
                      "Asia/Taipei"
                    ),
                    "PP pp",
                    { locale: zhCN }
                  )}
              </StyledTypography>
            </TextListItemWrapper>
          </DataTableCell>
        </DataTableRow>
      )}
      {isDownSm && (
        <DataTableRow
          className={tableRWDClasses.tableRowRWD}
          onClick={handleClick}
          hover
        >
          <DataTableCell>
            <TextListItemWrapper>
              {row.isRead === 0 ? (
                <StyledBadge variant="dot">
                  <StyledTypography variant="body2">
                    {row.messageInfo.messageInfoTitle}
                  </StyledTypography>
                </StyledBadge>
              ) : (
                <StyledTypography variant="body2">
                  {row.messageInfo.messageInfoTitle}
                </StyledTypography>
              )}
            </TextListItemWrapper>
          </DataTableCell>
          <DataTableCell>
            <TextListItemWrapper>
              <StyledTypography variant="body2">
                {row.messageCreateDate &&
                  format(
                    zonedTimeToUtc(
                      new Date(row.messageCreateDate),
                      "Asia/Taipei"
                    ),
                    "PP pp",
                    { locale: zhCN }
                  )}
              </StyledTypography>
            </TextListItemWrapper>
          </DataTableCell>
        </DataTableRow>
      )}
    </>
  );
};

export default MessagesDataTableRow;
