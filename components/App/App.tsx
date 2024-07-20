// scroll bar
import "simplebar-react/dist/simplebar.min.css";

// lightbox
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

import "spectrum-colorpicker2/dist/spectrum.min.css";

import React, { useEffect } from "react";
import Script from "next/script";
// import GlobalStyles from "@mui/material/GlobalStyles";
// import { PersistGate } from "redux-persist/integration/react";
import { store } from "redux/configureAppStore";
// import createEgTheme from "@eGroupAI/material/stylesheet/createEgTheme";
import { withReduxDialog, withReduxSnackbar } from "@eGroupAI/redux-modules";
import { AppProps as NextAppProps } from "next/app";
import { CookiesProvider } from "react-cookie";
import { Provider } from "react-redux";
// import EgThemeProvider from "@eGroupAI/material/EgThemeProvider";
import MinimalThemeProvider from "minimal/theme";
import { SettingsProvider, SettingsDrawer } from "minimal/components/settings";
import ProgressBar from "minimal/components/progress-bar";
import MotionLazy from "minimal/components/animate/motion-lazy";
import SnackbarProvider from "minimal/components/snackbar/snackbar-provider";
import Head from "next/head";
import AlertDialog from "@eGroupAI/material-module/AlertDialog";
import Snackbar, { SnackbarProps } from "@eGroupAI/material/Snackbar";
import ConfirmDialog from "components/ConfirmDialog";
import ConfirmDeleteDialog from "components/ConfirmDeleteDialog";
import ConfirmOutsideClickDialog from "components/ConfirmOutsideClickDialog";
import ConfirmLeaveDialog from "components/ConfirmLeaveDialog";
import ConfirmPublishDialog from "components/ConfirmPublishDialog";
import TourComponent from "components/OnboardingTour";
import ErrorBoundary from "components/ErrorPages/ErrorBoundary";

import SWRConfig from "./SWRConfig";

export const DIALOG = "globalAlertDialog";
export const SNACKBAR = "globalSnackbar";
const GlobalAlertDialog = withReduxDialog(DIALOG)(AlertDialog);
const GlobalSnackbar = withReduxSnackbar(SNACKBAR)<
  HTMLDivElement,
  SnackbarProps
>(Snackbar);

// const egTheme = createEgTheme();

