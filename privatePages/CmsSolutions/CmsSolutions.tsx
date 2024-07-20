import React, { useLayoutEffect, useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import useTab from "@eGroupAI/hooks/useTab";
import { useRouter } from "next/router";

import { Button, FormControl, MenuItem, Select } from "@mui/material";
import Iconify from "minimal/components/iconify";

import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import ResponsiveTabs from "components/ResponsiveTabs";
import PrivateLayout from "components/PrivateLayout";
import TagGroupsDataTable from "components/TagGroups/TagGroupsDataTable";
import OrgMediaSliderEditor from "components/OrgMediaSliderEditor";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import OrgSolutionsContentEditor from "components/OrgSolutionsContentEditor";
import { ServiceModuleValue, PageType } from "interfaces/utils";
import useModulePermissionValid from "components/PermissionValid/useModulePermissionValid";

import CmsSolutionsSeo from "./CmsSolutionsSeo";

function CmsSolutions() {
  const wordLibrary = useSelector(getWordLibrary);
  const tabData = [
    {
      value: "seo",
      label: "SEO",
    },
    {
      value: "carousel",
      label: "輪播圖",
    },
    {
      value: "content",
      label: "解決方案內容",
    },
    {
      value: "tagGroup",
      label: "標籤管理",
    },
  ];
  const { query, push, pathname } = useRouter();
  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, handleChange } = useTab<string>(
    "CmsSolutions",
    (tabValue as string) || "none",
    true
  );
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openSortDialog, setOpenSortDialog] = useState<boolean>(false);
  const locale = useSelector(getGlobalLocale);
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const organizationId = useSelector(getSelectedOrgId);

  useEffect(() => {
    if (query.tab) {
      handleChange(query.tab as string);
    }
  }, [handleChange, query.tab]);

  useEffect(() => {
    if (value === "none") {
      push({
        pathname,
        query: {
          ...query,
          tab: query.tab || "seo",
        },
      });
    }
  }, [pathname, push, query, handleChange, value]);

  const { hasModulePermission: tagGroup } = useModulePermissionValid({
    targetPath: "/me/tag-groups",
    modulePermissions: ["LIST", "READ"],
  });

  const actionButton = useMemo(() => {
    if (value !== "seo" && value !== "tagGroup") {
      return (
        <div>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setOpenAddDialog(true)}
          >
            新增
          </Button>
          <Button
            sx={{ mx: 1 }}
            variant="outlined"
            startIcon={<Iconify icon="akar-icons:sort" />}
            onClick={() => setOpenSortDialog(true)}
          >
            排序
          </Button>
          <FormControl size="small">
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={selectedLocale}
              onChange={(e: any) => setSelectedLocale(e.target.value)}
            >
              <MenuItem value="zh_TW">繁體中文</MenuItem>
              <MenuItem value="en_US">English</MenuItem>
            </Select>
          </FormControl>
        </div>
      );
    }
    if (value === "seo") {
      return (
        <div>
          <FormControl size="small">
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={selectedLocale}
              onChange={(e: any) => setSelectedLocale(e.target.value)}
            >
              <MenuItem value="zh_TW">繁體中文</MenuItem>
              <MenuItem value="en_US">English</MenuItem>
            </Select>
          </FormControl>
        </div>
      );
    }
    return <></>;
  }, [selectedLocale, value]);

  useLayoutEffect(() => {
    if (query.tab) {
      handleChange(query.tab as string);
    }
  }, [handleChange, query.tab]);

  const translatedTitle = `$${wordLibrary?.["網站管理"] ?? "網站管理"} - ${
    wordLibrary?.["解決方案"] ?? "解決方案"
  } | ${wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"}`;

  return (
    <PrivateLayout title={translatedTitle} actionsButton={actionButton}>
      <Main>
        <ResponsiveTabs
          value={value}
          tabData={
            tagGroup
              ? tabData
              : tabData.filter(({ value }) => value !== "tagGroup")
          }
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
        {value === "seo" && <CmsSolutionsSeo selectedLocale={selectedLocale} />}
        {value === "carousel" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <OrgMediaSliderEditor
              openSortModel={openSortDialog}
              setOpenSortModel={setOpenSortDialog}
              tableSelectedLocale={selectedLocale}
              openAddDialog={openAddDialog}
              setOpenAddDialog={setOpenAddDialog}
              pageType={PageType.SOLUTIONLIST}
              title="解決方案輪播圖"
            />
          </Container>
        )}
        {value === "content" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <OrgSolutionsContentEditor
              openSortModel={openSortDialog}
              setOpenSortModel={setOpenSortDialog}
              tableSelectedLocale={selectedLocale}
              openAddDialog={openAddDialog}
              setOpenAddDialog={setOpenAddDialog}
              pageType={PageType.SOLUTIONDETAIL}
              title="解決方案內容"
            />
          </Container>
        )}
        {value === "tagGroup" && (
          <TagGroupsDataTable
            organizationId={organizationId}
            serviceModuleValue={ServiceModuleValue.CMS_SOLUTION}
          />
        )}
      </Main>
    </PrivateLayout>
  );
}

export default CmsSolutions;
