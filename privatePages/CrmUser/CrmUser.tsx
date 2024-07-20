import React, { useEffect, useMemo, useState } from "react";

import useTab from "@eGroupAI/hooks/useTab";
import Label from "minimal/components/label";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import { useRouter } from "next/router";
import useBreadcrumb from "utils/useBreadcrumb";
import useOrgUser from "utils/useOrgUser";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { ServiceModuleValue } from "interfaces/utils";

import CircularProgress from "@eGroupAI/material/CircularProgress";
import Main from "@eGroupAI/material-layout/Main";
import Fab from "@eGroupAI/material/Fab";
import { makeStyles } from "@mui/styles";
import ListRoundedIcon from "@mui/icons-material/ListRounded";
import Container from "@eGroupAI/material/Container";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import useUserPermission from "@eGroupAI/hooks/apis/useUserPermission";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SNACKBAR } from "components/App";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import PrivateLayout from "components/PrivateLayout";
import EditSection from "components/EditSection";
import ResponsiveTabs from "components/ResponsiveTabs";
import UnModuleAuthorized from "components/PrivateLayout/UnModuleAuthorized";
import { DIALOG as CONFIRM_DIALOG } from "components/ConfirmDialog";
import clsx from "clsx";
import { useSettingsContext } from "minimal/components/settings";

import UserInfo from "./UserInfo";
import UserEvents from "./UserEvents";
import UserShares from "./UserShares";
import UserSmses from "./UserSmses";
import UserSeses from "./UserSeses";
import UserLines from "./UserLines";
import UserFinance from "./UserFinance";
import UserAgreementFiles from "./UserAgreementFiles";
import UserUploadFiles from "./UserUploadFiles";
import UserFinanceDetail from "./UserFinanceDetail";
import UserExportFiles from "./UserExportFiles";
import UserDetailPermissionTable from "./UserDetailPermissionTable";
import UserSettings from "./UserSettings";
import CrmUserTabDrawer from "./CrmUserTabDrawer";

