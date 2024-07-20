import React, { FC, useEffect } from "react";
import { format } from "@eGroupAI/utils/dateUtils";
import { makeStyles, useTheme } from "@mui/styles";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";

import { Box, useMediaQuery } from "@mui/material";

import Typography from "@eGroupAI/material/Typography";
import DataTableRow from "@eGroupAI/material-module/DataTable/DataTableRow";
import DataTableCell from "@eGroupAI/material-module/DataTable/DataTableCell";

import { OrganizationSms } from "interfaces/entities";
import { useTableRWDStyles } from "@eGroupAI/material-module/DataTable/useTableRWDStyles";

const useStyles = makeStyles(() => ({
  tableRow: {
    cursor: "pointer",
    "& .MuiTableCell-root:first-child": {
      maxWidth: "300px",
    },
    "& .MuiTableCell-root": {
      verticalAlign: "middle",
    },
  },
}));

interface Props {
  row: OrganizationSms;
  handleClick: (e) => void;
  columns?: {
    id: string;
    name: string;
    dataKey: string | undefined;
    sortKey?: string | undefined;
    format?: ((val: React.ReactNode) => React.ReactNode) | undefined;
  }[];
}

const SmsManageDataTableRow: FC<Props> = function (props) {
  const { row, handleClick, columns } = props;
  const classes = useStyles();
  const tableRWDClasses = useTableRWDStyles();
  const theme = useTheme();

  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));
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
            <Typography variant="body1">
              {row.organizationSmsSubject}
            </Typography>
          </DataTableCell>

          <DataTableCell>
            <Typography variant="body1">
              {row.organizationSmsContent}
            </Typography>
          </DataTableCell>

          <DataTableCell>
            <Typography variant="body1">{row.organizationSmsPhone}</Typography>
          </DataTableCell>

          <DataTableCell>
            <Typography variant="body1">{row.creator?.memberName}</Typography>
          </DataTableCell>

          <DataTableCell>
            <Typography variant="body1">
              {row.organizationSmsCreateDate &&
                format(
                  zonedTimeToUtc(
                    new Date(row.organizationSmsCreateDate),
                    "Asia/Taipei"
                  ),
                  "PP pp",
                  { locale: zhCN }
                )}
            </Typography>
          </DataTableCell>

          <DataTableCell>
            <Typography variant="body1">
              {row.organizationSmsSendStatusMessage}
            </Typography>
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
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[0]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.organizationSmsSubject}
              </Typography>
            </Box>
          </DataTableCell>

          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[1]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.organizationSmsContent}
              </Typography>
            </Box>
          </DataTableCell>

          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[2]?.name : ""}
            </Box>
            <Box
              className={tableRWDClasses.rowCell}
              sx={{ display: "flex", justifyContent: "right" }}
            >
              <Typography variant="body1">
                {row.organizationSmsPhone}
              </Typography>
            </Box>
          </DataTableCell>

          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[3]?.name : ""}
            </Box>
            <Box
              className={tableRWDClasses.rowCell}
              sx={{ display: "flex", justifyContent: "right" }}
            >
              <Typography variant="body1">{row.creator?.memberName}</Typography>
            </Box>
          </DataTableCell>

          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[4]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.organizationSmsCreateDate &&
                  format(
                    zonedTimeToUtc(
                      new Date(row.organizationSmsCreateDate),
                      "Asia/Taipei"
                    ),
                    "PP pp",
                    { locale: zhCN }
                  )}
              </Typography>
            </Box>
          </DataTableCell>

          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[5]?.name : ""}
            </Box>
            <Box
              className={tableRWDClasses.rowCell}
              sx={{ display: "flex", justifyContent: "right" }}
            >
              <Typography variant="body1">
                {row.organizationSmsSendStatusMessage}
              </Typography>
            </Box>
          </DataTableCell>
        </DataTableRow>
      )}
    </>
  );
};

export default SmsManageDataTableRow;
