import React, { FC, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import ReactTimeAgo from "react-timeago";
import zhStrings from "react-timeago/lib/language-strings/zh-TW";
import enStrings from "react-timeago/lib/language-strings/en";
import jaStrings from "react-timeago/lib/language-strings/ja";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import NextLink from "next/link";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import { makeStyles } from "@mui/styles";
import { styled } from "@mui/material/styles";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PushPinIcon from "@mui/icons-material/PushPin";
import PeopleIcon from "@mui/icons-material/People";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import Badge, { BadgeProps } from "@mui/material/Badge";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import Grid from "@eGroupAI/material/Grid";
import Link from "@eGroupAI/material/Link";
import Typography from "@eGroupAI/material/Typography";
import Button from "@eGroupAI/material/Button";
import Tooltip from "@eGroupAI/material/Tooltip";
import { ListItemText, Avatar, ListItemAvatar, Box } from "@eGroupAI/material";
import { MessagesModule, MessageItem } from "@eGroupAI/typings/apis";

import MenuItem from "components/MenuItem";
import Menu from "components/Menu";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import DropdownSettingMenu from "./DropdownSettingMenu";

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  width: "-webkit-fill-available",
  "& .MuiBadge-badge": {
    backgroundColor: theme.palette.primary.main,
    right: 15,
    top: "50%",
  },
}));

const useStyles = makeStyles((theme) => ({
  dropdownMenu: {
    width: 350,
    borderRight: `3px solid ${theme.palette.grey[200]}`,
    padding: "10px 5px",
  },
  gridContainer: {
    marginTop: 5,
    paddingLeft: 10,
  },
  notificationTitle: {
    fontSize: 15,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    float: "right",
    "&:hover": {
      backgroundColor: theme.palette.grey[800],
    },
  },
  moreHorizIcon: {
    color: theme.palette.grey[300],
    cursor: "pointer",
  },
  notificationActiveButton: {
    padding: "3px !important",
    color: `${theme.palette.grey[300]} !important`,
    backgroundColor: `${theme.palette.grey[300]} !important`,
  },
  notificationButton: {
    padding: "3px !important",
    color: `${theme.palette.grey[300]} !important`,
    backgroundColor: `${theme.palette.common.white} !important`,
  },
  newText: {
    fontSize: 15,
  },
  moreText: {
    fontSize: 15,
    color: theme.palette.primary.main,
    cursor: "pointer",
  },
  listLink: {
    width: "-webkit-fill-available",
  },
  listItem: {
    minHeight: 80,
    display: "flex",
    justifyContent: "space-between",
    padding: "3px 0 3px 10px",
  },
  avatarWrapper: {
    display: "flex",
    position: "relative",
  },
  itemContent: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  iconAvatar: {
    width: 40,
    height: 40,
    color: theme.palette.primary.light,
    fontSize: 15,
    fontWeight: "bold",
    background: theme.palette.grey[600],
  },
  avatarIcon: {
    width: 25,
    height: 25,
    background: theme.palette.primary.light,
    borderRadius: 50,
    position: "absolute",
    bottom: -8,
    right: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    "& svg": {
      color: theme.palette.common.white,
      width: "100%",
      fontSize: 15,
    },
  },
  messageInfoTitileText: {
    margin: "5px auto",
    display: "-webkit-box",
    overflow: "hidden",
    fontSize: 14,
    maxWidth: 230,
    maxHeight: "4em",
    wordBreak: "break-all",
    lineHeight: "1.2em",
    whiteSpace: "normal",
    textOverflow: "ellipsis",
    "-webkit-box-orient": "vertical",
    "-webkit-line-clamp": 3,
  },
  messageTimeText: {
    fontSize: 11,
    color: `${theme.palette.primary.main} !important`,
  },
  noResultContainer: {
    width: "-webkit-fill-available",
    padding: 30,
  },
  noResultText: {
    color: theme.palette.common.black,
  },
}));

