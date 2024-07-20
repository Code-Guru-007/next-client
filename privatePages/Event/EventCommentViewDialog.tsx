import React, { FC } from "react";

import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import { OrganizationComment } from "interfaces/entities";

import FroalaEditorView from "components/FroalaEditorView";
import DialogCloseButton from "components/DialogCloseButton";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export const DIALOG = "ViewCommentDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface ViewCommentDialogProps {
  commentData?: OrganizationComment;
}

const ViewCommentDialog: FC<ViewCommentDialogProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { commentData } = props;
  const classes = useStyles();
  const theme = useTheme();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);

  return (
    <div>
      <Dialog
        open={isOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="md"
        className={classes.dialogPaper}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
      >
        <DialogTitle onClickClose={closeDialog}>
          {wordLibrary?.title ?? "標題"}:{" "}
          {commentData?.organizationCommentTitle}
        </DialogTitle>
        <DialogTitle>{wordLibrary?.content ?? "內容"}: </DialogTitle>
        <DialogContent>
          <FroalaEditorView model={commentData?.organizationCommentContent} />
        </DialogContent>
        <DialogActions>
          <DialogCloseButton onClick={closeDialog} />
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ViewCommentDialog;
