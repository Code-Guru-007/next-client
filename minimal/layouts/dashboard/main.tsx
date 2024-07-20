// @mui
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Box, { BoxProps } from "@mui/material/Box";

import { makeStyles } from "@mui/styles";
// hooks
import { useResponsive } from "minimal/hooks/use-responsive";
// components
import { useSettingsContext } from "minimal/components/settings";

import { useSelector } from "react-redux";
//
import { HEADER, NAV } from "../config-layout";

import Breadcrumbs from "./breadcrumbs";
import { getBreadcrumbProps } from "./selectors";

// ----------------------------------------------------------------------

const useStyles = makeStyles(() => ({
  subNavbar: {
    display: "flex",
    boxShadow: "none",
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "none",
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 999,
  },
  showLoader: {
    display: "flex",
  },
  lightOpacity: {
    background: "rgba(255,255,255,0.6)",
  },
  darkOpacity: {
    background: "rgba(33, 43, 54, 0.6)",
  },
}));

const SPACING = 8;

interface MainProps extends BoxProps {
  subNavbarText?: React.ReactNode;
  hideBreadcrumbs?: boolean;
  isLoading?: boolean;
  actions?: React.ReactNode;
  paddingGutter?: number;
  customPadding?: number;
  actionsButton?: React.ReactNode;
}

export default function Main({
  children,
  sx,
  subNavbarText,
  hideBreadcrumbs,
  isLoading,
  actions,
  paddingGutter,
  customPadding = 0,
  actionsButton,
  ...other
}: MainProps) {
  const settings = useSettingsContext();
  const { pathname } = useRouter();
  const classes = useStyles();

  const breadcrumbProps = useSelector(getBreadcrumbProps);

  const lgUp = useResponsive("up", "lg");

  const isNavHorizontal = settings.themeLayout === "horizontal";

  const isNavMini = settings.themeLayout === "mini";

  const [headerHeight, setHeaderHeight] = useState(0);
  const [navbarHeight, setNavbarHeight] = useState(0);

  const handleResize = useCallback(() => {
    const headerElement = document.querySelector("header.MuiPaper-root");
    const hHeight = headerElement ? headerElement.clientHeight : 0;

    // horizontal layout navbar
    const navElement = document.querySelector("nav.MuiPaper-root");
    const nHeight = navElement ? navElement.clientHeight : 0;

    setHeaderHeight(hHeight);
    setNavbarHeight(nHeight);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  useEffect(() => {
    const headerElement = document.querySelector("header.MuiPaper-root");
    const hHeight = headerElement ? headerElement.clientHeight : 0;

    // horizontal layout navbar
    const navElement = document.querySelector("nav.MuiPaper-root");
    const nHeight = navElement ? navElement.clientHeight : 0;

    setHeaderHeight(hHeight);
    setNavbarHeight(nHeight);
  }, []);

  const headerElement = document.querySelector("header.MuiPaper-root");
  const hHeight = headerElement ? headerElement.clientHeight : 0;

  // horizontal layout navbar
  const navElement = document.querySelector("nav.MuiPaper-root");
  const nHeight = navElement ? navElement.clientHeight : 0;

  useEffect(() => {
    setHeaderHeight(hHeight);
    setNavbarHeight(nHeight);
  }, [hHeight, nHeight]);

  const subNavbar = subNavbarText;
  const breadcrumbRender = (
    <div className={classes.subNavbar}>
      {!hideBreadcrumbs && (
        <Breadcrumbs {...breadcrumbProps} subNavbar={subNavbar} />
      )}
      <Box flexGrow={1} />
      {actions}
    </div>
  );

  if (isNavHorizontal) {
    return (
      <Box
        component="main"
        sx={{
          minHeight: 1,
          display: "flex",
          flexDirection: "column",
          pb: 10,
          pt: `${headerHeight + navbarHeight + customPadding}px`,
        }}
      >
        {breadcrumbRender}
        {children}
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        ...(!lgUp && {
          py: `${headerHeight + customPadding}px`,
        }),
        pb:
          pathname === "/me/articles/[articleId]/edit" ||
          pathname === "/me/bulletins/[bulletinId]/edit"
            ? "0px"
            : `${HEADER.H_MOBILE * 2 + SPACING}px`,
        ...(lgUp && {
          px: 2,
          py: `${headerHeight + customPadding}px`,
          width: `calc(100% - ${NAV.W_VERTICAL}px)`,
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MINI}px)`,
          }),
        }),
        ...sx,
      }}
      {...other}
    >
      {breadcrumbRender}
      {children}
    </Box>
  );
}
