// @mui
import Box from "@mui/material/Box";

// components
import Scrollbar from "minimal/components/scrollbar";
import Lightbox, { useLightBox } from "minimal/components/lightbox";
//
import { useMessagesScroll } from "./hooks";
import ChatMessageItem from "./ChatMessageItem";
// types
import { IChatParticipant, IChatMessage } from "./type";

// ----------------------------------------------------------------------

type Props = {
  messages: IChatMessage[];
  participants: IChatParticipant[];
};

export default function ChatMessageList({ messages, participants }: Props) {
  const { messagesEndRef } = useMessagesScroll(messages);

  const slides = messages
    .filter((message) => message.contentType === "image")
    .map((message) => ({ src: message.body }));

  const lightbox = useLightBox(slides);

  return (
    <>
      <Scrollbar ref={messagesEndRef} sx={{ px: 3, py: 5, height: 1 }}>
        <Box>
          {messages.map((message) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              participants={participants}
              onOpenLightbox={() => lightbox.onOpen(message.body)}
            />
          ))}
        </Box>
      </Scrollbar>

      <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
      />
    </>
  );
}
