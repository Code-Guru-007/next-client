import React, { FC, useState, useEffect, useCallback } from "react";

import { makeStyles } from "@mui/styles";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import Divider from "@eGroupAI/material/Divider";
import Typography from "@eGroupAI/material/Typography";
import Box from "@eGroupAI/material/Box";
import Button from "@eGroupAI/material/Button";

import ButtonNestedTextArea from "components/ButtonNestedTextArea";
import { OrganizationArticleComment } from "interfaces/entities";
import useOrgArticleComments from "utils/useOrgArticleComments";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";

import ArticleCommentHeader from "./ArticleCommentHeader";
import ArticleCommentActions from "./ArticleCommentActions";

const useStyles = makeStyles(() => ({
  commentContainer: {
    width: "100%",
    cursor: "pointer",
  },
  commentContent: {
    margin: "8px 0px",
  },
  readMoreButton: {
    paddingLeft: "0px",
  },
  grandCommentsDivider: {
    borderWidth: "2px",
    marginRight: "20px",
  },
  grandCommentContainerWrapper: {
    marginBottom: "30px",
    width: "100%",
    display: "flex",
  },
  grandCommentContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  commentDivider: {
    marginTop: "10px",
  },
}));

export interface ArticleCommentProps {
  comment: OrganizationArticleComment;
  organizationId?: string;
  commentDepth?: number;
  parentMutate?: () => void;
  writable?: boolean;
  deletable?: boolean;
}

