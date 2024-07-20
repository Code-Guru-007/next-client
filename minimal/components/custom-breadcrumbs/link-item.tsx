import { useState } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
// @mui
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
// import Typography from "@mui/material/Typography";
// import Link from "@mui/material/Link";
import { BreadcrumbsProps } from "@mui/material/Breadcrumbs";
// routes
// import { RouterLink } from "minimal/routes/components";
// import { useResponsive } from "minimal/hooks/use-responsive";
//
import { BreadcrumbsLinkProps } from "./types";
import TextMaxLine from "../TextMaxLine";

// ----------------------------------------------------------------------

type Props = {
  link: BreadcrumbsLinkProps;
  activeLast?: boolean;
  disabled: boolean;
  onClick?: BreadcrumbsProps["onClick"];
  // eslint-disable-next-line react/no-unused-prop-types
  responsiveBreadcrumbs?: boolean;
  boldText?: boolean;
};

export default function BreadcrumbsLink({
  link,
  activeLast,
  disabled,
  onClick,
  // responsiveBreadcrumbs,
  boldText = false,
}: Props) {
  const { name, href, icon } = link;
  const wordLibrary = useSelector(getWordLibrary);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  // const smUp = useResponsive("up", "sm");

  const renderContent = (
    <>
      {icon && (
        <Box
          component="span"
          sx={{
            mr: 1,
            display: "inherit",
            "& svg": { width: 20, height: 20 },
          }}
        >
          {icon}
        </Box>
      )}
      <Tooltip
        title={
          (wordLibrary && name && wordLibrary[name]
            ? wordLibrary[name]
            : name) || ""
        }
        open={showTooltip}
        onMouseLeave={() => setShowTooltip(false)}
        onMouseEnter={() => {
          setShowTooltip(true);
        }}
      >
        <TextMaxLine
          line={1}
          asLink={href !== "#"}
          href={href}
          sx={{
            fontWeight: boldText ? 700 : 400,
            cursor: href === "#" ? "default" : "pointer",
            ".MuiTypography-root .MuiBreadcrumbs-li &": {
              lineHeight: "44px",
              fontSize: "1rem",
              fontWeight: boldText ? 700 : 400,
              cursor: href === "#" ? "default" : "pointer",
            },
            alignItems: "center",
            color: "text.primary",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "calc(100vw - 32px)",
            ...(disabled &&
              !activeLast && {
                cursor: "default",
                pointerEvents: "none",
                color: "text.secondary",
              }),
          }}
          onClick={onClick}
        >
          {wordLibrary && name && wordLibrary[name] ? wordLibrary[name] : name}
        </TextMaxLine>
      </Tooltip>
    </>
  );

  return <>{renderContent}</>;

  // if (href) {
  //   return (
  //     <>
  //       {renderContent}
  //       {/* <Tooltip
  //         title={
  //           (wordLibrary && name && wordLibrary[name]
  //             ? wordLibrary[name]
  //             : name) || ""
  //         }
  //         open={showTooltip}
  //         onMouseLeave={() => setShowTooltip(false)}
  //         onMouseEnter={() => {
  //           setShowTooltip(true);
  //         }}
  //       >
  //         <Link
  //           component={RouterLink}
  //           href={href}
  //           sx={{
  //             ".MuiTypography-root .MuiBreadcrumbs-li &": {
  //               lineHeight: "44px",
  //               fontSize: "1rem",
  //               fontWeight: boldText ? 700 : 400,
  //               cursor: "pointer",
  //             },
  //             alignItems: "center",
  //             color: "text.primary",
  //             overflow: "hidden",
  //             textOverflow: "ellipsis",
  //             maxWidth: "calc(100vw - 32px)",
  //             ...(disabled &&
  //               !activeLast && {
  //                 cursor: "default",
  //                 pointerEvents: "none",
  //                 color: "text.secondary",
  //               }),
  //           }}
  //           onClick={onClick}
  //         >
  //           {renderContent}
  //         </Link>
  //       </Tooltip> */}
  //     </>
  //   );
  // }

  // return (
  //   <>
  //     {responsiveBreadcrumbs ? (
  //       <Typography
  //         onMouseEnter={() => setShowTooltip(true)}
  //         onMouseLeave={() => setShowTooltip(false)}
  //         noWrap={!smUp}
  //         sx={{
  //           ".MuiBreadcrumbs-li &": {
  //             lineHeight: "44px",
  //             fontWeight: boldText ? 700 : 400,
  //             fontSize: "1rem",
  //             cursor: "pointer",
  //           },
  //           alignItems: "center",
  //           color: "text.primary",
  //           overflow: "hidden",
  //           textOverflow: "ellipsis",
  //           maxWidth: "calc(100vw - 32px)",
  //           ...(disabled &&
  //             !activeLast && {
  //               cursor: "default",
  //               pointerEvents: "none",
  //               color: "text.secondary",
  //             }),
  //         }}
  //       >
  //         {renderContent}
  //       </Typography>
  //     ) : (
  //       <Box
  //         sx={{
  //           ".MuiBreadcrumbs-li &": {
  //             lineHeight: "44px",
  //             fontSize: "1rem",
  //             fontWeight: boldText ? 700 : 400,
  //             cursor: "pointer",
  //           },
  //           alignItems: "center",
  //           color: "text.primary",
  //           overflow: "hidden",
  //           textOverflow: "ellipsis",
  //           maxWidth: "calc(100vw - 32px)",
  //           ...(disabled &&
  //             !activeLast && {
  //               cursor: "default",
  //               pointerEvents: "none",
  //               color: "text.secondary",
  //             }),
  //         }}
  //       >
  //         {renderContent}
  //       </Box>
  //     )}
  //   </>
  // );
}
