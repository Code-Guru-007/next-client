import React, { Component, ErrorInfo } from "react";
import ErrorPage from "./ErrorPage"; // import your ErrorPage component
import Page500 from "./500Error";

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// eslint-disable-next-line @typescript-eslint/ban-types
class ErrorBoundary extends Component<{}, State> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * getDerivedStateFromError is a static method and it does not have access to this.
   * If you want to log the error or perform side effects,
   * you should use componentDidCatch instead.
   *
   * @param error
   * @param errorInfo
   */

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service

    this.setState({ errorInfo, error });
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // eslint-disable-next-line no-console
      console.error(
        "Error catched:",
        `${this.state.error}---${this.state.error.message}`
      );
      // You can render any custom fallback UI
      return (
        <>
          {String(this.state.error?.message) === "500" && <Page500 />}
          {String(this.state.error?.message) !== "500" &&
            String(this.state.error?.message) !== "401" &&
            String(this.state.error?.message) !== "403" &&
            String(this.state.error?.message) !== "404" &&
            String(this.state.error?.message) !== "422" && (
              <ErrorPage
                error={this.state.error}
                errorInfo={this.state.errorInfo}
              />
            )}
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
