import { RootState } from "redux/root";

export const getSidebarIsOpen = (state: RootState) =>
  state.privateLayout.sidebar.isOpen;
export const getSidebarIsMobileOpen = (state: RootState) =>
  state.privateLayout.sidebar.isMobileOpen;
export const getSidebarItems = (state: RootState) =>
  state.privateLayout.sidebar.items;
export const getSidebarActiveLink = (state: RootState) =>
  state.privateLayout.sidebar.activeLink;
export const getGlobalLocale = (state: RootState) =>
  state.privateLayout.global.locale;
export const getBreadcrumbProps = (state: RootState) =>
  state.privateLayout.breadcrumbs;
