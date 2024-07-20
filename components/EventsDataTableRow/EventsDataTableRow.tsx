import React, { FC, useEffect } from "react";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";

// import clsx from "clsx";
import { format } from "@eGroupAI/utils/dateUtils";
import { makeStyles, useTheme } from "@mui/styles";
import { useMediaQuery } from "@mui/material";

import DataTableRow from "@eGroupAI/material-module/DataTable/DataTableRow";

import Box from "@eGroupAI/material/Box";
import DataTableCell from "@eGroupAI/material-module/DataTable/DataTableCell";
import DataTableRowCheckbox from "@eGroupAI/material-module/DataTable/StyledDataTableRowCheckbox";
import { useTableRWDStyles } from "@eGroupAI/material-module/DataTable/useTableRWDStyles";
import Typography from "@eGroupAI/material/Typography";
import Label from "minimal/components/label";

import { OrganizationEvent } from "interfaces/entities";
import { OrganizationReviewStatusTypeMap } from "interfaces/utils";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";
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
  row: OrganizationEvent;
  status: "success" | "warning" | "error" | "grey";
  handleClick: (e) => void;
  columns?: {
    id: string;
    name: string;
    sortKey: string | undefined;
    dataKey: string | undefined;
    format: ((val: React.ReactNode) => React.ReactNode) | undefined;
  }[];
}

const EventsDataTableRow: FC<Props> = function (props) {
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));
  const { columns, row, status, handleClick } = props;
  const classes = useStyles();
  const tableRWDClasses = useTableRWDStyles();

  const wordLibrary = useSelector(getWordLibrary);

  const StatusTextMap = {
    success: wordLibrary?.["in progress"] ?? "進行中",
    warning: wordLibrary?.expired ?? "已過期",
    error: wordLibrary?.abnormal ?? "異常",
    grey: wordLibrary?.closed ?? "已關閉",
  };
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
              dataId={`${row.organizationEventId}`}
              data={row}
              size="small"
            />
          </DataTableCell>

          <DataTableCell>
            <Typography variant="body1">
              {row.organizationEventTitle}
              <OrgTagsInDataTableRow
                organizationTagTargetList={row.organizationTagTargetList}
              />
            </Typography>
          </DataTableCell>

          <DataTableCell>
            <Label
              variant="soft"
              color={
                (status === "success" && "success") ||
                (status === "warning" && "warning") ||
                (status === "error" && "error") ||
                "default"
              }
            >
              {StatusTextMap[status]}
            </Label>
          </DataTableCell>

          <DataTableCell>
            {row.organizationMemberList?.map((member) => (
              <Typography
                variant="body1"
                key={`${member.member.loginId}-${member.member.memberName}`}
              >
                {member.member.memberName}
              </Typography>
            ))}
          </DataTableCell>

          <DataTableCell>
            {row.organizationUserList?.map((user) => (
              <Typography variant="body1" key={user.organizationUserId}>
                {user.organizationUserNameZh}
              </Typography>
            ))}
          </DataTableCell>

          <DataTableCell>
            {row.organizationReview?.organizationReviewStatusType ? (
              <Label
                variant="filled"
                color={
                  ((row.organizationReview
                    ?.organizationReviewStatusType as string) === "SUCCESS" &&
                    "success") ||
                  ((row.organizationReview
                    ?.organizationReviewStatusType as string) === "REJECT" &&
                    "error") ||
                  ((row.organizationReview
                    ?.organizationReviewStatusType as string) ===
                    "PROCESSING" &&
                    "info") ||
                  "default"
                }
              >
                {
                  OrganizationReviewStatusTypeMap[
                    row.organizationReview
                      ?.organizationReviewStatusType as string
                  ]
                }
              </Label>
            ) : (
              row.organizationReview?.organizationReviewStatusType
            )}
          </DataTableCell>

          <DataTableCell>
            <Typography variant="body1">
              {format(
                zonedTimeToUtc(
                  new Date(row.organizationEventCreateDate),
                  "Asia/Taipei"
                ),
                "PP pp",
                { locale: zhCN }
              )}
            </Typography>
          </DataTableCell>
          <DataTableCell>
            <Typography variant="body1">
              {row?.organizationReview?.organizationReviewUpdateDate &&
                format(
                  zonedTimeToUtc(
                    new Date(
                      row?.organizationReview?.organizationReviewUpdateDate
                    ),
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
              dataId={`${row.organizationEventId}`}
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
                {row.organizationEventTitle}
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
            <Box
              className={tableRWDClasses.rowCell}
              sx={{ display: "flex", justifyContent: "right" }}
            >
              <Label
                variant="soft"
                color={
                  (status === "success" && "success") ||
                  (status === "warning" && "warning") ||
                  (status === "error" && "error") ||
                  "default"
                }
              >
                {StatusTextMap[status]}
              </Label>
            </Box>
          </DataTableCell>

          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[2]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              {row.organizationMemberList?.map((member) => (
                <Typography
                  variant="body1"
                  key={`${member.member.loginId}-${member.member.memberName}`}
                >
                  {member.member.memberName}
                </Typography>
              ))}
            </Box>
          </DataTableCell>

          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[3]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              {row.organizationUserList?.map((user) => (
                <Typography variant="body1" key={user.organizationUserId}>
                  {user.organizationUserNameZh}
                </Typography>
              ))}
            </Box>
          </DataTableCell>

          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[4]?.name : ""}
            </Box>
            <Box
              className={tableRWDClasses.rowCell}
              sx={{ display: "flex", justifyContent: "right" }}
            >
              {row.organizationReview?.organizationReviewStatusType ? (
                <Label
                  variant="filled"
                  color={
                    ((row.organizationReview
                      ?.organizationReviewStatusType as string) === "SUCCESS" &&
                      "success") ||
                    ((row.organizationReview
                      ?.organizationReviewStatusType as string) === "REJECT" &&
                      "warning") ||
                    ((row.organizationReview
                      ?.organizationReviewStatusType as string) ===
                      "PROCESSING" &&
                      "info") ||
                    "default"
                  }
                >
                  {
                    OrganizationReviewStatusTypeMap[
                      row.organizationReview
                        ?.organizationReviewStatusType as string
                    ]
                  }
                </Label>
              ) : (
                row.organizationReview?.organizationReviewStatusType
              )}
            </Box>
          </DataTableCell>

          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[5]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {format(
                  zonedTimeToUtc(
                    new Date(row.organizationEventCreateDate),
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
              {columns ? columns[6]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.organizationReview?.organizationReviewUpdateDate &&
                  format(
                    zonedTimeToUtc(
                      new Date(
                        row.organizationReview.organizationReviewUpdateDate
                      ),
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

export default EventsDataTableRow;
