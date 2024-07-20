import React, { FC, useState } from "react";
import { useSelector } from "react-redux";

import { useRouter } from "next/router";
import { makeStyles } from "@mui/styles";
import { useCookies } from "react-cookie";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { Member, Route, Organization } from "@eGroupAI/typings/apis";
import {
  getSelectedOrgId,
  setSelectedOrg,
} from "@eGroupAI/redux-modules/memberOrgs";

import { useAppDispatch } from "redux/configureAppStore";
import filterRoutes from "@eGroupAI/hooks/apis/useFilterRoutes/filterRoutes";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import useMemberOrgs from "@eGroupAI/hooks/apis/useMemberOrgs";
import Tooltip from "@eGroupAI/material/Tooltip";
import Radio from "@eGroupAI/material/Radio";
import moduleRouteMapping from "utils/moduleRouteMapping";
import routes from "utils/routes";

import MenuItem from "components/MenuItem";
import {
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  ListItem,
  ListItemAvatar,
  Box,
  ListItemButton,
} from "@eGroupAI/material";
import CachedIcon from "@mui/icons-material/CachedRounded";
import ExitToAppIcon from "@mui/icons-material/ExitToAppRounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardIosRounded";
import ArrowBackIcon from "@mui/icons-material/ArrowBackRounded";
import clsx from "clsx";

import { logout as logoutAction } from "./actions";
import { getGlobalLocale } from "./selectors";

export interface UserDropDownMenuProps {
  memberInfo: Member;
}

