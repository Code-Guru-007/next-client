import React, { FC, useEffect } from "react";
import { makeStyles, useTheme } from "@mui/styles";
import { useMediaQuery } from "@mui/material";

import Box from "@eGroupAI/material/Box";
import TableRow from "@eGroupAI/material/TableRow";
import Typography from "@eGroupAI/material/Typography";
import { useTableRWDStyles } from "@eGroupAI/material-module/DataTable/useTableRWDStyles";
import StyledDataTableCell from "@eGroupAI/material-module/DataTable/StyledDataTableCell";

import { OrganizationModule } from "@eGroupAI/typings/apis";

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
  row: OrganizationModule;
  columns?: {
    id: string;
    name: string;
    dataKey: string;
  }[];
}

const OrderModuleDataTableRow: FC<Props> = function (props) {
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));
  const { columns, row } = props;

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
        <TableRow className={classes.tableRow} hover>
          <StyledDataTableCell>
            <Typography variant="body1">
              {row.serviceMainModule.serviceMainModuleNameZh}
            </Typography>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Typography variant="body1">
              {row.serviceMainModule.serviceModuleList
                ?.map((module) => module.serviceModuleNameZh)
                .join(", ")}
            </Typography>
          </StyledDataTableCell>
        </TableRow>
      )}
      {isDownSm && (
        <TableRow className={tableRWDClasses.tableRowRWD} hover>
          <StyledDataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[0]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.serviceMainModule.serviceMainModuleNameZh}
              </Typography>
            </Box>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[1]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.serviceMainModule.serviceModuleList
                  ?.map((module) => module.serviceModuleNameZh)
                  .join(", ")}
              </Typography>
            </Box>
          </StyledDataTableCell>
        </TableRow>
      )}
    </>
  );
};

export default OrderModuleDataTableRow;
