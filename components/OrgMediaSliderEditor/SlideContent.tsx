import React, { FC } from "react";

import { makeStyles } from "@mui/styles";
import Typography from "@eGroupAI/material/Typography";
import Button, { ButtonProps } from "@eGroupAI/material/Button";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    width: "100%",
    paddingTop: "56.25%",
  },
  textBlock: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: theme.palette.common.white,
    textAlign: "center",
    padding: theme.spacing(0, 2),
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",

    [theme.breakpoints.down("sm")]: {
      maxWidth: 400,
    },

    [theme.breakpoints.down(400)]: {
      maxWidth: 300,
    },
  },
  btn: {
    marginTop: "1rem",
  },
}));

export interface SlideContentProps {
  src: string;
  title?: string;
  subTitle?: string;
  onClick?: ButtonProps["onClick"];
}

const SlideContent: FC<SlideContentProps> = function (props) {
  const classes = useStyles();
  const { src, title, subTitle, onClick } = props;
  return (
    <div
      className={classes.root}
      style={{ backgroundImage: `url('${encodeURI(src || "")}')` }}
    >
      <div className={classes.textBlock}>
        {title && (
          <Typography
            component="h1"
            variant="h1"
            color="white"
            fontWeight={600}
            gutterBottom
          >
            {title}
          </Typography>
        )}
        {subTitle && (
          <Typography component="h2" variant="h4" color="white" gutterBottom>
            {subTitle}
          </Typography>
        )}
        {onClick && (
          <Button
            className={classes.btn}
            variant="contained"
            rounded
            onClick={onClick}
          >
            LEARN MORE
          </Button>
        )}
      </div>
    </div>
  );
};

export default SlideContent;
