"use client";

import merge from "lodash/merge";
import { useMemo } from "react";
// @mui
import CssBaseline from "@mui/material/CssBaseline";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
  ThemeOptions,
  Theme,
} from "@mui/material/styles";
// locales
// import { useLocales } from "minimal/locales";
// components
import { useSettingsContext } from "minimal/components/settings";
// system
import { palette } from "./palette";
import { shadows } from "./shadows";
import { typography } from "./typography";
import { customShadows } from "./custom-shadows";
import { componentsOverrides } from "./overrides";
// options
import { presets } from "./options/presets";
import { darkMode } from "./options/dark-mode";
import { contrast } from "./options/contrast";
import RTL, { direction } from "./options/right-to-left";

// ----------------------------------------------------------------------

declare module "@mui/styles" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

type Props = {
  children: React.ReactNode;
};

export default function ThemeProvider({ children }: Props) {
  // const { currentLang } = useLocales();

  const settings = useSettingsContext();

  const darkModeOption = darkMode(settings.themeMode);

  const presetsOption = presets(settings.themeColorPresets);

  const contrastOption = contrast(
    settings.themeContrast === "bold",
    settings.themeMode
  );

  const directionOption = direction(settings.themeDirection);

  const baseOption = useMemo(
    () => ({
      palette: palette("light"),
      shadows: shadows("light"),
      customShadows: customShadows("light"),
      typography,
      shape: { borderRadius: 8 },
    }),

    []
  );

  const breakpoints = useMemo(
    () => ({
      breakpoints: {
        values: {
          xs: 0,
          sm: 600,
          md: 900,
          lg: 1280,
          xl: 1536,
        },
      },
    }),
    []
  );

  const memoizedValue = useMemo(
    () =>
      merge(
        // Base
        baseOption,
        // Direction: remove if not in use
        directionOption,
        // Dark mode: remove if not in use
        darkModeOption,
        // Presets: remove if not in use
        presetsOption,
        // Contrast: remove if not in use
        contrastOption.theme,
        //
        breakpoints
      ),
    [
      breakpoints,
      baseOption,
      directionOption,
      darkModeOption,
      presetsOption,
      contrastOption.theme,
    ]
  );

  const theme = createTheme(memoizedValue as unknown as ThemeOptions);

  theme.components = merge(
    componentsOverrides(theme),
    contrastOption.components
  );

  // const themeWithLocale = useMemo(
  //   () => createTheme(theme, currentLang.systemValue),
  //   [currentLang.systemValue, theme]
  // );

  return (
    <MuiThemeProvider theme={theme}>
      <RTL themeDirection={settings.themeDirection}>
        <CssBaseline />
        {children}
      </RTL>
    </MuiThemeProvider>
  );
}
