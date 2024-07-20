import React, { FC, useState } from "react";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";
import { useSelector } from "react-redux";

import { makeStyles } from "@mui/styles";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

import ListItem from "@eGroupAI/material/ListItem";
import ListItemAvatar from "@eGroupAI/material/ListItemAvatar";
import ListItemText from "@eGroupAI/material/ListItemText";
import Avatar from "@eGroupAI/material/Avatar";
import Box from "@eGroupAI/material/Box";
import IconButton from "@mui/material/IconButton";
import Popover from "@eGroupAI/material/Popover";
import { format } from "@eGroupAI/utils/dateUtils";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { OrganizationArticleComment } from "interfaces/entities";
import { ListItemButton } from "@mui/material";

export interface ArticleCommentHeaderProps {
  comment: OrganizationArticleComment;
  handleCommentEditMode?: () => void;
  handleDeleteArticleComment?: () => void;
  writable?: boolean;
  deletable?: boolean;
}

const useStyles = makeStyles((theme) => ({
  user: {
    padding: "40px 0px 8px 0px",
    display: "flex",
    alignItems: "center",
  },
  userInfo: {
    "& .MuiListItemText-primary": {
      color: theme.palette.grey[500],
    },
  },
  commentMoreAction: {
    cursor: "pointer",
    color: theme.palette.grey[500],
    padding: 8,
    borderRadius: 8,
    "&:hover": {
      backgroundColor: theme.palette.primary.lighter,
    },
  },
}));

const ArticleCommentHeader: FC<ArticleCommentHeaderProps> = (props) => {
  const {
    comment,
    handleCommentEditMode,
    handleDeleteArticleComment,
    writable = false,
    deletable = false,
  } = props;
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const wordLibrary = useSelector(getWordLibrary);

  const handleShowCommentMoreActions = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleHideCommentMoreActions = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "comment-actions-popover" : undefined;
  return (
    <ListItem
      className={classes.user}
      secondaryAction={
        <Box>
          <IconButton
            edge="end"
            aria-label="more action"
            onClick={handleShowCommentMoreActions}
          >
            <MoreHorizRoundedIcon />
          </IconButton>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleHideCommentMoreActions}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <Box>
              <ListItemButton
                component="nav"
                className={classes.commentMoreAction}
                onClick={() => {
                  if (handleCommentEditMode) handleCommentEditMode();
                  handleHideCommentMoreActions();
                }}
                disabled={!writable}
              >
                <EditRoundedIcon />
                {wordLibrary?.update ?? "更新"}
              </ListItemButton>
              <ListItemButton
                component="nav"
                className={classes.commentMoreAction}
                onClick={handleDeleteArticleComment}
                disabled={!deletable}
              >
                <DeleteRoundedIcon />
                {wordLibrary?.delete ?? "刪除"}
              </ListItemButton>
            </Box>
          </Popover>
        </Box>
      }
    >
      <ListItemAvatar>
        <Avatar>
          <PersonRoundedIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        className={classes.userInfo}
        primary={comment.creator.memberName}
        secondary={format(
          zonedTimeToUtc(
            new Date(comment.articleCommentCreateDate),
            "Asia/Taipei"
          ),
          "PP pp",
          { locale: zhCN }
        )}
      />
    </ListItem>
  );
};

export default ArticleCommentHeader;
