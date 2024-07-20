import React, { FC } from "react";
import { makeStyles, useTheme } from "@mui/styles";
import { useMediaQuery } from "@mui/material";

import Box from "@eGroupAI/material/Box";
import TableRow from "@eGroupAI/material/TableRow";
import Typography from "@eGroupAI/material/Typography";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";

import StyledDataTableCell from "@eGroupAI/material-module/DataTable/StyledDataTableCell";
import StyledDataTableRowCheckbox from "@eGroupAI/material-module/DataTable/StyledDataTableRowCheckbox";
import { useTableRWDStyles } from "@eGroupAI/material-module/DataTable/useTableRWDStyles";
import { format } from "@eGroupAI/utils/dateUtils";

import { ColumnGroup } from "interfaces/entities";
import OrgTagsInDataTableRow from "components/OrgTagsInDataTableRow";

const useStyles = makeStyles((theme) => ({
  tableRow: {
    cursor: "pointer",
    "& .MuiTableCell-root:first-child": {
      maxWidth: "300px",
    },
    "& .MuiTableCell-root": {
      verticalAlign: "middle",
    },
  },
  tag: {
    color: theme.palette.common.white,
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
  popoverWrapper: {
    padding: "20px",
  },
}));

interface Props {
  row: ColumnGroup;
  onClick?: () => void;
  columns?: {
    id: string;
    name: string;
    sortKey: string | undefined;
    dataKey: string | undefined;
    format: ((val: React.ReactNode) => React.ReactNode) | undefined;
  }[];
}

const DynamicColumnGroupTableRow: FC<Props> = function (props) {
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));
  const { columns, row, onClick } = props;

  const classes = useStyles();
  const tableRWDClasses = useTableRWDStyles();

  return (
    <>
      {!isDownSm && (
        <TableRow className={classes.tableRow} hover onClick={onClick}>
          <StyledDataTableCell>
            <StyledDataTableRowCheckbox
              dataId={`${row.columnGroupId}`}
              data={row}
              size="small"
            />
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Typography variant="body1">{row.columnGroupName}</Typography>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Typography variant="body1">
              {row.organizationColumnListCount}
            </Typography>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <OrgTagsInDataTableRow
              organizationTagTargetList={row.organizationTagTargetList}
            />
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Typography variant="body1">
              {row.columnGroupCreateDate &&
                format(
                  zonedTimeToUtc(
                    new Date(row.columnGroupCreateDate),
                    "Asia/Taipei"
                  ),
                  "PP pp",
                  { locale: zhCN }
                )}
            </Typography>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Typography variant="body1">
              {row.columnGroupUpdateDate &&
                format(
                  zonedTimeToUtc(
                    new Date(row.columnGroupUpdateDate),
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
          hover
          onClick={onClick}
        >
          <StyledDataTableCell>
            <StyledDataTableRowCheckbox
              dataId={`${row.columnGroupId}`}
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
              <Typography variant="body1">{row.columnGroupName}</Typography>
            </Box>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[1]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <Typography variant="body1">
                {row.organizationColumnListCount}
              </Typography>
            </Box>
          </StyledDataTableCell>
          <StyledDataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[2]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <OrgTagsInDataTableRow
                organizationTagTargetList={row.organizationTagTargetList}
              />
            </Box>
          </StyledDataTableCell>
        </TableRow>
      )}
    </>
  );
};

export default DynamicColumnGroupTableRow;
