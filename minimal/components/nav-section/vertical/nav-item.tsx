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
import { StyledItem, StyledIcon, StyledDotIcon } from "./styles";

// ----------------------------------------------------------------------

type Props = NavItemProps & {
  config: NavConfigProps;
};

export default function NavItem({
  item,
  open,
  depth,
  active,
  config,
  externalLink,
  ...other
}: Props) {
  const { breadcrumbName, path, menuIcon, routes } = item;
  const wordLibrary = useSelector(getWordLibrary);

  const subItem = depth !== 1;

  const renderContent = (
    <StyledItem
      disableGutters
      active={active}
      depth={depth}
      config={config}
      {...other}
    >
      <>
        {menuIcon && depth === 1 && (
          <StyledIcon size={config.iconSize}>{menuIcon}</StyledIcon>
        )}

        {subItem && (
          <StyledIcon size={config.iconSize}>
            <StyledDotIcon active={active} />
          </StyledIcon>
        )}
      </>

      {!(config.hiddenLabel && !subItem) && (
        <ListItemText
          primary={
            wordLibrary && breadcrumbName && wordLibrary[breadcrumbName]
              ? wordLibrary[breadcrumbName]
              : breadcrumbName
          }
          primaryTypographyProps={{
            noWrap: true,
            typography: "body2",
            textTransform: "capitalize",
            fontWeight: active ? "fontWeightSemiBold" : "fontWeightMedium",
          }}
          secondaryTypographyProps={{
            noWrap: true,
            component: "span",
            typography: "caption",
            color: "text.disabled",
          }}
        />
      )}

      {!!routes && depth === 1 && routes?.[0]?.breadcrumbName && (
        <Iconify
          width={16}
          icon={
            open ? "eva:arrow-ios-downward-fill" : "eva:arrow-ios-forward-fill"
          }
          sx={{ ml: 1, flexShrink: 0 }}
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
        color="inherit"
      >
        {renderContent}
      </Link>
    );

  if (routes && depth === 1 && !path) {
    return renderContent;
  }

  // Default
  return (
    <Link component={RouterLink} href={path} underline="none" color="inherit">
      {renderContent}
    </Link>
  );
}
