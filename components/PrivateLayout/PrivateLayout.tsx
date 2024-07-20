import React, { ReactNode, FC, useMemo, useCallback } from "react";

import useFiltedRoutes from "utils/useFiltedRoutes";
import { useRouter } from "next/router";
import { useMediaQuery } from "@mui/material";
import useSetSelectedOrgId from "@eGroupAI/hooks/apis/useSetSelectedOrgId";
import clsx from "clsx";
import { makeStyles, useTheme } from "@mui/styles";
import { useSelector } from "react-redux";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import useWordLibrary from "@eGroupAI/hooks/useWordLibrary";

import Center from "@eGroupAI/material-layout/Center";
import Head from "next/head";
import Box from "@eGroupAI/material/Box";
import CircularProgress from "@eGroupAI/material/CircularProgress";
import Typography from "@eGroupAI/material/Typography";
import ImportUsersDialog from "components/ImportUsersDialog";
import iterationAndFindRoutes from "utils/iterationAndFindRoutes";
import useOrgMemberModules from "@eGroupAI/hooks/apis/useOrgMemberModules";
import useGetUnreadMessageCounts from "@eGroupAI/hooks/apis/useGetUnreadMessageCounts";
import { getOpenStatus } from "redux/froalaEditor/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSettingsContext } from "minimal/components/settings";
import Breadcrumbs from "./Breadcrumbs";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  getBreadcrumbProps,
  getSidebarIsOpen,
  getSidebarIsMobileOpen,
} from "./selectors";
import { PC_DRAWER_CLOSED_WIDTH } from "./utils";
import BackToTop from "./BackToTop";

type PrivateLayoutProps = {
  children?: ReactNode;
  title?: string;
  subNavbarText?: ReactNode;
  actions?: ReactNode;
  hideBreadcrumbs?: boolean;
  isLoading?: boolean;
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    "& .PrivateSwipeArea-root": {
      width: "0px !important",
    },
  },
  mainPanel: {
    width: `calc(100% - ${PC_DRAWER_CLOSED_WIDTH}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
  },
  mainPanelShift: {
    width: `calc(100% - ${PC_DRAWER_CLOSED_WIDTH}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
  },
  contentWrapper: {
    minHeight: "calc(100vh - 23px)",
    backgroundColor: "#f5f6fa",
  },
  subNavbar: {
    display: "flex",
    alignItems: "center",
    position: "sticky",
    top: 84,
    padding: "14px 14px 14px 20px",
    background: theme.palette.common.white,
    borderTop: `1px solid ${theme.palette.divider}`,
    zIndex: theme.zIndex.appBar - 1,
    boxShadow: "none",

    [theme.breakpoints.down("md")]: {
      top: 60,
    },
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

const PrivateLayout: FC<PrivateLayoutProps> = function PrivateLayout(props) {
  const { wordLibrary } = useWordLibrary();
  const {
    children,
    title = "InfoCenter 智能平台",
    actions,
    hideBreadcrumbs,
    subNavbarText,
    isLoading = false,
  } = props;
  const classes = useStyles();
  const organizationId = useSelector(getSelectedOrgId);
  const sidebarIsOpen = useSelector(getSidebarIsOpen);
  const sidebarIsMobileOpen = useSelector(getSidebarIsMobileOpen);
  const breadcrumbProps = useSelector(getBreadcrumbProps);
  const editorIsOpen = useSelector(getOpenStatus);
  const theme = useTheme();
  const settings = useSettingsContext();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isOpen = isMobile ? sidebarIsMobileOpen : sidebarIsOpen;
  const router = useRouter();
  const availableRoutes = useFiltedRoutes();
  const foundRoutes = useMemo(() => {
    if (availableRoutes) {
      return iterationAndFindRoutes(availableRoutes, router.pathname);
    }
    return undefined;
  }, [availableRoutes, router.pathname]);
  const { data: memberModules } = useOrgMemberModules({
    organizationId,
  });
  const { data: unreadMessageCounts } = useGetUnreadMessageCounts({
    organizationId,
  });
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>("globalSnackbar");

  const redirectToFirstAvailableModule = useCallback(() => {
    openSnackbar({
      message:
        wordLibrary?.["you do not have permission to perform this operation"] ??
        "您沒有操作權限",
      severity: "error",
    });
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
  }, [openSnackbar, memberModules, availableRoutes, router, wordLibrary]);

  useSetSelectedOrgId();

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

  const popupUnSavedData = () => {
    if (editorIsOpen) {
      openSnackbar({
        message: "您的資料還未保存，請確認並進行儲存，以免重要資訊的遺失。",
        severity: "error",
      });
    }
  };

  return (
    <>
      <ImportUsersDialog />
      <div>
        <Head>
          <title>{title}</title>
        </Head>
        <div className={classes.root}>
          <Sidebar
            isOpen={isOpen}
            isMobile={isMobile}
            isEditorOpen={editorIsOpen}
            onClick={() => {
              popupUnSavedData();
            }}
          />
          <div
            className={clsx({
              [classes.mainPanel]: !isMobile,
              [classes.mainPanelShift]: true,
            })}
          >
            <div className={classes.contentWrapper}>
              <Navbar
                sidebarIsOpen={isOpen}
                isMobile={isMobile}
                unreadMessageCounts={unreadMessageCounts}
                isEditorOpen={editorIsOpen}
                onClick={() => {
                  popupUnSavedData();
                }}
              />
              <div className={classes.subNavbar}>
                {!hideBreadcrumbs && (
                  <Breadcrumbs
                    isEditorOpen={editorIsOpen}
                    onClick={() => {
                      popupUnSavedData();
                    }}
                    {...breadcrumbProps}
                  />
                )}
                {isLoading ? (
                  <div
                    className={clsx(
                      classes.loader,
                      isLoading && classes.showLoader,
                      {
                        [classes.lightOpacity]: settings.themeMode === "light",
                        [classes.darkOpacity]: settings.themeMode !== "light",
                      }
                    )}
                  >
                    <CircularProgress />
                  </div>
                ) : (
                  subNavbarText
                )}
                <Box flexGrow={1} />
                {actions}
              </div>
              {renderContent()}
            </div>
            <BackToTop />
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivateLayout;
