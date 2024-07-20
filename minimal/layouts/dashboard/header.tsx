// @mui
import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import Box from "@mui/material/Box";

// theme
import { bgBlur } from "minimal/theme/css";
import { makeStyles } from "@mui/styles";
// hooks
import { useOffSetTop } from "minimal/hooks/use-off-set-top";
import { useResponsive } from "minimal/hooks/use-responsive";

import { useSelector } from "react-redux";
// components
import Image from "next/legacy/image";
import NextLink from "next/link";
import Link from "@eGroupAI/material/Link";
import SvgColor from "minimal/components/svg-color";
import { useSettingsContext } from "minimal/components/settings";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useGetUnreadMessageCounts from "@eGroupAI/hooks/apis/useGetUnreadMessageCounts";

import OrgNameButton from "components/PrivateLayout/OrgNameButton";
import PermissionValid from "components/PermissionValid";
//

import Iconify from "minimal/components/iconify";
import FullTextSearchAutocompleteDialog, {
  DIALOG,
} from "components/PrivateLayout/FullTextSearchAutocomplete/FullTextSearchAutocompleteDialog";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { HEADER, NAV } from "../config-layout";
import { AccountPopover, NotificationsPopover } from "../_common";
import { getBreadcrumbProps } from "./selectors";
import Breadcrumbs from "./breadcrumbs/breadcrumbs";

// ----------------------------------------------------------------------

const useStyles = makeStyles(() => ({
  subNavbar: {
    display: "flex",
    boxShadow: "none",
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "none",
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 999,
  },
  showLoader: {
    display: "flex",
  },
  lightOpacity: {
    background: "rgba(255,255,255,0.6)",
  },
  darkOpacity: {
    background: "rgba(33, 43, 54, 0.6)",
  },
}));

type Props = {
  onOpenNav?: VoidFunction;
  isEditorOpen: boolean;
  onClick?: () => void;
  subNavbarText?: React.ReactNode;
  hideBreadcrumbs?: boolean;
  actions?: React.ReactNode;
  actionsButton?: React.ReactNode;
  isLoading?: boolean;
  responsiveBreadcrumbs?: boolean;
};

export default function Header({
  onOpenNav,
  isEditorOpen,
  onClick,
  subNavbarText,
  hideBreadcrumbs,
  actions,
  actionsButton,
  responsiveBreadcrumbs,
}: Props) {
  const theme = useTheme();
  const classes = useStyles();

  const settings = useSettingsContext();
  const breadcrumbProps = useSelector(getBreadcrumbProps);

  const isNavHorizontal = settings.themeLayout === "horizontal";

  const isNavMini = settings.themeLayout === "mini";

  const lgUp = useResponsive("up", "lg");
  const mdUp = useResponsive("up", "md");
  const smUp = useResponsive("up", "sm");

  const offset = useOffSetTop(HEADER.H_DESKTOP);

  const offsetTop = offset && !isNavHorizontal;

  const organizationId = useSelector(getSelectedOrgId);
  const { openDialog: openSearchAutoCompleteDialog } = useReduxDialog(DIALOG);

  const { data: unreadMessageCounts, mutate: mutateUnreadMessageCounts } =
    useGetUnreadMessageCounts({
      organizationId,
    });

  const handleMutateUnreadMessageCount = () => {
    mutateUnreadMessageCounts();
  };

  const handleSearchDialog = () => {
    openSearchAutoCompleteDialog();
  };

  const renderSearchIcon = (
    <PermissionValid
      modulePermissions={["LIST"]}
      targetPath="/me/search"
      conditions={["MODULE", "OR", "TARGET"]}
    >
      <IconButton onClick={handleSearchDialog}>
        <Iconify icon="eva:search-fill" width={24} />
      </IconButton>
    </PermissionValid>
  );

  const subNavbar = subNavbarText;
  const breadcrumbRender = (
    <div className={classes.subNavbar}>
      {!hideBreadcrumbs && (
        <Breadcrumbs
          {...breadcrumbProps}
          subNavbar={subNavbar}
          responsiveBreadcrumbs={responsiveBreadcrumbs}
          onClick={onClick}
        />
      )}
      <Box flexGrow={1} />
      {actions}
    </div>
  );

  const renderContent = (
    <>
      {lgUp && isNavHorizontal && (
        <Box sx={{ ml: 2, my: 2 }}>
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
              <Image src="/events/logo.svg" width="70" height="70" />
            </Link>
          </NextLink>
        </Box>
      )}

      {!lgUp && (
        <IconButton
          onClick={onOpenNav}
          sx={{ mr: { sm: 0, md: 3 }, width: "44px", height: "44px" }}
        >
          <SvgColor src="/assets/icons/navbar/ic_menu_item.svg" />
        </IconButton>
      )}
      {mdUp && breadcrumbRender}
      {!smUp && renderSearchIcon}
      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.5, sm: 1 }}
      >
        <List sx={{ overflow: "hidden" }}>
          <OrgNameButton />
        </List>
        {smUp && renderSearchIcon}
        <NotificationsPopover
          unreadMessageCount={unreadMessageCounts}
          mutateUnreadMessageCount={handleMutateUnreadMessageCount}
        />
        <AccountPopover />
        <FullTextSearchAutocompleteDialog />
      </Stack>
    </>
  );

  return (
    <AppBar
      sx={{
        background: "rgba(255,255,255,0) !important",
        zIndex: theme.zIndex.appBar + 1,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        transition: theme.transitions.create(["height"], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(lgUp && {
          width: `calc(100% - ${NAV.W_VERTICAL + 1}px)`,
          ...(offsetTop && {}),
          ...(isNavHorizontal && {
            width: 1,
            bgcolor: "background.default",
          }),
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MINI + 1}px)`,
          }),
        }),
      }}
    >
      <Toolbar
        sx={{
          paddingRight: { lg: 5, md: 2, sm: 0 },
          px: { lg: 5, md: 2, sm: 0 },
          ...(isNavHorizontal && {}),
          alignItems: "flex-start",
          marginTop: "12px",
        }}
      >
        {renderContent}
      </Toolbar>
      {!mdUp && (
        <Toolbar
          sx={{
            justifyContent: "space-between",
            px: { sm: 5 },
            flexWrap: "wrap",
          }}
        >
          {breadcrumbRender}
          {actionsButton}
        </Toolbar>
      )}
      {lgUp && actionsButton && (
        <div
          style={{
            marginLeft: "auto",
            paddingRight: "10px",
            marginTop: isNavHorizontal ? "70px" : "0px",
          }}
        >
          {actionsButton}
        </div>
      )}
    </AppBar>
  );
}
