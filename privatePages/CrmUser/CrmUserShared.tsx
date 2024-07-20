import React, { useEffect, useMemo } from "react";

import useTab from "@eGroupAI/hooks/useTab";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import { useRouter } from "next/router";
import useBreadcrumb from "utils/useBreadcrumb";
import useOrgUser from "utils/useOrgUser";

import CircularProgress from "@eGroupAI/material/CircularProgress";
import Main from "@eGroupAI/material-layout/Main";
import { makeStyles } from "@mui/styles";
import Container from "@eGroupAI/material/Container";
import useUserPermission from "@eGroupAI/hooks/apis/useUserPermission";
import PrivateLayout from "components/PrivateLayout";
import EditSection from "components/EditSection";
import ResponsiveTabs from "components/ResponsiveTabs";
import clsx from "clsx";
import UnModuleAuthorized from "components/PrivateLayout/UnModuleAuthorized";
import { useSettingsContext } from "minimal/components/settings";

import SharedUserInfo from "./SharedUserInfo";
import UserEvents from "./UserEvents";
import UserShares from "./UserShares";
import UserSmses from "./UserSmses";
import UserFinance from "./UserFinance";
import UserAgreementFiles from "./UserAgreementFiles";
import UserUploadFiles from "./UserUploadFiles";
import UserFinanceDetail from "./UserFinanceDetail";
import UserExportFiles from "./UserExportFiles";
import UserDetailPermissionTable from "./UserDetailPermissionTable";
import UserSettings from "./UserSettings";

const useStyles = makeStyles(() => ({
  container: {
    padding: "10px 20px",
    position: "relative",
  },
  editSectionContainer: {
    borderRadius: 0,
  },
  mainLayout: {
    background: "#F5F6FA",
    paddingTop: 0,
  },
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
    alignItems: "center",
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

const CrmUser = function () {
  const { query, push, pathname } = useRouter();
  const classes = useStyles();
  const settings = useSettingsContext();
  const organizationId = useSelector(getSelectedOrgId);
  const sharedOrganizationId = query.sharedOrganizationId as string;
  const locale = useSelector(getGlobalLocale);
  const {
    data,
    mutate,
    isValidating: loading,
    isError,
  } = useOrgUser(
    {
      organizationId: sharedOrganizationId as string,
      organizationUserId: query.userId as string,
    },
    {
      locale,
    }
  );

  const { value, setValue } = useTab<string>(
    "CrmUser",
    (query.tab as string) || "none",
    true
  );

  const { data: permissions, isValidating } = useUserPermission({
    organizationId,
    serviceModuleValue: "CRM_USER",
    targetId: query.userId as string,
  });

  useBreadcrumb(
    locale === "zh_TW"
      ? data?.organizationUserNameZh || ""
      : data?.organizationUserNameEn || ""
  );

  useEffect(() => {
    if (query.tab) {
      setValue(query.tab as string);
    }
  }, [query.tab, setValue]);

  const permissionTabs = useMemo(
    () =>
      permissions?.filter(
        (per) =>
          per.permissionMap.READ &&
          per.serviceSubModuleValue !== "CRM_USER_EXPORT"
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
      })),
    [locale, permissionTabs]
  );

  return (
    <PrivateLayout title="個人-Shared">
      <Main>
        <Container maxWidth={false} className={classes.container}>
          <div
            className={clsx(
              classes.loader,
              (!data || !permissionTabs || isValidating) && classes.showLoader,
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
          {isError && <UnModuleAuthorized />}
          {value === "CRM_USER_INFO" &&
            getPermissionSubModule(value, "READ") && (
              <SharedUserInfo
                orgUser={data}
                sharedOrgId={sharedOrganizationId}
                readable
                writable={getPermissionSubModule(value, "WRITE")}
                deletable={getPermissionSubModule(value, "DELETE")}
              />
            )}
          {value === "CRM_USER_EVENTS" &&
            getPermissionSubModule(value, "READ") &&
            data && (
              <UserEvents
                orgUser={data}
                readable
                writable={getPermissionSubModule(value, "WRITE")}
                deletable={getPermissionSubModule(value, "DELETE")}
              />
            )}
          {value === "CRM_USER_SIGNATURE" &&
            getPermissionSubModule(value, "READ") && (
              <EditSection className={classes.editSectionContainer}>
                <UserAgreementFiles
                  data={data?.agreementFileList}
                  readable
                  writable={getPermissionSubModule(value, "WRITE")}
                  deletable={getPermissionSubModule(value, "DELETE")}
                />
              </EditSection>
            )}
          {value === "CRM_USER_FILES" && getPermissionSubModule(value, "READ") && (
            <EditSection className={classes.editSectionContainer}>
              <UserUploadFiles
                orgUserId={query.userId as string}
                data={data?.userFileList}
                loading={loading && !isError}
                readable
                writable={getPermissionSubModule(value, "WRITE")}
                deletable={getPermissionSubModule(value, "DELETE")}
                onMergeSuccess={() => mutate()}
                mutate={mutate}
              />
            </EditSection>
          )}
          {value === "CRM_USER_FINANCE" &&
            getPermissionSubModule(value, "READ") && (
              <>
                <EditSection
                  className={classes.editSectionContainer}
                  sx={{ mt: 2, mb: 2 }}
                >
                  <UserFinance
                    orgUser={data}
                    readable
                    writable={getPermissionSubModule(value, "WRITE")}
                    deletable={getPermissionSubModule(value, "DELETE")}
                  />
                </EditSection>
                <EditSection className={classes.editSectionContainer}>
                  <UserFinanceDetail
                    orgUser={data}
                    readable
                    writable={getPermissionSubModule(value, "WRITE")}
                    deletable={getPermissionSubModule(value, "DELETE")}
                  />
                </EditSection>
              </>
            )}
          {value === "CRM_USER_SHARE" && getPermissionSubModule(value, "READ") && (
            <EditSection className={classes.editSectionContainer}>
              <UserShares
                orgUser={data}
                readable
                writable={getPermissionSubModule(value, "WRITE")}
                deletable={getPermissionSubModule(value, "DELETE")}
              />
            </EditSection>
          )}
          {value === "CRM_USER_SMS" && getPermissionSubModule(value, "READ") && (
            <EditSection className={classes.editSectionContainer}>
              <UserSmses
                orgUser={data}
                readable
                writable={getPermissionSubModule(value, "WRITE")}
                deletable={getPermissionSubModule(value, "DELETE")}
              />
            </EditSection>
          )}
          {value === "CRM_USER_EXPORT" &&
            getPermissionSubModule(value, "READ") && (
              <EditSection className={classes.editSectionContainer}>
                <UserExportFiles
                  orgUser={data}
                  readable
                  writable={getPermissionSubModule(value, "WRITE")}
                  deletable={getPermissionSubModule(value, "DELETE")}
                />
              </EditSection>
            )}
          {value === "CRM_USER_AUTH" &&
            getPermissionSubModule(value, "READ") && (
              <UserDetailPermissionTable
                readable
                writable={getPermissionSubModule(value, "WRITE")}
                deletable={getPermissionSubModule(value, "DELETE")}
                targetId={query.userId as string}
              />
            )}
          {value === "CRM_USER_SETTINGS" &&
            getPermissionSubModule(value, "READ") && (
              <UserSettings
                organizationId={organizationId}
                orgUser={data}
                readable
                writable={getPermissionSubModule(value, "WRITE")}
                deletable={getPermissionSubModule(value, "DELETE")}
              />
            )}
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default CrmUser;
