import React, { FC, useState, useEffect } from "react";

import useOrgArticleComments from "utils/useOrgArticleComments";

import Box from "@mui/material/Box";
// types

//
import ArticleCommentItem from "./ArticleCommentItem";

// ----------------------------------------------------------------------

export interface ArticleCommentsChildrenProps {
  organizationId: string;
  articleId: string;
  commentId: string;
  hasChildren: boolean;
  depth: number;
  childCount: number;
}

const ArticleCommentChildrenList: FC<ArticleCommentsChildrenProps> = function (
  props
) {
  const {
    organizationId,
    articleId,
    commentId,
    hasChildren,
    depth,
    childCount,
  } = props;

  const [isOpenReply, setIsOpenReply] = useState<boolean>(false);

  const { data: childrenComments, mutate } = useOrgArticleComments(
    {
      organizationId,
      articleId,
    },
    {
      articleCommentParentId: commentId,
    }
  );

  useEffect(() => {
    mutate();
  }, [childCount, mutate]);

  return (
    <>
      {childrenComments?.source.map((comment) => {
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
              hasReply={hasChildren}
              depth={depth}
              organizationId={organizationId}
              articleId={article?.articleId}
              commentId={articleCommentId}
              commentsMutate={mutate}
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
                depth={depth + 1}
                childCount={articleCommentChildCount || 0}
              />
            )}
          </Box>
        );
      })}
    </>
  );
};

export default ArticleCommentChildrenList;
