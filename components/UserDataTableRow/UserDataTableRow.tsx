import React, { FC, useEffect } from "react";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";

// import clsx from "clsx";
import { format, differenceInYears } from "@eGroupAI/utils/dateUtils";
import { makeStyles, useTheme } from "@mui/styles";
import { useMediaQuery } from "@mui/material";

import DataTableRow from "@eGroupAI/material-module/DataTable/DataTableRow";

import Box from "@eGroupAI/material/Box";
import DataTableCell from "@eGroupAI/material-module/DataTable/DataTableCell";
import DataTableRowCheckbox from "@eGroupAI/material-module/DataTable/StyledDataTableRowCheckbox";
import { useTableRWDStyles } from "@eGroupAI/material-module/DataTable/useTableRWDStyles";
import Typography from "@eGroupAI/material/Typography";

import { OrganizationUser } from "interfaces/entities";
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
  row: OrganizationUser;
  handleClick: (e) => void;
  columns?: {
    id: string;
    name: string;
    sortKey: string | undefined;
    dataKey: string | undefined;
    format: ((val: React.ReactNode) => React.ReactNode) | undefined;
  }[];
}

const UserDataTableRow: FC<Props> = function (props) {
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
              dataId={`${row.organizationUserId}`}
              data={row}
              size="small"
            />
          </DataTableCell>

          <DataTableCell>
            <Typography variant="body1">
              {row.organizationUserNameZh}
              <OrgTagsInDataTableRow
                organizationTagTargetList={row.organizationTagTargetList}
              />
            </Typography>
          </DataTableCell>

          <DataTableCell>
            <Typography variant="body1">{row.organizationUserPhone}</Typography>
          </DataTableCell>
          <DataTableCell>
            <Typography variant="body1">{row.organizationUserEmail}</Typography>
          </DataTableCell>
          <DataTableCell>
            <Typography variant="body1">
              {row.organizationUserZIPCode}
            </Typography>
          </DataTableCell>
          <DataTableCell>
            <Typography variant="body1">{row.organizationUserCity}</Typography>
          </DataTableCell>
          <DataTableCell>
            <Typography variant="body1">
              {(() => {
                if (row.organizationUserGender === 1) {
                  return "男";
                }
                if (row.organizationUserGender === 2) {
                  return "女";
                }
                return "";
              })()}
            </Typography>
          </DataTableCell>

          <DataTableCell>
            <Typography variant="body1">
              {format(
                zonedTimeToUtc(
                  new Date(row.organizationUserCreateDate || ""),
                  "Asia/Taipei"
                ),
                "PP pp",
                { locale: zhCN }
              )}
            </Typography>
          </DataTableCell>
          <DataTableCell>
            <Typography variant="body1">
              {format(
                zonedTimeToUtc(
                  new Date(row.organizationUserUpdateDate || ""),
                  "Asia/Taipei"
                ),
                "PP pp",
                { locale: zhCN }
              )}
            </Typography>
          </DataTableCell>
          <DataTableCell>
            <Typography variant="body1">
              {row.organizationUserBirth
                ? `${row.organizationUserBirth} (${differenceInYears(
                    new Date(),
                    new Date(row.organizationUserBirth || "")
                  )}歲)`
                : ""}
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
              dataId={`${row.organizationUserId}`}
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
                {row.organizationUserNameZh}
                <OrgTagsInDataTableRow
                  organizationTagTargetList={row.organizationTagTargetList}
                />
              </Typography>
            </Box>
          </DataTableCell>

          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[2]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.organizationUserEmail}
              </Typography>
            </Box>
          </DataTableCell>
          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[3]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.organizationUserZIPCode}
              </Typography>
            </Box>
          </DataTableCell>
          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[4]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.organizationUserCity}
              </Typography>
            </Box>
          </DataTableCell>
          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[5]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {(() => {
                  if (row.organizationUserGender === 1) {
                    return "男";
                  }
                  if (row.organizationUserGender === 2) {
                    return "女";
                  }
                  return "";
                })()}
              </Typography>
            </Box>
          </DataTableCell>

          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[6]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.organizationUserBirth
                  ? `${row.organizationUserBirth} (${differenceInYears(
                      new Date(),
                      new Date(row.organizationUserBirth || "")
                    )}歲)`
                  : ""}
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
                    new Date(row.organizationUserUpdateDate || ""),
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
              {columns ? columns[8]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {format(
                  zonedTimeToUtc(
                    new Date(row.organizationUserBirth || ""),
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

export default UserDataTableRow;
