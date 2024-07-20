import React from "react";
import { NextPageContext } from "next";

interface ErrorProps {
  statusCode: number;
}

const ErrorPage = ({ statusCode }: ErrorProps) => (
  <div style={{ padding: "20px", textAlign: "center" }}>
    {statusCode === 500 ? (
      <h1>500 - Server-side error occurred</h1>
    ) : (
      <h1>{statusCode} - An error occurred</h1>
    )}
  </div>
);

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode || err?.statusCode || 404;
  return { statusCode };
};

export default ErrorPage;
