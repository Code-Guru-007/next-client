import React, { FC, useEffect } from "react";
import { makeStyles, useTheme } from "@mui/styles";
import { useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";
import Box from "@eGroupAI/material/Box";
import TableRow from "@eGroupAI/material/TableRow";
import Typography from "@eGroupAI/material/Typography";
import StyledDataTableCell from "@eGroupAI/material-module/DataTable/StyledDataTableCell";
import StyledDataTableRowCheckbox from "@eGroupAI/material-module/DataTable/StyledDataTableRowCheckbox";
import { useTableRWDStyles } from "@eGroupAI/material-module/DataTable/useTableRWDStyles";
import { ColumnTypeMap } from "interfaces/utils";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { format } from "@eGroupAI/utils/dateUtils";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";

import { OrganizationColumn } from "interfaces/entities";

const useStyles = makeStyles(() => ({
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
}));

interface Props {
  row: OrganizationColumn;
  onClick?: () => void;
  columns?: {
    id: string;
    name: string;
    sortKey: string | undefined;
    dataKey: string | undefined;
    format: ((val: React.ReactNode) => React.ReactNode) | undefined;
  }[];
}

const DynamicColumnTableRow: FC<Props> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));
  const { columns, row, onClick } = props;

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
        <TableRow className={classes.tableRow} hover onClick={onClick}>
          <StyledDataTableCell>
            <StyledDataTableRowCheckbox
              dataId={`${row.columnId}`}
              data={row}
              size="small"
            />
          </StyledDataTableCell>

          <StyledDataTableCell>
            <Typography variant="body1">
              {wordLibrary?.[row.columnName] ?? row.columnName}
            </Typography>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Typography variant="body1">
              {wordLibrary?.[ColumnTypeMap[row.columnType]] ??
                ColumnTypeMap[row.columnType]}
            </Typography>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Typography variant="body1">
              {wordLibrary?.[row?.columnSort] ?? row?.columnSort}
            </Typography>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Typography variant="body1">
              {(() => {
                let output = "";
                if (row.isRequired === 0) {
                  output = wordLibrary?.optional ?? "非必填";
                } else {
                  output = wordLibrary?.required ?? "必填";
                }
                return output;
              })()}
            </Typography>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Typography variant="body1">
              {row?.organizationColumnGroup?.columnGroupName}
            </Typography>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Typography variant="body1">
              {row.columnCreateDate &&
                format(
                  zonedTimeToUtc(new Date(row.columnCreateDate), "Asia/Taipei"),
                  "PP pp",
                  { locale: zhCN }
                )}
            </Typography>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Typography variant="body1">
              {row.columnUpdateDate &&
                format(
                  zonedTimeToUtc(new Date(row.columnUpdateDate), "Asia/Taipei"),
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
          hover
          onClick={onClick}
        >
          <StyledDataTableCell>
            <StyledDataTableRowCheckbox
              dataId={`${row.columnId}`}
              data={row}
              size="small"
              className={tableRWDClasses.checkBox}
            />
          </StyledDataTableCell>

          <StyledDataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[0]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {wordLibrary?.[row.columnName] ?? row.columnName}
              </Typography>
            </Box>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[1]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {wordLibrary?.[ColumnTypeMap[row.columnType]] ??
                  ColumnTypeMap[row.columnType]}
              </Typography>
            </Box>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[2]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {wordLibrary?.[row?.columnSort] ?? row?.columnSort}
              </Typography>
            </Box>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[3]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row?.organizationColumnGroup?.columnGroupName}
              </Typography>
            </Box>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[4]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {(() => {
                  let output = "";
                  if (row.isRequired === 0) {
                    output = wordLibrary?.optional ?? "非必填";
                  } else {
                    output = wordLibrary?.required ?? "必填";
                  }
                  return output;
                })()}
              </Typography>
            </Box>
          </StyledDataTableCell>
        </TableRow>
      )}
    </>
  );
};

export default DynamicColumnTableRow;
