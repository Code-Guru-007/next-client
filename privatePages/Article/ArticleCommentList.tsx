import React, { FC } from "react";
// @mui
// import Pagination from "@mui/material/Pagination";
// types
import { OrganizationArticleComment } from "interfaces/entities";
//
import ArticleCommentListItem from "./ArticleCommentListItem";

// ----------------------------------------------------------------------

export interface ArticleCommentsProps {
  organizationId: string;
  comments: OrganizationArticleComment[];
  commentsMutate: any;
}

const ArticleCommentList: FC<ArticleCommentsProps> = function (props) {
  const { organizationId, comments, commentsMutate } = props;

  return (
    <>
      <>
        {comments.map((comment) => (
          <ArticleCommentListItem
            key={comment.articleCommentId}
            comment={comment}
            organizationId={organizationId}
            commentsMutate={commentsMutate}
          />
        ))}
      </>
      {/* <Pagination count={8} sx={{ my: 5, mx: "auto" }} /> */}
    </>
  );
};

export default ArticleCommentList;
