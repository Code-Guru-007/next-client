import React, { FC } from "react";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import Image from "next/legacy/image";
import Box, { BoxProps } from "@eGroupAI/material/Box";
import Typography from "@eGroupAI/material/Typography";
import MultilineArea from "@eGroupAI/material/MultilineArea";
import Divider from "@eGroupAI/material/Divider";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#F6F6F6",
    borderRadius: "0 20px 20px 20px",
    padding: "33px",
    [theme.breakpoints.down("md")]: {
      padding: "20px",
    },
    [theme.breakpoints.down("md")]: {
      padding: "10px",
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    marginRight: "1.5rem",
    width: "4rem",
    height: "4rem",
    [theme.breakpoints.down("md")]: {
      marginRight: "1rem",
    },
    [theme.breakpoints.down("sm")]: {
      marginRight: "0.5rem",
      width: "3rem",
      height: "3rem",
    },
  },
}));

export interface MessageProps extends BoxProps {
  primary?: string;
  content?: string;
  date?: string;
  src?: string;
}

const Message: FC<MessageProps> = function (props) {
  const classes = useStyles();
  const { className, primary, content, date, src, ...other } = props;
  return (
    <Box className={clsx(className, classes.root)} {...other}>
      <div className={classes.header}>
        {src && (
          <div className={classes.avatar}>
            <Image src={src} width="64" height="64" />
          </div>
        )}
        <Typography variant="h4">{primary}</Typography>
        <Box flexGrow={1} />
        <Typography variant="body1">{date}</Typography>
      </div>
      <Divider sx={{ my: 2 }} />
      <MultilineArea variant="h5" text={content} />
    </Box>
  );
};

export default Message;