const ArticleComment: FC<ArticleCommentProps> = (props) => {
  const {
    comment,
    organizationId,
    commentDepth = 0,
    parentMutate,
    writable = false,
    deletable = false,
  } = props;
  const classes = useStyles();
  const [updatedComment, setUpdatedComment] = useState<string>(
    comment.articleCommentContent || ""
  );
  const [showGrandComments, setShowGrandComments] = useState<boolean>(false);
  const [showCreateGrandCommentForm, setShowCreateGrandCommentForm] =
    useState<boolean>(false);
  const [showReadMore, setShowReadMore] = useState<boolean>(false);
  const [commentEditMode, setCommentEditMode] = useState<boolean>(false);
  const [grandComment, setGrandComment] = useState<string>("");

  const { data: grandComments, mutate: mutateSelf } = useOrgArticleComments(
    {
      organizationId,
      articleId: comment.article.articleId,
    },
    {
      articleCommentParentId: comment.articleCommentId,
    }
  );

  useEffect(() => {
    if ((comment?.articleCommentChildCount as number) === 0) {
      setShowGrandComments(false);
    }
  }, [comment]);

  const mutate = () => {
    if (parentMutate) {
      parentMutate();
    }
    mutateSelf();
  };

  const { excute: deleteArticleComment } = useAxiosApiWrapper(
    apis.org.deleteOrgArticleComment,
    "Delete"
  );

  const { excute: updateArticleComment, isLoading: isUpdatingComment } =
    useAxiosApiWrapper(apis.org.updateOrgArticleComment, "Update");

  const { excute: createGrandComment, isLoading: isCreatingGrandComment } =
    useAxiosApiWrapper(apis.org.createOrgArticleCommentChild, "Create");

  const { excute: toggleArticleCommentLike } = useAxiosApiWrapper(
    apis.org.toggleOrgArticleCommentLike,
    "Create"
  );

  const handleToggleShowGrandComments = () => {
    if (
      comment.articleCommentChildCount &&
      comment.articleCommentChildCount > 0
    )
      setShowGrandComments(!showGrandComments);
  };

  const handleShowCreateGrandCommentForm = () => {
    setShowCreateGrandCommentForm(true);
  };

  const handleHideCreateGrandCommentForm = () => {
    setShowCreateGrandCommentForm(false);
  };

  const handleShowReadMore = () => {
    setShowReadMore(true);
  };

  const handleCommentEditMode = () => {
    setCommentEditMode(true);
  };

  const handleCommentEditModeDisable = () => {
    setCommentEditMode(false);
  };

  const handleInputChangeComment = (e) => {
    setUpdatedComment(e.target.value);
  };

  const handleInputChangeGrandComment = (e) => {
    setGrandComment(e.target.value);
  };

  const handleCreateGrandComment = async () => {
    if (organizationId && comment) {
      try {
        await createGrandComment({
          organizationId,
          articleId: comment.article.articleId,
          articleCommentContent: grandComment,
          articleCommentParentId: comment.articleCommentId,
        });
        mutate();
        setShowCreateGrandCommentForm(false);
        setGrandComment("");
      } catch (error) {
        apis.tools.createLog({
          function: "DatePicker: handleCreateGrandComment",
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

  const handleToggleArticleCommentLike = async () => {
    if (organizationId && comment) {
      try {
        await toggleArticleCommentLike({
          organizationId,
          articleId: comment.article.articleId,
          articleCommentId: comment.articleCommentId,
        });
        mutate();
      } catch (error) {
        apis.tools.createLog({
          function: "DatePicker: handleToggleArticleCommentLike",
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

  const handleDeleteArticleComment = async () => {
    if (organizationId && comment) {
      try {
        await deleteArticleComment({
          organizationId,
          articleId: comment.article.articleId,
          articleCommentId: comment.articleCommentId,
        });
        mutate();
      } catch (error) {
        apis.tools.createLog({
          function: "DatePicker: handleDeleteArticleComment",
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

  const handleUpdateArticleComment = async () => {
    if (organizationId && comment) {
      try {
        await updateArticleComment({
          organizationId,
          articleId: comment.article.articleId,
          articleCommentId: comment.articleCommentId,
          articleCommentContent: updatedComment,
        });
        handleCommentEditModeDisable();
        mutate();
      } catch (error) {
        apis.tools.createLog({
          function: "DatePicker: handleUpdateArticleComment",
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

  const handleScrollTo = useCallback((e, targetElId: string) => {
    e.preventDefault();
    const el = document.getElementById(targetElId);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 64;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, []);

  return (
    <>
      {!commentEditMode && (
        <Box
          className={classes.commentContainer}
          onClick={(e) => {
            handleScrollTo(e, comment?.articleCommentId);
          }}
        >
          <ArticleCommentHeader
            writable={writable}
            deletable={deletable}
            comment={comment}
            handleCommentEditMode={handleCommentEditMode}
            handleDeleteArticleComment={handleDeleteArticleComment}
          />
          <Typography className={classes.commentContent}>
            {!showReadMore &&
              comment.articleCommentContent.length > 350 &&
              `${comment.articleCommentContent.substring(0, 350)}...`}
            {(showReadMore || comment.articleCommentContent.length < 350) &&
              comment.articleCommentContent}
          </Typography>
          {!showReadMore && comment.articleCommentContent.length > 350 && (
            <Button
              className={classes.readMoreButton}
              color="primary"
              disableRipple
              onClick={handleShowReadMore}
            >
              讀取更多
            </Button>
          )}
          <ArticleCommentActions
            writable={writable}
            deletable={deletable}
            comment={comment}
            commentDepth={commentDepth}
            showGrandComments={showGrandComments}
            handleToggleArticleCommentLike={handleToggleArticleCommentLike}
            handleToggleShowGrandComments={handleToggleShowGrandComments}
            handleShowCreateGrandCommentForm={handleShowCreateGrandCommentForm}
          />
          {commentDepth < 2 && showCreateGrandCommentForm && (
            <Box display="flex">
              <Divider
                className={classes.grandCommentsDivider}
                orientation="vertical"
                flexItem
              />
              <ButtonNestedTextArea
                onChange={handleInputChangeGrandComment}
                cancelButtonProps={{
                  rounded: true,
                  variant: "contained",
                  sx: {
                    marginRight: "8px",
                  },
                }}
                okayButtonProps={{
                  color: "primary",
                  rounded: true,
                  variant: "contained",
                  loading: isCreatingGrandComment,
                  disabled:
                    !writable || isCreatingGrandComment || grandComment === "",
                }}
                onCancel={handleHideCreateGrandCommentForm}
                onOkay={handleCreateGrandComment}
              />
            </Box>
          )}
          {showGrandComments && (
            <Box className={classes.grandCommentContainerWrapper}>
              <Divider
                className={classes.grandCommentsDivider}
                orientation="vertical"
                flexItem
              />
              <Box className={classes.grandCommentContainer}>
                {grandComments?.source.map((comment) => (
                  <ArticleComment
                    writable={writable}
                    deletable={deletable}
                    comment={comment}
                    key={comment.articleCommentId}
                    organizationId={organizationId}
                    commentDepth={commentDepth + 1}
                    parentMutate={mutate}
                  />
                ))}
              </Box>
            </Box>
          )}
          <Divider className={classes.commentDivider} />
        </Box>
      )}
      {commentEditMode && (
        <Box className={classes.commentContainer} marginTop="40px">
          <ButtonNestedTextArea
            onChange={handleInputChangeComment}
            cancelButtonProps={{
              rounded: true,
              variant: "contained",
              sx: {
                marginRight: "8px",
              },
            }}
            okayButtonProps={{
              color: "primary",
              rounded: true,
              variant: "contained",
              loading: isUpdatingComment,
              disabled: !writable || isUpdatingComment || updatedComment === "",
            }}
            onCancel={handleCommentEditModeDisable}
            onOkay={handleUpdateArticleComment}
            value={updatedComment}
            disabled={!writable}
          />
        </Box>
      )}
    </>
  );
};

export default ArticleComment;
