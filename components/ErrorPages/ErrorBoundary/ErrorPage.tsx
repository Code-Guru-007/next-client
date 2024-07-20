"use client";

import React from "react";
import { NextPageContext } from "next";
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
import { MaintenanceIllustration } from "minimal/assets/illustrations";

// ----------------------------------------------------------------------

interface ErrorProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ErrorPage = ({ error, errorInfo }: ErrorProps) => (
  <CompactLayout>
    <MotionContainer>
      <m.div variants={varBounce().in}>
        <Typography variant="h3" paragraph>
          抱歉，系統出現了異常
        </Typography>
      </m.div>

      <m.div variants={varBounce().in}>
        <Typography sx={{ color: "text.secondary" }}>
          {`請點擊下方按鈕返回首頁，或是嘗試聯繫客服人員，我們將會盡快解決此問題，謝謝！`}
        </Typography>
      </m.div>

      <m.div variants={varBounce().in}>
        <MaintenanceIllustration
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

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode || err?.statusCode || 404;
  return { statusCode };
};

export default ErrorPage;
