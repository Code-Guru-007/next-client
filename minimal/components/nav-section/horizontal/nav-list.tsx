import { useState, useEffect, useRef } from "react";
// @mui
import Stack from "@mui/material/Stack";
import { appBarClasses } from "@mui/material/AppBar";
import Popover, { popoverClasses } from "@mui/material/Popover";
// routes
import { usePathname } from "minimal/routes/hook";
import { useActiveLink } from "minimal/routes/hook/use-active-link";
import { Route } from "@eGroupAI/typings/apis";

//
import { NavListProps, NavConfigProps } from "../types";
import NavItem from "./nav-item";

// ----------------------------------------------------------------------

type NavListRootProps = {
  data: NavListProps;
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
  const navRef = useRef(null);

  const pathname = usePathname();

  const active = useActiveLink(
    data.path || data.pathParent || "undefined",
    hasChild
  );

  const externalLink = data.path?.includes("http");

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const appBarEl = Array.from(
      document.querySelectorAll(`.${appBarClasses.root}`)
    ) as HTMLElement[];

    // Reset styles when hover
    const styles = () => {
      document.body.style.overflow = "";
      document.body.style.padding = "";
      // Apply for Window
      appBarEl.forEach((elem) => {
        elem.style.padding = "";
      });
    };

    styles();
  }, [open]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <NavItem
        ref={navRef}
        item={data}
        depth={depth}
        open={open}
        active={active}
        externalLink={externalLink}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        config={config}
      />

      {hasChild && depth === 1 && data?.routes?.[0]?.breadcrumbName && (
        <Popover
          open={open}
          anchorEl={navRef.current}
          anchorOrigin={
            depth === 1
              ? { vertical: "bottom", horizontal: "left" }
              : { vertical: "center", horizontal: "right" }
          }
          transformOrigin={
            depth === 1
              ? { vertical: "top", horizontal: "left" }
              : { vertical: "center", horizontal: "left" }
          }
          PaperProps={{
            onMouseEnter: handleOpen,
            onMouseLeave: handleClose,
          }}
          sx={{
            pointerEvents: "none",
            [`& .${popoverClasses.paper}`]: {
              width: 160,
              ...(open && {
                pointerEvents: "auto",
              }),
            },
          }}
        >
          <NavSubList data={data.routes} depth={depth} config={config} />
        </Popover>
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
    <Stack spacing={0.5}>
      {data?.map((list) => (
        <NavList
          key={(list.breadcrumbName || "") + list.path}
          data={list}
          depth={depth + 1}
          hasChild={!!list.routes}
          config={config}
        />
      ))}
    </Stack>
  );
}
