import React, { FC, useEffect } from "react";
import { format } from "@eGroupAI/utils/dateUtils";
import { makeStyles } from "@mui/styles";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";

import TableRow from "@eGroupAI/material/TableRow";
import Typography from "@eGroupAI/material/Typography";
import StyledDataTableCell from "@eGroupAI/material-module/DataTable/StyledDataTableCell";

import { OrganizationSes } from "interfaces/entities";

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
  row: OrganizationSes;
  handleClick: (e) => void;
}

const SesManageDataTableRow: FC<Props> = function (props) {
  const { row, handleClick } = props;

  const classes = useStyles();
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
    <TableRow className={classes.tableRow} onClick={handleClick} hover>
      <StyledDataTableCell>
        <Typography variant="body1">{row.organizationSesSubject}</Typography>
      </StyledDataTableCell>

      <StyledDataTableCell>
        <Typography variant="body1">{row.organizationSesContent}</Typography>
      </StyledDataTableCell>

      <StyledDataTableCell>
        <Typography variant="body1">{row.organizationSesEmail}</Typography>
      </StyledDataTableCell>

      <StyledDataTableCell>
        <Typography variant="body1">
          {row.organizationSesSendDate &&
            format(
              zonedTimeToUtc(
                new Date(row.organizationSesSendDate),
                "Asia/Taipei"
              ),
              "PP pp",
              { locale: zhCN }
            )}
        </Typography>
      </StyledDataTableCell>
    </TableRow>
  );
};

export default SesManageDataTableRow;
