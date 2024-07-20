import React, { FC } from "react";

import { makeStyles } from "@mui/styles";
import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";

import Typography from "@eGroupAI/material/Typography";
import Box from "@eGroupAI/material/Box";
import Button from "@eGroupAI/material/Button";

import { OrganizationArticleComment } from "interfaces/entities";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export interface ArticleCommentActionsProps {
  comment: OrganizationArticleComment;
  commentDepth: number;
  showGrandComments?: boolean;
  handleToggleArticleCommentLike?: () => void;
  handleToggleShowGrandComments?: () => void;
  handleShowCreateGrandCommentForm?: () => void;
  writable?: boolean;
  deletable?: boolean;
}

const useStyles = makeStyles(() => ({
  commentAction: {
    margin: "24px 0px",
    display: "flex",
  },
  commentActionThumbUp: {
    display: "flex",
    marginRight: "20px",
    "& *": {
      margin: "auto 5px auto 0px",
      cursor: "pointer",
    },
  },
  commentActionShowComment: {
    display: "flex",
    marginRight: "20px",
    "& *": {
      margin: "auto 5px auto 0px",
      cursor: "pointer",
    },
  },
  commentActionCreateGrandComment: {
    marginLeft: "auto",
  },
}));

const ArticleCommentActions: FC<ArticleCommentActionsProps> = (props) => {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    comment,
    commentDepth,
    showGrandComments = false,
    handleToggleArticleCommentLike,
    handleToggleShowGrandComments,
    handleShowCreateGrandCommentForm,
    // writable = false,
    // deletable = false,
  } = props;
  const classes = useStyles();

  return (
    <Box className={classes.commentAction}>
      <Box
        className={classes.commentActionThumbUp}
        onClick={handleToggleArticleCommentLike}
      >
        <ThumbUpRoundedIcon
          color={
            comment.hasLikeByCurrentLoginAccount === 1 ? "primary" : "disabled"
          }
        />
        <Typography
          variant="body1"
          color={
            comment.hasLikeByCurrentLoginAccount === 1
              ? "primary"
              : "textSecondary"
          }
        >
          {comment.articleCommentLikeCount}
        </Typography>
      </Box>
      {commentDepth < 2 && (
        <Box
          className={classes.commentActionShowComment}
          onClick={handleToggleShowGrandComments}
        >
          <SmsRoundedIcon color="disabled" />
          {showGrandComments && (
            <Typography variant="body1" color="textSecondary">
              隱藏回覆
            </Typography>
          )}
          {!showGrandComments && (
            <Typography variant="body1" color="textSecondary">
              {comment.articleCommentChildCount}
            </Typography>
          )}
        </Box>
      )}
      {commentDepth < 2 && (
        <Box
          className={classes.commentActionCreateGrandComment}
          onClick={handleShowCreateGrandCommentForm}
        >
          <Button color="grey" disableRipple>
            {wordLibrary?.reply ?? "回覆"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ArticleCommentActions;
