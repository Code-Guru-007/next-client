import React, { useState } from "react";
// @mui
import LoadingButton from "@mui/lab/LoadingButton";
import Stack from "@mui/material/Stack";
// components

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";

import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";
import NameTaggedFroalaEditor from "components/NameTaggedFroalaEditor/NameTaggedFroalaEditor";

// ----------------------------------------------------------------------

type Props = {
  organizationId: string;
  articleId: string;
  commentsMutate: any;
};

export default function PostCommentForm({
  organizationId,
  articleId,
  commentsMutate,
}: Props) {
  const [newComment, setNewComment] = useState<string>("");
  const [mentionedUsers, setMentionedUsers] = useState<
    { loginId: string; userName: string }[]
  >([]);

  const { excute: createOrgArticleCommentParent, isLoading } =
    useAxiosApiWrapper(apis.org.createOrgArticleCommentParent, "Create");

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
      await createOrgArticleCommentParent({
        organizationId,
        articleId,
        articleCommentContent: newComment,
        mentionedMemberList: mentionedUsers
          .filter(({ userName }) => newComment.indexOf(`@${userName}`) !== -1)
          .map(({ loginId }) => loginId),
      });
      setNewComment("");
      commentsMutate();
    }
  };

  const wordLibrary = useSelector(getWordLibrary);

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
        fileType="ARTICLE"
      />

      <Stack direction="row" alignItems="center">
        <Stack direction="row" alignItems="center" flexGrow={1} />

        <LoadingButton
          variant="contained"
          loading={isLoading}
          onClick={handleSubmitNewComment}
        >
          {wordLibrary?.submit ?? "送出"}
        </LoadingButton>
      </Stack>
    </Stack>
  );
}
