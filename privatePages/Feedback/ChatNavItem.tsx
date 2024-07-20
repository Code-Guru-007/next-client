// import { formatDistanceToNowStrict } from "date-fns";
// @mui
import { useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";

import Label from "minimal/components/label";

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  collapse: boolean;
  // onClickConversation: VoidFunction;
};

export default function ChatNavItem({
  selected,
  collapse,
}: // onClickConversation,
Props) {
  const theme = useTheme();

  return (
    <ListItemButton
      disableGutters
      // onClick={onClickConversation}
      sx={{
        py: 1.5,
        px: 2.5,
        ...(selected && {
          bgcolor: "action.selected",
        }),
      }}
    >
      {!collapse && (
        <>
          <ListItemText
            primary="Jayvion Simon"
            primaryTypographyProps={{
              noWrap: true,
              variant: "subtitle2",
            }}
            secondary="回饋標題"
            secondaryTypographyProps={{
              noWrap: true,
              component: "span",
              variant: "body2",
              color: "text.secondary",
            }}
          />

          <Stack alignItems="flex-end" sx={{ ml: 2, height: 44 }}>
            <Typography
              noWrap
              variant="body2"
              component="span"
              sx={{
                mb: 1.5,
                fontSize: 12,
                color: "text.disabled",
              }}
            >
              3 days
              {/* {formatDistanceToNowStrict(new Date(), {
                addSuffix: false,
              })} */}
            </Typography>

            {true && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  bgcolor: "info.main",
                  borderRadius: "50%",
                }}
              />
            )}
          </Stack>

          <Label
            variant="soft"
            sx={{
              backgroundColor: "#22C55E29",
              margin: "2px",
              ml: 2,
              color: theme.palette.success.dark,
            }}
          >
            回饋類型
          </Label>
        </>
      )}
    </ListItemButton>
  );
}
