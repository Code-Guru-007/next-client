import { useEffect } from "react";
// @mui
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Drawer from "@mui/material/Drawer";
// hooks
import { useResponsive } from "minimal/hooks/use-responsive";

//
import { useCollapseNav } from "./hooks";
import ChatRoomGroup from "./ChatRoomGroup";
import ChatRoomSingle from "./ChatRoomSingle";
// types
import { IChatConversation, IChatParticipant } from "./type";

// ----------------------------------------------------------------------

const NAV_WIDTH = 240;

type Props = {
  participants: IChatParticipant[];
  conversation: IChatConversation;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ChatRoom({ participants, conversation }: Props) {
  const theme = useTheme();

  const lgUp = useResponsive("up", "lg");

  const {
    collapseDesktop,
    onCloseDesktop,
    //
    openMobile,
    onCloseMobile,
  } = useCollapseNav();

  useEffect(() => {
    if (!lgUp) {
      onCloseDesktop();
    }
  }, [onCloseDesktop, lgUp]);

  const group = participants.length > 1;

  const renderContent = (
    <>
      {group ? (
        <ChatRoomGroup participants={participants} />
      ) : (
        <ChatRoomSingle
          participant={
            participants[0] || {
              name: "",
              role: "",
              email: "",
              address: "",
              avatarUrl: "",
              id: "",
              phoneNumber: "0",
              lastActivity: "",
              status: "offline",
            }
          }
        />
      )}
    </>
  );

  return (
    <Box sx={{ position: "relative" }}>
      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            flexShrink: 0,
            width: NAV_WIDTH,
            borderLeft: `solid 1px ${theme.palette.divider}`,
            transition: theme.transitions.create(["width"], {
              duration: theme.transitions.duration.shorter,
            }),
            ...(collapseDesktop && {
              width: 0,
            }),
          }}
        >
          {!collapseDesktop && renderContent}
        </Stack>
      ) : (
        <Drawer
          anchor="right"
          open={openMobile}
          onClose={onCloseMobile}
          PaperProps={{
            sx: { width: NAV_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