const avatarIcon = (type: string) => {
  switch (type) {
    case "EVENT":
      return <EventIcon />;
    case "CRM":
      return <AssignmentIndIcon />;
    case "BULLET":
      return <PushPinIcon />;
    case "MEMBER":
      return <PeopleIcon />;
    default:
      return <QuestionMarkIcon />;
  }
};

const locales = {
  zh: zhStrings,
  en: enStrings,
  ja: jaStrings,
};

export interface DropdownMessageMenuProps {
  allMessagesInfo: MessagesModule | undefined;
  unreadMessagesInfo: MessagesModule | undefined;
  closeDropdown: () => void;
}

const DropdownMessageMenu: FC<DropdownMessageMenuProps> = function ({
  allMessagesInfo,
  unreadMessagesInfo,
  closeDropdown,
}) {
  const wordLibrary = useSelector(getWordLibrary);
  const classes = useStyles();
  const organizationId = useSelector(getSelectedOrgId);
  const [selectedAllMessage, setSelectedAllMessage] = useState(true);
  const { excute: makeOneMessageHaveRead } = useAxiosApiWrapper(
    apis.message.makeOneMessageHaveRead,
    "Update"
  );
  const [anchorEl, setAnchorEl] = useState<HTMLSpanElement | null>(null);
  const handleClose = () => {
    setAnchorEl(null);
  };
  const [messageModules, setMessageModules] = useState(allMessagesInfo?.source);

  const handleClickMessageItem = useCallback(
    async (message: MessageItem) => {
      try {
        await makeOneMessageHaveRead({
          organizationId,
          messageId: message.messageId,
          isRead: 1,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        apis.tools.createLog({
          function: "DatePicker: handleClickMessageItem",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
    },
    [makeOneMessageHaveRead, organizationId]
  );

  const storageKey = "wordLibrary";
  const cachedLibrary = localStorage.getItem(storageKey);
  let locale = "zh";
  if (cachedLibrary) {
    const { language, expiration } = JSON.parse(cachedLibrary);
    if (expiration > Date.now()) {
      locale = language.slice(0, 2);
    }
  }
  const formatter = buildFormatter(locales[locale]);

  return (
    <div className={classes.dropdownMenu}>
      <Grid className={classes.gridContainer} container>
        <Grid item xs={10}>
          <Typography className={classes.notificationTitle} align="left">
            {wordLibrary?.message ?? "訊息"}
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <div className={classes.iconContainer}>
            <Typography
              align="right"
              className={classes.moreHorizIcon}
              onClick={(event) => {
                setAnchorEl(event.currentTarget);
              }}
            >
              <MoreHorizIcon />
            </Typography>
          </div>
        </Grid>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <DropdownSettingMenu closeDropdown={closeDropdown} />
        </Menu>
      </Grid>
      <Grid className={classes.gridContainer} container spacing={1}>
        <Grid item>
          <Button
            className={
              selectedAllMessage
                ? classes.notificationActiveButton
                : classes.notificationButton
            }
            component="div"
            disableRipple
            rounded
            variant="contained"
            size="small"
            onClick={() => {
              setMessageModules(allMessagesInfo?.source);
              setSelectedAllMessage(true);
            }}
          >
            {wordLibrary?.all ?? "全部"}
          </Button>
        </Grid>
        <Grid item>
          <Button
            className={
              selectedAllMessage
                ? classes.notificationButton
                : classes.notificationActiveButton
            }
            sx={{ width: "100px" }}
            component="div"
            disableRipple
            rounded
            variant="contained"
            size="small"
            onClick={() => {
              setMessageModules(unreadMessagesInfo?.source);
              setSelectedAllMessage(false);
            }}
          >
            {wordLibrary?.unread ?? "未讀"}
          </Button>
        </Grid>
      </Grid>
      <Grid
        className={classes.gridContainer}
        container
        sx={{ marginBottom: "5px" }}
      >
        <Grid item xs={10}>
          <Typography className={classes.newText} align="left">
            {wordLibrary?.["New Message"] ?? "新訊息"}
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <NextLink prefetch href="/me/messages" passHref legacyBehavior>
            <Link underline="none" onClick={closeDropdown}>
              <Typography align="right" className={classes.moreText}>
                {wordLibrary?.["View All"] ?? "全覽"}
              </Typography>
            </Link>
          </NextLink>
        </Grid>
      </Grid>
      <Grid container>
        {messageModules?.map((message) =>
          message.isRead === 0 ? (
            <Tooltip
              title={message?.messageInfo.messageInfoTitle}
              key={message.messageId}
            >
              <div className={classes.listLink}>
                <NextLink
                  href={`/me/${message.messageInfo.messageInfoType.toLocaleLowerCase()}s/${
                    message.messageInfo.messageInfoTargetId
                  }`}
                  passHref
                  legacyBehavior
                >
                  <Link underline="none">
                    <MenuItem
                      className={classes.listItem}
                      onClick={() => {
                        handleClickMessageItem(message);
                        closeDropdown();
                      }}
                    >
                      <StyledBadge variant="dot">
                        <Box className={classes.itemContent}>
                          <ListItemAvatar className={classes.avatarWrapper}>
                            <Avatar className={classes.iconAvatar}>
                              {message?.sender.memberName
                                .slice(0, 2)
                                .toUpperCase()}
                            </Avatar>
                            <div className={classes.avatarIcon}>
                              {avatarIcon(message?.messageInfo.messageInfoType)}
                            </div>
                          </ListItemAvatar>
                          <ListItemText>
                            <Typography
                              className={classes.messageInfoTitileText}
                            >
                              {message?.messageInfo.messageInfoTitle}
                            </Typography>
                            <Typography className={classes.messageTimeText}>
                              <ReactTimeAgo
                                date={message?.messageCreateDate}
                                locale={locales[locale]}
                                formatter={formatter}
                                live
                              />
                            </Typography>
                          </ListItemText>
                        </Box>
                      </StyledBadge>
                    </MenuItem>
                  </Link>
                </NextLink>
              </div>
            </Tooltip>
          ) : (
            <Tooltip
              title={message?.messageInfo.messageInfoTitle}
              key={message.messageId}
            >
              <div className={classes.listLink}>
                <NextLink
                  href={`/me/${message.messageInfo.messageInfoType.toLocaleLowerCase()}s/${
                    message.messageInfo.messageInfoTargetId
                  }`}
                  passHref
                  legacyBehavior
                >
                  <Link underline="none">
                    <MenuItem
                      className={classes.listItem}
                      key={message.messageId}
                      onClick={closeDropdown}
                    >
                      <Box className={classes.itemContent}>
                        <ListItemAvatar className={classes.avatarWrapper}>
                          <Avatar className={classes.iconAvatar}>
                            {message?.sender.memberName
                              .slice(0, 2)
                              .toUpperCase()}
                          </Avatar>
                          <div className={classes.avatarIcon}>
                            {avatarIcon(message?.messageInfo.messageInfoType)}
                          </div>
                        </ListItemAvatar>
                        <ListItemText>
                          <Typography className={classes.messageInfoTitileText}>
                            {message?.messageInfo.messageInfoTitle}
                          </Typography>
                          <Typography className={classes.messageTimeText}>
                            <ReactTimeAgo
                              date={message?.messageCreateDate}
                              locale={locales[locale]}
                              formatter={formatter}
                              live
                            />
                          </Typography>
                        </ListItemText>
                      </Box>
                    </MenuItem>
                  </Link>
                </NextLink>
              </div>
            </Tooltip>
          )
        )}
        {messageModules?.length === 0 && (
          <Box className={classes.noResultContainer}>
            <Typography align="center" className={classes.noResultText}>
              {wordLibrary?.["No Message"] ?? "沒有訊息"}
            </Typography>
          </Box>
        )}
      </Grid>
    </div>
  );
};

export default DropdownMessageMenu;
