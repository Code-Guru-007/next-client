import React, { FC, HTMLAttributes } from "react";

import { makeStyles } from "@mui/styles";
import { ImgSrc } from "interfaces/components";
import Image from "next/legacy/image";
import Typography from "@eGroupAI/material/Typography";
import Grid from "@eGroupAI/material/Grid";
import Container from "@eGroupAI/material/Container";

const useStyles = makeStyles(() => ({
  root: {
    padding: "3rem",
  },
  img: {
    maxWidth: 400,
    margin: "auto",
  },
}));

interface ImageTextSectionProps extends HTMLAttributes<HTMLDivElement> {
  primary?: string;
  description?: string;
  imgSrc?: ImgSrc;
}

const ImageTextSection: FC<ImageTextSectionProps> = function (props) {
  const classes = useStyles();

  const { primary, description, imgSrc, ...other } = props;

  return (
    <div className={classes.root} {...other}>
      <Container>
        <Grid container alignItems="center" spacing={4}>
          <Grid item xs={12} md={6}>
            <div className={classes.img}>
              {imgSrc?.normal && (
                <Image
                  src={imgSrc.normal}
                  width={540}
                  height={540}
                  layout="responsive"
                  objectFit="cover"
                  unoptimized
                />
              )}
            </div>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography
              component="h1"
              variant="h3"
              gutterBottom
              color="primary"
            >
              {primary}
            </Typography>
            <Typography component="span" variant="h6">
              {description}
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default ImageTextSection;
