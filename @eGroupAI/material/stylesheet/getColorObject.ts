import { darken, lighten } from "@mui/material";

const getColorObject = (color: string) => ({
  0: darken(color, 0.2),
  1: color,
  2: lighten(color, 0.2),
  3: lighten(color, 0.4),
  4: lighten(color, 0.6),
  5: lighten(color, 0.8),
  6: lighten(color, 0.9),
});

export default getColorObject;
