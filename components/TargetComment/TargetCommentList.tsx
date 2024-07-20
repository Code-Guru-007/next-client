import React, { FC } from "react";
// @mui
// types
import { TargetComment } from "interfaces/entities";
//
import TargetCommentListItem from "./TargetCommentListItem";

// ----------------------------------------------------------------------

export interface TargetCommentsProps {
  organizationId: string;
  targetTable: string;
  comments: TargetComment[];
  commentsMutate: any;
}

const TargetCommentList: FC<TargetCommentsProps> = function (props) {
  const { organizationId, targetTable, comments, commentsMutate } = props;

  return (
    <>
      <>
        {comments.map((comment, index) => (
          <TargetCommentListItem
            id={`comment-editor-${index}`}
            testId={`comment-editor-${index}`}
            key={comment.targetCommentId}
            comment={comment}
            organizationId={organizationId}
            targetTable={targetTable}
            commentsMutate={commentsMutate}
            isOpen={false}
          />
        ))}
      </>
    </>
  );
};

export default TargetCommentList;
