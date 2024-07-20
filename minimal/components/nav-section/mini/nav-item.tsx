import { forwardRef } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
// @mui
import { useTheme } from "@mui/material/styles";
import Link from "@mui/material/Link";
import ListItemText from "@mui/material/ListItemText";
// routes
import { RouterLink } from "minimal/routes/components";
//
import Iconify from "../../iconify";
//
import { NavItemProps, NavConfigProps } from "../types";
import { StyledItem, StyledIcon } from "./styles";

// ----------------------------------------------------------------------

type Props = NavItemProps & {
  config: NavConfigProps;
};

const NavItem = forwardRef<HTMLDivElement, Props>(
  ({ item, depth, open, active, externalLink, config, ...other }, ref) => {
    const theme = useTheme();
    const wordLibrary = useSelector(getWordLibrary);

    const { breadcrumbName, path, menuIcon, routes } = item;

    const subItem = depth !== 1;

    const renderContent = (
      <StyledItem
        disableGutters
        ref={ref}
        open={open}
        depth={depth}
        active={active}
        config={config}
        {...other}
      >
        {menuIcon && depth === 1 && (
          <StyledIcon size={config.iconSize}>{menuIcon}</StyledIcon>
        )}

        {!(config.hiddenLabel && !subItem) && (
          <ListItemText
            sx={{
              width: 1,
              flex: "unset",
              ...(!subItem && {
                px: 0.5,
                mt: 0.5,
              }),
            }}
            primary={
              wordLibrary && breadcrumbName && wordLibrary[breadcrumbName]
                ? wordLibrary[breadcrumbName]
                : breadcrumbName
            }
            primaryTypographyProps={{
              noWrap: true,
              fontSize: 10,
              lineHeight: "16px",
              textAlign: "center",
              textTransform: "capitalize",
              fontWeight: active ? "fontWeightBold" : "fontWeightSemiBold",
              ...(subItem && {
                textAlign: "unset",
                fontSize: theme.typography.body2.fontSize,
                lineHeight: theme.typography.body2.lineHeight,
                fontWeight: active ? "fontWeightSemiBold" : "fontWeightMedium",
              }),
            }}
          />
        )}

        {!!routes && depth === 1 && routes?.[0]?.breadcrumbName && (
          <Iconify
            width={16}
            icon="eva:arrow-ios-forward-fill"
            sx={{
              top: 11,
              right: 6,
              position: "absolute",
            }}
          />
        )}
      </StyledItem>
    );

    // External link
    if (externalLink)
      return (
        <Link
          href={path}
          target="_blank"
          rel="noopener"
          underline="none"
          sx={{
            width: 1,
          }}
        >
          {renderContent}
        </Link>
      );

    if (routes && depth === 1 && !path) {
      return renderContent;
    }

    // Default
    return (
      <Link
        component={RouterLink}
        href={path}
        underline="none"
        sx={{
          width: 1,
        }}
      >
        {renderContent}
      </Link>
    );
  }
);

export default NavItem;
