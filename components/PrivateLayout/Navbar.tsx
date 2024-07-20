import React, { FC, useState } from "react";
import { useSelector } from "react-redux";

import { makeStyles } from "@mui/styles";
import { useAppDispatch } from "redux/configureAppStore";

import PermissionValid from "components/PermissionValid";
import List from "@eGroupAI/material/List";
import AppBar from "@eGroupAI/material/AppBar";
import Toolbar from "@eGroupAI/material/Toolbar";
import Box from "@eGroupAI/material/Box";
import { Badge } from "@eGroupAI/material";
import ButtonBase from "@eGroupAI/material/ButtonBase";
import Notifications from "@mui/icons-material/Notifications";
import useGetMessages from "@eGroupAI/hooks/apis/useGetMessages";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { toggleSidebar, toggleSidebarMobile } from "./actions";
import DropdownMessageMenu from "./DropdownMessageMenu";
import UserMenu from "./UserMenu";
import ToggleMenuButton from "./ToggleMenuButton";
import OrgNameButton from "./OrgNameButton";
import FullTextSearchAutocomplete from "./FullTextSearchAutocomplete";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.common.white,
    height: 84,
    [theme.breakpoints.down("md")]: {
      height: 60,
    },
  },
  toolbar: {
    paddingRight: "1rem",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  listContainer: {
    overflow: "hidden",
  },
  iconContainer: {
    background: theme.palette.grey[200],
    height: 40,
    width: 40,
    minWidth: 40,
    borderRadius: 50,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    "& svg": {
      color: theme.palette.grey[500],
    },
    "& .BaseBadge-badge": {
      height: 5,
      width: 5,
      minWidth: 5,
      top: 4,
      right: 2,
    },
    zIndex: 10,
  },
  clickableBadge: {
    cursor: "pointer",
  },
  messageContainer: {
    position: "absolute",
    top: 85,
    [theme.breakpoints.down("md")]: {
      top: 61,
    },
    right: 15,
    backgroundColor: theme.palette.common.white,
    zIndex: 10,
  },
  backdrop: {
    position: "fixed",
    width: "-webkit-fill-available",
    height: "-webkit-fill-available",
    zIndex: 9,
  },
}));

export interface NavbarProps {
  sidebarIsOpen: boolean;
  isMobile: boolean;
  isEditorOpen: boolean;
  onClick?: () => void;
  unreadMessageCounts: number | undefined;
}

const Navbar: FC<NavbarProps> = function (props) {
  const {
    sidebarIsOpen,
    isMobile,
    isEditorOpen,
    onClick,
    unreadMessageCounts,
  } = props;

  const classes = useStyles();
  const dispatch = useAppDispatch();
  const organizationId = useSelector(getSelectedOrgId);
  const { data: allMessagesInfo } = useGetMessages(
    {
      organizationId,
    },
    {
      startIndex: 0,
      size: 5,
      locale: "zh_TW",
    }
  );
  const { data: unreadMessagesInfo } = useGetMessages(
    {
      organizationId,
    },
    {
      startIndex: 0,
      size: 5,
      locale: "zh_TW",
      equal: [
        {
          filterKey: "C42_1",
          value: ["0"],
        },
      ],
    }
  );
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const closeDropdown = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="sticky" className={classes.root} elevation={0}>
      <Toolbar className={classes.toolbar}>
        {isMobile && (
          <ToggleMenuButton
            isOpen={sidebarIsOpen}
            onClick={() => {
              if (isMobile) {
                dispatch(toggleSidebarMobile());
              } else {
                dispatch(toggleSidebar());
              }
            }}
          />
        )}
        <Box flexGrow={1} />
        <List className={classes.listContainer}>
          <OrgNameButton />
        </List>
        <PermissionValid
          modulePermissions={["LIST"]}
          targetPath="/me/search"
          conditions={["MODULE", "OR", "TARGET"]}
        >
          <FullTextSearchAutocomplete
            isEditorOpen={isEditorOpen}
            onClick={() => {
              if (onClick) {
                onClick();
              }
            }}
          />
        </PermissionValid>
        <ButtonBase
          className={classes.iconContainer}
          onClick={(event) => {
            if (!anchorEl) {
              setAnchorEl(event.currentTarget);
            } else {
              setAnchorEl(null);
            }
          }}
        >
          <Badge
            className={classes.clickableBadge}
            badgeContent={unreadMessageCounts}
            color="secondary"
          >
            <Notifications />
          </Badge>
        </ButtonBase>
        <UserMenu closeDropdown={closeDropdown} />
      </Toolbar>
      {anchorEl && (
        <div className={classes.messageContainer}>
          <DropdownMessageMenu
            allMessagesInfo={allMessagesInfo}
            unreadMessagesInfo={unreadMessagesInfo}
            closeDropdown={closeDropdown}
          />
        </div>
      )}
      {anchorEl && (
        <div
          className={classes.backdrop}
          onClick={closeDropdown}
          aria-hidden="true"
        >
          {" "}
        </div>
      )}
    </AppBar>
  );
};

export default Navbar;