const useStyles = makeStyles((theme) => ({
  headerItem: {
    position: "sticky",
    top: 0,
    background: theme.palette.common.white,
    zIndex: 10,
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    minWidth: "330px",
  },
  avatarWrapper: {
    display: "flex",
    justifyContent: "center",
    minWidth: "50px",
    marginRight: "5px",
  },
  itemContent: {
    display: "flex",
    minWidth: "250px",
    whiteSpace: "nowrap",
    alignItems: "center",
  },
  iconButton: {
    width: "40px",
    height: "40px",
    borderRadius: "40px",
    padding: 0,
    display: "flex",
    justifyContent: "flex-end",
    "& .MuiListItemIcon-root": {
      minWidth: "unset",
      color: theme.palette.grey[300],
    },
  },
  iconButtonNoHover: {
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  nameAvatar: {
    background: theme.palette.primary.main,
    width: 40,
    height: 40,
    fontSize: theme.typography.pxToRem(14),
  },
  iconAvatar: {
    width: 40,
    height: 40,
    color: theme.palette.grey[300],
    background: theme.palette.grey[600],
  },
  backAvatar: {
    width: 40,
    height: 40,
    color: theme.palette.grey[50],
    background: "none",
  },
  titleContent: {
    "& span": {
      marginLeft: 10,
      width: 245,
      overflow: "hidden",
      textOverflow: "ellipsis",
      wordBreak: "break-all",
    },
  },
}));

const UserDropDownMenu: FC<UserDropDownMenuProps> = function (props) {
  const { memberInfo } = props;
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const locale = useSelector(getGlobalLocale);
  const { data: orgs } = useMemberOrgs(undefined, { locale });
  const selectedOrgId = useSelector(getSelectedOrgId);
  const [, , removeCookie] = useCookies();
  const firstName = memberInfo?.memberName.split(" ")[0];
  const secondName = memberInfo?.memberName.split(" ")[1];
  let fLetter: string | undefined;
  let sLetter: string | undefined;
  if (firstName) fLetter = firstName[0] as string;
  if (secondName) sLetter = secondName[0] as string;
  const avatarLetters = fLetter?.concat(sLetter || "");

  const rootRoutes = filterRoutes(moduleRouteMapping, routes, [
    "SETTINGS_PRIVACY",
    "SUPPORT",
  ]);

  const [navDepth, setNavDepth] = useState<number>(0);
  const [parentRoute, setParentRoute] = useState<Route | null>(null);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [avaiableRoutes, setAvailableRoutes] = useState<Route[] | undefined>(
    rootRoutes
  );
  const wordLibrary = useSelector(getWordLibrary);

  const { excute: logout } = useAxiosApiWrapper(apis.member.logout, "None");

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
    window.localStorage.clear();
    removeCookie("lid");
    removeCookie("tid");
    removeCookie("m_info");
    removeCookie("XSRF-TOKEN");
    dispatch(logoutAction());
  };

  const handleClickMenu = (route: Route, navDepth: number) => {
    if (!route?.collapse && route?.path) {
      router.replace(route.path);
      return;
    }
    if (route?.collapse && route?.routes?.length !== 0) {
      if (currentRoute) setParentRoute(currentRoute);
      setCurrentRoute(route);
      setNavDepth(navDepth + 1);
      setAvailableRoutes(route?.routes);
    }
  };

  const handleBackNav = (navDepth: number) => {
    if (navDepth === 1) {
      setParentRoute(null);
      setCurrentRoute(null);
      setAvailableRoutes(rootRoutes);
      setNavDepth(navDepth - 1);
      return;
    }
    if (navDepth > 1) {
      if (parentRoute) setCurrentRoute(parentRoute);
      setNavDepth(navDepth - 1);
    }
  };

  const handleOrganization = (org: Organization) => {
    dispatch(setSelectedOrg(org));
    window.localStorage.setItem("selectedOrgId", org.organizationId);
    switch (router.route) {
      case "/me/crm/users/[userId]":
        router.push("/me/crm/users");
        break;
      case "/me/crm/partners/[partnerId]":
        router.push("/me/crm/partners");
        break;
      case "/me/event/events/[eventId]":
        router.push("/me/event/events");
        break;
      case "/me/bulletins/[bulletinId]":
        router.push("/me/bulletins");
        break;
      case "/me/members/list/[memberId]":
        router.push("/me/members/list");
        break;
      case "/me/articles/[articleId]":
        router.push("/me/articles");
        break;
      case "/me/ses-template/[organizationSesTemplateId]":
        router.push("/me/ses-template");
        break;
      case "/me/sms-template/[organizationSesTemplateId]":
        router.push("/me/sms-template");
        break;
      default:
        router.reload();
        break;
    }
  };

  return (
    <>
      <Box className={classes.headerItem}>
        {navDepth === 0 && (
          <ListItem className={classes.listItem}>
            <Box className={classes.itemContent}>
              <ListItemAvatar className={classes.avatarWrapper}>
                <Avatar className={classes.nameAvatar}>
                  {avatarLetters?.toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText>{memberInfo?.memberName}</ListItemText>
            </Box>
            <Tooltip title={wordLibrary?.["select organization"] ?? "選擇組織"}>
              <ListItemButton
                className={classes.iconButton}
                onClick={() => {
                  setNavDepth(-1);
                }}
              >
                <ListItemIcon>
                  <CachedIcon />
                </ListItemIcon>
              </ListItemButton>
            </Tooltip>
          </ListItem>
        )}
        {navDepth > 0 && currentRoute && (
          <MenuItem
            className={classes.listItem}
            onClick={() => handleBackNav(navDepth)}
          >
            <Box className={classes.itemContent}>
              <ListItemAvatar className={classes.avatarWrapper}>
                <Avatar className={classes.backAvatar}>
                  <ArrowBackIcon />
                </Avatar>
              </ListItemAvatar>
              {/* <ListItemText>{currentRoute?.breadcrumbName}</ListItemText> */}
              <ListItemText
                primary={
                  wordLibrary &&
                  currentRoute.breadcrumbName &&
                  wordLibrary[currentRoute.breadcrumbName]
                    ? wordLibrary[currentRoute.breadcrumbName]
                    : currentRoute.breadcrumbName
                }
              />
            </Box>
          </MenuItem>
        )}
        {navDepth === -1 && (
          <MenuItem className={classes.listItem} onClick={() => setNavDepth(0)}>
            <Box className={classes.itemContent}>
              <ListItemAvatar className={classes.avatarWrapper}>
                <Avatar className={classes.backAvatar}>
                  <ArrowBackIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText>
                {wordLibrary?.["select organization"] ?? "選擇組織"}
              </ListItemText>
            </Box>
          </MenuItem>
        )}
        <Divider sx={{ margin: "8px 20px" }} />
      </Box>
      {navDepth !== -1 &&
        avaiableRoutes?.map((route) => (
          <MenuItem
            key={route?.breadcrumbName}
            className={classes.listItem}
            onClick={() => handleClickMenu(route, navDepth)}
          >
            <Box className={classes.itemContent}>
              <ListItemAvatar className={classes.avatarWrapper}>
                <Avatar className={classes.iconAvatar}>
                  {route?.menuIcon}
                </Avatar>
              </ListItemAvatar>
              {/* <ListItemText>{route?.breadcrumbName}</ListItemText> */}
              <ListItemText>
                {wordLibrary &&
                route?.breadcrumbName &&
                wordLibrary[route?.breadcrumbName]
                  ? wordLibrary[route?.breadcrumbName]
                  : route?.breadcrumbName}
              </ListItemText>
            </Box>
            {route?.collapse && (route?.routes?.length as number) > 0 && (
              <ListItemButton
                className={clsx(classes.iconButton, classes.iconButtonNoHover)}
                disableRipple
              >
                <ListItemIcon>
                  <ArrowForwardIcon />
                </ListItemIcon>
              </ListItemButton>
            )}
          </MenuItem>
        ))}
      {navDepth === 0 && (
        <MenuItem className={classes.listItem} onClick={handleLogout}>
          <Box className={classes.itemContent}>
            <ListItemAvatar className={classes.avatarWrapper}>
              <Avatar className={classes.iconAvatar}>
                <ExitToAppIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText>{wordLibrary?.logout ?? "登出"}</ListItemText>
          </Box>
        </MenuItem>
      )}
      {navDepth === -1 &&
        orgs?.source.map((org) => (
          <Tooltip
            title={org.organizationName ? org.organizationName : "undefind"}
            key={org.organizationId}
          >
            <MenuItem
              className={classes.listItem}
              onClick={() => {
                handleOrganization(org);
              }}
            >
              <ListItemText className={classes.titleContent}>
                {org.organizationName}
              </ListItemText>
              <Radio checked={selectedOrgId === org.organizationId} />
            </MenuItem>
          </Tooltip>
        ))}
    </>
  );
};

export default UserDropDownMenu;
