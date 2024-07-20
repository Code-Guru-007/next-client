import { memo } from "react";
// @mui
import List from "@mui/material/List";
//
import { NavSectionProps } from "../types";
import { navVerticalConfig } from "../config";

import NavList from "./nav-list";

// ----------------------------------------------------------------------

function NavSectionVertical({ data, config, sx, ...other }: NavSectionProps) {
  const renderContent = data?.map((list) => (
    <NavList
      key={(list?.breadcrumbName || "route") + (list?.path || "path")}
      data={list}
      depth={1}
      hasChild={!!list.routes}
      config={navVerticalConfig(config)}
    />
  ));

  return (
    <List disablePadding sx={{ px: 2 }}>
      {renderContent}
    </List>
  );
}

export default memo(NavSectionVertical);
