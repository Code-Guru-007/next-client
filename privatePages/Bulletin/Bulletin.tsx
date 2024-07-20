import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { makeStyles } from "@mui/styles";
import { Button, alpha } from "@mui/material";

import useTab from "@eGroupAI/hooks/useTab";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import useUserPermission from "@eGroupAI/hooks/apis/useUserPermission";

import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import { SNACKBAR } from "components/App";
import { getChangeStatus, getOpenStatus } from "redux/froalaEditor/selectors";

import PrivateLayout from "components/PrivateLayout";
import ResponsiveTabs, { TabDataItem } from "components/ResponsiveTabs";
import useBreadcrumb from "utils/useBreadcrumb";
import useBulletin from "utils/Bulletin/useBulletin";
import BulletinInfo from "./BulletinInfo";
import BulletinSetting from "./BulletinSetting";
import BulletinPermissionManage from "./BulletinPermissionManage";

const useStyles = makeStyles(() => ({
  container: {
    padding: "10px 20px",
    position: "relative",
  },
  tabContainer: {
    borderRadius: 0,
    boxShadow: "none",
    padding: 0,
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

const Bulletin = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const { query, push, pathname } = useRouter();
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const editorState = useSelector(getOpenStatus);
  const changeStatus = useSelector(getChangeStatus);
  const { openSnackbar, closeSnackbar } =
    useReduxSnackbar<SnackbarProps>(SNACKBAR);
  const classes = useStyles();
  const { data, error, isValidating } = useBulletin(
    {
      organizationId,
      bulletinId: query.bulletinId as string,
    },
    {
      locale,
    }
  );
  const { value, setValue } = useTab("Bulletin", "none", true);

  useBreadcrumb(`${data?.bulletinTitle ? data?.bulletinTitle : ""}` || "");

  const { data: permissions } = useUserPermission({
    organizationId,
    serviceModuleValue: "BULLETIN",
    targetId: query.bulletinId as string,
  });

  const permissionTabs = useMemo(
    () => permissions?.filter((per) => per.permissionMap?.READ),
    [permissions]
  );

  useEffect(() => {
    if (error?.response?.status === 404) {
      push({
        pathname: pathname.split("[")[0],
      });
    }
  }, [error, pathname, push]);

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
    if (!permissions) return false;
    return !!permissions.filter((p) => p.serviceSubModuleValue === value)[0]
      ?.permissionMap?.[permission];
  };

  const tabData = useMemo(() => {
    const data: TabDataItem[] = [];
    permissionTabs?.map((e) =>
      data.push({
        id: `${e.serviceSubModuleValue}-btn`,
        testId: `${e.serviceSubModuleValue}-btn`,
        value: e.serviceSubModuleValue,
        label:
          locale === "zh_TW"
            ? e?.serviceSubModuleNameZh || ""
            : e?.serviceSubModuleNameEn || "",
      })
    );
    return data;
  }, [locale, permissionTabs]);

  useEffect(() => {
    if (query.tab) {
      setValue(query.tab as string);
    }
  }, [query.tab, setValue]);

  const translatedTitle = `${data?.bulletinTitle || ""} | ${
    wordLibrary?.["佈告欄"] ?? "佈告欄"
  } | ${wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"}`;
  return (
    <PrivateLayout title={translatedTitle} isLoading={isValidating}>
      <Main>
        <Container maxWidth={false} className={classes.container}>
          <ResponsiveTabs
            value={value}
            tabData={tabData}
            onChange={(value) => {
              if (
                (value === "BULLETIN_AUTH" || value === "BULLETIN_SETTINGS") &&
                editorState &&
                changeStatus
              ) {
                openSnackbar({
                  message:
                    "您的資料還未保存，請確認並進行儲存，以免重要資訊的遺失。",
                  severity: "error",
                  action: (
                    <>
                      <Button
                        color="inherit"
                        size="small"
                        variant="outlined"
                        sx={{
                          mr: 1,
                          border: (theme) =>
                            `1px solid ${alpha(
                              theme.palette.common.white,
                              0.48
                            )}`,
                        }}
                        onClick={() => {
                          closeSnackbar({ action: null });
                          setValue(value);
                          push({
                            pathname,
                            query: {
                              ...query,
                              tab: value,
                            },
                          });
                        }}
                        id="tabs-snackbar-leave-btn"
                        data-tid="tabs-snackbar-leave-btn"
                      >
                        Leave
                      </Button>

                      <Button
                        size="small"
                        color="info"
                        variant="contained"
                        sx={{
                          bgcolor: "info.dark",
                        }}
                        onClick={async () => {
                          closeSnackbar({ action: null });
                          const saveBtn: HTMLButtonElement | null =
                            document.querySelector(
                              ".MuiLoadingButton-root.MuiButton-root.MuiButton-contained.MuiButton-containedInherit.MuiButton-sizeMedium.MuiButton-containedSizeMedium.MuiButton-colorInherit.MuiButton-disableElevation.MuiButtonBase-root.css-7eab8y-MuiButtonBase-root-MuiButton-root-MuiLoadingButton-root"
                            );
                          if (saveBtn) {
                            saveBtn.click();
                            push({
                              pathname,
                              query: {
                                ...query,
                                tab: value,
                              },
                            });
                          }
                        }}
                        id="tabs-snackbar-save-btn"
                        data-tid="tabs-snackbar-save-btn"
                      >
                        Save
                      </Button>
                    </>
                  ),
                });
              } else {
                push({
                  pathname,
                  query: {
                    ...query,
                    tab: value,
                  },
                });
              }
            }}
            id="responsive-tabs"
            data-tid="responsive-tabs"
          />
          {value === "BULLETIN_INFO" &&
            getPermissionSubModule("BULLETIN_INFO", "READ") && (
              <BulletinInfo
                bulletinId={query.bulletinId as string}
                readable={getPermissionSubModule("BULLETIN_INFO", "READ")}
                writable={getPermissionSubModule("BULLETIN_INFO", "WRITE")}
                deletable={getPermissionSubModule("BULLETIN_INFO", "DELETE")}
                tabValue={value}
                tabData={tabData}
              />
            )}
          {value === "BULLETIN_AUTH" &&
            getPermissionSubModule("BULLETIN_AUTH", "READ") && (
              <BulletinPermissionManage
                targetId={query.bulletinId as string}
                readable={getPermissionSubModule("BULLETIN_AUTH", "READ")}
                writable={getPermissionSubModule("BULLETIN_AUTH", "WRITE")}
                deletable={getPermissionSubModule("BULLETIN_AUTH", "DELETE")}
              />
            )}
          {value === "BULLETIN_SETTINGS" &&
            getPermissionSubModule("BULLETIN_SETTINGS", "READ") && (
              <BulletinSetting
                bulletin={data}
                organizationId={organizationId}
                orgUser={data}
                readable={getPermissionSubModule("BULLETIN_SETTINGS", "READ")}
                writable={getPermissionSubModule("BULLETIN_SETTINGS", "WRITE")}
                deletable={getPermissionSubModule(
                  "BULLETIN_SETTINGS",
                  "DELETE"
                )}
              />
            )}
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default Bulletin;
