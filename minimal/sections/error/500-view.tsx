"use client";

import { m } from "framer-motion";

// @mui
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
// layouts
import CompactLayout from "minimal/layouts/compact";
// assets
import { SeverErrorIllustration } from "minimal/assets/illustrations";
// components
import { RouterLink } from "minimal/routes/components";
import { MotionContainer, varBounce } from "minimal/components/animate";

// ----------------------------------------------------------------------

export default function Page500() {
  return (
    <CompactLayout>
      <MotionContainer>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" paragraph>
            500 Internal Server Error
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: "text.secondary" }}>
            There was an error, please try again later.
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <SeverErrorIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
        </m.div>

        <Button
          component={RouterLink}
          href="/"
          onClick={() => {
            window.location.replace("/me");
          }}
          size="large"
          variant="contained"
        >
          Go to Home
        </Button>
      </MotionContainer>
    </CompactLayout>
  );
}
