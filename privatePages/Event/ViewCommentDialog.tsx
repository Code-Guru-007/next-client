import React, { FC } from "react";

import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@eGroupAI/material/Typography";
import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogConfirmButton from "components/DialogConfirmButton";
import { OrganizationComment } from "interfaces/entities";
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

export interface CommentDialogProps {
  comment: OrganizationComment;
}

const ViewCommentDialog: FC<CommentDialogProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { comment } = props;
  const classes = useStyles();
  const theme = useTheme();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      fullWidth
      maxWidth="sm"
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={closeDialog}>
        {wordLibrary?.["comment content"] ?? "評論內容"}
      </DialogTitle>
      <DialogContent>
        <Typography gutterBottom variant="body1">
          評論者: {comment.creator.memberName}
        </Typography>
        <Typography gutterBottom variant="body1">
          {wordLibrary?.title ?? "標題"}: {comment.organizationCommentTitle}
        </Typography>
        <Typography gutterBottom variant="body1">
          {wordLibrary?.content ?? "內容"} :{" "}
          {comment.organizationCommentContent}
        </Typography>
      </DialogContent>
      <DialogActions>
        <DialogConfirmButton onClick={closeDialog} />
      </DialogActions>
    </Dialog>
  );
};

export default ViewCommentDialog;
