import React, { FC, HTMLAttributes } from "react";

import { makeStyles } from "@mui/styles";

import Image from "next/legacy/image";
import Container from "@eGroupAI/material/Container";
import Typography from "@eGroupAI/material/Typography";
import Grid from "@eGroupAI/material/Grid";
import aboutUs from "./about-bg.png";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "6rem 3rem 6rem 3rem",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  title: {
    marginBottom: "3rem",
  },
  item: {
    transition: "all 0.3s",
    textAlign: "center",
    borderRadius: 20,
    padding: "1rem",
    borderStyle: "solid",
    borderWidth: "4px",
    borderColor: "transparent",
    cursor: "pointer",

    "&:hover": {
      borderColor: theme.palette.common.white,
    },
  },
  image: {
    marginBottom: "1.5rem",
  },
}));

export type Item = {
  id: string;
  primary?: string;
  src?: string;
};

interface FeatureSectionProps extends HTMLAttributes<HTMLDivElement> {
  primary?: string;
  items?: Item[];
}

const FeatureSection: FC<FeatureSectionProps> = function (props) {
  const classes = useStyles();

  const { primary, items, ...other } = props;

  return (
    <div
      className={classes.root}
      style={{ backgroundImage: `url('${aboutUs.src}')` }}
      {...other}
    >
      <Typography
        color="white"
        component="h1"
        variant="h3"
        align="center"
        fontWeight={600}
        className={classes.title}
      >
        {primary}
      </Typography>
      <Container>
        <Grid container spacing={2}>
          {items?.map((item) => (
            <Grid item xs={12} md={4} key={item.id}>
              <div className={classes.item}>
                <div className={classes.image}>
                  {item.src && (
                    <Image
                      src={item.src}
                      width={137}
                      height={137}
                      unoptimized
                    />
                  )}
                </div>
                <Typography variant="h4" fontWeight={600} color="white">
                  {item.primary}
                </Typography>
              </div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
};

export default FeatureSection;
