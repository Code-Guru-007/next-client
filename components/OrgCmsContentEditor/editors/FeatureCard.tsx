import React, { FC } from "react";

import { makeStyles } from "@mui/styles";

import Image from "next/legacy/image";
import Typography from "@eGroupAI/material/Typography";

const useStyles = makeStyles((theme) => ({
  root: {
    transition: "all 0.4s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2rem 0.5rem",
    boxShadow: "0px 0px 30px 1px #0000001f",
    borderRadius: 15,
    border: "1px solid #bfbfbf",
    cursor: "pointer",

    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
    },
  },
  img: {
    width: "5.5rem",
  },
  title: {
    marginTop: "3rem",
  },
}));

export interface FeatureCardProps {
  src?: string;
  title?: string;
}

const FeatureCard: FC<FeatureCardProps> = function (props) {
  const { src, title } = props;
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.img}>
        {src && (
          <Image
            src={src}
            width={1}
            height={1}
            layout="responsive"
            unoptimized
          />
        )}
      </div>
      <Typography
        className={classes.title}
        align="center"
        variant="h5"
        fontWeight={600}
      >
        {title}
      </Typography>
    </div>
  );
};

export default FeatureCard;
