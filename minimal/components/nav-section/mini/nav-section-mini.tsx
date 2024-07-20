import { memo } from "react";
import Stack from "@mui/material/Stack";
//
import { NavSectionProps } from "../types";
import { navMiniConfig } from "../config";
import NavList from "./nav-list";

// ----------------------------------------------------------------------

function NavSectionMini({ data, config, sx, ...other }: NavSectionProps) {
  return (
    <Stack sx={sx} {...other}>
      {data?.map((list) => (
        <NavList
          key={(list?.breadcrumbName || "") + list?.path}
          data={list}
          depth={1}
          hasChild={!!list?.routes}
          config={navMiniConfig(config)}
        />
      ))}
    </Stack>
  );
}

export default memo(NavSectionMini);
