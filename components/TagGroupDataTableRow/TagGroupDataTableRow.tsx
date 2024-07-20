import React, { FC, useEffect } from "react";
import { makeStyles, useTheme } from "@mui/styles";
import { Theme } from "@mui/material/styles";

import { useMediaQuery } from "@mui/material";
import Typography from "@eGroupAI/material/Typography";
import { useTableRWDStyles } from "@eGroupAI/material-module/DataTable/useTableRWDStyles";
import DataTableRow from "@eGroupAI/material-module/DataTable/DataTableRow";
import DataTableCell from "@eGroupAI/material-module/DataTable/DataTableCell";
import DataTableRowCheckbox from "@eGroupAI/material-module/DataTable/StyledDataTableRowCheckbox";
import Box from "@eGroupAI/material/Box";
import Popover from "@eGroupAI/material/Popover";
import { format } from "@eGroupAI/utils/dateUtils";
import getTextColor from "@eGroupAI/utils/colorUtils";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";

import Label from "minimal/components/label";

import { OrganizationTagGroup } from "interfaces/entities";

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
  tagPopover: {
    color: "white",
    border: "1px solid transparent",
    padding: "0.375rem 1rem",
    borderRadius: "10000px",
    width: "fit-content",
    display: "flex",
    justifyContent: "center",
    fontSize: "0.9375rem",
    margin: "10px 0px",
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
  popoverWrapper: {
    padding: "20px",
  },
}));
interface Props {
  row: OrganizationTagGroup;
  handleClick: (e) => void;
  columns?: {
    id: string;
    name: string;
    sortKey: string | undefined;
    dataKey: string | undefined;
    format: ((val: React.ReactNode) => React.ReactNode) | undefined;
  }[];
}

const TagGroupDataTableRow: FC<Props> = function (props) {
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));
  const { columns, row, handleClick } = props;
  const classes = useStyles();
  const tableRWDClasses = useTableRWDStyles();

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
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
  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      {!isDownSm && (
        <DataTableRow
          className={classes.tableRow}
          onClick={handleClick}
          hover
          id={`tag-group-row-${row.tagGroupId}`}
          data-tid={`tag-group-row-${row.tagGroupId}`}
        >
          <DataTableCell className={classes.checkboxCell}>
            <DataTableRowCheckbox
              onClick={(e) => {
                e.stopPropagation();
              }}
              dataId={`${row.tagGroupId}`}
              data={row}
              size="small"
              id="tag-group-table-checkbox"
              data-tid="tag-group-table-checkbox"
            />
          </DataTableCell>
          <DataTableCell>
            <Typography variant="body1">{row.tagGroupName}</Typography>
          </DataTableCell>
          <DataTableCell sx={{ padding: "16px 0 16px 0", gap: "4px" }}>
            {row.organizationTagList?.slice(0, 2).map((tag) => (
              <Label
                variant="soft"
                key={`${row.tagGroupId}-${tag.tagId}`}
                sx={{
                  backgroundColor: tag.tagColor,
                  margin: "2px",
                  color: getTextColor(tag.tagColor),
                  borderRadius: "8px",
                  padding: "3px",
                }}
              >
                {tag.tagName}
              </Label>
            ))}
            {row.organizationTagList && row.organizationTagList.length > 2 && (
              <Label
                variant="soft"
                sx={{
                  backgroundColor: "#DFE3E83D",
                  margin: "2px",
                  color: "#637381",
                  borderRadius: "8px",
                  padding: "3px",
                  width: "24px",
                  height: "24px",
                }}
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
              >
                +{row.organizationTagList.length - 2}
              </Label>
            )}
            <Popover
              className={classes.popoverWrapper}
              id="mouse-over-popover"
              sx={{
                pointerEvents: "none",
              }}
              open={open}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              onClose={handlePopoverClose}
              disableRestoreFocus
            >
              {row.organizationTagList?.map((tag) => (
                <>
                  <Label
                    variant="soft"
                    key={`${row.tagGroupId}-${tag.tagId}`}
                    sx={{
                      backgroundColor: tag.tagColor,
                      margin: "5px 20px",
                      display: "",
                      color: getTextColor(tag.tagColor),
                    }}
                  >
                    {tag.tagName}
                  </Label>
                  <br />
                </>
              ))}
            </Popover>
          </DataTableCell>
          <DataTableCell>
            <Typography variant="body1">
              {row.tagGroupCreateDate &&
                format(
                  zonedTimeToUtc(
                    new Date(row.tagGroupCreateDate),
                    "Asia/Taipei"
                  ),
                  "PP pp",
                  { locale: zhCN }
                )}
            </Typography>
          </DataTableCell>
          <DataTableCell>
            <Typography variant="body1">
              {row.tagGroupUpdateDate &&
                format(
                  zonedTimeToUtc(
                    new Date(row.tagGroupUpdateDate),
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
          id={`tag-group-row-${row.tagGroupId}`}
          data-tid={`tag-group-row-${row.tagGroupId}`}
        >
          <DataTableCell className={tableRWDClasses.checkBox}>
            <DataTableRowCheckbox
              onClick={(e) => {
                e.stopPropagation();
              }}
              dataId={`${row.tagGroupId}`}
              data={row}
              size="small"
            />
          </DataTableCell>
          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[0]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">{row.tagGroupName}</Typography>
            </Box>
          </DataTableCell>
          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[1]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              {row.organizationTagList?.slice(0, 2).map((tag) => (
                <Label
                  variant="soft"
                  key={tag.tagId}
                  sx={{
                    backgroundColor: tag.tagColor,
                    margin: "2px",
                    color: getTextColor(tag.tagColor),
                    borderRadius: "8px",
                    padding: "3px",
                  }}
                >
                  {tag.tagName}
                </Label>
              ))}
              {row.organizationTagList && row.organizationTagList.length > 2 && (
                <Box sx={{ display: "flex", justifyContent: "right" }}>
                  <Label
                    variant="soft"
                    sx={{
                      backgroundColor: "#DFE3E83D",
                      margin: "2px",
                      color: "#637381",
                      borderRadius: "8px",
                      padding: "3px",
                      width: "24px",
                      height: "24px",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePopoverOpen(e);
                    }}
                    onMouseLeave={handlePopoverClose}
                  >
                    +{row.organizationTagList.length - 2}
                  </Label>
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "right" }}>
                <Popover
                  className={classes.popoverWrapper}
                  id="mouse-over-popover"
                  sx={{
                    pointerEvents: "none",
                  }}
                  open={open}
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  onClose={handlePopoverClose}
                  disableRestoreFocus
                >
                  {row.organizationTagList?.map((tag) => (
                    <>
                      <Label
                        variant="soft"
                        key={`${row.tagGroupId}-${tag.tagId}`}
                        sx={{
                          backgroundColor: tag.tagColor,
                          margin: "2px",
                          color: getTextColor(tag.tagColor),
                        }}
                      >
                        {tag.tagName}
                      </Label>
                      <br />
                    </>
                  ))}
                </Popover>
              </Box>
            </Box>
          </DataTableCell>
        </DataTableRow>
      )}
    </>
  );
};

export default TagGroupDataTableRow;
