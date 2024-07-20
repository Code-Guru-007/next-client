import React, { FC } from "react";
import { useAppDispatch } from "redux/configureAppStore";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
// @mui
import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

// components
import Iconify from "minimal/components/iconify";
import Scrollbar from "minimal/components/scrollbar";
import { Organization } from "@eGroupAI/typings/apis";
import filterRoutes from "@eGroupAI/hooks/apis/useFilterRoutes/filterRoutes";

import { setSelectedOrg } from "@eGroupAI/redux-modules/memberOrgs";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import moduleRouteMapping from "utils/moduleRouteMapping";
import routes from "utils/routes";
import Link from "next/link";

interface OrgListProps {
  /**
   * orgs list
   */
  orgs?: Organization[];
}

const defaultCommonModuleValues = [
  "COMMON",
  "SETTINGS_PRIVACY",
  "SUPPORT",
  "MESSAGES",
];

const OrgList: FC<OrgListProps> = function ({ orgs = [] }) {
  const wordLibrary = useSelector(getWordLibrary);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { excute: getOrgMemberPermission } = useAxiosApiWrapper(
    apis.org.getOrgMemberPermission,
    "None"
  );
  const { excute: getOrgModule } = useAxiosApiWrapper(
    apis.org.getOrgModule,
    "None"
  );
  const handleClickOrg = async (org) => {
    dispatch(setSelectedOrg(org));
    window.localStorage.setItem("selectedOrgId", org.organizationId);
    const modulesData = await getOrgMemberPermission({
      organizationId: org.organizationId,
    });
    const orgModulesData = await getOrgModule({
      organizationId: org.organizationId,
    });
    let permissions = {};
    if (modulesData.data) {
      permissions = modulesData.data.reduce(
        (p, c) => ({
          ...p,
          [c.organizationRole.serviceModule.serviceModuleValue]:
            c.organizationRoleModulePermissionList,
        }),
        {}
      );
    }
    let serviceModuleValues: any = [];
    if (orgModulesData.data) {
      serviceModuleValues = [
        ...orgModulesData.data.source
          .map((el) => el.serviceMainModule.serviceModuleList || [])
          .reduce((a, b) => [...a, ...b], [])
          .map((el) => el.serviceModuleValue),
      ];
    }

    let filterdRoutes;
    if (!permissions || serviceModuleValues.length === 0) {
      filterdRoutes = [];
    }
    if (Object.keys(permissions).length === 0) {
      filterdRoutes = filterRoutes(
        moduleRouteMapping,
        routes,
        defaultCommonModuleValues
      );
    }
    filterdRoutes = filterRoutes(moduleRouteMapping, routes, [
      ...defaultCommonModuleValues,
      ...serviceModuleValues,
    ]);
    filterdRoutes = filterRoutes(moduleRouteMapping, routes, [
      ...defaultCommonModuleValues,
      ...Object.keys(permissions),
    ]);

    const checkOrgInfoRoute = filterdRoutes.findIndex(
      (route) => route.pathParent === "/me/org"
    );
    if (checkOrgInfoRoute === -1) {
      const firstModuleRoute = filterdRoutes.find(
        (mainRoute) =>
          mainRoute.path !== undefined ||
          mainRoute.routes?.find((subRoute) => subRoute.path !== undefined)
            ?.path !== undefined
      );
      const firstPath =
        firstModuleRoute?.path ||
        firstModuleRoute?.routes?.find(
          (subRoute) => subRoute.path !== undefined
        )?.path;
      router.replace(firstPath);
    } else {
      router.replace("/me/org-info");
    }
  };

  return (
    <Container sx={{ my: 1 }}>
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h4" textAlign="center">
          {`${wordLibrary?.welcome ?? "歡迎"}！`}
        </Typography>
        <Typography variant="h5" textAlign="center">
          {wordLibrary?.["select your organization"] ?? "請選擇您的單位"}
        </Typography>
      </Stack>
      <Paper variant="outlined" sx={{ width: 1 }}>
        <List sx={{ maxHeight: 300, overflow: "auto" }}>
          <Scrollbar>
            {orgs.map((org) => (
              <ListItemButton
                key={org.organizationId}
                onClick={() => {
                  handleClickOrg(org);
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ width: 40, height: 40 }}>
                    {org.organizationName?.substring(0, 1).toUpperCase() ?? (
                      <Iconify icon="solar:user-rounded-bold" width={24} />
                    )}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={org.organizationName}
                  primaryTypographyProps={{ fontSize: "1rem" }}
                />
              </ListItemButton>
            ))}
          </Scrollbar>
        </List>
        {orgs.length > 0 && <Divider />}
        <Link
          href={`/me/create-org?orgLength=${orgs.length}`}
          passHref
          legacyBehavior
        >
          <List component="nav" aria-label="secondary mailbox folders">
            <ListItemButton>
              <ListItemAvatar>
                <Avatar sx={{ width: 40, height: 40 }}>
                  <Iconify icon="ic:round-apartment" width={24} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={wordLibrary?.["create organization"] ?? "建立單位"}
                primaryTypographyProps={{ fontSize: "1rem" }}
              />
            </ListItemButton>
          </List>
        </Link>
      </Paper>
    </Container>
  );
};

export default OrgList;
