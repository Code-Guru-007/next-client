import React, { FC, useEffect } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import useOrgRecordTargets from "utils/useOrgRecordTargets";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { format } from "@eGroupAI/utils/dateUtils";
import { ColumnType } from "@eGroupAI/typings/apis";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import Table from "@eGroupAI/material/Table";
import TableHead from "@eGroupAI/material/TableHead";
import TableBody from "@eGroupAI/material/TableBody";
import TableRow from "@eGroupAI/material/TableRow";
import TableCell from "@eGroupAI/material/TableCell";
import Dialog from "@eGroupAI/material/Dialog";
import Typography from "@eGroupAI/material/Typography";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogCloseButton from "components/DialogCloseButton";

export const DIALOG = "SesTemplateInfoHistoryDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export type RecordTarget = {
  key?: string;
  type?: ColumnType;
  name?: string;
  permission?: {
    readable?: boolean;
    writable?: boolean;
    deletable?: boolean;
  };
};
export interface SesTemplateInfoHistoryDialogProps {
  targetId: string;
  recordTarget: RecordTarget;
}

const getFormatTargetValue = (type: ColumnType, value: string) => {
  switch (type) {
    case ColumnType.DATE:
      return format(value, "PP");
    case ColumnType.DATETIME:
      return format(value, "PP pp");
    default:
      return value;
  }
};

const SesTemplateInfoHistoryDialog: FC<SesTemplateInfoHistoryDialogProps> =
  function (props) {
    const { targetId, recordTarget } = props;
    const theme = useTheme();
    const classes = useStyles();
    const { closeDialog, isOpen } = useReduxDialog(DIALOG);
    const organizationId = useSelector(getSelectedOrgId);
    const { data, mutate } = useOrgRecordTargets(
      {
        organizationId,
      },
      {
        targetId,
        organizationRecordTargetKey: recordTarget.key,
      },
      undefined,
      !recordTarget.key
    );

    useEffect(() => {
      if (isOpen) {
        mutate();
      }
    }, [isOpen, mutate]);

    const wordLibrary = useSelector(getWordLibrary);

    const renderContent = () => {
      if (!data) return undefined;
      if (data.length === 0) {
        return (
          <Typography variant="body2">
            {wordLibrary?.["no data available"] ?? "無資料"}
          </Typography>
        );
      }
      return (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                {wordLibrary?.["history record"] ?? "歷史紀錄"}
              </TableCell>
              <TableCell>{wordLibrary?.time ?? "時間"}</TableCell>
              <TableCell>{wordLibrary?.editor ?? "編輯者"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((el) => (
              <TableRow key={el.organizationRecordTargetId}>
                <TableCell>
                  {recordTarget.type &&
                    getFormatTargetValue(
                      recordTarget.type,
                      el.organizationRecordTargetValue
                    )}
                </TableCell>
                <TableCell>
                  {format(el.organizationRecordTargetCreateDate, "PP pp")}
                </TableCell>
                <TableCell>
                  {el.updater.memberName ||
                    `${wordLibrary?.["edit via link"] ?? "透過連結編輯"}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    };

    return (
      <Dialog
        open={isOpen}
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
        className={classes.dialogPaper}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
      >
        <DialogTitle onClickClose={closeDialog}>
          {wordLibrary?.["history record"] ?? "歷史紀錄"}
        </DialogTitle>
        <DialogContent>{renderContent()}</DialogContent>
        <DialogActions>
          <DialogCloseButton onClick={closeDialog} />
        </DialogActions>
      </Dialog>
    );
  };

export default SesTemplateInfoHistoryDialog;