const App = function App({ Component, pageProps }: NextAppProps) {
  // Fixed material-ui style SSR issue.
  // Example:
  // https://github.com/mui-org/material-ui/tree/next/examples/nextjs
  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <>
      <Head>
        {/* Website Settings */}
        <title>InfoCenter 智能中台</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="theme-color" />
        <link rel="icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        {/* SEO */}
        <meta name="description" content="description" key="description" />
        {/* 告訴爬蟲多久回來一次 */}
        <meta name="revisit-after" content="1 days" />
        {/* 搜尋引擎登記 */}
        <meta
          name="google-site-verification"
          content="IykqChnStKYdnhksHQANAuKa0DVF2BBFEElqVTylmSA"
        />
        <meta name="msvalidate.01" content="D05E1782FEF56AA295AD3CA7FA4DFE90" />
        {/* Org info */}
        <meta
          property="og:title"
          content={`${pageProps?.title || "InfoCenter 智能中台"}`}
          key="ogTitle"
        />
        <meta
          property="og:description"
          content={`${pageProps?.description || "InfoCenter 智能中台"}`}
          key="ogDescription"
        />
        <meta property="og:type" content="website" key="ogType" />
        <meta
          property="og:email"
          content="service@egroupai.com"
          key="ogEmail"
        />
        <meta
          property="og:url"
          content={process.env.NEXT_PUBLIC_SITE_URL}
          key="ogUrl"
        />
        <meta
          property="og:image"
          content={`${pageProps?.img?.src || "/logo-new-sm.png"}`}
          key="ogImage"
        />
        {(Number(pageProps?.img?.width || 0) < 380 ||
          Number(pageProps?.img?.height || 0) < 190) &&
          (pageProps?.img?.ratio || 2) < 2 && (
            <>
              <meta
                property="og:image:width"
                content={`${190 * pageProps?.img?.ratio}`}
                key="ogImageWidth"
              />
              <meta
                property="og:image:height"
                content="190"
                key="ogImageHeight"
              />
            </>
          )}

        {(Number(pageProps?.img?.width || 0) < 380 ||
          Number(pageProps?.img?.height || 0) < 190) &&
          (pageProps?.img?.ratio || 2) > 2 && (
            <>
              <meta
                property="og:image:width"
                content="190"
                key="ogImageWidth"
              />
              <meta
                property="og:image:height"
                content={`${190 / pageProps?.img?.ratio}`}
                key="ogImageHeight"
              />
            </>
          )}

        {/* Facebook share */}
        <meta property="fb:app_id" content="235683754299627" />
        {/* FB 網域認證 */}
        <meta
          name="facebook-domain-verification"
          content="0nhoilk01sbhuznizbl4n00bu8141l"
        />
      </Head>
      <Script
        id="codox"
        src="https://app.codox.io/plugins/wave.client.js?apiKey=445bc3bd-da3d-483c-a367-a78730ff5a38&app=froala"
        strategy="lazyOnload"
      />
      {/* facebook shared script */}
      {/* <Script
        id="fb"
        dangerouslySetInnerHTML={{
          __html: `!function(f,b,e,v,n,t,s) {if(f.fbq)return;n=f.fbq=function(){n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)}; if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0'; n.queue=[];t=b.createElement(e);t.async=!0; t.src=v;s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s)}(window, document,'script', 'https://connect.facebook.net/en_US/fbevents.js'); fbq('init', '282679346954391'); fbq('track', 'PageView');`,
        }}
      /> */}
      {/* <GlobalStyles
        styles={{
          body: {
            overflowX: "auto",
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "6px",
            },

            "&::-webkit-scrollbar-track": {
              background: egTheme.egPalette.text[6],
            },

            "&::-webkit-scrollbar-thumb": {
              "-webkit-border-radius": "1000px",
              borderRadius: "1000px",
              backgroundColor: egTheme.egPalette.text[3],
            },
          },
        }}
      /> */}
      <CookiesProvider>
        <Provider store={store}>
          {/* <PersistGate loading={null} persistor={persistor}> */}
          {/* <EgThemeProvider theme={egTheme}> */}
          <SettingsProvider
            defaultSettings={{
              themeMode: "light", // 'light' | 'dark'
              themeDirection: "ltr", //  'rtl' | 'ltr'
              themeContrast: "default", // 'default' | 'bold'
              themeLayout: "vertical", // 'vertical' | 'horizontal' | 'mini'
              themeColorPresets: "blue", // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
              themeStretch: false,
            }}
          >
            <MinimalThemeProvider>
              <MotionLazy>
                <SnackbarProvider>
                  <ErrorBoundary>
                    <SWRConfig>
                      <TourComponent />
                      <SettingsDrawer />
                      <ProgressBar />
                      <GlobalAlertDialog />
                      <GlobalSnackbar
                        anchorOrigin={{
                          vertical: "top",
                          horizontal: "center",
                        }}
                        autoHideDuration={4000}
                        AlertProps={{
                          variant: "filled",
                        }}
                      />
                      <ConfirmDialog />
                      <ConfirmDeleteDialog />
                      <ConfirmOutsideClickDialog />
                      <ConfirmLeaveDialog />
                      <ConfirmPublishDialog />
                      <Component {...pageProps} />
                    </SWRConfig>
                  </ErrorBoundary>
                </SnackbarProvider>
              </MotionLazy>
            </MinimalThemeProvider>
          </SettingsProvider>
          {/* </EgThemeProvider> */}
          {/* </PersistGate> */}
        </Provider>
      </CookiesProvider>
    </>
  );
};

export default App;
