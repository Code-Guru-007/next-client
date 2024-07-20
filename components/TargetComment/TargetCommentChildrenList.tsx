import React, { FC, useState, useEffect } from "react";

import useTargetComments from "utils/useTargetComments";

import Box from "@mui/material/Box";
// types

//
import TargetCommentItem from "./TargetCommentItem";

// ----------------------------------------------------------------------

export interface TargetCommentsChildrenProps {
  organizationId: string;
  targetTable: string;
  targetId: string;
  commentId: string;
  hasChildren: boolean;
  depth: number;
  childCount: number;
  usedForColumnComment?: boolean;
  id?: string;
  testId?: string;
  isOpen: boolean;
}

const TargetCommentChildrenList: FC<TargetCommentsChildrenProps> = function (
  props
) {
  const {
    organizationId,
    targetTable,
    targetId,
    commentId,
    hasChildren,
    depth,
    childCount,
    usedForColumnComment = false,
    id,
    testId,
    isOpen,
  } = props;

  const [isOpenReply, setIsOpenReply] = useState<boolean>(false);

  const { data: childrenComments, mutate } = useTargetComments(
    {
      organizationId,
      targetTable,
      targetId,
    },
    {
      targetCommentParentId: commentId,
    },
    undefined,
    !isOpen
  );

  useEffect(() => {
    mutate();
  }, [childCount, mutate]);

  return (
    <>
      {childrenComments?.source.map((comment) => {
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
              hasReply={hasChildren}
              depth={depth}
              organizationId={organizationId}
              targetTable={targetTable}
              targetId={targetId}
              commentId={targetCommentId}
              commentsMutate={mutate}
              hasLikeByCurrentLoginAccount={hasLikeByCurrentLoginAccount || 0}
              targetCommentChildCount={targetCommentChildCount || 0}
              showReply={setIsOpenReply}
              isOpenReply={isOpenReply}
              comment={comment}
              usedForColumnComment={usedForColumnComment}
              hasChildren={usedForColumnComment ? false : hasChildren}
              id={id}
              testId={testId}
            />
            {isOpenReply && (
              <TargetCommentChildrenList
                id={id}
                testId={testId}
                organizationId={organizationId}
                targetTable={targetTable}
                targetId={targetId}
                commentId={targetCommentId}
                hasChildren={hasReply}
                depth={depth + 1}
                usedForColumnComment={usedForColumnComment}
                childCount={targetCommentChildCount || 0}
                isOpen={isOpen}
              />
            )}
          </Box>
        );
      })}
    </>
  );
};

export default TargetCommentChildrenList;
