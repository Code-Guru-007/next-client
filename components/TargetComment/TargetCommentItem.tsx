import React, { FC, useState, useEffect } from "react";
import { useCookies } from "react-cookie";
// @mui
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
// hooks
import { useBoolean } from "minimal/hooks/use-boolean";
// utils
import { fZonedDateTime } from "minimal/utils/format-time";
// components
import Iconify from "minimal/components/iconify";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { TargetComment } from "interfaces/entities";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";
import NameTaggedFroalaEditor from "components/NameTaggedFroalaEditor/NameTaggedFroalaEditor";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import Markdown from "minimal/components/markdown";
import { usePopover } from "minimal/components/custom-popover";
import CustomPopover from "minimal/components/custom-popover/custom-popover";
import { MenuItem } from "@mui/material";
import { getMentionedMembersHighlightedMessage } from "./utils";

// ----------------------------------------------------------------------

export interface TargetCommentItemProps {
  name: string;
  avatarUrl: string;
  time: string;
  message: string;
  hasReply?: boolean;
  depth: number;
  organizationId: string;
  targetTable: string;
  targetId: string;
  commentId: string;
  commentsMutate: any;
  hasLikeByCurrentLoginAccount: number;
  targetCommentChildCount: number;
  showReply: React.Dispatch<React.SetStateAction<boolean>>;
  isOpenReply: boolean;
  comment?: TargetComment;
  usedForColumnComment?: boolean;
  hasChildren?: boolean;
  id?: string;
  testId?: string;
}

