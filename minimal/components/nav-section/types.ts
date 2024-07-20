import { StackProps } from "@mui/material/Stack";
import { ListItemButtonProps } from "@mui/material/ListItemButton";
import { Route } from "@eGroupAI/typings/apis";

// ----------------------------------------------------------------------

export type NavConfigProps = {
  hiddenLabel?: boolean;
  itemGap?: number;
  iconSize?: number;
  itemRadius?: number;
  itemPadding?: string;
  currentRole?: string;
  itemSubHeight?: number;
  itemRootHeight?: number;
};

export type NavItemProps = ListItemButtonProps & {
  item: NavListProps;
  depth: number;
  open?: boolean;
  active: boolean;
  externalLink?: boolean;
};

export type NavListProps = Route;

export type NavSectionProps = StackProps & {
  data: Route[] | undefined;
  config?: NavConfigProps;
};
