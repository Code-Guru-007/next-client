// @mui
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
// theme
import { bgBlur } from "minimal/theme/css";
// routes
// hooks
import { useOffSetTop } from "minimal/hooks/use-off-set-top";
// components
import Logo from "minimal/components/logo";
//
import { HEADER } from "../config-layout";
import HeaderShadow from "./header-shadow";

// ----------------------------------------------------------------------

export default function HeaderSimple() {
  const theme = useTheme();

  const offsetTop = useOffSetTop(HEADER.H_DESKTOP);

  return (
    <AppBar
      sx={{
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        justifyContent: "space-between",
        height: {
          xs: HEADER.H_MOBILE,
          md: HEADER.H_DESKTOP,
        },
        transition: theme.transitions.create(["height"], {
          easing: theme.transitions.easing.easeInOut,
          duration: theme.transitions.duration.shorter,
        }),
        ...(offsetTop && {
          ...bgBlur({
            color: theme.palette.background.default,
          }),
          height: {
            md: HEADER.H_DESKTOP_OFFSET,
          },
        }),
      }}
    >
      <Toolbar>
        <Logo />
      </Toolbar>

      {offsetTop && <HeaderShadow />}
    </AppBar>
  );
}
