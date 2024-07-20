import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useRouter } from "next/router";

import { makeStyles } from "@mui/styles";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useTab from "@eGroupAI/hooks/useTab";
import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";

import { SNACKBAR } from "components/App";
import { Button, alpha } from "@mui/material";
import { getOpenStatus } from "redux/froalaEditor/selectors";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";

import PrivateLayout from "components/PrivateLayout";
import TagGroupsDataTable from "components/TagGroups/TagGroupsDataTable";
import ResponsiveTabs from "components/ResponsiveTabs";
import { ServiceModuleValue } from "interfaces/utils";

import useOrgOwnerValid from "components/PermissionValid/useOrgOwnerValid";
import useModulePermissionValid from "components/PermissionValid/useModulePermissionValid";

import ArticlesDataTable from "./ArticlesDataTable";

const useStyles = makeStyles(() => ({
  container: {
    padding: "10px 20px",
    position: "relative",
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

const Articles = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const tabData = [
    {
      value: "publish",
      label: wordLibrary?.published ?? "已發布",
      id: "articles-tab-publish",
      testId: "articles-tab-0",
    },
    {
      value: "draft",
      label: wordLibrary?.draft ?? "未發布",
      id: "articles-tab-draft",
      testId: "articles-tab-1",
    },
    {
      value: "tagGroup",
      label: wordLibrary?.["label management"] ?? "標籤管理",
      id: "articles-tab-tagGroup",
      testId: "articles-tab-2",
    },
  ];
  const organizationId = useSelector(getSelectedOrgId);
  const router = useRouter();
  const { query, push, pathname } = useRouter();
  const classes = useStyles();
  const editorState = useSelector(getOpenStatus);
  const { openSnackbar } = useReduxSnackbar(SNACKBAR);

  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, handleChange } = useTab<string>(
    "Articles",
    (tabValue as string) || "none",
    true
  );

  const isOrgOwner = useOrgOwnerValid(true);
  const { hasModulePermission: isDynamicColumnPerms } =
    useModulePermissionValid({
      modulePermissions: ["LIST", "READ", "CREATE", "UPDATE_ALL", "DELETE_ALL"],
      targetPath: "/me/dynamic-columns",
    });

  const { hasModulePermission: tagGroup } = useModulePermissionValid({
    targetPath: "/me/tag-groups",
    modulePermissions: ["LIST", "READ"],
  });

  let filteredTabs;
  filteredTabs =
    isOrgOwner || isDynamicColumnPerms
      ? tabData
      : tabData.filter(
          (tab) =>
            tab.value !== "dynamicColumn" &&
            tab.value !== "dynamicColumnGroup" &&
            tab.value !== "dynamicColumnTemplate"
        );
  filteredTabs =
    isOrgOwner || tagGroup
      ? filteredTabs
      : filteredTabs.filter(({ value }) => value !== "tagGroup");

  useEffect(() => {
    if (router.query.tab) {
      handleChange(router.query.tab as string);
    }
  }, [router.query.tab, handleChange]);

  useEffect(() => {
    if (value === "none") {
      push({
        pathname,
        query: {
          ...query,
          tab: query.tab || "publish",
        },
      });
    }
  }, [pathname, push, query, handleChange, value]);

  const translatedTitle = `${wordLibrary?.["文章討論"] ?? "文章討論"} | ${
    wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
  }`;
  return (
    <PrivateLayout title={translatedTitle}>
      <Main>
        <Container maxWidth={false} className={classes.container}>
          <ResponsiveTabs
            value={String(value)}
            tabData={filteredTabs}
            onChange={(value) => {
              if (value === "ARTICLE_SETTINGS" && editorState) {
                openSnackbar({
                  message:
                    "您的資料還未保存，請確認並進行儲存，以免重要資訊的遺失。",
                  severity: "error",
                  AlertProps: {
                    shape: "round",
                  },
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
          {value === "publish" && (
            <ArticlesDataTable
              organizationId={organizationId}
              isRelease={1}
              tableName="ReleasedArticlesDataTable"
            />
          )}
          {value === "draft" && (
            <ArticlesDataTable
              organizationId={organizationId}
              tableName="NonReleasedArticlesDataTable"
            />
          )}
          {value === "tagGroup" && (
            <TagGroupsDataTable
              organizationId={organizationId}
              serviceModuleValue={ServiceModuleValue.ARTICLE}
            />
          )}
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default Articles;
