import { formatDistanceToNowStrict, Locale } from "date-fns";
import zhTW from "date-fns/locale/zh-TW/index.js";
import enUS from "date-fns/locale/en-US/index.js";

// @eGroupAI
import useWordLibrary from "@eGroupAI/hooks/useWordLibrary";
// @mui
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import { useTheme } from "@mui/styles";
// hooks
import { useResponsive } from "minimal/hooks/use-responsive";
// types
import { OrganizationTargetHistoryRecord } from "interfaces/entities";
//
import { useGetNavItem } from "./hooks";

// ----------------------------------------------------------------------

export function eliminateHtmlTags(str?: string) {
  const div = document.createElement("div");
  div.innerHTML = str || "";
  return div.textContent || div.innerText || "";
}

type Props = {
  selected: boolean;
  onClickRecordItem: VoidFunction;
  record: OrganizationTargetHistoryRecord;
};

export default function HistoryNavItem({
  selected,
  record,
  onClickRecordItem,
}: Props) {
  const {
    displayName,
    lastActivity,
    lastTitleAdded,
    lastTitleDeleted,
    lastContentAdded,
    lastContentDeleted,
  } = useGetNavItem({ record });

  let locale: Locale | undefined;
  const currentLanguage = useWordLibrary();
  if (currentLanguage.language === "zh_TW") {
    locale = zhTW;
  } else {
    locale = enUS;
  }

  const mdUp = useResponsive("up", "md");

  const theme = useTheme();

  const renderSingle = (
    <Avatar
      src={displayName}
      alt={displayName}
      sx={{
        width: mdUp ? 48 : 32,
        height: mdUp ? 48 : 32,
        ...(selected && {
          color: theme.palette.primary.main,
        }),
      }}
    >
      {displayName?.[0]?.toUpperCase()}
    </Avatar>
  );

  return (
    <ListItemButton
      disableGutters
      onClick={onClickRecordItem}
      sx={{
        py: mdUp ? 1.5 : 0.8,
        px: mdUp ? 2.5 : 1,
        ...(selected && {
          bgcolor: "action.selected",
        }),
      }}
    >
      {renderSingle}

      {mdUp && (
        <>
          <ListItemText
            sx={{ ml: 2 }}
            primary={displayName}
            primaryTypographyProps={{
              noWrap: true,
              variant: "subtitle2",
            }}
            secondary={eliminateHtmlTags(
              lastTitleAdded ||
                lastTitleDeleted ||
                lastContentAdded ||
                lastContentDeleted
            )}
            secondaryTypographyProps={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              noWrap: true,
              variant:
                lastTitleAdded || lastTitleDeleted ? "subtitle2" : "body2",
              color:
                lastTitleAdded || lastTitleDeleted
                  ? "text.primary"
                  : "text.secondary",
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
              {formatDistanceToNowStrict(new Date(lastActivity), {
                addSuffix: false,
                locale,
              })}
            </Typography>
          </Stack>
        </>
      )}
    </ListItemButton>
  );
}
