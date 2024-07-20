import React, { useState } from "react";
// @mui
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
// hooks
import { useBoolean } from "minimal/hooks/use-boolean";
// utils
import { fZonedDateTime } from "minimal/utils/format-time";
// components
import Iconify from "minimal/components/iconify";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { OrganizationArticleComment } from "interfaces/entities";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";
import NameTaggedFroalaEditor from "components/NameTaggedFroalaEditor/NameTaggedFroalaEditor";
import Markdown from "minimal/components/markdown";
import { getMentionedMembersHighlightedMessage } from "components/TargetComment/utils";

// ----------------------------------------------------------------------

type Props = {
  name: string;
  avatarUrl: string;
  time: string;
  message: string;
  hasReply?: boolean;
  depth: number;
  organizationId: string;
  articleId: string;
  commentId: string;
  commentsMutate: any;
  hasLikeByCurrentLoginAccount: number;
  articleCommentChildCount: number;
  showReply: React.Dispatch<React.SetStateAction<boolean>>;
  isOpenReply: boolean;
  comment?: OrganizationArticleComment;
};

export default function PostCommentItem({
  name,
  avatarUrl,
  time,
  message,
  hasReply,
  depth,
  organizationId,
  articleId,
  commentId,
  commentsMutate,
  hasLikeByCurrentLoginAccount,
  articleCommentChildCount,
  showReply,
  isOpenReply,
  comment,
}: Props) {
  const reply = useBoolean();
  const [newComment, setNewComment] = useState<string>("");
  const [mentionedUsers, setMentionedUsers] = useState<
    { loginId: string; userName: string }[]
  >([]);

  const highlightedMessage = getMentionedMembersHighlightedMessage(
    message,
    comment?.mentionedMemberList
  );

  const { excute: createGrandComment, isLoading: isCreatingGrandComment } =
    useAxiosApiWrapper(apis.org.createOrgArticleCommentChild, "Create");

  const { excute: toggleArticleCommentLike } = useAxiosApiWrapper(
    apis.org.toggleOrgArticleCommentLike,
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
    if (organizationId && newComment) {
      await createGrandComment({
        organizationId,
        articleId,
        articleCommentContent: newComment,
        articleCommentParentId: commentId,
        mentionedMemberList: mentionedUsers
          .filter(({ userName }) => newComment.indexOf(`@${userName}`) !== -1)
          .map(({ loginId }) => loginId),
      });
      reply.onFalse();
      commentsMutate();
    }
  };

  const handleToggleArticleCommentLike = async () => {
    if (organizationId && comment) {
      try {
        await toggleArticleCommentLike({
          organizationId,
          articleId: comment.article.articleId,
          articleCommentId: comment.articleCommentId,
        });
        commentsMutate();
      } catch (error) {
        apis.tools.createLog({
          function: " handleToggleArticleCommentLike",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
    }
  };

  const wordLibrary = useSelector(getWordLibrary);

  return (
    <ListItem
      id={commentId}
      sx={{
        p: 0,
        pt: 3,
        alignItems: "flex-start",
        ...(hasReply && {
          pl: 8 * depth,
        }),
      }}
    >
      <Avatar
        alt={name}
        src={avatarUrl}
        sx={{ mr: 2, width: 48, height: 48 }}
      />

      <Stack
        flexGrow={1}
        sx={{
          pb: 3,
          borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          {name}
        </Typography>

        <Typography variant="caption" sx={{ color: "text.disabled" }}>
          {fZonedDateTime(time)}
        </Typography>

        <Markdown children={highlightedMessage} />

        <Stack direction="row" alignItems="center" gap={2}>
          <Stack direction="row" alignItems="center">
            <IconButton
              color={!hasLikeByCurrentLoginAccount ? "inherit" : "primary"}
              onClick={handleToggleArticleCommentLike}
            >
              <Iconify icon="mdi:thumb-up" />
            </IconButton>
            <Typography>{comment?.articleCommentLikeCount}</Typography>
          </Stack>

          <Stack direction="row" alignItems="center">
            <IconButton
              color={"primary"}
              disabled={articleCommentChildCount === 0}
              onClick={() => {
                if (articleCommentChildCount !== 0) {
                  showReply(!isOpenReply);
                }
              }}
            >
              <Iconify icon="mdi:message-processing" />
            </IconButton>
            <Typography>{articleCommentChildCount}</Typography>
          </Stack>

          <Button
            size="small"
            color={reply.value ? "primary" : "inherit"}
            startIcon={<Iconify icon="jam:write" width={16} />}
            onClick={reply.onToggle}
          >
            {wordLibrary?.reply ?? "回覆"}
          </Button>
        </Stack>

        {reply.value && (
          <Box sx={{ mt: 2 }}>
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

            <Stack direction="row" alignItems="center" sx={{ marginTop: 2 }}>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={reply.onFalse}
                sx={{ marginRight: 2 }}
              >
                {wordLibrary?.cancel ?? "取消"}
              </Button>
              <LoadingButton
                size="small"
                variant="contained"
                color="inherit"
                loading={isCreatingGrandComment}
                onClick={handleSubmitNewComment}
              >
                {wordLibrary?.submit ?? "送出"}
              </LoadingButton>
            </Stack>
          </Box>
        )}
      </Stack>
    </ListItem>
  );
}
