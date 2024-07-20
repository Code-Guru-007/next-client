// @mui
import { useTheme } from "@mui/material";
import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";
import AvatarGroup, { avatarGroupClasses } from "@mui/material/AvatarGroup";

// components
import Label from "minimal/components/label";
// types
import { IChatParticipant } from "./type";

// ----------------------------------------------------------------------

type Props = {
  participants: IChatParticipant[] | undefined;
};

export default function ChatHeaderDetail({ participants }: Props) {
  const theme = useTheme();
  const group = (participants?.length || 0) > 1;

  const singleParticipant = participants?.[0];

  return (
    <>
      {group ? (
        <AvatarGroup
          max={3}
          sx={{
            [`& .${avatarGroupClasses.avatar}`]: {
              width: 32,
              height: 32,
            },
          }}
        >
          {participants?.map((participant) => (
            <Avatar
              key={participant.id}
              alt={participant.name}
              src={participant.avatarUrl}
            />
          ))}
        </AvatarGroup>
      ) : (
        <Stack direction="row" alignItems="center" spacing={2}>
          <Badge
            variant={"online"}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Avatar
              src={singleParticipant?.avatarUrl}
              alt={singleParticipant?.name}
            />
          </Badge>

          <ListItemText
            primary={singleParticipant?.name}
            secondary="回饋標題"
          />
          <Label
            variant="soft"
            sx={{
              backgroundColor: "#22C55E29",
              margin: "2px",
              color: theme.palette.success.dark,
            }}
          >
            回饋類型
          </Label>
        </Stack>
      )}

      <Stack flexGrow={1} />
    </>
  );
}
