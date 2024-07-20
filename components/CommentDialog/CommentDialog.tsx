import React, { FC, useState } from "react";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import makeStyles from "@mui/styles/makeStyles";
import DialogActions from "@mui/material/DialogActions";
import Card from "@mui/material/Card";

import DialogTitle from "@eGroupAI/material/DialogTitle";
import Dialog from "@eGroupAI/material/Dialog";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import NameTaggedFroalaEditor from "components/NameTaggedFroalaEditor/NameTaggedFroalaEditor";
import useTargetComments from "utils/useTargetComments";
import { Table } from "interfaces/utils";
import TargetCommentListItem from "components/TargetComment//TargetCommentListItem";

export const DIALOG = "CommentDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface CommentDialogProps {
  organizationId: string;
  targetTable: string;
  targetId: string;
}

const CommentDialog: FC<CommentDialogProps> = function (props) {
  const { organizationId, targetTable, targetId } = props;

  const [newComment, setNewComment] = useState<string>("");
  const wordLibrary = useSelector(getWordLibrary);
  const [mentionedUsers, setMentionedUsers] = useState<
    { loginId: string; userName: string }[]
  >([]);

  const classes = useStyles();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);

  const { data: comments, mutate: commentsMutate } = useTargetComments(
    {
      organizationId,
      targetTable: Table.COLUMNS,
      targetId,
    },
    undefined,
    undefined,
    !isOpen
  );
  const { excute: createTargetCommentParent, isLoading } = useAxiosApiWrapper(
    apis.org.createTargetCommentParent,
    "Create"
  );

  const handleChangeEditorModel = (newModel: string) => {
    setNewComment(newModel);
  };

  const handleMentionedMemberList = (loginId: string, userName: string) => {
    setMentionedUsers((prev) => {
      if (!prev.map(({ loginId }) => loginId).includes(loginId))
        return [...prev, { loginId, userName }];
      return [...prev];
    });
  };

  const handleSubmitNewComment = async () => {
    if (newComment) {
      closeDialog();
      await createTargetCommentParent({
        organizationId,
        targetTable,
        targetId,
        targetCommentContent: newComment,
        mentionedMemberList: mentionedUsers
          .filter(({ userName }) => newComment.indexOf(`@${userName}`) !== -1)
          .map(({ loginId }) => ({ loginId })),
      });
      setNewComment("");
      commentsMutate();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        closeDialog();
      }}
      fullWidth
      maxWidth="md"
      className={classes.dialogPaper}
      disableEnforceFocus
    >
      <DialogTitle>新增回饋</DialogTitle>
      <DialogFullPageContainer sx={{ color: "#637381" }}>
        <NameTaggedFroalaEditor
          name="comment"
          placeholder={
            wordLibrary?.["write down some of your comments"] ?? "建議....."
          }
          value={newComment}
          onChangeModel={handleChangeEditorModel}
          handleMentionedMemberList={handleMentionedMemberList}
          height={34}
        />
        <Card sx={{ pr: "24px", pl: "24px", mt: "24px" }}>
          {comments?.source.map((comment) => (
            <TargetCommentListItem
              key={comment.targetCommentId}
              comment={comment}
              organizationId={organizationId}
              targetTable={targetTable}
              commentsMutate={commentsMutate}
              usedForColumnComment
              isOpen={isOpen}
            />
          ))}
        </Card>
      </DialogFullPageContainer>
      <DialogActions>
        <DialogCloseButton onClick={closeDialog}>
          {wordLibrary?.cancel ?? "取消"}
        </DialogCloseButton>
        <DialogConfirmButton
          loading={isLoading}
          type="submit"
          onClick={handleSubmitNewComment}
        >
          {wordLibrary?.save ?? "儲存"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(CommentDialog);
