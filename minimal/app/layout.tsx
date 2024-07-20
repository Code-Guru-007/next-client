// i18n
import "minimal/locales/i18n";

// scroll bar
import "simplebar-react/dist/simplebar.min.css";

// lightbox
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

// map
import "mapbox-gl/dist/mapbox-gl.css";

// editor
import "react-quill/dist/quill.snow.css";

// slick-carousel
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// lazy image
import "react-lazy-load-image-component/src/effects/blur.css";

// ----------------------------------------------------------------------

// redux
import ReduxProvider from "minimal/redux/redux-provider";
// locales
import { LocalizationProvider } from "minimal/locales";
// theme
import ThemeProvider from "minimal/theme";
// components
import ProgressBar from "minimal/components/progress-bar";
import MotionLazy from "minimal/components/animate/motion-lazy";
import SnackbarProvider from "minimal/components/snackbar/snackbar-provider";
import { SettingsProvider, SettingsDrawer } from "minimal/components/settings";
// auth
import { AuthProvider, AuthConsumer } from "minimal/auth/context/jwt";
// import { AuthProvider, AuthConsumer } from 'minimal/auth/context/auth0';
// import { AuthProvider, AuthConsumer } from 'minimal/auth/context/amplify';
// import { AuthProvider, AuthConsumer } from 'minimal/auth/context/firebase';

// ----------------------------------------------------------------------

export const metadata = {
  title: "Minimal UI Kit",
  description:
    "The starting point for your next project with Minimal UI Kit, built on the newest version of Material-UI ©, ready to be customized to your style",
  keywords: "react,material,kit,application,dashboard,admin,template",
  themeColor: "#000000",
  manifest: "/manifest.json",
  icons: [
    {
      rel: "icon",
      url: "/favicon/favicon.ico",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/favicon/favicon-16x16.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/favicon/favicon-32x32.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      url: "/favicon/apple-touch-icon.png",
    },
  ],
};

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body style={{ height: "auto", minHeight: "100%" }}>
        <AuthProvider>
          <ReduxProvider>
            <LocalizationProvider>
              <SettingsProvider
                defaultSettings={{
                  themeMode: "light", // 'light' | 'dark'
                  themeDirection: "ltr", //  'rtl' | 'ltr'
                  themeContrast: "default", // 'default' | 'bold'
                  themeLayout: "vertical", // 'vertical' | 'horizontal' | 'mini'
                  themeColorPresets: "default", // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
                  themeStretch: false,
                }}
              >
                <ThemeProvider>
                  <MotionLazy>
                    <SnackbarProvider>
                      <SettingsDrawer />
                      <ProgressBar />
                      <AuthConsumer>{children}</AuthConsumer>
                    </SnackbarProvider>
                  </MotionLazy>
                </ThemeProvider>
              </SettingsProvider>
            </LocalizationProvider>
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
