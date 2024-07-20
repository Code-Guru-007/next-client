import React, { FC } from "react";
import { makeStyles, useTheme } from "@mui/styles";
import { useMediaQuery } from "@mui/material";

import { format } from "@eGroupAI/utils/dateUtils";
import TableRow from "@eGroupAI/material/TableRow";
import Typography from "@eGroupAI/material/Typography";
import TableCell from "@eGroupAI/material/TableCell";
import Popover from "@eGroupAI/material/Popover";
import Paper from "@eGroupAI/material/Paper";
import Box from "@eGroupAI/material/Box";
import StyledDataTableCell from "@eGroupAI/material-module/DataTable/StyledDataTableCell";
import StyledDataTableRowCheckbox from "@eGroupAI/material-module/DataTable/StyledDataTableRowCheckbox";
import { useTableRWDStyles } from "@eGroupAI/material-module/DataTable/useTableRWDStyles";
import getTextColor from "@eGroupAI/utils/colorUtils";

import Label from "minimal/components/label";
import { OrganizationFinanceTarget } from "interfaces/entities";
import DataTableMoreButton from "components/DataTableMoreButton";

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
  popoverWrapper: {
    padding: "10px",
  },
}));

interface Props {
  row: OrganizationFinanceTarget;
  onClick?: () => void;
}

const UserFinanceTableRow: FC<Props> = function (props) {
  const theme = useTheme();
  const classes = useStyles();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));
  const { row, onClick } = props;
  const tableRWDClasses = useTableRWDStyles();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

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
        <TableRow className={classes.tableRow} hover onClick={onClick}>
          <StyledDataTableCell>
            <StyledDataTableRowCheckbox
              dataId={`${row.organizationFinanceTargetId}`}
              data={row}
              size="small"
            />
          </StyledDataTableCell>

          <StyledDataTableCell>
            <Typography variant="body1">
              {row.organizationFinanceColumn.organizationFinanceColumnName}
            </Typography>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Typography variant="body1">
              {row.organizationFinanceTargetInsertDate}
            </Typography>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Typography variant="body1">
              {format(row.organizationFinanceTargetCreateDate, "PP pp")}
            </Typography>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Typography variant="body1">
              {row.organizationFinanceTargetAmount}
            </Typography>
          </StyledDataTableCell>
          <TableCell key="tags">
            {row.organizationTagTargetList.slice(0, 3).map((tag) => (
              <Label
                variant="soft"
                key={`${tag.organizationTag.tagId}`}
                sx={{
                  backgroundColor: tag.organizationTag.tagColor,
                  margin: "2px",
                  color: getTextColor(tag.organizationTag.tagColor),
                }}
              >
                {tag.organizationTag.tagName}
              </Label>
            ))}
            {row.organizationTagTargetList &&
              row.organizationTagTargetList.length > 3 && (
                <DataTableMoreButton
                  onHoverReduce={handlePopoverOpen}
                  onLeaveReduce={handlePopoverClose}
                />
              )}
            <Popover
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
              <Paper className={classes.popoverWrapper}>
                {row.organizationTagTargetList?.map((tag) => (
                  <>
                    <Label
                      variant="soft"
                      key={`${tag.organizationTag.tagId}`}
                      sx={{
                        backgroundColor: tag.organizationTag.tagColor,
                        margin: "2px",
                        color: getTextColor(tag.organizationTag.tagColor),
                      }}
                    >
                      {tag.organizationTag.tagName}
                    </Label>
                    <br />
                  </>
                ))}
              </Paper>
            </Popover>
          </TableCell>
        </TableRow>
      )}
      {isDownSm && (
        <TableRow
          className={tableRWDClasses.tableRowRWD}
          hover
          onClick={onClick}
        >
          <StyledDataTableCell className={tableRWDClasses.checkBox}>
            <StyledDataTableRowCheckbox
              dataId={`${row.organizationFinanceTargetId}`}
              data={row}
              size="small"
            />
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Box className={tableRWDClasses.columnCell}>帳務名稱</Box>
            <Box
              className={tableRWDClasses.rowCell}
              sx={{ display: "flex", justifyContent: "right" }}
            >
              <Typography variant="body1">
                {row.organizationFinanceColumn.organizationFinanceColumnName}
              </Typography>
            </Box>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Box className={tableRWDClasses.columnCell}>帳務發生時間</Box>
            <Box
              className={tableRWDClasses.rowCell}
              sx={{ display: "flex", justifyContent: "right" }}
            >
              <Typography variant="body1">
                {row.organizationFinanceTargetInsertDate}
              </Typography>
            </Box>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Box className={tableRWDClasses.columnCell}>填寫時間</Box>
            <Box
              className={tableRWDClasses.rowCell}
              sx={{ display: "flex", justifyContent: "right" }}
            >
              <Typography variant="body1">
                {format(row.organizationFinanceTargetCreateDate, "PP pp")}
              </Typography>
            </Box>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Box className={tableRWDClasses.columnCell}>金額</Box>
            <Box
              className={tableRWDClasses.rowCell}
              sx={{ display: "flex", justifyContent: "right" }}
            >
              <Typography variant="body1">
                {row.organizationFinanceTargetAmount}
              </Typography>
            </Box>
          </StyledDataTableCell>
          <TableCell key="tags">
            <Box className={tableRWDClasses.columnCell}>標籤</Box>
            <Box className={tableRWDClasses.rowCell}>
              {row.organizationTagTargetList?.slice(0, 3).map((tag) => (
                <Box
                  sx={{ display: "flex", justifyContent: "right" }}
                  key={tag.organizationTag.tagId}
                >
                  <Label
                    variant="soft"
                    key={`${tag.organizationTag.tagId}`}
                    sx={{
                      backgroundColor: tag.organizationTag.tagColor,
                      margin: "2px",
                      color: getTextColor(tag.organizationTag.tagColor),
                    }}
                  >
                    {tag.organizationTag.tagName}
                  </Label>
                </Box>
              ))}
              {row.organizationTagTargetList &&
                row.organizationTagTargetList.length > 3 && (
                  <Box sx={{ display: "flex", justifyContent: "right" }}>
                    <DataTableMoreButton
                      onHoverReduce={handlePopoverOpen}
                      onLeaveReduce={handlePopoverClose}
                    />
                  </Box>
                )}
              <Box sx={{ display: "flex", justifyContent: "right" }}>
                <Popover
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
                  <Paper className={classes.popoverWrapper}>
                    {row.organizationTagTargetList?.map((tag) => (
                      <>
                        <Label
                          variant="soft"
                          key={`${tag.organizationTag.tagId}`}
                          sx={{
                            backgroundColor: tag.organizationTag.tagColor,
                            margin: "2px",
                            color: getTextColor(tag.organizationTag.tagColor),
                          }}
                        >
                          {tag.organizationTag.tagName}
                        </Label>
                        <br />
                      </>
                    ))}
                  </Paper>
                </Popover>
              </Box>
            </Box>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default UserFinanceTableRow;
