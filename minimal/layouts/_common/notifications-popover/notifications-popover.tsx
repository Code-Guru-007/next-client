"use client";

import { m } from "framer-motion";
import { useState, useCallback, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import NextLink from "next/link";
// @mui
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import List from "@mui/material/List";
import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import { useTheme } from "@mui/styles";
// hooks
import { useBoolean } from "minimal/hooks/use-boolean";
import { useResponsive } from "minimal/hooks/use-responsive";
// components
import Label from "minimal/components/label";
import Iconify from "minimal/components/iconify";
import { varHover } from "minimal/components/animate";
//
import Link from "@eGroupAI/material/Link";
import { MessageItem } from "@eGroupAI/typings/apis";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useGetMessages from "@eGroupAI/hooks/apis/useGetMessages";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";

import NotificationItem from "./notification-item";

// ----------------------------------------------------------------------

type Props = {
  unreadMessageCount: number | undefined;
  mutateUnreadMessageCount: () => void;
};

// ----------------------------------------------------------------------

export default function NotificationsPopover({
  unreadMessageCount: unReadMessageCountProp,
  mutateUnreadMessageCount,
}: Props) {
  const wordLibrary = useSelector(getWordLibrary);
  const drawer = useBoolean();
  const theme = useTheme();

  const smUp = useResponsive("up", "sm");

  const [currentTab, setCurrentTab] = useState("all");

  const organizationId = useSelector(getSelectedOrgId);

  const scrollableDivRef = useRef<HTMLDivElement>(null);

  const messageFetchCount = 20;

  const [shouldRenderMoreAll, setShouldRenderMoreAll] = useState(false);
  const [allMessageFetchedIndex, setAllMessageFetchedIndex] = useState(0);
  const [allMessagesCount, setAllMessagesCount] = useState<number>();
  const [isAllMessagesFetched, setIsAllMessagesFetched] = useState(false);
  const [allMessages, setAllMessages] = useState<MessageItem[]>([]);
  const [allMessagesFetched, setAllMessagesFetched] = useState<MessageItem[]>(
    []
  );
  const {
    data: allMessageData,
    mutate: mutateAllMessages,
    isValidating: isAllMessageValidating,
  } = useGetMessages(
    {
      organizationId,
    },
    {
      startIndex: allMessageFetchedIndex * messageFetchCount,
      size: messageFetchCount,
      locale: "zh_TW",
    },
    undefined,
    undefined,
    !drawer.value ||
      currentTab !== "all" ||
      allMessagesCount === 0 ||
      allMessageFetchedIndex * messageFetchCount > (allMessagesCount ?? 1)
  );
  useEffect(() => {
    if (allMessageData) {
      setAllMessagesCount(allMessageData.total);
      setAllMessagesFetched(allMessageData.source);
      setIsAllMessagesFetched(true);
    }
  }, [allMessageData]);
  useEffect(() => {
    if (!isAllMessageValidating && allMessagesFetched) {
      if (
        (allMessageFetchedIndex + 1) * messageFetchCount >
        (allMessages?.length || 0)
      ) {
        if (isAllMessagesFetched) {
          setIsAllMessagesFetched(false);
          setShouldRenderMoreAll(true);
        }
      }
    }
  }, [
    allMessageFetchedIndex,
    allMessages?.length,
    allMessagesFetched,
    isAllMessageValidating,
    isAllMessagesFetched,
  ]);
  useEffect(() => {
    if (shouldRenderMoreAll) {
      setAllMessages((prev) => {
        const prevIds = prev.map((p) => p.messageId);
        const newMessages = [...prev];
        allMessagesFetched.forEach((m) => {
          if (!prevIds.includes(m.messageId)) {
            newMessages.push(m);
          }
        });
        return [...newMessages];
      });
      setShouldRenderMoreAll(false);
    }
  }, [allMessagesFetched, shouldRenderMoreAll]);

  const [shouldRenderMoreUnread, setShouldRenderMoreUnread] = useState(false);
  const [unreadMessageFetchedIndex, setUnreadMessageFetchedIndex] = useState(0);
  const [isUnreadMessagesFetched, setIsUnreadMessagesFetched] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<MessageItem[]>([]);
  const [unreadMessagesFetched, setUnreadMessagesFetched] = useState<
    MessageItem[]
  >([]);
  const {
    data: unreadMessageData,
    mutate: mutateUnreadMessages,
    isValidating: isUnreadMessageValidating,
  } = useGetMessages(
    {
      organizationId,
    },
    {
      startIndex: unreadMessageFetchedIndex * messageFetchCount,
      size: messageFetchCount,
      locale: "zh_TW",
      equal: [
        {
          filterKey: "C42_1",
          value: ["0"],
        },
      ],
    },
    undefined,
    undefined,
    !drawer.value ||
      currentTab !== "unread" ||
      unReadMessageCountProp === 0 ||
      unreadMessageFetchedIndex * messageFetchCount >=
        (unReadMessageCountProp ?? 1)
  );
  useEffect(() => {
    if (unreadMessageData) {
      setUnreadMessagesFetched(unreadMessageData.source);
      setIsUnreadMessagesFetched(true);
    }
  }, [unreadMessageData]);
  useEffect(() => {
    if (!isUnreadMessageValidating && unreadMessagesFetched) {
      if (
        (unreadMessageFetchedIndex + 1) * messageFetchCount >
        (unreadMessages?.length || 0)
      ) {
        if (isUnreadMessagesFetched) {
          setIsUnreadMessagesFetched(false);
          setShouldRenderMoreUnread(true);
        }
      }
    }
  }, [
    unreadMessageFetchedIndex,
    unreadMessages?.length,
    unreadMessagesFetched,
    isUnreadMessageValidating,
    isUnreadMessagesFetched,
  ]);
  useEffect(() => {
    if (shouldRenderMoreUnread) {
      setUnreadMessages((prev) => {
        const prevIds = prev.map((p) => p.messageId);
        const newMessages = [...prev];
        unreadMessagesFetched.forEach((m) => {
          if (!prevIds.includes(m.messageId)) {
            newMessages.push(m);
          }
        });
        return [...newMessages];
      });
      setShouldRenderMoreUnread(false);
    }
  }, [unreadMessagesFetched, shouldRenderMoreUnread]);

  const { excute: makeAllMessageHaveRead } = useAxiosApiWrapper(
    apis.message.makeAllMessageHaveRead,
    "Update"
  );

  const handleMutateMessages = () => {
    mutateUnreadMessageCount();
    mutateUnreadMessages();
    mutateAllMessages();
  };

  const handleMarkAllAsRead = async () => {
    await makeAllMessageHaveRead({
      organizationId,
    });
    handleMutateMessages();
  };

  const handleChangeTab = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      setCurrentTab(newValue);
      setShouldRenderMoreAll(false);
      if (newValue === "all") {
        setUnreadMessages([]);
        setUnreadMessageFetchedIndex(0);
      } else if (newValue === "unread") {
        setAllMessages([]);
        setAllMessageFetchedIndex(0);
      }
    },
    []
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollableDiv = scrollableDivRef.current;
      if (scrollableDiv)
        if (
          (scrollableDiv?.scrollTop || 0) +
            (scrollableDiv?.clientHeight || 0) >=
          (scrollableDiv?.scrollHeight || 0)
        ) {
          if (currentTab === "all") {
            if (
              (allMessagesCount || 0) >
              allMessageFetchedIndex * messageFetchCount
            ) {
              if (
                !isAllMessagesFetched &&
                !shouldRenderMoreAll &&
                !isAllMessageValidating
              ) {
                setAllMessageFetchedIndex(allMessageFetchedIndex + 1);
              }
            }
          } else if (currentTab === "unread") {
            if (
              (unReadMessageCountProp || 0) >
              unreadMessageFetchedIndex * messageFetchCount
            ) {
              if (
                !isUnreadMessagesFetched &&
                !shouldRenderMoreUnread &&
                !isUnreadMessageValidating
              ) {
                setUnreadMessageFetchedIndex(unreadMessageFetchedIndex + 1);
              }
            }
          }
        }
    };
    const scrollableDiv = scrollableDivRef.current;
    if (scrollableDiv) scrollableDiv.addEventListener("scroll", handleScroll);
    return () => {
      if (scrollableDiv)
        scrollableDiv.removeEventListener("scroll", handleScroll);
    };
  }, [
    allMessageFetchedIndex,
    allMessagesCount,
    currentTab,
    isAllMessageValidating,
    isAllMessagesFetched,
    isUnreadMessageValidating,
    isUnreadMessagesFetched,
    shouldRenderMoreAll,
    shouldRenderMoreUnread,
    unReadMessageCountProp,
    unreadMessageFetchedIndex,
  ]);

  useEffect(() => {
    if (!drawer.value) {
      setCurrentTab("all");
      setShouldRenderMoreAll(false);
      setAllMessages([]);
      setAllMessagesCount(undefined);
      setAllMessageFetchedIndex(0);
      setUnreadMessages([]);
      setUnreadMessageFetchedIndex(0);
    }
  }, [drawer.value]);

  const TABS = [
    {
      value: "all",
      label: wordLibrary?.all ?? "全部",
      count: allMessagesCount,
    },
    {
      value: "unread",
      label: wordLibrary?.unread ?? "未讀",
      count: unReadMessageCountProp,
    },
  ];

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        {wordLibrary?.notification ?? "訊息"}
      </Typography>

      {!!unReadMessageCountProp && (
        <Tooltip title={wordLibrary?.["mark all as read"] ?? "全部標示為已讀"}>
          <IconButton color="primary" onClick={handleMarkAllAsRead}>
            <Iconify icon="eva:done-all-fill" />
          </IconButton>
        </Tooltip>
      )}

      {!smUp && (
        <IconButton onClick={drawer.onFalse}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      )}
    </Stack>
  );

  const renderTabs = (
    <Tabs value={currentTab} onChange={handleChangeTab}>
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={
            <Label
              variant={
                ((tab.value === "all" || tab.value === currentTab) &&
                  "filled") ||
                "soft"
              }
              color={
                (tab.value === "unread" && "info") ||
                (tab.value === "archived" && "success") ||
                "default"
              }
            >
              {tab.count}
            </Label>
          }
          sx={{
            "&:not(:last-of-type)": {
              mr: 3,
            },
          }}
        />
      ))}
    </Tabs>
  );

  const renderList = (
    <Box
      ref={scrollableDivRef}
      id="messageScrollableArea"
      sx={{
        overflowY: "auto",
        maxHeight: "calc(100vh - 200px)",
      }}
    >
      {currentTab === "all" && (
        <List disablePadding>
          {allMessages?.map((notification) => (
            <NotificationItem
              key={notification.messageId}
              notification={notification}
              drawerClose={drawer.onFalse}
              mutateMessages={handleMutateMessages}
            />
          ))}
        </List>
      )}
      {currentTab === "unread" && (
        <>
          <List disablePadding>
            {unreadMessages?.map((notification) => (
              <NotificationItem
                key={notification.messageId}
                notification={notification}
                drawerClose={drawer.onFalse}
                mutateMessages={handleMutateMessages}
              />
            ))}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        color={drawer.value ? "primary" : "default"}
        onClick={() => {
          drawer.onTrue();
        }}
      >
        <Badge badgeContent={unReadMessageCountProp} color="error">
          <Iconify icon="solar:bell-bing-bold-duotone" width={24} />
        </Badge>
      </IconButton>

      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        PaperProps={{
          sx: {
            width: 1,
            maxWidth: 420,
            overflow: "hidden",
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "transparent",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            display:
              isAllMessageValidating || isUnreadMessageValidating
                ? "flex"
                : "none",
          }}
        >
          <CircularProgress />
        </Box>

        {renderHead}

        <Divider />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pl: 2.5, pr: 1 }}
        >
          {renderTabs}
        </Stack>

        <Divider />

        {renderList}

        <Box flexGrow={1} />
        <NextLink prefetch href="/me/messages" passHref legacyBehavior>
          <Link underline="none" onClick={drawer.onFalse}>
            <Box
              sx={{
                p: 1,
                color: theme.palette.text.primary,
              }}
            >
              <Button fullWidth size="large">
                {wordLibrary?.overview ?? "全覽"}
              </Button>
            </Box>
          </Link>
        </NextLink>
      </Drawer>
    </>
  );
}
