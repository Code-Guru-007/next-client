import React, { useState, useEffect } from "react";
// @mui
import LoadingButton from "@mui/lab/LoadingButton";
import Stack from "@mui/material/Stack";
// components

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";
// import MultilineTextFieldTagged from "components/MultilineTextFieldTagged";
import NameTaggedFroalaEditor from "components/NameTaggedFroalaEditor/NameTaggedFroalaEditor";

// ----------------------------------------------------------------------

type Props = {
  organizationId: string;
  targetTable: string;
  targetId: string;
  commentsMutate: any;
};

export default function TargetCommentForm({
  organizationId,
  targetTable,
  targetId,
  commentsMutate,
}: Props) {
  const [newComment, setNewComment] = useState<string>("");
  const [mentionedUsers, setMentionedUsers] = useState<
    { loginId: string; userName: string }[]
  >([]);

  const { excute: createTargetCommentParent, isLoading } = useAxiosApiWrapper(
    apis.org.createTargetCommentParent,
    "Create"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const froalaElement = document.querySelector(".fr-element.fr-view");
      if (froalaElement) {
        froalaElement.setAttribute("id", "comment-editor-main");
      }
    });
    observer.observe(document, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const handleChangeEditorModel = (newModel: string) => {
    setNewComment(newModel);
  };

  const handleSubmitNewComment = async () => {
    if (newComment) {
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

  const handleMentionedMemberList = (loginId: string, userName: string) => {
    setMentionedUsers((prev) => {
      if (!prev.map(({ loginId }) => loginId).includes(loginId))
        return [...prev, { loginId, userName }];
      return [...prev];
    });
  };

  const wordLibrary = useSelector(getWordLibrary);

  let fileType;

  switch (targetTable) {
    case "bulletins":
      fileType = "BULLETIN";
      break;
    case "events":
      fileType = "EVENT";
      break;
    case "articles":
      fileType = "ARTICLE";
      break;
    default:
      break;
  }

  return (
    <Stack spacing={3}>
      <NameTaggedFroalaEditor
        name="comment"
        placeholder={
          wordLibrary?.["write down some of your responses"] ??
          "寫下您的一些回應..."
        }
        value={newComment}
        onChangeModel={handleChangeEditorModel}
        handleMentionedMemberList={handleMentionedMemberList}
        fileType={fileType}
      />

      <Stack direction="row" alignItems="center">
        <Stack direction="row" alignItems="center" flexGrow={1} />

        <LoadingButton
          variant="contained"
          disabled={!newComment}
          loading={isLoading}
          onClick={handleSubmitNewComment}
          id={`add-new-comment-btn-${targetId}`}
        >
          {wordLibrary?.submit ?? "送出"}
        </LoadingButton>
      </Stack>
    </Stack>
  );
}