const TargetCommentItem: FC<TargetCommentItemProps> = function (props) {
  const {
    usedForColumnComment = false,
    name,
    avatarUrl,
    time,
    message,
    hasReply,
    depth,
    organizationId,
    targetTable,
    targetId,
    commentId,
    commentsMutate,
    hasLikeByCurrentLoginAccount,
    targetCommentChildCount,
    showReply,
    isOpenReply,
    comment,
    hasChildren,
    id,
    testId,
  } = props;
  const reply = useBoolean();
  const [clientCookies] = useCookies();
  const { lid } = clientCookies;
  const [newComment, setNewComment] = useState<string>("");
  const [updatedComment, setUpdatedComment] = useState<string>(
    comment?.targetCommentContent || ""
  );
  const [updateState, setUpdateState] = useState<boolean>(false);
  const [mentionedUsers, setMentionedUsers] = useState<
    { loginId: string; userName: string }[]
  >([]);
  const highlightedMessage = getMentionedMembersHighlightedMessage(
    message,
    comment?.mentionedMemberList
  );
  const popover = usePopover();
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

  const {
    excute: createTargetCommentChild,
    isLoading: isCreatingGrandComment,
  } = useAxiosApiWrapper(apis.org.createTargetCommentChild, "Create");

  const { excute: updateTargetComment, isLoading: isUpdatingComment } =
    useAxiosApiWrapper(apis.org.updateTargetComment, "Update");

  const { excute: deleteTargetComment } = useAxiosApiWrapper(
    apis.org.deleteTargetComment,
    "Delete"
  );

  const { excute: toggleTargetCommentLike } = useAxiosApiWrapper(
    apis.org.toggleTargetCommentLike,
    "Create"
  );

  const handleChangeEditorModel = (newModel: string) => {
    setNewComment(newModel);
  };

  const handleChangeUpdatedEditorModel = (newModel: string) => {
    setUpdatedComment(newModel);
  };

  const handleSubmitNewComment = async () => {
    if (organizationId && newComment) {
      await createTargetCommentChild({
        organizationId,
        targetTable,
        targetId,
        targetCommentContent: newComment,
        targetCommentParentId: commentId,
        mentionedMemberList: mentionedUsers
          .filter(({ userName }) => newComment.indexOf(`@${userName}`) !== -1)
          .map(({ loginId }) => ({ loginId })),
      });
      reply.onFalse();
      commentsMutate();
    }
  };

  const handleSubmitUpdatedComment = async () => {
    if (organizationId && updatedComment && comment?.targetCommentId) {
      await updateTargetComment({
        organizationId,
        targetTable,
        targetId,
        targetCommentId: comment?.targetCommentId,
        targetCommentContent: updatedComment,
        mentionedMemberList: mentionedUsers
          .filter(
            ({ userName }) => updatedComment.indexOf(`@${userName}`) !== -1
          )
          .map(({ loginId }) => ({ loginId })),
      });
      setUpdateState(false);
      setUpdatedComment("");
      setMentionedUsers([]);
      commentsMutate();
    }
  };

  const handleToggleArticleCommentLike = async () => {
    if (organizationId && comment) {
      try {
        await toggleTargetCommentLike({
          organizationId,
          targetTable,
          targetId: comment.targetId,
          targetCommentId: comment.targetCommentId,
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

  const handleMentionedMemberList = (loginId: string, userName: string) => {
    setMentionedUsers((prev) => {
      if (!prev.map(({ loginId }) => loginId).includes(loginId))
        return [...prev, { loginId, userName }];
      return [...prev];
    });
  };

  useEffect(() => {
    if (usedForColumnComment) showReply(true);
  }, [usedForColumnComment, showReply]);

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
        position: "relative",
      }}
    >
      {comment?.creator.loginId === lid && (
        <Stack
          direction="row"
          alignItems="center"
          gap={0.5}
          sx={{ position: "absolute", top: 20, right: 20 }}
        >
          {(!usedForColumnComment ||
            (!hasChildren && usedForColumnComment)) && (
            <>
              <IconButton
                color={popover.open ? "inherit" : "default"}
                onClick={popover.onOpen}
                id={`comment-more-option-button-${commentId}`}
                data-tid={`comment-more-option-button-${commentId}`}
              >
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
              <CustomPopover
                open={popover.open}
                onClose={popover.onClose}
                arrow="right-top"
                sx={{ width: 160 }}
              >
                <MenuItem
                  id={`edit-comment-${commentId}`}
                  data-tid={`edit-comment-${commentId}`}
                  onClick={() => {
                    setUpdatedComment(comment?.targetCommentContent || "");
                    setMentionedUsers(
                      comment?.mentionedMemberList?.map((member) => ({
                        loginId: member.loginId,
                        userName: member.memberName,
                      })) || []
                    );
                    setUpdateState(true);
                    popover.onClose();
                  }}
                >
                  <Iconify icon="solar:pen-bold" />
                  {wordLibrary?.edit ?? "編輯"}
                </MenuItem>
                <MenuItem
                  id={`delete-comment-${commentId}`}
                  data-tid={`delete-comment-${commentId}`}
                  sx={{ color: "error.main" }}
                  onClick={() => {
                    openConfirmDeleteDialog({
                      primary: `您確定要刪除嗎？`,
                      onConfirm: async () => {
                        if (comment?.targetCommentId) {
                          closeConfirmDeleteDialog();
                          await deleteTargetComment({
                            organizationId,
                            targetTable,
                            targetId: comment.targetId,
                            targetCommentId: comment.targetCommentId,
                          });
                          commentsMutate();
                        }
                      },
                    });
                    popover.onClose();
                  }}
                >
                  <Iconify icon="solar:trash-bin-trash-bold" />
                  {wordLibrary?.delete ?? "刪除"}
                </MenuItem>
              </CustomPopover>
            </>
          )}
        </Stack>
      )}
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

        {updateState && (
          <Box sx={{ mt: 2 }}>
            <NameTaggedFroalaEditor
              name="comment"
              placeholder={
                wordLibrary?.["write down some of your responses"] ??
                "寫下您的一些回應..."
              }
              value={updatedComment}
              onChangeModel={handleChangeUpdatedEditorModel}
              handleMentionedMemberList={handleMentionedMemberList}
              fileType={targetTable === "bulletins" ? "BULLETIN" : "EVENT"}
              id={id}
              testId={testId}
            />

            <Stack
              direction="row"
              justifyContent="flex-end"
              sx={{ marginTop: 2 }}
            >
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setUpdatedComment("");
                  setMentionedUsers([]);
                  setUpdateState(false);
                }}
                sx={{ marginRight: 2 }}
                id="cancel-update-comment-button"
                data-tid="cancel-update-comment-button"
              >
                {wordLibrary?.cancel ?? "取消"}
              </Button>
              <LoadingButton
                variant="contained"
                color="inherit"
                disabled={!updatedComment}
                loading={isUpdatingComment}
                onClick={handleSubmitUpdatedComment}
                id="submit-update-comment-button"
                data-tid="submit-update-comment-button"
              >
                {wordLibrary?.submit ?? "送出"}
              </LoadingButton>
            </Stack>
          </Box>
        )}
        {!updateState && (
          <>
            <Markdown children={highlightedMessage} showFullImage />
            <Stack direction="row" alignItems="center" gap={2}>
              <Stack direction="row" alignItems="center">
                {!hasChildren && usedForColumnComment && (
                  <Button
                    size="small"
                    color={reply.value ? "primary" : "inherit"}
                    startIcon={
                      <Iconify
                        icon="solar:pen-bold"
                        sx={{ width: "18px", height: "18px" }}
                      />
                    }
                    onClick={reply.onToggle}
                  >
                    &nbsp;{wordLibrary?.reply ?? "回覆"}
                  </Button>
                )}
              </Stack>
            </Stack>
            {!usedForColumnComment && (
              <Stack direction="row" alignItems="center" gap={2}>
                <Stack direction="row" alignItems="center">
                  <IconButton
                    color={
                      !hasLikeByCurrentLoginAccount ? "inherit" : "primary"
                    }
                    onClick={handleToggleArticleCommentLike}
                    id={`like-comment-button-${commentId}`}
                    data-tid={`like-comment-button-${commentId}`}
                  >
                    <Iconify icon="mdi:thumb-up" />
                  </IconButton>
                  <Typography>{comment?.targetCommentLikeCount}</Typography>
                </Stack>

                <Stack direction="row" alignItems="center">
                  <IconButton
                    color={"primary"}
                    disabled={targetCommentChildCount === 0}
                    onClick={() => {
                      if (targetCommentChildCount !== 0) {
                        showReply(!isOpenReply);
                      }
                    }}
                    id="show-reply-comment-button"
                    data-tid="show-reply-comment-button"
                  >
                    <Iconify icon="mdi:message-processing" />
                  </IconButton>
                  <Typography>{targetCommentChildCount}</Typography>
                </Stack>
                <Button
                  size="small"
                  color={reply.value ? "primary" : "inherit"}
                  startIcon={<Iconify icon="jam:write" width={16} />}
                  onClick={reply.onToggle}
                  id="reply-comment-button"
                  data-tid="reply-comment-button"
                >
                  {wordLibrary?.reply ?? "回覆"}
                </Button>
              </Stack>
            )}
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
                  fileType={targetTable === "bulletins" ? "BULLETIN" : "EVENT"}
                  id={id}
                  testId={testId}
                />
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ marginTop: 2 }}
                >
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={reply.onFalse}
                    sx={{ marginRight: 2 }}
                    id="cancel-reply-comment-button"
                    data-tid="cancel-reply-comment-button"
                  >
                    {wordLibrary?.cancel ?? "取消"}
                  </Button>
                  <LoadingButton
                    variant="contained"
                    color="inherit"
                    disabled={!newComment}
                    loading={isCreatingGrandComment}
                    onClick={handleSubmitNewComment}
                    id="submit-reply-comment-button"
                    data-tid="submit-reply-comment-button"
                  >
                    {wordLibrary?.submit ?? "送出"}
                  </LoadingButton>
                </Stack>
              </Box>
            )}
          </>
        )}
      </Stack>
    </ListItem>
  );
};

export default TargetCommentItem;
