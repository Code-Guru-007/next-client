import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
// @mui
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
// utils
import { fZonedDateTime } from "minimal/utils/format-time";
// types
// components
import { OrganizationTargetHistoryRecord } from "interfaces/entities";

// ----------------------------------------------------------------------

type Props = {
  selectedRecord?: OrganizationTargetHistoryRecord;
  isCurrentVersion?: boolean;
};

export default function HistoryHeaderDetail({
  selectedRecord: record,
  isCurrentVersion,
}: Props) {
  const editor = record?.updater?.memberName ?? "";
  const wordLibrary = useSelector(getWordLibrary);
  return (
    <>
      <Stack flexGrow={1} direction="row" alignItems="center" spacing={2}>
        {record && (
          <>
            <ListItemText
              primary={`${fZonedDateTime(
                record?.targetHistoryRecordCreateDate
              )}${
                isCurrentVersion
                  ? ` - ${wordLibrary?.["current version"] ?? "[目前版本]"}`
                  : ""
              }`}
              primaryTypographyProps={{
                typography: "body2",
                color: "text.disabled",
              }}
              secondary={`${wordLibrary?.editor ?? "編輯者"} : ${editor}`}
              secondaryTypographyProps={{
                typography: "subtitle1",
                color: "text.primary",
              }}
            />
          </>
        )}
      </Stack>
    </>
  );
}
