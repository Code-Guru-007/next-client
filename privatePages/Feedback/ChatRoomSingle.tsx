// @mui
import { useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import ListItemButton from "@mui/material/ListItemButton";
// hooks
import { useBoolean } from "minimal/hooks/use-boolean";
import { fDate } from "minimal/utils/format-time";

// components
import Iconify from "minimal/components/iconify";
import Label from "minimal/components/label";
// types
import { IChatParticipant } from "./type";

// ----------------------------------------------------------------------

type Props = {
  participant: IChatParticipant;
};

export default function ChatRoomSingle({ participant }: Props) {
  const collapse = useBoolean(true);
  const theme = useTheme();

  const { name, phoneNumber, email, lastActivity } = participant;

  const renderInfo = (
    <Stack alignItems="center" gap={0.5} sx={{ py: 5 }}>
      <Typography
        sx={{ fontSize: "10px", color: theme.palette.grey[500], mb: 2 }}
      >
        {fDate(lastActivity)}
      </Typography>
      <Typography variant="subtitle1">{name}</Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
        回饋標題
      </Typography>
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
  );

  const renderBtn = (
    <ListItemButton
      onClick={collapse.onToggle}
      sx={{
        pl: 2.5,
        pr: 1.5,
        height: 40,
        flexShrink: 0,
        flexGrow: "unset",
        typography: "overline",
        color: "text.secondary",
        bgcolor: "background.neutral",
      }}
    >
      <Box component="span" sx={{ flexGrow: 1 }}>
        Information
      </Box>
      <Iconify
        width={16}
        icon={
          collapse.value
            ? "eva:arrow-ios-downward-fill"
            : "eva:arrow-ios-forward-fill"
        }
      />
    </ListItemButton>
  );

  const renderContent = (
    <Stack
      spacing={2}
      sx={{
        px: 2,
        py: 2.5,
        "& svg": {
          mr: 1,
          flexShrink: 0,
          color: "text.disabled",
        },
      }}
    >
      <Stack direction="row">
        <Iconify icon="solar:phone-bold" />
        <Typography variant="body2">{phoneNumber}</Typography>
      </Stack>

      <Stack direction="row">
        <Iconify icon="fluent:mail-24-filled" />
        <Typography variant="body2" noWrap>
          {email}
        </Typography>
      </Stack>
    </Stack>
  );

  return (
    <>
      {renderInfo}

      {renderBtn}

      <div>
        <Collapse in={collapse.value}>{renderContent}</Collapse>
      </div>
    </>
  );
}
