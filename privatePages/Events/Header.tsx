import React, { FC } from "react";

import { makeStyles } from "@mui/styles";

import Image from "next/legacy/image";
import Box from "@eGroupAI/material/Box";
import Typography from "@eGroupAI/material/Typography";
import Button from "@eGroupAI/material/Button";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  yourEvent: {
    color: "#373737",
  },
  sort: {
    marginBottom: "6px",
    "& > p": {
      fontWeight: "500",
      color: "#CACACA",
      marginBottom: "13.5px",
    },
    "& .MuiButton-root": {
      color: "#373737",
    },
    "& .MuiButton-endIcon": {
      marginLeft: "16px",
    },
    [theme.breakpoints.down("md")]: {
      "& > p": {
        marginBottom: "8px",
      },
      "& .MuiButton-endIcon": {
        marginLeft: "16px",
      },
    },
    [theme.breakpoints.down("sm")]: {
      "& > p": {
        marginBottom: "3px",
      },
      "& .MuiButton-endIcon": {
        width: "6px",
        marginLeft: "3.3px",
      },
    },
  },
}));

const Header: FC = function () {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div>
        <Typography variant="h3" noWrap>
          Event
        </Typography>
        <Typography variant="body1" noWrap className={classes.yourEvent}>
          Your event
        </Typography>
      </div>
      <Box ml="auto" className={classes.sort}>
        <Typography variant="body1" align="right">
          Sort by:
        </Typography>
        <Button
          variant="text"
          endIcon={<Image src="/events/sort.png" width="20" height="20" />}
        >
          Select Date Range
        </Button>
      </Box>
    </div>
  );
};

export default Header;
