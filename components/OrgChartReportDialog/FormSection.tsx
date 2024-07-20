import { ComponentPropsWithoutRef } from "react";
import { Paper } from "@mui/material";

const FormSection = ({
  children,
  sx,
  ...props
}: ComponentPropsWithoutRef<typeof Paper>) => (
  <Paper
    sx={{ mt: 3, p: 3, boxShadow: (theme) => theme.customShadows.card, ...sx }}
    {...props}
  >
    {children}
  </Paper>
);

export default FormSection;
