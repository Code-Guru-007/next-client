import React, { FC } from "react";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import NextLink from "next/link";
import Box, { BoxProps } from "@eGroupAI/material/Box";
import Typography from "@eGroupAI/material/Typography";
import IconButton from "components/IconButton/StyledIconButton";
import Link from "@eGroupAI/material/Link";
import Avatar from "components/Avatar";
import ApartmentIcon from "@mui/icons-material/Apartment";
import DeleteIcon from "@mui/icons-material/Close";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: "0 20px 20px 20px",
    backgroundColor: (props: InfoCardProps) =>
      props.color === "green" ? "#F3FAFA" : "#F2FCFF",
  },
  content: {
    padding: "24px",
    "& > div:last-child": {
      marginBottom: "0",
    },
    [theme.breakpoints.down("sm")]: {
      padding: "20px",
    },
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "1rem",
  },
  dataRow: {
    display: "flex",
    marginBottom: "0.5rem",
  },
  avatar: {
    background: theme.palette.info.main,
    color: theme.palette.common.white,
  },
}));

export type Item = {
  title?: string;
  content?: string;
};

export interface InfoCardProps extends BoxProps {
  href?: string;
  src?: string;
  primary?: string;
  items?: Item[];
  onDelete?: () => void;
  type?: string;
  testId?: string;
}

const InfoCard: FC<InfoCardProps> = function (props) {
  const { className, href, src, primary, items, onDelete, ...other } = props;
  const classes = useStyles(props);

  const renderLink = () => (
    <Link color="inherit" underline="none" target="_blank">
      <Avatar src={src} className={classes.avatar}>
        {!src && <ApartmentIcon />}
      </Avatar>
    </Link>
  );

  return (
    <Box className={clsx(className, classes.root)} {...other}>
      <div className={classes.content}>
        <div className={classes.titleRow}>
          {href ? (
            <NextLink prefetch href={href} passHref legacyBehavior>
              {renderLink()}
            </NextLink>
          ) : (
            renderLink()
          )}
          <Typography
            variant="body2"
            sx={{ ml: "10px" }}
            style={{ color: "black" }}
          >
            {primary}
          </Typography>
          <Box flexGrow={1} />
          {onDelete && (
            <IconButton
              onClick={onDelete}
              id={`delete-${other.type}-btn-${other.testId}`}
              data-tid={`delete-${other.type}-btn-${other.testId}`}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </div>
        {items?.map((el) => (
          <div key={el.title} className={classes.dataRow}>
            <Box width="40%" maxWidth={208}>
              <Typography variant="body2" style={{ color: "black" }}>
                {el.title}
              </Typography>
            </Box>
            <Box width="60%" pl={1}>
              <Typography
                variant="body2"
                sx={{ wordBreak: "break-all" }}
                style={{ color: "black" }}
              >
                {el.content}
              </Typography>
            </Box>
          </div>
        ))}
      </div>
    </Box>
  );
};

export default InfoCard;
