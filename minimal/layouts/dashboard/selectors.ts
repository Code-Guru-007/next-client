import { RootState } from "redux/root";

export const getBreadcrumbProps = (state: RootState) =>
  state.privateLayout.breadcrumbs;
