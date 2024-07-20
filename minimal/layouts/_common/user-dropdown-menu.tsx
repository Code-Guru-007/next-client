import React, { FC, useState } from "react";
import { useSelector } from "react-redux";
import ReactDOM from "react-dom";
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
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import FeedbackDialog, {
  DIALOG as FEEDBACK_DIALOG,
} from "components/FeedbackDialog";
import moduleRouteMapping from "utils/moduleRouteMapping";
import routes from "utils/routes";
import getLocalStorageItemsWithPrefix from "utils/getLocalStorageItemsWithPrefix";

import MenuItem from "components/MenuItem";
import { useSettingsContext } from "minimal/components/settings";
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
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import clsx from "clsx";
import { logout as logoutAction } from "./actions";

export interface UserDropDownMenuProps {
  memberInfo: Member;
  onClose?: () => void;
}

const useStyles = makeStyles((theme) => ({
  headerItem: {
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  listContainer: {
    maxHeight: "calc(100vh - 280px)",
    overflow: "hidden",
    overflowY: "auto",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    minWidth: "330px",
    padding: "8px 16px",
    "& span": {
      width: 20,
    },
  },
  avatarWrapper: {
    display: "flex",
    justifyContent: "center",
    minWidth: "50px",
    marginRight: "5px",
  },
  itemContent: {
    display: "flex",
    minWidth: "252px",
    whiteSpace: "nowrap",
    alignItems: "center",
  },
  iconButton: {
    width: "30px",
    height: "50px",
    borderRadius: "40px",
    display: "flex",
    justifyContent: "center",
    "& .MuiListItemIcon-root": {
      minWidth: "unset",
      color: theme.palette.text.secondary,
      margin: 0,
    },
    marginLeft: "-4px",
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
    "& svg": {
      marginRight: "0 !important",
    },
  },
  backAvatar: {
    width: 40,
    height: 40,
    color: theme.palette.text.secondary,
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

const FeedbackDialogContainer: React.FC = ({ children }) =>
  ReactDOM.createPortal(children, document.body);

const UserDropDownMenu: FC<UserDropDownMenuProps> = function (props) {
  const { memberInfo, onClose } = props;
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const locale = useSelector(getGlobalLocale);
  const { data: orgs } = useMemberOrgs(undefined, { locale });
  const selectedOrgId = useSelector(getSelectedOrgId);
  const settings = useSettingsContext();
  const [, , removeCookie] = useCookies();
  const firstName = memberInfo?.memberName?.split(" ")[0];
  const secondName = memberInfo?.memberName?.split(" ")[1];
  let fLetter: string | undefined;
  let sLetter: string | undefined;
  if (firstName) fLetter = firstName[0] as string;
  if (secondName) sLetter = secondName[0] as string;
  const avatarLetters = fLetter?.concat(sLetter || "");

  const rootRoutes = filterRoutes(moduleRouteMapping, routes, [
    "SETTINGS_PRIVACY",
    "FEEDBACK",
  ]);

  const { openDialog: openFeedbackDialog } = useReduxDialog(FEEDBACK_DIALOG);
  const [menuOpen] = useState<boolean>(true);
  const [navDepth, setNavDepth] = useState<number>(0);
  const [parentRoute, setParentRoute] = useState<Route | null>(null);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [avaiableRoutes, setAvailableRoutes] = useState<Route[] | undefined>(
    rootRoutes
  );
  const wordLibrary = useSelector(getWordLibrary);

  const { excute: logout } = useAxiosApiWrapper(apis.member.logout, "None");

  const handleLogout = async () => {
    // remove localStorage items with prefix
    const itemsWithPrefix = getLocalStorageItemsWithPrefix("useDataTable");
    itemsWithPrefix.forEach(({ key }) => {
      window.localStorage.removeItem(key);
    });

    await logout();
    router.replace("/login");
    removeCookie("lid");
    removeCookie("tid");
    removeCookie("m_info");
    removeCookie("XSRF-TOKEN");
    dispatch(logoutAction());
  };

  const handleClickMenu = (route: Route, navDepth: number) => {
    if (!route?.collapse && route?.path) {
      if (route.path === "/me/feedback") {
        openFeedbackDialog();
        const popup = document.querySelector(
          ".MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiPopover-paper.css-i48iwq-MuiPaper-root-MuiPopover-paper"
        ) as HTMLElement;
        if (popup) {
          popup.style.display = "none";
        }
      } else if (route.path === "/me/settings-privacy") {
        settings.onToggle();
        if (onClose) onClose();
      } else router.replace(route.path);
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
      {menuOpen && (
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
                <Tooltip
                  title={wordLibrary?.["select organization"] ?? "選擇組織"}
                >
                  <ListItemButton
                    disableRipple
                    className={clsx(classes.iconButton)}
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
                  <ListItemText>
                    {wordLibrary &&
                    currentRoute.breadcrumbName &&
                    wordLibrary[currentRoute.breadcrumbName]
                      ? wordLibrary[currentRoute.breadcrumbName]
                      : currentRoute.breadcrumbName}
                  </ListItemText>
                </Box>
              </MenuItem>
            )}
            {navDepth === -1 && (
              <MenuItem
                className={classes.listItem}
                onClick={() => setNavDepth(0)}
              >
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
            <Divider sx={{ margin: "2px 20px" }} />
          </Box>
          <Box className={classes.listContainer}>
            {navDepth !== -1 &&
              avaiableRoutes?.map((route) => (
                <MenuItem
                  key={route?.breadcrumbName}
                  className={classes.listItem}
                  onClick={() => handleClickMenu(route, navDepth)}
                >
                  <Box className={classes.itemContent}>
                    <ListItemAvatar
                      className={classes.avatarWrapper}
                      onClick={(e) => {
                        if (route.path === "/me/settings-privacy")
                          e.stopPropagation();
                        if (onClose) onClose();
                      }}
                    >
                      <Avatar className={classes.iconAvatar}>
                        {route?.menuIcon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText>
                      {wordLibrary &&
                      route.breadcrumbName &&
                      wordLibrary[route.breadcrumbName]
                        ? wordLibrary[route.breadcrumbName]
                        : route.breadcrumbName}
                    </ListItemText>
                  </Box>
                  {route?.collapse && (route?.routes?.length as number) > 0 && (
                    <ListItemButton
                      className={clsx(
                        classes.iconButton,
                        classes.iconButtonNoHover
                      )}
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
                  title={
                    org.organizationName
                      ? org.organizationName
                      : wordLibrary?.["unnamed organization"] ?? "未命名組織"
                  }
                  key={org.organizationId}
                >
                  <MenuItem
                    className={classes.listItem}
                    disableRipple
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
          </Box>
        </>
      )}
      <FeedbackDialogContainer>
        <FeedbackDialog />
      </FeedbackDialogContainer>
    </>
  );
};

export default UserDropDownMenu;
