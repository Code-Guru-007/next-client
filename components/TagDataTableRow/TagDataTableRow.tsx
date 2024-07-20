import React, { FC, MouseEvent, useEffect } from "react";
import { makeStyles, useTheme } from "@mui/styles";
import { Theme } from "@mui/material/styles";

import Image from "next/legacy/image";
import { useMediaQuery } from "@mui/material";
import Typography from "@eGroupAI/material/Typography";
import Box from "@eGroupAI/material/Box";
import DataTableRow from "@eGroupAI/material-module/DataTable/DataTableRow";
import DataTableCell from "@eGroupAI/material-module/DataTable/DataTableCell";
import DataTableRowCheckbox from "@eGroupAI/material-module/DataTable/StyledDataTableRowCheckbox";
import { useTableRWDStyles } from "@eGroupAI/material-module/DataTable/useTableRWDStyles";
import Label from "minimal/components/label";
import { OrganizationTag } from "interfaces/entities";
import getTextColor from "@eGroupAI/utils/colorUtils";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { format } from "@eGroupAI/utils/dateUtils";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";

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
  roleName: {
    color: theme.palette.primary.main,
    paddingRight: "15px",
  },
}));

interface Props {
  row: OrganizationTag;
  onClick?: (e: MouseEvent) => void;
  columns?: {
    id: string;
    name: string;
    sortKey: string | undefined;
    dataKey: string | undefined;
    format: ((val: React.ReactNode) => React.ReactNode) | undefined;
  }[];
}

const TagDataTabelRow: FC<Props> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);

  const permissionTranslations = {
    READ: `${wordLibrary?.["tagged readable"] ?? "被標註可讀取"}`,
    WRITE: `${wordLibrary?.["tagged editable"] ?? "被標註可編輯"}`,
    USE: `${wordLibrary?.taggable ?? "可使用此標籤"}`,
  };
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
        <DataTableRow className={classes.tableRow} hover onClick={onClick}>
          <DataTableCell className={classes.checkboxCell}>
            <DataTableRowCheckbox
              dataId={`${row.tagId}`}
              data={row}
              size="small"
            />
          </DataTableCell>
          <DataTableCell>
            <Label
              variant="soft"
              sx={{
                backgroundColor: row.tagColor,
                margin: "2px",
                textTransform: "none",
                color: getTextColor(row.tagColor),
              }}
            >
              {row.tagName}
            </Label>
          </DataTableCell>
          <DataTableCell>
            {row.organizationRoleTargetAuthList?.map((role) => (
              <Typography
                variant="body1"
                sx={{ display: "flex" }}
                key={role.organizationRole.organizationRoleId}
              >
                <Box className={classes.roleName}>
                  {role.organizationRole.organizationRoleNameZh}
                </Box>
                {role.organizationRoleTargetAuthPermission?.map(
                  (permission) => (
                    <Box sx={{ paddingRight: "5px" }} key={permission}>
                      {permissionTranslations[permission] || permission}
                    </Box>
                  )
                )}
              </Typography>
            ))}
          </DataTableCell>
          <DataTableCell>
            {row.organizationMediaList &&
              row.organizationMediaList[0]?.uploadFile.uploadFilePath && (
                <Image
                  width={30}
                  height={30}
                  src={
                    row.organizationMediaList &&
                    row.organizationMediaList[0]?.uploadFile.uploadFilePath
                  }
                  alt="tag"
                />
              )}
          </DataTableCell>
          <DataTableCell>
            {row.tagCreateDate &&
              format(
                zonedTimeToUtc(new Date(row.tagCreateDate), "Asia/Taipei"),
                "PP pp",
                { locale: zhCN }
              )}
          </DataTableCell>
          <DataTableCell>
            {row.tagUpdateDate &&
              format(
                zonedTimeToUtc(new Date(row.tagUpdateDate), "Asia/Taipei"),
                "PP pp",
                { locale: zhCN }
              )}
          </DataTableCell>
        </DataTableRow>
      )}
      {isDownSm && (
        <DataTableRow
          className={tableRWDClasses.tableRowRWD}
          hover
          onClick={onClick}
        >
          <DataTableCell className={tableRWDClasses.checkBox}>
            <DataTableRowCheckbox
              dataId={`${row.tagId}`}
              data={row}
              size="small"
            />
          </DataTableCell>
          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[0]?.name : ""}
            </Box>
            <Box
              className={tableRWDClasses.rowCell}
              sx={{ display: "flex", justifyContent: "right" }}
            >
              <Label
                variant="soft"
                sx={{
                  backgroundColor: row.tagColor,
                  margin: "2px",
                  color: getTextColor(row.tagColor),
                }}
              >
                {row.tagName}
              </Label>
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
              {row.organizationRoleTargetAuthList?.map((role) => (
                <Typography
                  variant="body1"
                  sx={{ display: "flex" }}
                  key={role.organizationRole.organizationRoleId}
                >
                  <Box className={classes.roleName}>
                    {role.organizationRole.organizationRoleNameZh}
                  </Box>
                  {role.organizationRoleTargetAuthPermission?.map(
                    (permission) => (
                      <Box sx={{ paddingRight: "5px" }} key={permission}>
                        {permissionTranslations[permission] || permission}
                      </Box>
                    )
                  )}
                </Typography>
              ))}
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
              {row.organizationMediaList?.[0]?.uploadFile.uploadFilePath && (
                <Image
                  width={30}
                  height={30}
                  src={row.organizationMediaList[0].uploadFile.uploadFilePath}
                  alt="tag"
                />
              )}
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
              {row.tagCreateDate &&
                format(
                  zonedTimeToUtc(new Date(row.tagCreateDate), "Asia/Taipei"),
                  "PP pp",
                  { locale: zhCN }
                )}
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
              {row.tagUpdateDate &&
                format(
                  zonedTimeToUtc(new Date(row.tagUpdateDate), "Asia/Taipei"),
                  "PP pp",
                  { locale: zhCN }
                )}
            </Box>
          </DataTableCell>
        </DataTableRow>
      )}
    </>
  );
};

export default TagDataTabelRow;
