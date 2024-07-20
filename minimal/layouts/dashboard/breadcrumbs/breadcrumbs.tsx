import React, { FC, useMemo } from "react";

import { useRouter } from "next/router";
import { Route } from "@eGroupAI/typings/apis";
import routes from "utils/routes";
import iterationAndFindRoutes from "utils/iterationAndFindRoutes";

import CustomBreadcrumbs, {
  CustomBreadcrumbsProps,
} from "minimal/components/custom-breadcrumbs";

export interface BreadcrumbsProps {
  dynamicRoutes?: Route[];
  subNavbar?: React.ReactNode;
  onClick?: CustomBreadcrumbsProps["onClick"];
  responsiveBreadcrumbs?: boolean;
}

const Breadcrumbs: FC<BreadcrumbsProps> = function (props) {
  const {
    dynamicRoutes = [],
    subNavbar,
    onClick,
    responsiveBreadcrumbs,
  } = props;

  const router = useRouter();
  const findedRoutes = useMemo(
    () => iterationAndFindRoutes(routes, router.pathname),
    [router.pathname]
  );
  const breadcrumbRoutes = [...findedRoutes, ...dynamicRoutes];

  const breadcrumbLinks = (route) => {
    if (!route.breadcrumbName) return {};
    if (route.path && route.path !== router.pathname)
      return {
        name: route.breadcrumbName,
        href: route.path,
      };
    return {
      name: route.breadcrumbName,
      href: route.path,
    };
  };

  return (
    <CustomBreadcrumbs
      responsiveBreadcrumbs={responsiveBreadcrumbs}
      headingText={
        breadcrumbRoutes[breadcrumbRoutes.length - 1]?.breadcrumbName
      }
      links={
        breadcrumbRoutes.length < 1
          ? []
          : breadcrumbRoutes
              .map((route) => breadcrumbLinks(route))
              .filter((obj) => Object.keys(obj).length !== 0)
      }
      subNavbar={subNavbar}
      onClick={onClick}
      onlyLinkable
    />
  );
};

export default Breadcrumbs;
