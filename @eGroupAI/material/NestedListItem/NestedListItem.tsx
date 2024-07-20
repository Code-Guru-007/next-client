import React, { forwardRef, Key, ReactNode } from "react";

import {
  List,
  ListItemProps,
  ListItemButton,
  ListItemButtonProps,
  ListItemIcon,
  ListItemText,
  ListItemIconProps,
  ListItemTextProps,
  Drawer,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  drawers: {
    "& .MuiPaper-root": {
      left: 84,
      background: theme.palette.primary.main,
      width: 222,
    },
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  selected: {
    display: "block",
    color: theme.palette.grey[700],
    paddingBottom: 5,
    paddingRight: 0,
    paddingLeft: 0,
    "&:hover": {
      borderTopLeftRadius: 26,
      borderBottomLeftRadius: 26,
      backgroundColor: theme.palette.primary.main,
    },
    borderTopLeftRadius: 26,
    borderBottomLeftRadius: 26,
    backgroundColor: theme.palette.primary.main,
  },
  listItem: {
    display: "block",
    color: theme.palette.grey[700],
    paddingBottom: 5,
    paddingRight: 0,
    paddingLeft: 0,
    "&:hover": {
      borderRadius: 45,
      background: theme.palette.primary.light,
    },
  },
  listItemIcon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: theme.palette.grey[700],
    minWidth: 40,
  },
  listItemText: {
    "& > span": {
      fontFamily: theme.typography.fontFamily,
      fontSize: 10,
      textAlign: "center",
    },
  },
  nestSelected: {
    color: theme.palette.grey[700],
    paddingLeft: 24,
    paddingTop: 11,
    paddingBottom: 10,
    paddingRight: 16,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
    backgroundColor: theme.palette.primary.dark,
  },
  nestListItem: {
    color: theme.palette.grey[700],
    paddingLeft: 24,
    paddingTop: 11,
    paddingBottom: 10,
    paddingRight: 16,
    "&:hover": {
      background: theme.palette.primary.light,
    },
  },
  nestListItemIcon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: theme.palette.grey[700],
    minWidth: 40,
  },
  nestListItemText: {
    "& > span": {
      paddingLeft: 14,
      fontFamily: theme.typography.fontFamily,
      fontSize: 15,
      lineHeight: "22px",
    },
  },
}));

type MuiListItemProps = ListItemProps & ListItemButtonProps;
export interface CusListItemProps extends MuiListItemProps {
  button?: boolean;
  selected?: boolean;
}

export type NestedItems = {
  key?: Key;
  icon?: ReactNode;
  MuiListItemProps?: CusListItemProps;
  MuiListItemTextProps?: ListItemTextProps;
};

export interface NestedListItemProps {
  /**
   * Mui `ListItem` Props
   */
  MuiListItemProps?: CusListItemProps;
  /**
   * Mui `ListItemText` props
   */
  MuiListItemTextProps?: ListItemTextProps;
  /**
   * Mui `ListItemIcon` props
   */
  MuiListItemIconProps?: ListItemIconProps;
  /**
   * Set icon before text.
   */
  icon?: ReactNode;
  /**
   * If has items will auto generate nested list.
   */
  items?: NestedItems[];
  /**
   * Set default `isOpen` state.
   */
  defaultIsOpen?: boolean;
  pathname?: string;
  parentPath?: string;
  idx?: number;
  isOpen?: boolean;
  onClickItem?: (idx?: number, hasItems?: boolean) => void;
}

const NestedListItem = forwardRef<any, NestedListItemProps>((props, ref) => {
  const {
    icon: iconProp,
    items,
    MuiListItemProps,
    MuiListItemIconProps,
    MuiListItemTextProps,
    pathname,
    parentPath,
    idx,
    isOpen,
  } = props;
  const { selected, ...otherMuiListItemProps } = MuiListItemProps || {};
  const classes = useStyles(props);
  const hasItems = items && items.length > 0;

  const handleClick = () => {
    if (props && props.onClickItem) {
      props.onClickItem(idx, hasItems);
    }
  };

  const renderIcon = (icon) => {
    if (icon) {
      return (
        <ListItemIcon
          {...MuiListItemIconProps}
          className={classes.listItemIcon}
        >
          {icon}
        </ListItemIcon>
      );
    }
    return undefined;
  };

  const renderDrawer = () => {
    if (hasItems) {
      return (
        <Drawer open={isOpen} className={classes.drawers} hideBackdrop>
          <List disablePadding>
            {items &&
              items.map((item: NestedItems) => {
                const { key, icon, MuiListItemTextProps, MuiListItemProps } =
                  item;
                // Pending issue waiting for solved.
                // https://github.com/mui-org/material-ui/issues/14971
                const { ...otherMuiListItemProps } = MuiListItemProps || {};
                const itemProps = {
                  key,
                  className: clsx(MuiListItemProps?.className, classes.nested),
                  ...otherMuiListItemProps,
                };
                return (
                  <ListItemButton
                    {...itemProps}
                    className={
                      item.key?.toString() === pathname
                        ? classes.nestSelected
                        : classes.nestListItem
                    }
                  >
                    {renderIcon(icon)}
                    <ListItemText
                      {...MuiListItemTextProps}
                      className={classes.nestListItemText}
                    />
                  </ListItemButton>
                );
              })}
          </List>
        </Drawer>
      );
    }
    return undefined;
  };

  const itemProps = {
    ref,
    onClick: handleClick,
    ...otherMuiListItemProps,
  };
  return (
    <>
      <ListItemButton
        {...itemProps}
        className={
          selected || (parentPath && pathname?.includes(parentPath))
            ? classes.selected
            : classes.listItem
        }
      >
        {renderIcon(iconProp)}
        <ListItemText
          {...MuiListItemTextProps}
          className={classes.listItemText}
        />
      </ListItemButton>
      {renderDrawer()}
    </>
  );
});

export default NestedListItem;
