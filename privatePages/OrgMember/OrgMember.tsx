import React, { useEffect, useMemo } from "react";

import { useRouter } from "next/router";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import makeStyles from "@mui/styles/makeStyles";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import ResponsiveTabs from "components/ResponsiveTabs";

import apis from "utils/apis";
import useOrgMemberInfo from "utils/useOrgMemberInfo";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import PrivateLayout from "components/PrivateLayout";
import { Main } from "@eGroupAI/material-layout";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { CircularProgress, Container } from "@mui/material";
import clsx from "clsx";
import useTab from "@eGroupAI/hooks/useTab";
import useUserPermission from "@eGroupAI/hooks/apis/useUserPermission";
import useBreadcrumb from "utils/useBreadcrumb";
import { useSettingsContext } from "minimal/components/settings";

import MemberInfo from "./MemberInfo";
import MemberEvents from "./MemberEvents";
import MemberDetailPermissionTable from "./MemberDetailPermissionTable";
import MemberSettings from "./MemberSettings";
import OrgMemberRoleEditDialog, {
  DIALOG as ROLE_DIALOG,
} from "../Members/OrgMemberRoleEditDialog";

const useStyles = makeStyles(() => ({
  tabContainer: {
    borderRadius: 0,
    boxShadow: "none",
    padding: 0,
    marginBottom: 0,
    "& .MuiTabs-indicator": {
      height: 2,
    },
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "none",
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 999,
  },
  showLoader: {
    display: "flex",
  },
  lightOpacity: {
    background: "rgba(255,255,255,0.6)",
  },
  darkOpacity: {
    background: "rgba(33, 43, 54, 0.6)",
  },
}));

