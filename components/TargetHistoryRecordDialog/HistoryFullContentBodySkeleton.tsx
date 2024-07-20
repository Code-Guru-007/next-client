// @mui
import Skeleton from "@mui/material/Skeleton";
import Stack, { StackProps } from "@mui/material/Stack";

// ----------------------------------------------------------------------

export function HistoryFullContentBodySkeleton({ sx, ...other }: StackProps) {
  return (
    <Stack spacing={6} flexGrow={1} sx={{ ...sx }} {...other}>
      <Stack spacing={3}>
        <Skeleton sx={{ width: 0.4, height: 20 }} />
        <Skeleton sx={{ width: 0.75, height: 10 }} />
        <Skeleton sx={{ width: 0.75, height: 10 }} />
      </Stack>
      <Stack spacing={3}>
        <Skeleton sx={{ width: 0.4, height: 20 }} />
        <Skeleton sx={{ width: 0.75, height: 10 }} />
        <Skeleton sx={{ width: 0.75, height: 10 }} />
      </Stack>
      <Stack spacing={3}>
        <Skeleton sx={{ width: 0.4, height: 20 }} />
        <Skeleton sx={{ width: 0.75, height: 10 }} />
        <Skeleton sx={{ width: 0.75, height: 10 }} />
      </Stack>
      <Stack spacing={3}>
        <Skeleton sx={{ width: 0.4, height: 20 }} />
        <Skeleton sx={{ width: 0.75, height: 10 }} />
        <Skeleton sx={{ width: 0.75, height: 10 }} />
      </Stack>
      <Stack spacing={3}>
        <Skeleton sx={{ width: 0.4, height: 20 }} />
        <Skeleton sx={{ width: 0.75, height: 10 }} />
        <Skeleton sx={{ width: 0.75, height: 10 }} />
      </Stack>
    </Stack>
  );
}
