import React, { FC, HTMLAttributes } from "react";
import { makeStyles } from "@mui/styles";
import Image from "next/legacy/image";
import Grid from "@eGroupAI/material/Grid";
import Container from "@eGroupAI/material/Container";
import Typography from "@eGroupAI/material/Typography";

const useStyles = makeStyles(() => ({
  root: {
    padding: "3rem 3rem 6rem 3rem",
  },
  title: {
    marginBottom: "3rem",
  },
}));

export type Item = {
  id: string;
  primary?: string;
  src?: string;
};

interface LogoSectionProps extends HTMLAttributes<HTMLDivElement> {
  primary?: string;
  items?: Item[];
}

const LogoSection: FC<LogoSectionProps> = function (props) {
  const classes = useStyles();

  const { primary, items, ...other } = props;

  return (
    <div className={classes.root} {...other}>
      <Typography
        component="h1"
        variant="h3"
        align="center"
        fontWeight={600}
        className={classes.title}
      >
        {primary}
      </Typography>
      <Container>
        <Grid container spacing={8}>
          {items?.map((item) => (
            <Grid item xs={6} md={3} lg={2} key={item.id}>
              {item.src && (
                <Image
                  src={`${item.src}`}
                  width={300}
                  height={300}
                  layout="responsive"
                  objectFit="cover"
                  unoptimized
                />
              )}
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
};

export default LogoSection;