const OrgMember = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const { query, push, pathname } = useRouter();
  const classes = useStyles();
  const settings = useSettingsContext();

  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);

  const {
    data: selectedOrgMember,
    mutate,
    isValidating: isLoading,
  } = useOrgMemberInfo({
    organizationId,
    loginId: query.memberId as string,
  });

  useBreadcrumb(selectedOrgMember?.member.memberName || "");
  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, setValue } = useTab<string>(
    "HrmMember",
    (tabValue as string) || "none",
    true
  );

  useEffect(() => {
    if (query.tab) {
      setValue(query.tab as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.tab]);

  const { data: permissions, isValidating: isPermissionLoading } =
    useUserPermission({
      organizationId,
      serviceModuleValue: "HRM_MEMBERS",
      targetId: query.memberId as string,
    });

  const permissionTabs = useMemo(
    () =>
      permissions?.filter(
        (per) =>
          per.permissionMap.READ &&
          per.serviceSubModuleValue !== "HRM_MEMBERS_EXPORT"
      ),
    [permissions]
  );

  useEffect(() => {
    if (permissionTabs && value === "none") {
      const tabName = permissionTabs[0]?.serviceSubModuleValue;
      push({
        pathname,
        query: {
          ...query,
          tab: query.tab || tabName,
        },
      });
    }
  }, [pathname, permissionTabs, push, query, setValue, value]);
  const memberInfoPayload = useMemo(
    () => ({
      memberName: selectedOrgMember?.member.memberName,
      memberPhone: selectedOrgMember?.member.memberPhone,
      memberEmail: selectedOrgMember?.member.memberEmail,
      memberBirth: selectedOrgMember?.member.memberBirth,
      memberGender: selectedOrgMember?.member.memberGender,
    }),
    [selectedOrgMember?.member]
  );

  const { excute: updateMemberInfo } = useAxiosApiWrapper(
    apis.member.updateMemberInfo,
    "Update"
  );
  const { excute: updateMemberRole, isLoading: isMemberRoleUpdating } =
    useAxiosApiWrapper(apis.org.updateMemberRole, "Update");

  const { openDialog: openRoleDialog, closeDialog: closeRoleDialog } =
    useReduxDialog(ROLE_DIALOG);

  const handleUpdateMember = async (name, value) => {
    if (selectedOrgMember?.member[name] !== value) {
      try {
        await updateMemberInfo({ ...memberInfoPayload, [name]: value });
        mutate();
        return "success";
      } catch (e) {
        apis.tools.createLog({
          function: "DatePicker: handleUpdateMember",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: e,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
    }
    return "success";
  };

  const handleEditMemberRolesSubmit = async (values?: string[]) => {
    if (values && organizationId && selectedOrgMember) {
      try {
        updateMemberRole({
          organizationId,
          loginId: selectedOrgMember.member.loginId,
          organizationMemberRoleSet: values,
        })
          .then(() => {
            mutate();
          })
          .catch((err) => {
            apis.tools.createLog({
              function: "updateMemberRole: error",
              browserDescription: window.navigator.userAgent,
              jsonData: {
                data: err,
                deviceInfo: getDeviceInfo(),
              },
              level: "ERROR",
            });
          });
        closeRoleDialog();
      } catch (error) {
        apis.tools.createLog({
          function: "DatePicker: handleEditMemberRolesSubmit",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
    }
  };

  const getPermissionSubModule = (value, permission) => {
    if (!permissionTabs) return false;
    return !!permissionTabs.filter((p) => p.serviceSubModuleValue === value)[0]
      ?.permissionMap?.[permission];
  };

  const tabData = useMemo(
    () =>
      permissionTabs?.map((e) => ({
        value: e.serviceSubModuleValue,
        label:
          locale === "zh_TW"
            ? e?.serviceSubModuleNameZh || ""
            : e?.serviceSubModuleNameEn || "",
        id: `member-tabdata-${e.serviceSubModuleNameEn}-btn`,
      })),
    [permissionTabs, locale]
  );

  const translatedTitle = `${selectedOrgMember?.member.memberName || ""} | ${
    wordLibrary?.["人員管理"] ?? "人員管理"
  } | ${wordLibrary?.["成員管理"] ?? "成員管理"} - ${
    wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
  }`;
  return (
    <>
      <PrivateLayout title={translatedTitle}>
        <Main>
          <Container maxWidth={false}>
            <div
              className={clsx(
                classes.loader,
                (!selectedOrgMember || isPermissionLoading) &&
                  classes.showLoader,
                {
                  [classes.lightOpacity]: settings.themeMode === "light",
                  [classes.darkOpacity]: settings.themeMode !== "light",
                }
              )}
            >
              <CircularProgress />
            </div>
            <ResponsiveTabs
              value={value}
              tabData={tabData}
              onChange={(value) => {
                push({
                  pathname,
                  query: {
                    ...query,
                    tab: value,
                  },
                });
              }}
            />
            {value === "HRM_MEMBERS_INFO" &&
              getPermissionSubModule(value, "READ") && (
                <MemberInfo
                  orgMember={selectedOrgMember}
                  onUpdateMember={handleUpdateMember}
                  isLoading={isLoading}
                  openRoleDialog={openRoleDialog}
                  readable
                  writable={getPermissionSubModule(value, "WRITE")}
                  deletable={getPermissionSubModule(value, "DELETE")}
                />
              )}
            {value === "HRM_MEMBERS_INFO_EVENTS" &&
              getPermissionSubModule(value, "READ") && (
                <MemberEvents
                  orgMember={selectedOrgMember}
                  isLoading={isLoading}
                  readable
                  writable={getPermissionSubModule(value, "WRITE")}
                  deletable={getPermissionSubModule(value, "DELETE")}
                />
              )}
            {value === "HRM_MEMBERS_INFO_AUTH" &&
              getPermissionSubModule(value, "READ") && (
                <MemberDetailPermissionTable
                  readable
                  writable={getPermissionSubModule(value, "WRITE")}
                  deletable={getPermissionSubModule(value, "DELETE")}
                  targetId={query.memberId as string}
                />
              )}
            {value === "HRM_MEMBERS_INFO_SETTINGS" &&
              getPermissionSubModule(value, "READ") && (
                <MemberSettings
                  organizationId={organizationId}
                  orgMember={selectedOrgMember}
                  readable
                  writable={getPermissionSubModule(value, "WRITE")}
                  deletable={getPermissionSubModule(value, "DELETE")}
                />
              )}
          </Container>
        </Main>
        <OrgMemberRoleEditDialog
          loginId={selectedOrgMember?.member.loginId}
          memberName={selectedOrgMember?.member.memberName}
          onSubmit={handleEditMemberRolesSubmit}
          loading={isMemberRoleUpdating}
        />
      </PrivateLayout>
    </>
  );
};

export default OrgMember;
