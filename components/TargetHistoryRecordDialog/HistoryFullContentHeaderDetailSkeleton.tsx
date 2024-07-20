// @mui
import Skeleton from "@mui/material/Skeleton";
import Stack, { StackProps } from "@mui/material/Stack";

// ----------------------------------------------------------------------

export function HistoryFullContentHeaderDetailSkeleton({
  sx,
  ...other
}: StackProps) {
  return (
    <Stack spacing={1} sx={{ ...sx }} {...other}>
      <Skeleton sx={{ width: 310, height: 10 }} />
      <Skeleton sx={{ width: 150, height: 10 }} />
    </Stack>
  );
}
