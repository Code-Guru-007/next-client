import { memo, useEffect, useState } from "react";
// @mui
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
// theme
import { bgBlur } from "minimal/theme/css";
// hooks
import { useMockedUser } from "minimal/hooks/use-mocked-user";
// components
import { NavSectionHorizontal } from "minimal/components/nav-section";

import useFiltedRoutes from "utils/useFiltedRoutes";
//
import { HeaderShadow } from "../_common";

// ----------------------------------------------------------------------

function NavHorizontal() {
  const theme = useTheme();

  const { user } = useMockedUser();

  const filtedRoutes = useFiltedRoutes([]);

  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const headerElement = document.querySelector("header.MuiPaper-root");
      const hHeight = headerElement ? headerElement.clientHeight : 0;
      setHeaderHeight(hHeight);
    };

    window.addEventListener("resize", handleResize);

    const headerElement = document.querySelector("header.MuiPaper-root");
    const hHeight = headerElement ? headerElement.clientHeight : 0;
    setHeaderHeight(hHeight);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  return (
    <AppBar
      component="nav"
      sx={{
        top: `${headerHeight}px`,
        zIndex: 1200,
      }}
    >
      <Toolbar
        sx={{
          ...bgBlur({
            color: theme.palette.background.default,
          }),
        }}
      >
        <NavSectionHorizontal
          data={filtedRoutes?.filter((el) => !!el.breadcrumbName)}
          config={{
            currentRole: user?.role || "admin",
          }}
        />
      </Toolbar>

      <HeaderShadow />
    </AppBar>
  );
}

export default memo(NavHorizontal);
