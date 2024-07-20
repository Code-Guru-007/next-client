import {
  combineReducers,
  createReducer,
  PayloadAction,
} from "@reduxjs/toolkit";
import { Locale } from "interfaces/utils";

import {
  toggleSidebar,
  toggleSidebarMobile,
  openSidebarMobile,
  closeSidebarMobile,
  toggleSidebarItem,
  setLocale,
  setBreadcrumbProps,
  resetBreadcrumbProps,
  clickSidebarItem,
  SidebarItemClickProps,
} from "./actions";
import { BreadcrumbsProps } from "./Breadcrumbs";

type Sidebar = {
  isOpen: boolean;
  isMobileOpen: boolean;
  items: {
    isOpen: boolean;
  }[];
  activeLink: string | undefined;
};

type Global = {
  locale: Locale;
};

const sidebar = createReducer<Sidebar>(
  {
    isOpen: true,
    isMobileOpen: false,
    items: [],
    activeLink: "",
  },
  {
    [toggleSidebar.type]: (state) => ({
      ...state,
      isOpen: !state.isOpen,
    }),
    [toggleSidebarMobile.type]: (state) => ({
      ...state,
      isMobileOpen: !state.isMobileOpen,
    }),
    [openSidebarMobile.type]: (state) => ({
      ...state,
      isMobileOpen: true,
    }),
    [closeSidebarMobile.type]: (state) => ({
      ...state,
      isMobileOpen: false,
      items: Array(state.items.length).fill(false),
    }),
    [toggleSidebarItem.type]: (state, action: PayloadAction<number>) => {
      const nextItems = Array(state.items.length).fill(false);
      nextItems[action.payload] = {
        ...state.items[action.payload],
        isOpen: !state.items[action.payload]?.isOpen,
      };
      return {
        ...state,
        items: nextItems,
      };
    },
    [clickSidebarItem.type]: (
      state,
      action: PayloadAction<SidebarItemClickProps>
    ) => {
      const nextItems = state.items.map((item, index) => {
        if (action.payload.type) {
          return item;
        }
        if (index !== action.payload.index) {
          return { ...item, isOpen: false };
        }
        return { ...item, isOpen: !item.isOpen };
      });

      return {
        ...state,
        activeLink: action.payload.activeLink,
        items: nextItems,
      };
    },
  }
);

const breadcrumbs = createReducer<BreadcrumbsProps>(
  {
    dynamicRoutes: [],
  },
  {
    [setBreadcrumbProps.type]: (
      state,
      action: PayloadAction<BreadcrumbsProps>
    ) => ({
      ...state,
      ...action.payload,
    }),
    [resetBreadcrumbProps.type]: () => ({
      dynamicRoutes: [],
    }),
  }
);

const global = createReducer<Global>(
  {
    locale: Locale.ZH_TW,
  },
  {
    [setLocale.type]: (state, action: PayloadAction<Locale>) => ({
      ...state,
      locale: action.payload,
    }),
  }
);

export default combineReducers({
  sidebar,
  breadcrumbs,
  global,
});
