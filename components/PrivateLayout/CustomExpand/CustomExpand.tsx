import React, { FC } from "react";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/router";
import NextLink from "next/link";
import ListItemButton from "@eGroupAI/material/ListItemButton";
import ListItemText from "@eGroupAI/material/ListItemText";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import ListItemIcon from "@eGroupAI/material/ListItemIcon";
import { Route } from "@eGroupAI/typings/apis";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

interface ExpandItemListProps {
  /**
   * flag for if sidebar menu is opened
   */
  open?: boolean;
  routeItems?: Route;
  onClick?: () => void;
  /**
   * flag for if sidebar menu is minimized
   */
  shouldMiniItem?: boolean;
  isEditorOpen?: boolean;
}

const ExpandItemList = styled("div")(({ open }: ExpandItemListProps) => ({
  backgroundColor: "#3DA5D9",
  position: "fixed",
  top: "0px",
  left: open ? "84px" : "-220px",
  width: "220px",
  height: "100%",
  zIndex: "-10",
  transition: "0.25s ease-out",
  paddingTop: "90px",
}));

const useStyles = makeStyles((theme) => ({
  titleLabel: {
    "& .MuiTypography-root": {
      fontSize: "15px!important",
    },
  },

  itemSort: {
    flexDirection: "row",
  },

  itemButton: {
    padding: "0.75rem 25px",
    color: "white",
    cursor: "pointer",
    textDecoratioColor: theme.palette.common.white,
    textDecoration: "underline",

    "& .MuiListItemIcon-root": {
      minWidth: "unset",
      marginRight: theme.spacing(1),
      color: "white",
      "& .MuiSvgIcon-root": {
        width: 20,
        height: 20,
      },
    },

    "&:hover": {
      background: "#356FA3",
    },
  },
  miniRouteItem: {
    justifyContent: "center",
    "& .MuiListItemIcon-root": {
      marginRight: "15px",
    },
    "& .MuiTypography-root": {
      fontSize: "0.65rem",
    },
    "&$activeRouteItem": {
      paddingLeft: "25px",
      background: "#034C8C",
    },
  },
  activeRouteItem: {
    background: "#034C8C",

    "&:hover": {
      background: "#034C8C",
    },
  },
}));

const CustomExpand: FC<ExpandItemListProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const classes = useStyles();
  const { open, routeItems, onClick, shouldMiniItem, isEditorOpen } = props;
  const router = useRouter();

  return (
    <ExpandItemList open={open}>
      {routeItems?.routes?.map((item) => {
        const active = item.path
          ? router.asPath.indexOf(item.path) !== -1
          : false;
        if (!item.path) return undefined;
        return (
          <NextLink
            prefetch
            key={item.path}
            href={item.path as string}
            passHref
            legacyBehavior
          >
            <ListItemButton
              component="a"
              onClick={(e) => {
                if (isEditorOpen) {
                  e.preventDefault();
                }
                if (onClick) {
                  onClick();
                }
              }}
              className={clsx([classes.itemButton, classes.itemSort], {
                [classes.miniRouteItem]: shouldMiniItem,
                [classes.activeRouteItem]: active,
              })}
            >
              <ListItemIcon>
                <ListItemIcon>{item.menuIcon}</ListItemIcon>
              </ListItemIcon>
              <ListItemText
                className={classes.titleLabel}
                primary={
                  wordLibrary &&
                  item.breadcrumbName &&
                  wordLibrary?.[item.breadcrumbName]
                    ? wordLibrary[item.breadcrumbName]
                    : item.breadcrumbName
                }
              />
            </ListItemButton>
          </NextLink>
        );
      })}
    </ExpandItemList>
  );
};

export default CustomExpand;
