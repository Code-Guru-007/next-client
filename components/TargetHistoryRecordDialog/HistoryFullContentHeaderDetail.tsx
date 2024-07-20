import React from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { Box, ListItemText, Stack } from "@mui/material";
import Button from "@eGroupAI/material/Button";
import {
  OrganizationTargetHistoryFullContent,
  OrganizationTargetHistoryRecord,
} from "interfaces/entities";

import Iconify from "minimal/components/iconify";
import { fZonedDateTime } from "minimal/utils/format-time";

import { HistoryFullContentHeaderDetailSkeleton } from "./HistoryFullContentHeaderDetailSkeleton";

export interface HistoryFullContentHeaderDetailProps {
  records: OrganizationTargetHistoryRecord[];
  isLoading?: boolean;
  selectedFullDocument?: OrganizationTargetHistoryFullContent;
  itemLength?: number;
  itemIndex?: number;
  setSelectedRecordId?: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  closeDialog?: () => void;
  handleRestoreSelectedVersion: () => void;
  isRestoring?: boolean;
}

export default function HistoryFullContentHeaderDetail(
  props: HistoryFullContentHeaderDetailProps
) {
  const {
    records,
    selectedFullDocument,
    isLoading = true,
    itemLength = 0,
    itemIndex = 0,
    setSelectedRecordId,
    closeDialog,
    handleRestoreSelectedVersion,
    isRestoring,
  } = props;

  const wordLibrary = useSelector(getWordLibrary);
  const handleClickBefore = () => {
    if (setSelectedRecordId) {
      if (itemIndex < itemLength - 1)
        setSelectedRecordId(records[itemIndex + 1]?.targetHistoryRecordId);
    }
  };

  const handleClickNext = () => {
    if (setSelectedRecordId) {
      if (itemIndex > 0)
        setSelectedRecordId(records[itemIndex - 1]?.targetHistoryRecordId);
    }
  };

  const handleSetToCurrentVersion = () => {
    if (closeDialog) closeDialog();
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      width="100%"
      alignItems="center"
    >
      <Stack spacing={1} width="45%" justifyContent="left">
        {isLoading && <HistoryFullContentHeaderDetailSkeleton />}
        {!isLoading && (
          <ListItemText
            primary={`${wordLibrary?.version ?? "版本"} : ${
              selectedFullDocument?.targetHistoryRecordId
            }${
              itemIndex === 0
                ? ` - ${wordLibrary?.["current version"] ?? "[目前版本]"}`
                : ""
            }`}
            secondary={fZonedDateTime(
              selectedFullDocument?.targetHistoryRecordCreateDate
            )}
          />
        )}
      </Stack>
      <Stack spacing={1} direction="row" width="10%" justifyContent="center">
        <Button
          variant="outlined"
          sx={{ p: 0, m: 0, width: 40, minWidth: 40, height: 40 }}
          disabled={itemIndex === itemLength - 1}
          onClick={handleClickBefore}
        >
          <Iconify
            icon="icon-park-outline:left"
            sx={{ color: itemIndex === itemLength - 1 ? "text.disabled" : "" }}
          />
        </Button>
        <Button
          variant="outlined"
          sx={{ p: 0, m: 0, width: 40, minWidth: 40, height: 40 }}
          disabled={itemIndex === 0}
          onClick={handleClickNext}
        >
          <Iconify
            icon="icon-park-outline:right"
            sx={{
              color: itemIndex === 0 ? "text.disabled" : "",
            }}
          />
        </Button>
      </Stack>
      <Stack spacing={1} direction="row" width="45%" justifyContent="right">
        <Button
          onClick={handleRestoreSelectedVersion}
          variant="outlined"
          disabled={itemIndex === 0}
          loading={isRestoring}
        >
          {wordLibrary?.["restore to this version"] ?? "復原至這個版本"}
        </Button>
        <Button variant="contained" onClick={handleSetToCurrentVersion}>
          {wordLibrary?.["Return To Current Document"] ?? "返回至目前文件"}
        </Button>
      </Stack>
    </Box>
  );
}