const useStyles = makeStyles(() => ({
  container: {
    padding: "10px 20px",
    position: "relative",
  },
  editSectionContainer: {
    padding: 0,
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
  menuIcon: {
    position: "fixed",
    bottom: 90,
  },
  right: {
    right: 20,
  },
  left: {
    left: 20,
  },
}));

const CrmUser = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const { query, push, pathname } = useRouter();
  const classes = useStyles();
  const settings = useSettingsContext();
  const rtl = settings.themeDirection === "rtl";
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const [isOpenCommentDrawer, setIsOpenCommentDrawer] =
    useState<boolean>(false);

  const { openSnackbar, closeSnackbar } =
    useReduxSnackbar<SnackbarProps>(SNACKBAR);
  const { openDialog: openConfirmDialog, closeDialog: closeConfirmDialog } =
    useReduxDialog(CONFIRM_DIALOG);

  const {
    data,
    mutate: mutateOrgUser,
    isValidating: loading,
    isError,
    error,
  } = useOrgUser(
    {
      organizationId,
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

  const { excute: unbindLine } = useAxiosApiWrapper(
    apis.org.unbindLine,
    "Delete"
  );

  const handleOpenCommentDrawer = () => {
    setTimeout(() => {
      setIsOpenCommentDrawer(true);
    }, 400);
  };

  const handleCloseCommentDrawer = () => {
    setIsOpenCommentDrawer(false);
  };

  useBreadcrumb(
    locale === "zh_TW"
      ? data?.organizationUserNameZh || ""
      : data?.organizationUserNameEn || ""
  );

  useEffect(() => {
    if (error?.response?.status === 404) {
      push({
        pathname: pathname.split("[")[0],
      });
    }
  }, [error, pathname, push]);

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

  const handleLineUnbind = () => {
    openConfirmDialog({
      primary: "是否確定要解除綁定LINE帳號？",
      onConfirm: async () => {
        if (organizationId && query.userId && data?.lineId) {
          try {
            closeConfirmDialog();
            openSnackbar({
              message: wordLibrary?.["please wait"] ?? "請稍後",
              severity: "warning",
              autoHideDuration: 999999,
            });
            await unbindLine({
              organizationId,
              targetId: query.userId as string,
              targetServiceModule: ServiceModuleValue.CRM_USER,
              lineId: data?.lineId,
            });
            closeSnackbar();
            openSnackbar({
              message: "解除綁定成功",
              severity: "success",
              autoHideDuration: 4000,
            });
            mutateOrgUser();
          } catch (error) {
            apis.tools.createLog({
              function: "unbindLine: error",
              browserDescription: window.navigator.userAgent,
              jsonData: {
                data: error,
                deviceInfo: getDeviceInfo(),
              },
              level: "ERROR",
            });
          }
        }
      },
    });
  };

  const subNavbarText = (
    <Label
      variant="soft"
      sx={{
        position: "relative",
        padding: "15px",
        margin: "10px",
        backgroundColor: data?.hasBindingLineId ? "#06c755" : "#dfe3e8",
        color: data?.hasBindingLineId ? "white" : "black",
        cursor: data?.hasBindingLineId ? "pointer" : "default",
      }}
      {...(data?.hasBindingLineId &&
        getPermissionSubModule("CRM_USER_LINE", "DELETE") && {
          onClick: handleLineUnbind,
        })}
    >
      {data?.hasBindingLineId ? "已綁定LINE" : "未綁定LINE"}
    </Label>
  );

  const tabData = useMemo(
    () =>
      permissionTabs?.map((e) => {
        let id: string | undefined;
        let testId: string | undefined;

        if (e.serviceSubModuleValue === "CRM_USER_INFO") {
          id = "crm-user-tab-info";
          testId = "crm-user-tab-0";
        } else if (e.serviceSubModuleValue === "CRM_USER_EVENTS") {
          id = "crm-user-tab-events";
          testId = "crm-user-tab-1";
        } else if (e.serviceSubModuleValue === "CRM_USER_SIGNATURE") {
          id = "crm-user-tab-signature";
          testId = "crm-user-tab-2";
        } else if (e.serviceSubModuleValue === "CRM_USER_FILES") {
          id = "crm-user-tab-files";
          testId = "crm-user-tab-3";
        } else if (e.serviceSubModuleValue === "CRM_USER_FINANCE") {
          id = "crm-user-tab-finance";
          testId = "crm-user-tab-4";
        } else if (e.serviceSubModuleValue === "CRM_USER_SHARE") {
          id = "crm-user-tab-share";
          testId = "crm-user-tab-5";
        } else if (e.serviceSubModuleValue === "CRM_USER_SMS") {
          id = "crm-user-tab-sms";
          testId = "crm-user-tab-6";
        } else if (e.serviceSubModuleValue === "CRM_USER_SES") {
          id = "crm-user-tab-ses";
          testId = "crm-user-tab-7";
        } else if (e.serviceSubModuleValue === "CRM_USER_LINE") {
          id = "crm-user-tab-line";
          testId = "crm-user-tab-8";
        } else if (e.serviceSubModuleValue === "CRM_USER_AUTH") {
          id = "crm-user-tab-auth";
          testId = "crm-user-tab-9";
        } else if (e.serviceSubModuleValue === "CRM_USER_SETTINGS") {
          id = "crm-user-tab-settings";
          testId = "crm-user-tab-10";
        }

        return {
          value: e.serviceSubModuleValue,
          label:
            locale === "zh_TW"
              ? e?.serviceSubModuleNameZh || ""
              : e?.serviceSubModuleNameEn || "",
          id: id ?? "",
          testId: testId ?? "",
        };
      }),
    [permissionTabs, locale]
  );

  const translatedTitle = `${data?.organizationUserNameZh || ""} | ${
    wordLibrary?.["客戶管理"] ?? "客戶管理"
  } - ${wordLibrary?.["個人列表"] ?? "個人列表"} | ${
    wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
  }`;

  return (
    <PrivateLayout
      title={translatedTitle}
      subNavbarText={subNavbarText}
      isLoading={loading}
    >
      <Main>
        <Container maxWidth={false}>
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
          {value === "CRM_USER_INFO" && getPermissionSubModule(value, "READ") && (
            <UserInfo
              orgUser={data}
              readable
              writable={getPermissionSubModule(value, "WRITE")}
              deletable={getPermissionSubModule(value, "DELETE")}
              tabValue={value}
              tabData={tabData}
              isOpenDrawer={isOpenCommentDrawer}
              setIsOpenDrawer={(isOpen) => {
                setIsOpenCommentDrawer(isOpen);
              }}
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
                  orgUserId={query.userId as string}
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
                data={data?.userFileList || []}
                loading={loading && !isError}
                readable
                writable={getPermissionSubModule(value, "WRITE")}
                deletable={getPermissionSubModule(value, "DELETE")}
                onMergeSuccess={() => mutateOrgUser()}
                mutate={mutateOrgUser}
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
                    orgUserId={query.userId as string}
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
                orgUserId={query.userId as string}
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
                orgUserId={query.userId as string}
                orgUser={data}
                readable
                writable={getPermissionSubModule(value, "WRITE")}
                deletable={getPermissionSubModule(value, "DELETE")}
              />
            </EditSection>
          )}
          {value === "CRM_USER_SES" && data && (
            <EditSection className={classes.editSectionContainer}>
              <UserSeses
                orgUserId={query.userId as string}
                orgUser={data}
                readable
                writable={getPermissionSubModule(value, "WRITE")}
                deletable={getPermissionSubModule(value, "DELETE")}
              />
            </EditSection>
          )}
          {value === "CRM_USER_LINE" && getPermissionSubModule(value, "READ") && (
            <EditSection className={classes.editSectionContainer}>
              <UserLines
                orgUserId={query.userId as string}
                orgUser={data}
                readable
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
        {value !== "CRM_USER_INFO" && (
          <>
            <Fab
              color="primary"
              className={clsx(classes.menuIcon, {
                [classes.left]: rtl,
                [classes.right]: !rtl,
              })}
              onClick={handleOpenCommentDrawer}
            >
              <ListRoundedIcon />
            </Fab>
            <CrmUserTabDrawer
              isOpen={isOpenCommentDrawer}
              onClickAway={handleCloseCommentDrawer}
              tabValue={value}
              tabData={tabData}
            />
          </>
        )}
      </Main>
    </PrivateLayout>
  );
};

export default CrmUser;
