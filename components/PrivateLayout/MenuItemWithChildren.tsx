import React, { FC } from "react";

import clsx from "clsx";
import { makeStyles } from "@mui/styles";
import { Route } from "@eGroupAI/typings/apis";

import NextLink from "next/link";
import ListItem from "@eGroupAI/material/ListItem";
import ListItemButton from "@eGroupAI/material/ListItemButton";
import ListItemText from "@eGroupAI/material/ListItemText";
import ListItemIcon from "@eGroupAI/material/ListItemIcon";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useAppDispatch } from "redux/configureAppStore";
import { getSidebarItems } from "./selectors";
import { toggleSidebarItem } from "./actions";

import CustomExpand from "./CustomExpand";

const useStyles = makeStyles((theme) => ({
  itemButton: {
    textAlign: "center",
    padding: "0.3rem 1rem",
    borderRadius: "36px 0px 0px 36px",
    borderTopLeftRadius: 0,
    color: "white",
    cursor: "pointer",

    "&:hover": {
      background: "#356FA3",
    },

    "& .MuiListItemIcon-root": {
      minWidth: "unset",
      marginRight: theme.spacing(1),
      color: "white",
      "& .MuiSvgIcon-root": {
        width: 20,
        height: 20,
      },
    },
  },
  activeRouteItem: {
    background: "#05C7F2",
  },
  miniRouteItem: {
    justifyContent: "center",
    flexDirection: "column",
    borderRadius: 36,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    "& .MuiListItemIcon-root": {
      marginRight: "0",
    },
    "& .MuiTypography-root": {
      fontSize: "0.65rem",
    },
    "&$activeRouteItem": {
      borderRadius: "35px 0px 0px 35px",
      color: theme.palette.common.white,
      "& .MuiListItemIcon-root": {
        color: theme.palette.common.white,
      },
    },
  },
  collapse: {
    backgroundColor: theme.palette.primary.dark,
  },

  zIndex: {
    position: "relative",
    zIndex: 1202,
  },
}));
export interface MenuItemWithChildrenProps {
  routeItem: Route;
  shouldMiniItem: boolean;
  index: number;
  active: boolean;
  isEditorOpen: boolean;
  onClick?: () => void;
}

const MenuItemWithChildren: FC<MenuItemWithChildrenProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { active, routeItem, shouldMiniItem, index, isEditorOpen, onClick } =
    props;
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const items = useSelector(getSidebarItems);
  const open = items[index]?.isOpen;
  const { collapse } = routeItem;

  if (!collapse && routeItem.path) {
    return (
      <NextLink prefetch href={routeItem.path} passHref legacyBehavior>
        <ListItemButton
          component="a"
          className={clsx(classes.itemButton, {
            [classes.miniRouteItem]: true,
            [classes.activeRouteItem]: active,
            [classes.zIndex]: true,
          })}
          onClick={(e) => {
            if (isEditorOpen) {
              e.preventDefault();
            }
            if (onClick) {
              onClick();
            }
          }}
        >
          <ListItemIcon>{routeItem.menuIcon}</ListItemIcon>
          <ListItemText
            primary={
              wordLibrary &&
              routeItem.breadcrumbName &&
              wordLibrary[routeItem.breadcrumbName]
                ? wordLibrary[routeItem.breadcrumbName]
                : routeItem.breadcrumbName
            }
          />
        </ListItemButton>
      </NextLink>
    );
  }

  if (collapse && routeItem.routes && routeItem.routes.length > 0) {
    return (
      <>
        <ListItem
          className={clsx(classes.itemButton, {
            [classes.miniRouteItem]: true,
            [classes.activeRouteItem]: active,
            [classes.zIndex]: true,
          })}
          onClick={(e) => {
            e.preventDefault();
            dispatch(toggleSidebarItem(index));
          }}
        >
          <ListItemIcon>{routeItem.menuIcon}</ListItemIcon>
          <ListItemText
            primary={
              wordLibrary &&
              routeItem.breadcrumbName &&
              wordLibrary[routeItem.breadcrumbName]
                ? wordLibrary[routeItem.breadcrumbName]
                : routeItem.breadcrumbName
            }
          />
          {/* {!shouldMiniItem && !isMobile && open && <ExpandMoreIcon />}
          {!shouldMiniItem && !isMobile && !open && <ChevronRightIcon />} */}
        </ListItem>

        <CustomExpand
          shouldMiniItem={shouldMiniItem}
          open={open}
          routeItems={routeItem}
          isEditorOpen={isEditorOpen}
          onClick={() => {
            if (onClick) {
              onClick();
            }
          }}
        />
      </>
    );
  }

  return null;
};

export default MenuItemWithChildren;
