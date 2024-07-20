// @mui
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
// theme
import { hideScroll } from "minimal/theme/css";
// hooks
import { useMockedUser } from "minimal/hooks/use-mocked-user";
// components
import Image from "next/legacy/image";
import NextLink from "next/link";
import Link from "@eGroupAI/material/Link";
import { NavSectionMini } from "minimal/components/nav-section";

import useFiltedRoutes from "utils/useFiltedRoutes";
//
import { NAV } from "../config-layout";
import { NavToggleButton } from "../_common";

// ----------------------------------------------------------------------

type Props = {
  isEditorOpen: boolean;
  onClick?: () => void;
};

export default function NavMini({ isEditorOpen, onClick }: Props) {
  const { user } = useMockedUser();

  const filtedRoutes = useFiltedRoutes([]);

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_MINI },
      }}
    >
      <NavToggleButton
        sx={{
          top: 22,
          left: NAV.W_MINI - 12,
        }}
      />

      <Stack
        sx={{
          pb: 2,
          height: 1,
          position: "fixed",
          width: NAV.W_MINI,
          borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          ...hideScroll.x,
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            m: "8px 0 16px 4px",
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

        <NavSectionMini
          data={filtedRoutes?.filter((el) => !!el.breadcrumbName)}
          config={{
            currentRole: user?.role || "admin",
          }}
        />
      </Stack>
    </Box>
  );
}
