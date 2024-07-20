import { DataTableContext } from "@eGroupAI/material-module/DataTable";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useContext } from "react";

export const ReportTable = () => {
  const { selectedReport } = useContext(DataTableContext);
  if (!selectedReport) return null;

  const {
    reportResult: { reportColumnList, reportDataList },
  } = selectedReport;

  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      <TableContainer sx={{ maxHeight: "80vh" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {Object.values(reportColumnList).map((col, colIdx) => (
                <TableCell key={colIdx}>{col.reportColumnName}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {reportDataList.map((data, rowIdx) => (
              <TableRow key={rowIdx}>
                {Object.keys(reportColumnList).map((col, colIdx) => (
                  <TableCell key={colIdx}>{data[col]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
