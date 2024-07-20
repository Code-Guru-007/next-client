import { memo } from "react";
// @mui
import Stack from "@mui/material/Stack";
// theme
import { hideScroll } from "minimal/theme/css";
//
import { NavSectionProps } from "../types";
import { navHorizontalConfig } from "../config";
import NavList from "./nav-list";

// ----------------------------------------------------------------------

function NavSectionHorizontal({ data, config, sx, ...other }: NavSectionProps) {
  return (
    <Stack
      direction="row"
      sx={{
        mx: "auto",
        ...hideScroll.y,
        ...sx,
      }}
      {...other}
    >
      {data?.map((list, index) => (
        <NavList
          key={(list.breadcrumbName || "") + list.path}
          data={list}
          depth={1}
          hasChild={!!list.routes}
          config={navHorizontalConfig(config)}
        />
      ))}
    </Stack>
  );
}

export default memo(NavSectionHorizontal);
