import { forwardRef } from "react";
import Link from "@mui/material/Link";
import Box, { BoxProps } from "@mui/material/Box";
// routes
import { RouterLink } from "minimal/routes/components";

// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
  disabledLink?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, sx }, ref) => {
    // -------------------------------------------------------
    const logo = (
      <Box
        ref={ref}
        component="img"
        src="/events/logo.svg"
        sx={{ width: 40, height: 40, cursor: "pointer", ...sx }}
      />
    );

    if (disabledLink) {
      return logo;
    }

    return (
      <Link component={RouterLink} href="/" sx={{ display: "contents" }}>
        {logo}
      </Link>
    );
  }
);

export default Logo;
