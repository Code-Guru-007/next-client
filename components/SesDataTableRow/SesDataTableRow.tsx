import React, { FC, useEffect } from "react";
import { format } from "@eGroupAI/utils/dateUtils";
import { makeStyles, useTheme } from "@mui/styles";
import { useMediaQuery } from "@mui/material";

import Box from "@eGroupAI/material/Box";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";

import TableRow from "@eGroupAI/material/TableRow";
import Typography from "@eGroupAI/material/Typography";
import StyledDataTableCell from "@eGroupAI/material-module/DataTable/StyledDataTableCell";
import StyledDataTableRowCheckbox from "@eGroupAI/material-module/DataTable/StyledDataTableRowCheckbox";
import { useTableRWDStyles } from "@eGroupAI/material-module/DataTable/useTableRWDStyles";

import { OrganizationSesTemplate } from "interfaces/entities";

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
  row: OrganizationSesTemplate;
  handleClick: (e) => void;
  columns?: {
    id: string;
    name: string;
    dataKey: string | undefined;
  }[];
}

const SESDataTableRow: FC<Props> = function (props) {
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
              dataId={`${row.organizationSesTemplateId}`}
              data={row}
              size="small"
            />
          </StyledDataTableCell>

          <StyledDataTableCell>
            <Typography variant="body1">
              {row.organizationSesTemplateTitle}
            </Typography>
          </StyledDataTableCell>

          <StyledDataTableCell>
            <Typography variant="body1">
              {row.organizationSesTemplateContent}
            </Typography>
          </StyledDataTableCell>

          <StyledDataTableCell>
            <Typography variant="body1">
              {row.organizationSesTemplateCreateDate &&
                format(
                  zonedTimeToUtc(
                    new Date(row.organizationSesTemplateCreateDate),
                    "Asia/Taipei"
                  ),
                  "PP pp",
                  { locale: zhCN }
                )}
            </Typography>
          </StyledDataTableCell>

          <StyledDataTableCell>
            <Typography variant="body1">
              {row.organizationSesTemplateUpdateDate &&
                format(
                  zonedTimeToUtc(
                    new Date(row.organizationSesTemplateUpdateDate),
                    "Asia/Taipei"
                  ),
                  "PP pp",
                  { locale: zhCN }
                )}
            </Typography>
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
              dataId={`${row.organizationSesTemplateId}`}
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
                {row.organizationSesTemplateTitle}
              </Typography>
            </Box>
          </StyledDataTableCell>

          <StyledDataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[1]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.organizationSesTemplateContent}
              </Typography>
            </Box>
          </StyledDataTableCell>

          <StyledDataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[2]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.organizationSesTemplateCreateDate &&
                  format(
                    zonedTimeToUtc(
                      new Date(row.organizationSesTemplateCreateDate),
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
              <Typography variant="body1">
                {row.organizationSesTemplateUpdateDate &&
                  format(
                    zonedTimeToUtc(
                      new Date(row.organizationSesTemplateUpdateDate),
                      "Asia/Taipei"
                    ),
                    "PP pp",
                    { locale: zhCN }
                  )}
              </Typography>
            </Box>
          </StyledDataTableCell>
        </TableRow>
      )}
    </>
  );
};

export default SESDataTableRow;
