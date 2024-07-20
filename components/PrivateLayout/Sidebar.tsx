import React, { FC, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@mui/styles";
import { CSSObject, styled, Theme } from "@mui/material/styles";
import { useAppDispatch } from "redux/configureAppStore";
import useFiltedRoutes from "utils/useFiltedRoutes";

import Image from "next/legacy/image";
import NextLink from "next/link";
import ClickAwayListener from "@eGroupAI/material/ClickAwayListener";
import Link from "@eGroupAI/material/Link";
import Drawer from "@eGroupAI/material/Drawer";
import SwipeableDrawer from "@eGroupAI/material/SwipeableDrawer";
import Box from "@eGroupAI/material/Box";
import List from "@eGroupAI/material/List";
import MenuItemWithChildren from "./MenuItemWithChildren";

import {
  clickSidebarItem,
  closeSidebarMobile,
  openSidebarMobile,
  toggleSidebarItem,
  toggleSidebarMobile,
} from "./actions";
import {
  MOBILE_DRAWER_CLOSED_WIDTH,
  PC_DRAWER_CLOSED_WIDTH,
  PC_DRAWER_OPENED_WIDTH,
} from "./utils";
import { getSidebarActiveLink, getSidebarItems } from "./selectors";

const openedMixin = (theme: Theme): CSSObject => ({
  width: PC_DRAWER_OPENED_WIDTH,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: PC_DRAWER_CLOSED_WIDTH,
  [theme.breakpoints.down("md")]: {
    width: MOBILE_DRAWER_CLOSED_WIDTH,
  },
});

const DesktopDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: PC_DRAWER_OPENED_WIDTH,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    boxShadow: theme.shadows[3],
    "& .MuiDrawer-paper": {
      background: theme.palette.primary.main,
      border: "none",
      height: "105%",

      "&::-webkit-scrollbar": {
        width: 0,
        background: "transparent",
      },
    },
  },
  drawer: {
    [theme.breakpoints.down("md")]: {
      width: "84px",
    },
    marginBottom: "50px",
  },
  logoContainer: {
    [theme.breakpoints.down("md")]: {
      width: "84px",
    },
    zIndex: 10000000,
    padding: "15px 0 80px 10px",
  },
  sidebarLogoContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    width: "100%",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(12),
    paddingLeft: theme.spacing(0),
    textAlign: "left",
    zIndex: theme.zIndex.drawer + 2,
    position: "relative",
  },
  brand: {
    color: "white",
    fontSize: "1.5rem",
    lineHeight: "1.5",
  },
  toggleMenuBtn: {
    width: 20,
    height: 46,
    borderRadius: "8px",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    background: `${theme.palette.primary.light} !important`,
  },
}));

export interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  isEditorOpen: boolean;
  onClick?: () => void;
}

export interface SidebarItemClickProps {
  activeLink: string | undefined;
  index: number;
  type?: boolean;
}

const Sidebar: FC<SidebarProps> = function (props) {
  const { isOpen, isMobile, isEditorOpen, onClick } = props;
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const filtedRoutes = useFiltedRoutes([]);
  const activeLink = useSelector(getSidebarActiveLink);
  const items = useSelector(getSidebarItems);

  const closeSidebarHandler = useCallback(() => {
    const openedItemIndex = items.findIndex((p) => p?.isOpen);
    if (openedItemIndex >= 0) dispatch(toggleSidebarItem(openedItemIndex));
  }, [items, dispatch]);

  const list = useMemo(
    () => (
      <>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            zIndex: "1201",
            position: "absolute",
            backgroundColor: "#034C8C",
          }}
        />
        <div className={classes.drawer}>
          <div className={classes.sidebarHeader}>
            <div className={classes.sidebarLogoContainer}>
              <NextLink prefetch href="/me" passHref legacyBehavior>
                <Link
                  variant="body1"
                  className={classes.brand}
                  underline="none"
                  onClick={(e) => {
                    if (isEditorOpen) {
                      e.preventDefault();
                    }
                    if (onClick) {
                      onClick();
                    }
                  }}
                >
                  <Image src="/events/logo.svg" width="70" height="70" />
                </Link>
              </NextLink>
            </div>
            <Box flexGrow={1} />
          </div>
          <List disablePadding>
            {filtedRoutes
              ?.filter((el) => !!el.breadcrumbName)
              .map((el, index) => (
                <div
                  key={el.breadcrumbName}
                  role="button"
                  tabIndex={0}
                  onKeyDown={() => {}}
                  onClick={() => {
                    dispatch(
                      clickSidebarItem({
                        activeLink: el.breadcrumbName ?? "",
                        index,
                        type: el.collapse,
                      })
                    );
                  }}
                >
                  <MenuItemWithChildren
                    index={index}
                    routeItem={el}
                    shouldMiniItem={!isOpen}
                    active={el.breadcrumbName === activeLink}
                    isEditorOpen={isEditorOpen}
                    onClick={() => {
                      if (isMobile) {
                        dispatch(toggleSidebarMobile());
                      } else {
                        closeSidebarHandler();
                      }

                      if (onClick) {
                        onClick();
                      }
                    }}
                  />
                </div>
              ))}
          </List>
        </div>
        <Box flexGrow={1} />
      </>
    ),
    [
      classes.drawer,
      classes.sidebarHeader,
      classes.sidebarLogoContainer,
      classes.brand,
      filtedRoutes,
      isEditorOpen,
      onClick,
      isOpen,
      activeLink,
      dispatch,
      isMobile,
      closeSidebarHandler,
    ]
  );

  if (isMobile) {
    return (
      <SwipeableDrawer
        variant="temporary"
        open={isOpen}
        className={classes.root}
        onClose={() => {
          dispatch(closeSidebarMobile());
        }}
        onOpen={() => {
          dispatch(openSidebarMobile());
        }}
      >
        {list}
      </SwipeableDrawer>
    );
  }

  return (
    <ClickAwayListener onClickAway={() => closeSidebarHandler()}>
      <DesktopDrawer variant="permanent" open={false} className={classes.root}>
        {list}
      </DesktopDrawer>
    </ClickAwayListener>
  );
};

export default Sidebar;
