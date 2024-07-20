import React, { FC } from "react";

import clsx from "clsx";
import { makeStyles } from "@mui/styles";

import NextLink from "next/link";
import Link from "@eGroupAI/material/Link";
import Box from "@eGroupAI/material/Box";
import Typography from "@eGroupAI/material/Typography";
import Avatar from "components/Avatar";
import MemberList from "components/MemberList";
import { OrganizationMember } from "@eGroupAI/typings/apis";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: ({ index }: EventContentProps) => {
      if ((index as number) % 2 === 0) return "0 20px 20px 20px";
      return "20px 0 20px 20px";
    },
    padding: "16px 25px 24px",
    [theme.breakpoints.down("sm")]: {
      padding: "6px 9px 8px",
    },
  },
  successEvent: {
    backgroundColor: theme.palette.primary.lighter,
  },
  warningEvent: {
    backgroundColor: theme.palette.warning.lighter,
  },
  errorEvent: {
    backgroundColor: theme.palette.error.lighter,
  },
  greyEvent: {
    backgroundColor: theme.palette.action.disabledBackground,
  },
  eventStatus: {
    marginBottom: "0.8rem",
  },
  successStatus: {
    color: theme.palette.primary.dark,
  },
  warningStatus: {
    color: theme.palette.warning.dark,
  },
  errorStatus: {
    color: theme.palette.error.dark,
  },
  greyStatus: {
    color: theme.palette.text.primary,
  },
  eventTitle: {
    marginBottom: "1.5rem",
  },
  members: {
    display: "flex",
    gap: 8,
  },
}));

export interface EventContentProps {
  href: string;
  title: string;
  status: "success" | "warning" | "error" | "grey";
  orgMembers?: OrganizationMember[];
  address?: string;
  index?: number;
}

const EventContent: FC<EventContentProps> = function (props) {
  const classes = useStyles(props);
  const { href, title, orgMembers, status, address, index } = props;
  const isOdd = (index as number) % 2 === 0;

  const wordLibrary = useSelector(getWordLibrary);

  const StatusTextMap = {
    success: wordLibrary?.["in progress"] ?? "進行中",
    warning: wordLibrary?.expired ?? "已過期",
    error: wordLibrary?.abnormal ?? "異常",
    grey: wordLibrary?.closed ?? "已關閉",
  };

  return (
    <NextLink prefetch href={href} passHref legacyBehavior>
      <Link underline="none" color="inherit" target="_blank">
        <div
          className={clsx(classes.root, {
            [classes.successEvent]: status === "success",
            [classes.warningEvent]: status === "warning",
            [classes.errorEvent]: status === "error",
            [classes.greyEvent]: status === "grey",
          })}
        >
          <Typography
            variant="body1"
            className={clsx(classes.eventStatus, {
              [classes.successStatus]: status === "success",
              [classes.warningStatus]: status === "warning",
              [classes.errorStatus]: status === "error",
              [classes.greyStatus]: status === "grey",
            })}
          >
            {StatusTextMap[status]}
          </Typography>
          <Typography variant="body1" className={classes.eventTitle}>
            {title}
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexDirection={isOdd ? undefined : "row-reverse"}
          >
            {address ? (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  window.open(
                    `https://google.com/maps/search/${address}`,
                    "_blank"
                  );
                }}
                onKeyPress={(e) => {
                  e.preventDefault();
                  window.open(
                    `https://google.com/maps/search/${address}`,
                    "_blank"
                  );
                }}
                role="button"
                tabIndex={-1}
              >
                <Avatar src="/events/map.png" />
              </div>
            ) : (
              <div />
            )}
            <MemberList orgMembers={orgMembers} max={3} color="white" />
          </Box>
        </div>
      </Link>
    </NextLink>
  );
};

export default EventContent;
