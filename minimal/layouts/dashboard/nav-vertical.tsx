"use client";

import { useEffect } from "react";
// @mui
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Drawer from "@mui/material/Drawer";
// hooks
import { useResponsive } from "minimal/hooks/use-responsive";
// hooks
import { useMockedUser } from "minimal/hooks/use-mocked-user";
// components
import Image from "next/legacy/image";
import NextLink from "next/link";
import Link from "@eGroupAI/material/Link";
import Scrollbar from "minimal/components/scrollbar";
import { NavSectionVertical } from "minimal/components/nav-section";

import useFiltedRoutes from "utils/useFiltedRoutes";
//
import { NAV } from "../config-layout";
import { NavToggleButton } from "../_common";

// ----------------------------------------------------------------------

type Props = {
  openNav: boolean;
  onCloseNav: VoidFunction;
  isEditorOpen: boolean;
  onClick?: () => void;
};

export default function NavVertical({
  openNav,
  onCloseNav,
  isEditorOpen,
  onClick,
}: Props) {
  const { user } = useMockedUser();

  const pathname = "usePathname()";

  const lgUp = useResponsive("up", "lg");

  const filtedRoutes = useFiltedRoutes([]);

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        "& .simplebar-content": {
          height: 1,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          m: "8px 0 16px 16px",
        }}
      >
        <NextLink prefetch href="/me" passHref legacyBehavior>
          <Link
            variant="body1"
            underline="none"
            onClick={(e) => {
              if (isEditorOpen) {
                e.preventDefault();
              }
              if (onClick) {
                onClick();
              }
            }}
          >
            <Image src="/events/logo.svg" width="80" height="80" />
          </Link>
        </NextLink>
      </Box>

      <NavSectionVertical
        data={filtedRoutes?.filter((el) => !!el.breadcrumbName)}
        config={{
          currentRole: user?.role || "admin",
        }}
      />

      <Box sx={{ flexGrow: 1 }} />
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL },
      }}
    >
      <NavToggleButton />

      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            position: "fixed",
            width: NAV.W_VERTICAL,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.W_VERTICAL,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
