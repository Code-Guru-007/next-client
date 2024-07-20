import React, { FC, useEffect } from "react";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";

import { format } from "@eGroupAI/utils/dateUtils";
import { makeStyles, useTheme } from "@mui/styles";
import { useMediaQuery } from "@mui/material";

import DataTableRow from "@eGroupAI/material-module/DataTable/DataTableRow";

import Box from "@eGroupAI/material/Box";
import DataTableCell from "@eGroupAI/material-module/DataTable/DataTableCell";
import DataTableRowCheckbox from "@eGroupAI/material-module/DataTable/StyledDataTableRowCheckbox";
import { useTableRWDStyles } from "@eGroupAI/material-module/DataTable/useTableRWDStyles";
import Typography from "@eGroupAI/material/Typography";

import { OrganizationPartner } from "interfaces/entities";
import OrgTagsInDataTableRow from "components/OrgTagsInDataTableRow";

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
  row: OrganizationPartner;
  handleClick: (e) => void;
  columns?: {
    id: string;
    name: string;
    sortKey: string | undefined;
    dataKey: string | undefined;
    format: ((val: React.ReactNode) => React.ReactNode) | undefined;
  }[];
}

const PartnerDataTableRow: FC<Props> = function (props) {
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
        <DataTableRow className={classes.tableRow} onClick={handleClick} hover>
          <DataTableCell>
            <DataTableRowCheckbox
              onClick={(e) => {
                e.stopPropagation();
              }}
              dataId={`${row.organizationPartnerId}`}
              data={row}
              size="small"
            />
          </DataTableCell>

          <DataTableCell>
            <Typography variant="body1">
              {row.organizationPartnerNameZh}
              <OrgTagsInDataTableRow
                organizationTagTargetList={row.organizationTagTargetList}
              />
            </Typography>
          </DataTableCell>

          <DataTableCell>
            <Typography variant="body1">
              {row.organizationPartnerCity}
            </Typography>
          </DataTableCell>
          <DataTableCell>
            <Typography variant="body1">
              {row.organizationPartnerCountry}
            </Typography>
          </DataTableCell>
          <DataTableCell>
            <Typography variant="body1">
              {row.organizationPartnerAddress}
            </Typography>
          </DataTableCell>
          <DataTableCell>
            <Typography variant="body1">
              {row.organizationPartnerInvoiceTaxIdNumber}
            </Typography>
          </DataTableCell>
          <DataTableCell>
            <Typography variant="body1">
              {row.organizationPartnerTelephone}
            </Typography>
          </DataTableCell>
          <DataTableCell>
            <Typography variant="body1">
              {row.organizationPartnerFax}
            </Typography>
          </DataTableCell>

          <DataTableCell>
            <Typography variant="body1">
              {format(
                zonedTimeToUtc(
                  new Date(row.organizationPartnerCreateDate || ""),
                  "Asia/Taipei"
                ),
                "PP pp",
                { locale: zhCN }
              )}
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
          <DataTableCell className={tableRWDClasses.checkBox}>
            <DataTableRowCheckbox
              onClick={(e) => {
                e.stopPropagation();
              }}
              dataId={`${row.organizationPartnerId}`}
              data={row}
              size="small"
            />
          </DataTableCell>

          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[0]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.organizationPartnerNameZh}
                <OrgTagsInDataTableRow
                  organizationTagTargetList={row.organizationTagTargetList}
                />
              </Typography>
            </Box>
          </DataTableCell>

          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[1]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.organizationPartnerCity}
              </Typography>
            </Box>
          </DataTableCell>
          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[2]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.organizationPartnerCountry}
              </Typography>
            </Box>
          </DataTableCell>
          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[3]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.organizationPartnerAddress}
              </Typography>
            </Box>
          </DataTableCell>
          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[4]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.organizationPartnerInvoiceTaxIdNumber}
              </Typography>
            </Box>
          </DataTableCell>
          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[5]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.organizationPartnerTelephone}
              </Typography>
            </Box>
          </DataTableCell>
          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[6]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.organizationPartnerFax}
              </Typography>
            </Box>
          </DataTableCell>

          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[7]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {format(
                  zonedTimeToUtc(
                    new Date(row.organizationPartnerCreateDate || ""),
                    "Asia/Taipei"
                  ),
                  "PP pp",
                  { locale: zhCN }
                )}
              </Typography>
            </Box>
          </DataTableCell>
        </DataTableRow>
      )}
    </>
  );
};

export default PartnerDataTableRow;
