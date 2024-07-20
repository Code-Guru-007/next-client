import React, { FC, useMemo } from "react";

import { makeStyles } from "@mui/styles";
import { useRouter } from "next/router";
import { Route } from "@eGroupAI/typings/apis";
import routes from "utils/routes";
import iterationAndFindRoutes from "utils/iterationAndFindRoutes";

import NextLink from "next/link";
import Link from "@eGroupAI/material/Link";
import Tooltip from "@eGroupAI/material/Tooltip";
import MuiBreadcrumbs from "@eGroupAI/material/Breadcrumbs";
import replacePath from "./replacePath";

const useStyles = makeStyles((theme) => ({
  item: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    [theme.breakpoints.down("md")]: {
      maxWidth: 400,
    },
    [theme.breakpoints.down("sm")]: {
      maxWidth: 150,
    },
  },
}));

export interface BreadcrumbsProps {
  isEditorOpen?: boolean;
  dynamicRoutes?: Route[];
  onClick?: () => void;
}

const Breadcrumbs: FC<BreadcrumbsProps> = function (props) {
  const { isEditorOpen, onClick, dynamicRoutes = [] } = props;
  const classes = useStyles();
  const router = useRouter();
  const { query } = router;
  const findedRoutes = useMemo(
    () => iterationAndFindRoutes(routes, router.pathname),
    [router.pathname]
  );
  const breadcrumbRoutes = [...findedRoutes, ...dynamicRoutes];

  return (
    <MuiBreadcrumbs separator="›">
      {breadcrumbRoutes.map((el) => {
        if (!el.breadcrumbName) return undefined;
        if (el.path && el.path !== router.pathname) {
          return (
            <Tooltip title={el.breadcrumbName} key={el.breadcrumbName}>
              <div className={classes.item}>
                <NextLink
                  prefetch
                  href={replacePath(el.path, query)}
                  passHref
                  legacyBehavior
                >
                  <Link
                    underline="hover"
                    variant="h5"
                    color="black"
                    fontSize="1.0938rem"
                    noWrap
                    sx={{ cursor: "pointer" }}
                    onClick={(e) => {
                      if (isEditorOpen) {
                        e.preventDefault();
                      }
                      if (onClick) {
                        onClick();
                      }
                    }}
                  >
                    {el.breadcrumbName}
                  </Link>
                </NextLink>
              </div>
            </Tooltip>
          );
        }
        return (
          <Tooltip title={el.breadcrumbName} key={el.breadcrumbName}>
            <div className={classes.item}>
              <Link
                underline="none"
                variant="h5"
                color="black"
                fontSize="1.0938rem"
                noWrap
              >
                {el.breadcrumbName}
              </Link>
            </div>
          </Tooltip>
        );
      })}
    </MuiBreadcrumbs>
  );
};

export default Breadcrumbs;
