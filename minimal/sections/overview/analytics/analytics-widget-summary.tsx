// @mui
import { alpha, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CardProps } from "@mui/material/Card";
// theme
import { bgGradient } from "minimal/theme/css";
// utils
import { fShortenNumber } from "minimal/utils/format-number";
// theme
import { ColorSchema } from "minimal/theme/palette";
import { CircularProgress } from "@mui/material";
import { AxiosError } from "axios";

// ----------------------------------------------------------------------

export interface AnalyticsWidgetSummaryProps extends CardProps {
  title: string;
  total?: number;
  tatalPlaceholder?: React.ReactNode;
  icon: React.ReactNode;
  color?: ColorSchema;
  isFetching?: boolean;
  error?: AxiosError<unknown, any>;
  showLoadingStatus?: boolean;
}

export default function AnalyticsWidgetSummary({
  title,
  total,
  tatalPlaceholder,
  icon,
  color = "primary",
  sx,
  isFetching = false,
  error,
  showLoadingStatus = true,
  ...other
}: AnalyticsWidgetSummaryProps) {
  const theme = useTheme();

  return (
    <Stack
      alignItems="center"
      sx={{
        ...bgGradient({
          direction: "135deg",
          startColor: alpha(theme.palette[color].light, 0.2),
          endColor: alpha(theme.palette[color].main, 0.2),
        }),
        py: 5,
        borderRadius: 2,
        textAlign: "center",
        color: `${color}.darker`,
        backgroundColor: "common.white",
        ...sx,
      }}
      {...other}
    >
      {icon && <Box sx={{ width: 64, height: 64, mb: 1 }}>{icon}</Box>}
      {error && (
        <Typography variant="body2" fontSize={13}>
          {`${error.response?.statusText}`}
        </Typography>
      )}
      {!error && (
        <Typography variant="h3">
          {(showLoadingStatus && isFetching) || typeof total === "undefined"
            ? tatalPlaceholder ?? <CircularProgress />
            : fShortenNumber(total)}
        </Typography>
      )}

      <Typography variant="subtitle2" sx={{ opacity: 0.64 }}>
        {title}
      </Typography>
    </Stack>
  );
}
