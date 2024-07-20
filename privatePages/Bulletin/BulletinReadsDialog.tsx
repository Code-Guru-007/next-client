import React, { FC } from "react";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogCloseButton from "components/DialogCloseButton";
import BulletinReadsTable from "./BulletinReadsTable";

export const DIALOG = "BulletinReadsDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

interface OrgRoleDialogProps {
  organizationId: string;
  bulletinId?: string;
}

const BulletinReadsDialog: FC<OrgRoleDialogProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { organizationId, bulletinId } = props;
  const classes = useStyles();
  const theme = useTheme();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      maxWidth="lg"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={closeDialog}>
        {wordLibrary?.["viewing history"] ?? "觀看紀錄"}
      </DialogTitle>
      <DialogContent>
        <BulletinReadsTable
          bulletinId={bulletinId}
          organizationId={organizationId}
        />
      </DialogContent>
      <DialogActions>
        <DialogCloseButton onClick={closeDialog} />
      </DialogActions>
    </Dialog>
  );
};

export default BulletinReadsDialog;
