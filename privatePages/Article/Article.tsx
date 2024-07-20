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
import { getOpenStatus, getChangeStatus } from "redux/froalaEditor/selectors";

import UserTargetPermissionTable from "components/UserTargetPermissionManagement/UserTargetPermissionTable";
import PrivateLayout from "components/PrivateLayout";
import ResponsiveTabs, { TabDataItem } from "components/ResponsiveTabs";

import { ServiceModuleValue } from "interfaces/utils";
import useBreadcrumb from "utils/useBreadcrumb";
import useOrgArticle from "utils/useOrgArticle";

import ArticleInfo from "./ArticleInfo";
import ArticleSetting from "./ArticleSetting";

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

const Article = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const { query, push, pathname } = useRouter();
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const editorState = useSelector(getOpenStatus);
  const changeStatus = useSelector(getChangeStatus);
  const { openSnackbar, closeSnackbar } =
    useReduxSnackbar<SnackbarProps>(SNACKBAR);
  const classes = useStyles();
  const { data, isValidating, error } = useOrgArticle(
    {
      organizationId,
      articleId: query.articleId as string,
    },
    {
      locale,
    }
  );
  const { value, setValue } = useTab("Article", "none", true);

  useBreadcrumb(`${data?.articleTitle ? data?.articleTitle : ""}` || "");

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

  const { data: permissions } = useUserPermission({
    organizationId,
    serviceModuleValue: "ARTICLE",
    targetId: query.articleId as string,
  });

  const permissionTabs = useMemo(
    () =>
      permissions?.filter(
        (per) =>
          // temporily filter out "Files" permission in tabs
          per.permissionMap?.READ && per.serviceSubModuleNameEn !== "Files"
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

  // temporarily disabling Files permission for Article module
  const disabledPermissions = useMemo<string[]>(() => ["Files"], []);

  const tabData = useMemo(() => {
    const data: TabDataItem[] = [];
    permissions?.map((e, index) => {
      if (!disabledPermissions?.includes(e.serviceSubModuleNameEn))
        data.push({
          value: e.serviceSubModuleValue,
          label:
            locale === "zh_TW"
              ? e?.serviceSubModuleNameZh || ""
              : e?.serviceSubModuleNameEn || "",
          id: `articles-tab-${e.serviceSubModuleValue}`,
          testId: `article-tab-${index}`,
        });
      return data;
    });
    return data;
  }, [disabledPermissions, locale, permissions]);
  // temporarily disabling Files permission for Article module

  const translatedTitle = `${data?.articleTitle || ""} | ${
    wordLibrary?.["文章討論"] ?? "文章討論"
  } | ${wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"}`;

  return (
    <PrivateLayout title={translatedTitle} isLoading={isValidating}>
      <Main>
        <Container maxWidth={false} className={classes.container}>
          <ResponsiveTabs
            value={value}
            tabData={tabData}
            onChange={(value) => {
              if (value === "ARTICLE_SETTINGS" && editorState && changeStatus) {
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
                        id="tabs-snackbar-leave-button"
                        data-tid="tabs-snackbar-leave-button"
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
                        id="tabs-snackbar-save-button"
                        data-tid="tabs-snackbar-save-button"
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
          />
          {value === "ARTICLE_INFO" &&
            getPermissionSubModule(value, "READ") && (
              <ArticleInfo
                articleId={query.articleId as string}
                readable
                writable={getPermissionSubModule(value, "WRITE")}
                deletable={getPermissionSubModule(value, "DELETE")}
                tabValue={value}
                tabData={tabData}
              />
            )}
          {value === "ARTICLE_AUTH" &&
            getPermissionSubModule("ARTICLE_AUTH", "READ") && (
              <UserTargetPermissionTable
                targetId={query.articleId as string}
                serviceModuleValue={ServiceModuleValue.ARTICLE}
                readable={getPermissionSubModule(value, "READ")}
                writable={getPermissionSubModule(value, "WRITE")}
                deletable={getPermissionSubModule(value, "DELETE")}
                disabledPermissions={disabledPermissions}
              />
            )}
          {value === "ARTICLE_SETTINGS" &&
            getPermissionSubModule(value, "READ") && (
              <ArticleSetting
                articleId={query.articleId as string}
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

export default Article;
