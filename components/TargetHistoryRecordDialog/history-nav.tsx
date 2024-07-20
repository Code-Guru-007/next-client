import { useCallback, useRef } from "react";
import Stack from "@mui/material/Stack";
import { OrganizationTargetHistoryRecord } from "interfaces/entities";
import { useResponsive } from "minimal/hooks/use-responsive";
//
import Center from "@eGroupAI/material-layout/Center";
import { CircularProgress, useTheme } from "@mui/material";
import { HistoryNavItemSkeleton } from "./history-skeleton";
import HistoryNavItem from "./history-nav-item";

// ----------------------------------------------------------------------

const NAV_WIDTH = 320;
const NAV_COLLAPSE_WIDTH = 48;

type Props = {
  loading: boolean;
  records: OrganizationTargetHistoryRecord[];
  currentRecordId?: string;
  onClickRecordItem: (id: string) => void;
  onScrollToBottom?: () => void;
  totalElements?: number;
  size?: number;
};

export default function HistoryNav({
  loading,
  records,
  currentRecordId,
  onClickRecordItem,
  onScrollToBottom,
  totalElements,
  size,
}: Props) {
  const theme = useTheme();
  const mdUp = useResponsive("up", "md");

  const handleClickRecordItem = useCallback(
    (id: string) => {
      onClickRecordItem(id);
    },
    [onClickRecordItem]
  );

  const handleScrollToBottom = useCallback(() => {
    if (onScrollToBottom) {
      onScrollToBottom();
    }
  }, [onScrollToBottom]);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const renderList = (
    <>
      {(loading && !records ? [...Array(12)] : records).map((record, index) =>
        record ? (
          <HistoryNavItem
            key={record.targetHistoryRecordId}
            record={record}
            onClickRecordItem={() =>
              handleClickRecordItem(record.targetHistoryRecordId)
            }
            selected={record.targetHistoryRecordId === currentRecordId}
          />
        ) : (
          <HistoryNavItemSkeleton key={index} />
        )
      )}
      {loading && (
        <Center height={100}>
          <CircularProgress />
        </Center>
      )}
    </>
  );

  const renderContent = (
    <>
      <div
        ref={scrollContainerRef}
        onScroll={(e) => {
          const target = e.target as HTMLElement;
          const bottom =
            target.scrollHeight - target.scrollTop === target.clientHeight;
          if (bottom) {
            if (size && totalElements && size < totalElements)
              handleScrollToBottom();
          }
        }}
        style={{ overflow: "auto", paddingBottom: 1 }}
      >
        {renderList}
      </div>
    </>
  );

  return (
    <>
      <Stack
        sx={{
          height: 1,
          flexShrink: 0,
          width: mdUp ? NAV_WIDTH : NAV_COLLAPSE_WIDTH,
          borderRight: `solid 1px ${theme.palette.divider}`,
          transition: theme.transitions.create(["width"], {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        {renderContent}
      </Stack>
    </>
  );
}
