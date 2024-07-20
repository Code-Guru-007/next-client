import React, { FC } from "react";
import Typography, { TypographyProps } from "@eGroupAI/material/Typography";

const StyledTypography: FC<TypographyProps> = function (
  props: TypographyProps
) {
  return (
    <Typography
      sx={{
        fontSize: "15px",
      }}
      {...props}
    />
  );
};

export default StyledTypography;
