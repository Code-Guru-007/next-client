import { forwardRef } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
// @mui
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
    const { breadcrumbName, path, menuIcon, routes } = item;
    const wordLibrary = useSelector(getWordLibrary);

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
              ...(!subItem && {
                ml: 1,
              }),
            }}
            primary={
              wordLibrary && breadcrumbName && wordLibrary[breadcrumbName]
                ? wordLibrary[breadcrumbName]
                : breadcrumbName
            }
            primaryTypographyProps={{
              noWrap: true,
              typography: "body2",
              textTransform: "capitalize",
              fontWeight: active ? "fontWeightBold" : "fontWeightMedium",
              ...(subItem && {
                fontWeight: active ? "fontWeightSemiBold" : "fontWeightMedium",
              }),
            }}
          />
        )}

        {!!routes && depth === 1 && routes?.[0]?.breadcrumbName && (
          <Iconify
            icon={
              subItem
                ? "eva:arrow-ios-forward-fill"
                : "eva:arrow-ios-downward-fill"
            }
            width={16}
            sx={{ flexShrink: 0, ml: 0.5 }}
          />
        )}
      </StyledItem>
    );

    // External link
    if (externalLink)
      return (
        <Link href={path} target="_blank" rel="noopener" underline="none">
          {renderContent}
        </Link>
      );

    if (routes && depth === 1 && !path) {
      return renderContent;
    }

    // Default
    return (
      <Link component={RouterLink} href={path} underline="none">
        {renderContent}
      </Link>
    );
  }
);

export default NavItem;
