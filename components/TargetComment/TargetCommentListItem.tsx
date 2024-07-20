import React, { FC, useState } from "react";
// @mui
import Box from "@mui/material/Box";
// types
import { TargetComment } from "interfaces/entities";
//
import TargetCommentItem from "./TargetCommentItem";
import TargetCommentChildrenList from "./TargetCommentChildrenList";

// ----------------------------------------------------------------------

export interface TargetCommentListItemProps {
  comment: TargetComment;
  organizationId: string;
  targetTable: string;
  commentsMutate: any;
  usedForColumnComment?: boolean;
  id?: string;
  testId?: string;
  isOpen: boolean;
}

const TargetCommentListItem: FC<TargetCommentListItemProps> = function (props) {
  const {
    comment,
    organizationId,
    targetTable,
    commentsMutate,
    usedForColumnComment = false,
    id,
    testId,
    isOpen,
  } = props;

  const [isOpenReply, setIsOpenReply] = useState<boolean>(usedForColumnComment);

  const {
    targetId,
    targetCommentId,
    creator,
    targetCommentCreateDate,
    targetCommentContent,
    targetCommentChildCount,
    hasLikeByCurrentLoginAccount,
  } = comment;

  const hasReply = !!targetCommentChildCount;

  return (
    <Box key={targetCommentId}>
      <TargetCommentItem
        name={creator.memberName}
        time={targetCommentCreateDate}
        message={targetCommentContent}
        avatarUrl={"avatarUrl"}
        depth={0}
        organizationId={organizationId}
        targetTable={targetTable}
        targetId={targetId}
        commentId={targetCommentId}
        commentsMutate={commentsMutate}
        hasLikeByCurrentLoginAccount={hasLikeByCurrentLoginAccount || 0}
        targetCommentChildCount={targetCommentChildCount || 0}
        showReply={setIsOpenReply}
        isOpenReply={isOpenReply}
        comment={comment}
        usedForColumnComment={usedForColumnComment}
        id={id}
        testId={testId}
      />
      {isOpenReply && (
        <TargetCommentChildrenList
          organizationId={organizationId}
          targetTable={targetTable}
          targetId={targetId}
          commentId={targetCommentId}
          hasChildren={hasReply}
          depth={1}
          usedForColumnComment={usedForColumnComment}
          childCount={targetCommentChildCount || 0}
          id={id}
          testId={testId}
          isOpen={isOpen}
        />
      )}
    </Box>
  );
};

export default TargetCommentListItem;
