import { useState } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
// @mui
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Breadcrumbs, { breadcrumbsClasses } from "@mui/material/Breadcrumbs";
import Tooltip from "@mui/material/Tooltip";
import { useResponsive } from "minimal/hooks/use-responsive";
//
import { CustomBreadcrumbsProps } from "./types";
import LinkItem from "./link-item";

// ----------------------------------------------------------------------

export default function CustomBreadcrumbs({
  links,
  action,
  headingText,
  showHeadingText = false,
  moreLink,
  activeLast,
  subNavbar,
  sx,
  onClick,
  responsiveBreadcrumbs,
  onlyLinkable = false,
  ...other
}: CustomBreadcrumbsProps) {
  const wordLibrary = useSelector(getWordLibrary);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const smUp = useResponsive("up", "sm");

  const lastItem =
    links.length > 0
      ? { ...links[links.length - 1], href: "#" }
      : { name: "", href: "#" };

  const hasLinkOfLastItem = !!links[links.length - 1]?.href;
  const linkNameforLabel = wordLibrary?.["標籤管理"] ?? "標籤管理";
  const linkNameforFinance = wordLibrary?.["財務標籤管理"] ?? "財務標籤管理";
  const linkIndexforLabel = links.findIndex(
    (link) => link.name === linkNameforLabel
  );
  const linkIndexforFinance = links.findIndex(
    (link) => link.name === linkNameforFinance
  );
  const updatedLinks = [...links];
  if (
    updatedLinks &&
    linkIndexforLabel !== -1 &&
    linkIndexforLabel !== updatedLinks.length - 1 &&
    updatedLinks[linkIndexforLabel]
  ) {
    const newUrl = updatedLinks?.[linkIndexforLabel]?.href?.replace(
      "/tag-groups/[tagGroupId]",
      "?tab=tagGroup"
    );
    updatedLinks[linkIndexforLabel] = {
      ...updatedLinks[linkIndexforLabel],
      href: newUrl,
    };
  }

  if (
    updatedLinks &&
    linkIndexforFinance !== -1 &&
    linkIndexforFinance !== updatedLinks.length - 1 &&
    updatedLinks[linkIndexforFinance]
  ) {
    const newUrl = updatedLinks?.[linkIndexforFinance]?.href?.replace(
      "/finance-tag-management/[tagGroupId]",
      "?tab=financeTagManagement"
    );
    updatedLinks[linkIndexforFinance] = {
      ...updatedLinks[linkIndexforFinance],
      href: newUrl,
    };
  }

  return (
    <Box sx={{ ...sx }}>
      <Stack direction="row" alignItems="center">
        <Box sx={{ flexGrow: 1, mr: 3 }}>
          {/* HEADING */}
          {showHeadingText && (
            <Stack
              direction="row"
              alignItems="center"
              sx={{
                maxWidth: "calc(100vw - 32px)",
              }}
            >
              {headingText && responsiveBreadcrumbs ? (
                <Tooltip
                  title={
                    smUp ? "" : (wordLibrary?.heading ?? headingText) || ""
                  }
                  open={showTooltip}
                  onMouseLeave={() => setShowTooltip(false)}
                  onMouseEnter={() => setShowTooltip(true)}
                >
                  <Typography
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: "44px",
                    }}
                    noWrap={!smUp}
                    variant="h4"
                  >
                    {wordLibrary?.heading ?? headingText}
                  </Typography>
                </Tooltip>
              ) : (
                headingText &&
                !responsiveBreadcrumbs && (
                  <Typography variant="h4" sx={{ lineHeight: "44px" }}>
                    {wordLibrary?.heading ?? headingText}
                  </Typography>
                )
              )}
              <Box flexGrow={1} />
              {subNavbar}
            </Stack>
          )}
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              maxWidth: "calc(100vw - 32px)",
            }}
          >
            {/* BREADCRUMBS */}
            {!!updatedLinks.length && (
              <Breadcrumbs
                separator={<Separator />}
                {...other}
                sx={{
                  [`& .${breadcrumbsClasses.ol}`]: { flexWrap: "nowrap" },
                  [`& .${breadcrumbsClasses.separator}`]: { margin: "0 0px" },
                }}
              >
                {!onlyLinkable &&
                  updatedLinks.map((link) => (
                    <LinkItem
                      responsiveBreadcrumbs={responsiveBreadcrumbs}
                      onClick={onClick}
                      key={link.name || ""}
                      link={link}
                      activeLast={activeLast}
                      disabled={!link.href}
                    />
                  ))}
                {onlyLinkable &&
                  !hasLinkOfLastItem &&
                  updatedLinks
                    .filter((el) => el.href)
                    .map((link, index) => (
                      <LinkItem
                        responsiveBreadcrumbs={responsiveBreadcrumbs}
                        onClick={onClick}
                        key={link.name || ""}
                        link={link}
                        activeLast={activeLast}
                        disabled={!link.href}
                        boldText={
                          index ===
                            updatedLinks.filter((el) => el.href).length - 1 &&
                          hasLinkOfLastItem
                        }
                      />
                    ))}
                {onlyLinkable && !showHeadingText && (
                  <LinkItem
                    responsiveBreadcrumbs={responsiveBreadcrumbs}
                    onClick={onClick}
                    key={lastItem.name || ""}
                    link={lastItem}
                    activeLast={activeLast}
                    disabled={!lastItem.href}
                    boldText={onlyLinkable}
                  />
                )}
              </Breadcrumbs>
            )}
            {subNavbar && !showHeadingText && (
              <Stack direction="row" alignItems="center">
                <Box flexGrow={1} />
                {subNavbar}
              </Stack>
            )}
          </Stack>
        </Box>

        {action && <Box sx={{ flexShrink: 0 }}> {action} </Box>}
      </Stack>

      {/* MORE LINK */}
      {!!moreLink && (
        <Box sx={{ mt: 2 }}>
          {moreLink.map((href) => (
            <Link
              key={href}
              onClick={onClick}
              href={href}
              variant="body2"
              target="_blank"
              rel="noopener"
              sx={{ display: "table" }}
            >
              {wordLibrary?.[href] ?? href}
            </Link>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

function Separator() {
  return (
    <Box
      component="span"
      sx={{
        margin: "0 8px",
        // width: 20,
        // height: 20,
        // borderRadius: "50%",
        // bgcolor: "text.disabled",
      }}
    >
      {"/"}
    </Box>
  );
}
