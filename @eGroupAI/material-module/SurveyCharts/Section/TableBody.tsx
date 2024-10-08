import React, { FC } from "react";

import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

import calcPercent from "@eGroupAI/utils/calcPercent";
import { TableBody as MuiTableBody, TableRow, TableCell } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import sortOptionCount from "../sortOptionCount";
import sortResponseContentCount from "../sortResponseContentCount";
import colors from "../colors";

import { Question } from "../types";

const useStyles = makeStyles(() => ({
  colorBlock: {
    width: "12px",
    height: "12px",
    display: "inline-block",
    marginRight: "7px",
    marginBottom: "2px",
    verticalAlign: "middle",
  },
}));

export interface TableBodyProps {
  question: Question;
  totalResponses: number;
}

const TableBody: FC<TableBodyProps> = ({ question, totalResponses }) => {
  const wordLibrary = useSelector(getWordLibrary);
  const classes = useStyles();
  switch (question.questionType) {
    case "rating": {
      if (question.responseContentList) {
        const { statistics } = question;
        return (
          <MuiTableBody>
            {question.responseContentList
              .sort(sortResponseContentCount)
              .map((el) => (
                <TableRow key={el.responseContent}>
                  <TableCell component="th" scope="row">
                    {el.responseContent}
                  </TableCell>
                  <TableCell align="right">{el.responseContentCount}</TableCell>
                  <TableCell align="right">
                    {calcPercent(
                      el.responseContentCount,
                      question.questionCount
                    )}
                  </TableCell>
                </TableRow>
              ))}
            {statistics && (
              <>
                <TableRow>
                  <TableCell rowSpan={5} style={{ borderBottom: "none" }} />
                  <TableCell>
                    ${wordLibrary?.["maximum value"] ?? "最大值"}
                  </TableCell>
                  <TableCell align="right">{statistics.max} 分</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    ${wordLibrary?.["minimum value"] ?? "最小值"}
                  </TableCell>
                  <TableCell align="right">{statistics.min} 分</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>總分</TableCell>
                  <TableCell align="right">
                    {statistics.totalScore} 分
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>平均數</TableCell>
                  <TableCell align="right">{statistics.mean} 分</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>標準差</TableCell>
                  <TableCell align="right">
                    {statistics.standardDeviation} 分
                  </TableCell>
                </TableRow>
              </>
            )}
          </MuiTableBody>
        );
      }
      return (
        <MuiTableBody>
          <TableRow>
            <TableCell>No Data</TableCell>
          </TableRow>
        </MuiTableBody>
      );
    }
    case "choiceone":
    case "select": {
      if (question.optionList) {
        return (
          <MuiTableBody>
            {question.optionList.sort(sortOptionCount).map((el) => (
              <TableRow key={el.optionId}>
                <TableCell component="th" scope="row">
                  {el.optionName}
                </TableCell>
                <TableCell align="right">{el.optionCount}</TableCell>
                <TableCell align="right">
                  {calcPercent(el.optionCount, question.questionCount)}
                </TableCell>
              </TableRow>
            ))}
          </MuiTableBody>
        );
      }
      return (
        <MuiTableBody>
          <TableRow>
            <TableCell>No Data</TableCell>
          </TableRow>
        </MuiTableBody>
      );
    }
    case "choicemulti": {
      if (question.optionList) {
        return (
          <MuiTableBody>
            {question.optionList.sort(sortOptionCount).map((el, index) => (
              <TableRow key={el.optionId}>
                <TableCell component="th" scope="row">
                  <div
                    className={classes.colorBlock}
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  {el.optionName}
                </TableCell>
                <TableCell align="right">{el.optionCount}</TableCell>
                <TableCell align="right">
                  {calcPercent(el.optionCount, totalResponses)}
                </TableCell>
              </TableRow>
            ))}
          </MuiTableBody>
        );
      }
      return (
        <MuiTableBody>
          <TableRow>
            <TableCell>No Data</TableCell>
          </TableRow>
        </MuiTableBody>
      );
    }
    default:
      return null;
  }
};

export default TableBody;
