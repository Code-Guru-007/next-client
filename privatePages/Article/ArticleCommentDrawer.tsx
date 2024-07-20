import React, { FC, useState } from "react";
import { useSelector } from "react-redux";

import { makeStyles } from "@mui/styles";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Grid from "@eGroupAI/material/Grid";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useOrgArticleComments from "utils/useOrgArticleComments";
import EditSectionHeader from "components/EditSectionHeader";
import ButtonNestedTextArea from "components/ButtonNestedTextArea";
import Iconify from "minimal/components/iconify/iconify";

import ArticleComment from "./ArticleComment";

const useStyles = makeStyles((theme) => ({
  drawer: {
    "& .MuiDrawer-paper": {
      [theme.breakpoints.down("md")]: {
        width: "80vw",
      },
      padding: "20px",
      width: "420px",
    },
  },
  searchTextField: {
    margin: "54px 0px",
  },
}));

export interface ArticleCommentDrawerProps {
  isOpen?: boolean;
  organizationId: string;
  articleId?: string;
  onClickAway?: () => void;
  writable?: boolean;
  deletable?: boolean;
}

const ArticleCommentDrawer: FC<ArticleCommentDrawerProps> = (props) => {
  const {
    organizationId,
    articleId,
    isOpen = false,
    onClickAway,
    writable = false,
    deletable = false,
  } = props;
  const classes = useStyles();
  const [newComment, setNewComment] = useState<string>("");

  const wordLibrary = useSelector(getWordLibrary);

  const { data: comments, mutate } = useOrgArticleComments({
    organizationId,
    articleId,
  });

  const { excute: createOrgArticleCommentParent, isLoading } =
    useAxiosApiWrapper(apis.org.createOrgArticleCommentParent, "Create");

  const handleClose = () => {
    if (onClickAway) onClickAway();
  };

  const handleChangeNewComment = (e) => {
    setNewComment(e.target.value);
  };

  const handleSubmitNewComment = async () => {
    if (articleId) {
      try {
        await createOrgArticleCommentParent({
          organizationId,
          articleId,
          articleCommentContent: newComment,
        });
        setNewComment("");
        mutate();
      } catch (error) {
        apis.tools.createLog({
          function: "DatePicker: handleSubmitNewComment",
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

  return (
    <Drawer
      className={classes.drawer}
      open={isOpen}
      onClose={handleClose}
      anchor="right"
      BackdropProps={{
        sx: {
          backgroundColor: "transparent",
        },
      }}
    >
      <EditSectionHeader
        primary={`${wordLibrary?.reply ?? "回覆"} (${comments?.source.length})`}
      >
        <IconButton onClick={handleClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </EditSectionHeader>
      <ButtonNestedTextArea
        collapsable
        onOkay={handleSubmitNewComment}
        fullWidth
        placeholder={wordLibrary?.add ?? "新增"}
        onChange={handleChangeNewComment}
        value={newComment}
        cancelButtonProps={{
          rounded: true,
          variant: "contained",
        }}
        okayButtonProps={{
          rounded: true,
          variant: "contained",
          color: "primary",
          loading: isLoading,
          disabled: !writable || isLoading || newComment === "",
          sx: {
            marginLeft: "10px",
          },
        }}
        disabled={!writable}
      />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {comments?.source.map((comment) => (
            <ArticleComment
              writable={writable}
              deletable={deletable}
              comment={comment}
              organizationId={organizationId}
              key={comment.articleCommentId}
              parentMutate={mutate}
            />
          ))}
        </Grid>
      </Grid>
    </Drawer>
  );
};

export default ArticleCommentDrawer;
