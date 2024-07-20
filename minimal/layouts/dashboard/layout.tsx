import React, { useMemo, useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
// @mui
import Box from "@mui/material/Box";

// hooks
import { useBoolean } from "minimal/hooks/use-boolean";
import { useResponsive } from "minimal/hooks/use-responsive";
// components
import { useSettingsContext } from "minimal/components/settings";
//
import { useSelector } from "react-redux";
import { getOpenStatus } from "redux/froalaEditor/selectors";
import Center from "@eGroupAI/material-layout/Center";
import CircularProgress from "@eGroupAI/material/CircularProgress";
import Typography from "@eGroupAI/material/Typography";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useSetSelectedOrgId from "@eGroupAI/hooks/apis/useSetSelectedOrgId";
import useOrgMemberModules from "@eGroupAI/hooks/apis/useOrgMemberModules";
import iterationAndFindRoutes from "utils/iterationAndFindRoutes";
import useFiltedRoutes from "utils/useFiltedRoutes";

import apis from "utils/apis";
import { useCookies } from "react-cookie";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { logout as logoutAction } from "components/PrivateLayout/actions";
import { useAppDispatch } from "redux/configureAppStore";
import { OrganizationMemberRole } from "@eGroupAI/typings/apis";

//
import clsx from "clsx";
import { makeStyles } from "@mui/styles";
import Main from "./main";
import Header from "./header";
import NavMini from "./nav-mini";
import NavVertical from "./nav-vertical";
import NavHorizontal from "./nav-horizontal";
import BackToTop from "./back-to-top";

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

type Props = {
  children: React.ReactNode;
  title?: string;
  subNavbarText?: React.ReactNode;
  actions?: React.ReactNode;
  actionsButton?: React.ReactNode;
  hideBreadcrumbs?: boolean;
  isLoading?: boolean;
  paddingGutter?: number;
  paddingAdditional?: number;
  responsiveBreadcrumbs?: boolean;
  hideHeader?: boolean;
};

export default function DashboardLayout({
  children,
  title,
  subNavbarText,
  actions,
  hideBreadcrumbs,
  isLoading,
  actionsButton,
  paddingGutter,
  paddingAdditional,
  responsiveBreadcrumbs,
  hideHeader = false,
}: Props) {
  const settings = useSettingsContext();

  const lgUp = useResponsive("up", "lg");

  const nav = useBoolean();

  const classes = useStyles();

  const organizationId = useSelector(getSelectedOrgId);

  const editorIsOpen = useSelector(getOpenStatus);

  const [memberModules, setMemberModules] =
    useState<OrganizationMemberRole[]>();
  const { data: memberModulesData } = useOrgMemberModules(
    {
      organizationId,
    },
    undefined,
    undefined,
    !!memberModules
  );
  if (memberModulesData) {
    setMemberModules(memberModulesData);
  }

  const router = useRouter();
  const availableRoutes = useFiltedRoutes();
  const foundRoutes = useMemo(() => {
    if (availableRoutes) {
      return iterationAndFindRoutes(availableRoutes, router.pathname);
    }
    return undefined;
  }, [availableRoutes, router.pathname]);

  const redirectToFirstAvailableModule = useCallback(() => {
    if (memberModules && memberModules.length > 0 && availableRoutes) {
      // To find first route.
      const firstModuleRoute = availableRoutes.find(
        (mainRoute) =>
          mainRoute.path !== undefined ||
          mainRoute.routes?.find((subRoute) => subRoute.path !== undefined)
            ?.path !== undefined
      );
      const firstPath =
        firstModuleRoute?.path ||
        firstModuleRoute?.routes?.find(
          (subRoute) => subRoute.path !== undefined
        )?.path;

      router.replace(firstPath || "/me");
    }
  }, [memberModules, availableRoutes, router]);

  useSetSelectedOrgId();

  const isHorizontal = settings.themeLayout === "horizontal";

  const isMini = settings.themeLayout === "mini";

  const renderNavMini = (
    <NavMini
      isEditorOpen={editorIsOpen}
      onClick={() => {
        popupUnSavedData();
      }}
    />
  );

  const renderHorizontal = <NavHorizontal />;

  const renderNavVertical = (
    <NavVertical
      openNav={nav.value}
      onCloseNav={nav.onFalse}
      isEditorOpen={editorIsOpen}
      onClick={() => {
        popupUnSavedData();
      }}
    />
  );

  const subNavbar = isLoading ? (
    <div
      className={clsx(classes.loader, isLoading && classes.showLoader, {
        [classes.lightOpacity]: settings.themeMode === "light",
        [classes.darkOpacity]: settings.themeMode !== "light",
      })}
    >
      <CircularProgress />
    </div>
  ) : (
    subNavbarText
  );

  const renderContent = () => {
    if (!foundRoutes || !memberModules) {
      return (
        <Center offsetTop={117}>
          <CircularProgress />
        </Center>
      );
    }
    if (memberModules.length === 0) {
      return (
        <Center offsetTop={117}>
          <div>
            <Typography variant="h4" align="center" gutterBottom>
              無訪問權限
            </Typography>
            <Typography variant="h6" align="center">
              請聯絡您的管理員取得權限
            </Typography>
          </div>
        </Center>
      );
    }
    if (foundRoutes.length === 0 && router.asPath !== "/me") {
      return redirectToFirstAvailableModule();
    }
    return children;
  };

  const popupUnSavedData = () => {};

  const { excute: logout } = useAxiosApiWrapper(apis.member.logout, "None");
  const [, , removeCookie] = useCookies();
  const dispatch = useAppDispatch();

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace("/login");
    window.localStorage.clear();
    removeCookie("lid");
    removeCookie("tid");
    removeCookie("m_info");
    removeCookie("XSRF-TOKEN");
    dispatch(logoutAction());
  }, [dispatch, logout, removeCookie, router]);

  const checkUserActivity = useCallback(() => {
    const rememberMe = localStorage.getItem("rememberMe");

    const lastActivityTime = localStorage.getItem("lastActivityTime");
    const currentTime = Date.now();
    const inactivityDuration = currentTime - Number(lastActivityTime);
    const twoHoursInMilliseconds = 2 * 60 * 60 * 1000;
    if (rememberMe !== "true" && inactivityDuration >= twoHoursInMilliseconds) {
      handleLogout();
    }
  }, [handleLogout]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    function handleUserActivity() {
      const currentTime = Date.now();
      localStorage.setItem("lastActivityTime", currentTime.toString());
    }

    const rememberMe = localStorage.getItem("rememberMe");

    if (rememberMe !== "true") {
      localStorage.setItem("lastActivityTime", Date.now().toString());

      const intervalId = setInterval(checkUserActivity, 60 * 1000);
      window.addEventListener("mousemove", handleUserActivity);
      window.addEventListener("keydown", handleUserActivity);
      window.addEventListener("scroll", handleUserActivity);

      return () => {
        window.removeEventListener("mousemove", handleUserActivity);
        window.removeEventListener("keydown", handleUserActivity);
        window.removeEventListener("scroll", handleUserActivity);
        clearInterval(intervalId);
      };
    }
  }, [checkUserActivity]);

  if (isHorizontal) {
    return (
      <>
        <Head>
          <title>{title}</title>
        </Head>
        {!hideHeader && (
          <Header
            responsiveBreadcrumbs={responsiveBreadcrumbs}
            onOpenNav={nav.onTrue}
            isEditorOpen={editorIsOpen}
            onClick={() => {
              popupUnSavedData();
            }}
            hideBreadcrumbs={hideBreadcrumbs}
            isLoading={isLoading}
            subNavbarText={subNavbarText}
            actions={actions}
            actionsButton={actionsButton}
          />
        )}

        {lgUp ? renderHorizontal : renderNavVertical}
        <Main
          hideBreadcrumbs
          isLoading={isLoading}
          actionsButton={actionsButton}
          subNavbarText={subNavbar}
          actions={actions}
          paddingGutter={paddingGutter}
          customPadding={paddingAdditional}
        >
          {renderContent()}
          <BackToTop />
        </Main>
      </>
    );
  }

  if (isMini) {
    return (
      <>
        <Head>
          <title>{title}</title>
        </Head>
        {!hideHeader && (
          <Header
            responsiveBreadcrumbs={responsiveBreadcrumbs}
            onOpenNav={nav.onTrue}
            isEditorOpen={editorIsOpen}
            onClick={() => {
              popupUnSavedData();
            }}
            hideBreadcrumbs={hideBreadcrumbs}
            isLoading={isLoading}
            subNavbarText={subNavbarText}
            actions={actions}
            actionsButton={actionsButton}
          />
        )}

        <Box
          sx={{
            display: { lg: "flex" },
            minHeight: { lg: 1 },
          }}
        >
          {lgUp ? renderNavMini : renderNavVertical}
          <Main
            hideBreadcrumbs
            isLoading={isLoading}
            subNavbarText={subNavbarText}
            actions={actions}
            paddingGutter={paddingGutter}
            customPadding={paddingAdditional}
          >
            {renderContent()}
            <BackToTop />
          </Main>
        </Box>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      {!hideHeader && (
        <Header
          responsiveBreadcrumbs={responsiveBreadcrumbs}
          onOpenNav={nav.onTrue}
          isEditorOpen={editorIsOpen}
          onClick={() => {
            popupUnSavedData();
          }}
          hideBreadcrumbs={hideBreadcrumbs}
          isLoading={isLoading}
          subNavbarText={subNavbarText}
          actions={actions}
          actionsButton={actionsButton}
        />
      )}

      <Box
        sx={{
          display: { lg: "flex" },
          minHeight: { lg: 1 },
        }}
      >
        {renderNavVertical}
        <Main
          hideBreadcrumbs
          isLoading={isLoading}
          subNavbarText={subNavbar}
          actions={actions}
          paddingGutter={paddingGutter}
          customPadding={paddingAdditional}
        >
          {renderContent()}
          <BackToTop />
        </Main>
      </Box>
    </>
  );
}
