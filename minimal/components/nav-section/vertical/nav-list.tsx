import { useState, useEffect, useCallback } from "react";
// @mui
import Collapse from "@mui/material/Collapse";
// routes
import { usePathname } from "minimal/routes/hook";
import { useActiveLink } from "minimal/routes/hook/use-active-link";
//
import { Route } from "@eGroupAI/typings/apis";
import { NavConfigProps } from "../types";
import NavItem from "./nav-item";

// ----------------------------------------------------------------------

type NavListRootProps = {
  data: Route;
  depth: number;
  hasChild: boolean;
  config: NavConfigProps;
};

export default function NavList({
  data,
  depth,
  hasChild,
  config,
}: NavListRootProps) {
  const pathname = usePathname();

  const active = useActiveLink(
    data.path || data.pathParent || "undefined",
    hasChild
  );

  const externalLink = data.path?.includes("http");

  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (!active) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <NavItem
        item={data}
        depth={depth}
        open={open}
        active={active}
        externalLink={externalLink}
        onClick={handleToggle}
        config={config}
      />

      {hasChild && depth === 1 && data?.routes?.[0]?.breadcrumbName && (
        <Collapse in={open} unmountOnExit>
          <NavSubList data={data.routes} depth={depth} config={config} />
        </Collapse>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

type NavListSubProps = {
  data: Route[] | undefined;
  depth: number;
  config: NavConfigProps;
};

function NavSubList({ data, depth, config }: NavListSubProps) {
  return (
    <>
      {data?.map((list) => (
        <NavList
          key={(list?.breadcrumbName || "route") + (list?.path || "path")}
          data={list}
          depth={depth + 1}
          hasChild={!!list.routes}
          config={config}
        />
      ))}
    </>
  );
}
