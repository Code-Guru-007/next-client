import { ComponentPropsWithoutRef } from "react";
import { Typography } from "@mui/material";

const FormSectionTitle = ({
  variant = "h6",
  sx,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof Typography>) => (
  <Typography
    variant={variant}
    sx={{ lineHeight: "28px", paddingBottom: 3, ...sx }}
    {...props}
  >
    {children}
  </Typography>
);

export default FormSectionTitle;
