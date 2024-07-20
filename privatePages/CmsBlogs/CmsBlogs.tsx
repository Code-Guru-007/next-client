import React, { useEffect, useLayoutEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import useTab from "@eGroupAI/hooks/useTab";
import { useRouter } from "next/router";

import Main from "@eGroupAI/material-layout/Main";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";

import { Button, FormControl, MenuItem, Select } from "@mui/material";
import Iconify from "minimal/components/iconify";

import ResponsiveTabs from "components/ResponsiveTabs";
import PrivateLayout from "components/PrivateLayout";
import TagGroupsDataTable from "components/TagGroups/TagGroupsDataTable";
import { ServiceModuleValue } from "interfaces/utils";
import useModulePermissionValid from "components/PermissionValid/useModulePermissionValid";
import { getGlobalLocale } from "components/PrivateLayout/selectors";

import CmsBlogsInfo from "./CmsBlogsInfo";

function CmsProductions() {
  const wordLibrary = useSelector(getWordLibrary);
  const tabData = [
    {
      value: "info",
      label: "SEO",
    },
    {
      value: "articleListCarousel",
      label: "輪播圖",
    },
    {
      value: "articleManagement",
      label: wordLibrary?.["article management"] ?? "文章管理",
    },
    {
      value: "tagGroup",
      label: wordLibrary?.["tag group management"] ?? "標籤管理",
    },
  ];
  const { query, push, pathname } = useRouter();
  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, handleChange } = useTab<string>(
    "CmsBlogs",
    (tabValue as string) || "info",
    true
  );
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [sortOpenDialog, setSortOpenDialog] = useState<boolean>(false);
  useEffect(() => {
    if (query.tab) {
      handleChange(query.tab as string);
    }
  }, [handleChange, query.tab]);

  useEffect(() => {
    if (value === "none") {
      handleChange("info");
      push({
        pathname,
        query: {
          ...query,
          tab: "info",
        },
      });
    }
  }, [pathname, push, query, handleChange, value]);
  const { hasModulePermission: tagGroup } = useModulePermissionValid({
    targetPath: "/me/tag-groups",
    modulePermissions: ["LIST", "READ"],
  });
  const actionButton = useMemo(() => {
    if (value === "articleListCarousel") {
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
            onClick={() => setSortOpenDialog(true)}
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
    if (value === "articleManagement") {
      return (
        <div>
          <Button
            sx={{ mx: 1 }}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => {
              handleOpen();
            }}
          >
            新增
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
    if (value === "info") {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocale, value]);

  const { isOpen, handleClose, handleOpen } = useIsOpen(false);

  useLayoutEffect(() => {
    if (query.tab) {
      handleChange(query.tab as string);
    }
  }, [handleChange, query.tab]);

  const translatedTitle = `${wordLibrary?.["網站管理"] ?? "網站管理"} - ${
    wordLibrary?.["文章管理"] ?? "文章管理"
  } | ${wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"}`;

  useEffect(() => {
    setOpenAddDialog(false);
    setSortOpenDialog(false);
  }, [value]);

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
        {tabData
          .map((v) => v.value !== "tagGroup" && v.value)
          .includes(value) && (
          <CmsBlogsInfo
            dialogProps={{
              isOpen,
              handleClose,
              openAddDialog,
              sortOpenDialog,
              setOpenAddDialog,
              setSortOpenDialog,
              selectedLocale,
            }}
            tabData={value}
          />
        )}
        {value === "tagGroup" && (
          <TagGroupsDataTable
            organizationId={organizationId}
            serviceModuleValue={ServiceModuleValue.CMS_BLOG}
          />
        )}
      </Main>
    </PrivateLayout>
  );
}

export default CmsProductions;
