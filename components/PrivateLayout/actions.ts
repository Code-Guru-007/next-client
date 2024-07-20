import { createAction } from "@reduxjs/toolkit";
import { Locale } from "interfaces/utils";
import { BreadcrumbsProps } from "./Breadcrumbs";

export interface SidebarItemClickProps {
  activeLink: string | undefined;
  index: number;
  type?: boolean;
}

// Actions
export const logout = createAction("logout");
export const toggleSidebar = createAction("toggleSidebar");
export const toggleSidebarMobile = createAction("toggleSidebarMobile");
export const openSidebarMobile = createAction("openSidebarMobile");
export const closeSidebarMobile = createAction("closeSidebarMobile");
export const toggleSidebarItem = createAction<number>("toggleSidebarItem");
export const clickSidebarItem =
  createAction<SidebarItemClickProps>("clickSidebarItem");
export const setLocale = createAction<Locale>("setLocale");
export const setBreadcrumbProps =
  createAction<BreadcrumbsProps>("setBreadcrumbProps");
export const resetBreadcrumbProps = createAction("resetBreadcrumbProps");
