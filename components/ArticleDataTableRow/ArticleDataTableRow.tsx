import React, { FC, useEffect } from "react";
import { format } from "@eGroupAI/utils/dateUtils";
import { makeStyles, useTheme } from "@mui/styles";
import { useMediaQuery } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";
import PinIcon from "@mui/icons-material/PushPinRounded";

import Box from "@eGroupAI/material/Box";
import TableRow from "@eGroupAI/material/TableRow";
import Typography from "@eGroupAI/material/Typography";
import StyledDataTableCell from "@eGroupAI/material-module/DataTable/StyledDataTableCell";
import { useTableRWDStyles } from "@eGroupAI/material-module/DataTable/useTableRWDStyles";
import StyledDataTableRowCheckbox from "@eGroupAI/material-module/DataTable/StyledDataTableRowCheckbox";
import { OrganizationArticle } from "interfaces/entities";
import OrgTagsInDataTableRow from "components/OrgTagsInDataTableRow";

const useStyles = makeStyles((theme: Theme) => ({
  successStatus: {
    backgroundColor: `${theme.palette.success.main} !important`,
  },
  warningStatus: {
    backgroundColor: `${theme.palette.warning.main} !important`,
  },
  errorStatus: {
    backgroundColor: `${theme.palette.error.main} !important`,
  },
  greyStatus: {
    backgroundColor: `${theme.palette.text.primary} !important`,
  },
  processingStatus: {
    backgroundColor: `#2196f3 !important`,
  },
  tag: {
    color: "white",
    border: "1px solid transparent",
    padding: "0.375rem 1rem",
    borderRadius: "10000px",
    width: "fit-content",
    display: "flex",
    justifyContent: "center",
    fontSize: "0.9375rem",
    margin: "1px 0px",
  },
  tableRow: {
    cursor: "pointer",
    "& .MuiTableCell-root:first-child": {
      maxWidth: "300px",
    },
    "& .MuiTableCell-root": {
      verticalAlign: "middle",
    },
  },
  checkboxCell: {
    width: "50px",
  },
}));

interface Props {
  row: OrganizationArticle;
  handleClick: (e) => void;
  columns?: {
    id: string;
    name: string;
    sortKey: string | undefined;
    dataKey: string | undefined;
    format: ((val: React.ReactNode) => React.ReactNode) | undefined;
  }[];
}

const ArticleDataTableRow: FC<Props> = function (props) {
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));
  const { columns, row, handleClick } = props;

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
        <TableRow className={classes.tableRow} onClick={handleClick} hover>
          <StyledDataTableCell>
            <StyledDataTableRowCheckbox
              onClick={(e) => {
                e.stopPropagation();
              }}
              dataId={`${row.articleId}`}
              data={row}
              size="small"
            />
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Box
              style={{
                display: "inline-flex",
                gap: 5,
                alignItems: "flex-start",
              }}
            >
              {Boolean(row.isPinned) && (
                <PinIcon
                  fontSize="small"
                  color="success"
                  style={{
                    transform: "rotate(45deg)",
                    position: "relative",
                    top: "3px",
                  }}
                />
              )}
              <Typography variant="body1">
                {row.articleTitle}
                <OrgTagsInDataTableRow
                  organizationTagTargetList={row.organizationTagTargetList}
                />
              </Typography>
            </Box>
          </StyledDataTableCell>

          <StyledDataTableCell>
            <Typography variant="body1">
              {row.articleCreateDate &&
                format(
                  zonedTimeToUtc(
                    new Date(row.articleCreateDate),
                    "Asia/Taipei"
                  ),
                  "PP pp",
                  { locale: zhCN }
                )}
            </Typography>
          </StyledDataTableCell>

          <StyledDataTableCell>
            <Typography variant="body1">
              {row.articleUpdateDate &&
                format(
                  zonedTimeToUtc(
                    new Date(row.articleUpdateDate),
                    "Asia/Taipei"
                  ),
                  "PP pp",
                  { locale: zhCN }
                )}
            </Typography>
          </StyledDataTableCell>

          <StyledDataTableCell>
            <Typography variant="body1">{row.latestUpdaterName}</Typography>
          </StyledDataTableCell>
        </TableRow>
      )}
      {isDownSm && (
        <TableRow
          className={tableRWDClasses.tableRowRWD}
          onClick={handleClick}
          hover
        >
          <StyledDataTableCell className={tableRWDClasses.checkBox}>
            <StyledDataTableRowCheckbox
              onClick={(e) => {
                e.stopPropagation();
              }}
              dataId={`${row.articleId}`}
              data={row}
              size="small"
            />
          </StyledDataTableCell>

          <StyledDataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[0]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.articleTitle}
                <OrgTagsInDataTableRow
                  organizationTagTargetList={row.organizationTagTargetList}
                />
              </Typography>
            </Box>
          </StyledDataTableCell>

          <StyledDataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[1]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.articleCreateDate &&
                  format(
                    zonedTimeToUtc(
                      new Date(row.articleCreateDate),
                      "Asia/Taipei"
                    ),
                    "PP pp",
                    { locale: zhCN }
                  )}
              </Typography>
            </Box>
          </StyledDataTableCell>

          <StyledDataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[2]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.articleUpdateDate &&
                  format(
                    zonedTimeToUtc(
                      new Date(row.articleUpdateDate),
                      "Asia/Taipei"
                    ),
                    "PP pp",
                    { locale: zhCN }
                  )}
              </Typography>
            </Box>
          </StyledDataTableCell>

          <StyledDataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[3]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">{row.latestUpdaterName}</Typography>
            </Box>
          </StyledDataTableCell>
        </TableRow>
      )}
    </>
  );
};

export default ArticleDataTableRow;
