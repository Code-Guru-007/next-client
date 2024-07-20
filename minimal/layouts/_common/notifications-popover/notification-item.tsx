import ReactTimeAgo from "react-timeago";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import zhStrings from "react-timeago/lib/language-strings/zh-TW";
import enStrings from "react-timeago/lib/language-strings/en";
import jaStrings from "react-timeago/lib/language-strings/ja";
import { useSelector } from "react-redux";

import NextLink from "next/link";
// @mui
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { MessageItem } from "@eGroupAI/typings/apis";
import Link from "@eGroupAI/material/Link";

import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import moduleRouteMapping from "utils/moduleRouteMapping";
import { getWordLibrary } from "redux/wordLibrary/selectors";

// ----------------------------------------------------------------------

const locales = {
  zh: zhStrings,
  en: enStrings,
  ja: jaStrings,
};

type NotificationItemProps = {
  notification: MessageItem;
  drawerClose: () => void;
  mutateMessages: () => void;
};

export default function NotificationItem({
  notification,
  drawerClose,
  mutateMessages,
}: NotificationItemProps) {
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const { excute: makeOneMessageHaveRead } = useAxiosApiWrapper(
    apis.message.makeOneMessageHaveRead,
    "None"
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

  const renderAvatar = (
    <ListItemAvatar>
      <Avatar>
        {notification?.sender.memberName.slice(0, 2).toUpperCase()}
      </Avatar>
    </ListItemAvatar>
  );

  const renderText = (
    <ListItemText
      disableTypography
      primary={
        <Typography
          variant="subtitle2"
          component="div"
          sx={{
            maxWidth: { sm: "290px", xs: "265px" },
            color: "text.primary",
            marginBottom: 0.5,
          }}
        >
          {notification?.messageInfo.messageInfoTitle}
        </Typography>
      }
      secondary={
        <Stack
          direction="row"
          alignItems="center"
          sx={{ typography: "caption", color: "text.disabled" }}
          divider={
            <Box
              sx={{
                width: 2,
                height: 2,
                bgcolor: "currentColor",
                mx: 0.5,
                borderRadius: "50%",
              }}
            />
          }
        >
          <ReactTimeAgo
            date={notification?.messageCreateDate}
            locale={locales[locale]}
            formatter={formatter}
            live
          />
          {
            wordLibrary?.[
              notification?.messageInfo.messageInfoType?.toLowerCase()
            ]
          }
        </Stack>
      }
    />
  );

  const renderUnReadBadge = !notification.isRead && (
    <Box
      sx={{
        top: 26,
        width: 8,
        height: 8,
        right: 20,
        borderRadius: "50%",
        bgcolor: "info.main",
        position: "absolute",
      }}
    />
  );

  const messageTargetModule = notification.messageInfo.messageInfoType;
  const moduleTargetRouteQuery = `[${messageTargetModule.toLocaleLowerCase()}Id]`;
  const availableRoutes = moduleRouteMapping[messageTargetModule];
  const availableTargetRoute = availableRoutes.find((route) =>
    route.includes(moduleTargetRouteQuery)
  );
  const targetRoutePrefix = availableTargetRoute?.split(
    moduleTargetRouteQuery
  )[0];
  const prefix = (targetRoutePrefix as string)?.endsWith("/")
    ? targetRoutePrefix
    : `${targetRoutePrefix}/`;

  return (
    <NextLink
      href={`${prefix}${notification.messageInfo.messageInfoTargetId}`}
      passHref
      legacyBehavior
    >
      <Link underline="none">
        <ListItemButton
          disableRipple
          sx={{
            p: 2.5,
            alignItems: "flex-start",
            borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
          onClick={() => {
            if (!notification.isRead) {
              makeOneMessageHaveRead({
                organizationId,
                messageId: notification.messageId,
                isRead: 1,
              });
            }
            mutateMessages();
            drawerClose();
          }}
        >
          {renderUnReadBadge}

          {renderAvatar}

          <Stack sx={{ flexGrow: 1 }}>{renderText}</Stack>
        </ListItemButton>
      </Link>
    </NextLink>
  );
}
