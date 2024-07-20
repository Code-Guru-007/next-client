import React, { FC } from "react";

import formatBytes from "@eGroupAI/utils/formatBytes";
import { format } from "@eGroupAI/utils/dateUtils";
import { useSelector } from "react-redux";
import { makeStyles } from "@mui/styles";

import Typography from "@eGroupAI/material/Typography";
import Button, { ButtonProps } from "@eGroupAI/material/Button";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import Avatar from "components/Avatar";

const IconMap = {
  excel: "excel",
  pdf: "pdf",
  word: "word",
  zip: "zip",
};

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    alignItems: "flex-start",
  },
  avatar: {
    marginRight: "1rem",
  },
  header: {
    display: "flex",
    flexDirection: "column",
  },
  action: {
    display: "flex",
    gap: 8,
    marginTop: 3,
  },
}));

export interface FileCardProps {
  iconName: string;
  fileName: string;
  fileSize: number;
  fileCreateDate: string;
  onDownload?: ButtonProps["onClick"];
  onPreview?: ButtonProps["onClick"];
  onDelete?: ButtonProps["onClick"];
}

const FileCard: FC<FileCardProps> = function (props) {
  const {
    iconName,
    fileName,
    fileSize,
    fileCreateDate,
    onDownload,
    onPreview,
    onDelete,
  } = props;
  const classes = useStyles();
  const wordLibrary = useSelector(getWordLibrary);
  const icon = IconMap[iconName] || "unknown";
  return (
    <div className={classes.root}>
      <Avatar
        className={classes.avatar}
        src={`/events/filestype/${icon}.png`}
      />
      <div>
        <div className={classes.header}>
          <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
            {fileName}
          </Typography>
          <Typography variant="body1">{formatBytes(fileSize)}</Typography>
        </div>
        <Typography variant="body2">
          {format(fileCreateDate, "PP pp")}
        </Typography>
        <div className={classes.action}>
          {onDownload && (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={onDownload}
            >
              {wordLibrary?.download ?? "下載"}
            </Button>
          )}
          {onPreview && (
            <Button variant="outlined" size="small" onClick={onPreview}>
              {wordLibrary?.preview ?? "預覽"}
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={onDelete}
            >
              {wordLibrary?.delete ?? "刪除"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileCard;
