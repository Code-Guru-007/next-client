import React, { FC } from "react";

import { makeStyles } from "@mui/styles";
import YoutubePlayer from "@eGroupAI/material-module/YoutubePlayer";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiEgYoutubePlayButton-root": {
      background: "#E20C0C",
    },
    "& .MuiSvgIcon-root": {
      color: theme.palette.common.white,
    },
  },
}));

export interface SlideProps {
  placeholder?: string;
  iframeSrc: string;
  iframeTitle?: string;
}

const Slide: FC<SlideProps> = function (props) {
  const classes = useStyles();
  const { placeholder, iframeSrc, iframeTitle } = props;
  return (
    <YoutubePlayer
      variant="lightbox"
      className={classes.root}
      iframeSrc={iframeSrc}
      iframeTitle={iframeTitle}
      placeholder={placeholder}
    />
  );
};

export default Slide;
