import React, { FC, forwardRef, useEffect, useState } from "react";
import { List, ListProps } from "@mui/material";

import { RouteConfig } from "react-router-config";
import { NavLink, NavLinkProps, useHistory } from "react-router-dom";
import NestedListItem, {
  NestedItems,
  NestedListItemProps,
} from "@eGroupAI/material/NestedListItem";
import makeStyles from "@mui/styles/makeStyles";
import createStyles from "@mui/styles/createStyles";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

const useStyles = makeStyles(() =>
  createStyles({
    mainLayer: {
      position: "absolute",
      width: 84,
      background: "#034C8C",
      left: 0,
      top: 0,
      bottom: 0,
      overflow: "overlay",
      zIndex: 10000,
      "&::-webkit-scrollbar": {
        backgroundColor: "transparent",
        width: "10px",
      },
    },
  })
);

export interface EgRouteConfig extends RouteConfig {
  /**
   * If breadcrumbName defined it'll display in Breadcrumbs.
   */
  breadcrumbName?: string;
}

export interface NestedSideMenuProps extends ListProps {
  /**
   * react router config routes.
   */
  routes: EgRouteConfig[];
  /**
   * current pathname
   */
  pathname: string;
  /**
   * `NestedListItem` props.
   */
  NestedListItemProps?: NestedListItemProps;
  /**
   * `NestedListItem` items props.
   */
  NestedListItemItemsProps?: NestedItems;
}

const NavLinkWrapper = forwardRef<HTMLAnchorElement, NavLinkProps>(
  (props, ref) => <NavLink innerRef={ref} {...props} />
);

const NestedSideMenu: FC<NestedSideMenuProps> = (props) => {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    className,
    pathname,
    routes,
    NestedListItemProps,
    NestedListItemItemsProps,
    style,
    ...other
  } = props;

  const classes = useStyles();
  const {
    MuiListItemProps,
    MuiListItemTextProps,
    ...otherNestedListItemProps
  } = NestedListItemProps || {};
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [currentItems, setCurrentItems] = useState([{}]);
  const history = useHistory();

  useEffect(() => {
    const items = routes[currentIdx];
    if (isOpen) {
      if (items?.routes && items.routes?.length > 0) {
        const firstPath = items.routes[0];
        if (firstPath?.path) {
          history.push(firstPath?.path.toString());
        }
      }
    }
  }, [currentIdx, history, isOpen, routes]);

  const handleClickItem = (idx, hasItems) => {
    if (hasItems) {
      setIsOpen((isOpen) => !isOpen);
    } else {
      setIsOpen(false);
    }
    setCurrentIdx(idx);

    if (hasItems) {
      let items = routes[idx]?.routes;
      items = items?.filter((el) => Boolean(el.breadcrumbName));
      if (items && items.length > 0) {
        const {
          MuiListItemProps: NestedMuiListItemProps,
          MuiListItemTextProps: NestedMuiListItemTextProps,
          ...otherNestedListItemItemsProps
        } = NestedListItemItemsProps || {};
        items = items.map((el) => {
          const selected = el.path === pathname;
          return {
            key: el.key ?? (el.path as string),
            icon: el.icon,
            path: el.path,
            MuiListItemProps: {
              selected,
              to: el.path,
              component: NavLinkWrapper,
              ...NestedMuiListItemProps,
            },
            MuiListItemTextProps: {
              primary: wordLibrary?.[el.breadcrumbName] ?? el.breadcrumbName,
              ...NestedMuiListItemTextProps,
            },
            ...otherNestedListItemItemsProps,
          };
        });
        setCurrentItems(items);
      }
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <List className={classes.mainLayer} {...other}>
        {routes.map((route, index) => {
          if (route.routes && route.routes.length > 0) {
            const items = route.routes.filter((el) =>
              Boolean(el.breadcrumbName)
            );
            // If routes do not exist any breadcrumbName means it doesn't need openable NestedListItem.
            // Therefore we can simply return a `NestedListItem` wrapped by `Link`.
            if (items.length === 0) {
              return (
                <NestedListItem
                  key={route.key ?? (route.path as string)}
                  icon={route.icon}
                  idx={index}
                  onClickItem={(idx, hasItems) =>
                    handleClickItem(idx, hasItems)
                  }
                  isOpen={isOpen}
                  MuiListItemProps={{
                    selected: route.path === pathname,
                    ...MuiListItemProps,
                  }}
                  MuiListItemTextProps={{
                    primary:
                      wordLibrary &&
                      route?.breadcrumbName &&
                      wordLibrary[route?.breadcrumbName]
                        ? wordLibrary[route?.breadcrumbName]
                        : route?.breadcrumbName,
                    ...MuiListItemTextProps,
                  }}
                  {...otherNestedListItemProps}
                  pathname={pathname}
                  parentPath={(route.path as string) || ""}
                />
              );
            }
            return (
              <NestedListItem
                key={route.key ?? (route.path as string)}
                icon={route.icon}
                idx={index}
                onClickItem={(idx, hasItems) => handleClickItem(idx, hasItems)}
                isOpen={isOpen}
                MuiListItemProps={{
                  ...MuiListItemProps,
                }}
                MuiListItemTextProps={{
                  primary:
                    wordLibrary &&
                    route?.breadcrumbName &&
                    wordLibrary[route?.breadcrumbName]
                      ? wordLibrary[route?.breadcrumbName]
                      : route?.breadcrumbName,
                  ...MuiListItemTextProps,
                }}
                items={currentItems}
                pathname={pathname}
                parentPath={(route.path as string) || ""}
                {...otherNestedListItemProps}
              />
            );
          }

          if (route.breadcrumbName) {
            return (
              <NestedListItem
                key={route.key ?? (route.path as string)}
                icon={route.icon}
                idx={index}
                onClickItem={(idx, hasItems) => handleClickItem(idx, hasItems)}
                isOpen={isOpen}
                MuiListItemProps={{
                  selected: route.path === pathname,
                  ...MuiListItemProps,
                }}
                MuiListItemTextProps={{
                  primary:
                    wordLibrary &&
                    route?.breadcrumbName &&
                    wordLibrary[route?.breadcrumbName]
                      ? wordLibrary[route?.breadcrumbName]
                      : route?.breadcrumbName,
                  ...MuiListItemTextProps,
                }}
                {...otherNestedListItemProps}
              />
            );
          }
          return null;
        })}
      </List>
    </div>
  );
};

export default NestedSideMenu;
