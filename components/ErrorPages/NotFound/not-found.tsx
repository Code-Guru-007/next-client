"use client";

import { m } from "framer-motion";
// @mui
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
// layouts
import CompactLayout from "minimal/layouts/compact";
// routes
import { RouterLink } from "minimal/routes/components";
// components
import { MotionContainer, varBounce } from "minimal/components/animate";
// assets
import { PageNotFoundIllustration } from "minimal/assets/illustrations";

// ----------------------------------------------------------------------

export default function NotFound() {
  return (
    <CompactLayout>
      <MotionContainer>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" paragraph>
            抱歉，找不到頁面
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: "text.secondary" }}>
            {`很抱歉，我們找不到您正在尋找的頁面。可能是您輸入的網址有誤？請確認您的拼寫是否正確。`}
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <PageNotFoundIllustration
            sx={{
              height: 260,
              my: { xs: 5, sm: 10 },
            }}
          />
        </m.div>

        <Button
          component={RouterLink}
          href="/me/org-info"
          size="large"
          variant="contained"
          onClick={() => {
            window.location.replace("/me/org-info");
          }}
        >
          返回首頁
        </Button>
      </MotionContainer>
    </CompactLayout>
  );
}
