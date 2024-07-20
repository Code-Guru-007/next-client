import React, { FC, useState } from "react";
// @mui
import Box from "@mui/material/Box";
// types
import { OrganizationArticleComment } from "interfaces/entities";
//
import ArticleCommentItem from "./ArticleCommentItem";
import ArticleCommentChildrenList from "./ArticleCommentChildrenList";

// ----------------------------------------------------------------------

export interface ArticleCommentListItemProps {
  comment: OrganizationArticleComment;
  organizationId: string;
  commentsMutate: any;
}

const ArticleCommentListItem: FC<ArticleCommentListItemProps> = function (
  props
) {
  const { comment, organizationId, commentsMutate } = props;

  const [isOpenReply, setIsOpenReply] = useState<boolean>(false);

  const {
    article,
    articleCommentId,
    creator,
    articleCommentCreateDate,
    articleCommentContent,
    articleCommentChildCount,
    hasLikeByCurrentLoginAccount,
  } = comment;

  const hasReply = !!articleCommentChildCount;

  return (
    <Box key={articleCommentId}>
      <ArticleCommentItem
        name={creator.memberName}
        time={articleCommentCreateDate}
        message={articleCommentContent}
        avatarUrl={"avatarUrl"}
        depth={0}
        organizationId={organizationId}
        articleId={article?.articleId}
        commentId={articleCommentId}
        commentsMutate={commentsMutate}
        hasLikeByCurrentLoginAccount={hasLikeByCurrentLoginAccount || 0}
        articleCommentChildCount={articleCommentChildCount || 0}
        showReply={setIsOpenReply}
        isOpenReply={isOpenReply}
        comment={comment}
      />
      {isOpenReply && (
        <ArticleCommentChildrenList
          organizationId={organizationId}
          articleId={article?.articleId}
          commentId={articleCommentId}
          hasChildren={hasReply}
          depth={1}
          childCount={articleCommentChildCount || 0}
        />
      )}
    </Box>
  );
};

export default ArticleCommentListItem;
