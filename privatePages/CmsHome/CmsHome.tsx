import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { Locale, PageType } from "interfaces/utils";
import useTab from "@eGroupAI/hooks/useTab";
import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import PrivateLayout from "components/PrivateLayout";
import OrgMediaSliderEditor from "components/OrgMediaSliderEditor";
import ResponsiveTabs from "components/ResponsiveTabs";
import CmsSeoPageEditSection from "components/CmsSeoPageEditSection";
import { Button, FormControl, MenuItem, Select } from "@mui/material";
import Iconify from "minimal/components/iconify";
import { getGlobalLocale } from "components/PrivateLayout/selectors";

const CmsHome = function () {
  const router = useRouter();
  const { query, push, pathname } = useRouter();
  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, handleChange } = useTab<string>(
    "CMS_HOME",
    (tabValue as string) || "none",
    true
  );
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openSortDialog, setOpenSortDialog] = useState<boolean>(false);
  const locale = useSelector(getGlobalLocale);
  const [selectedLocale, setSelectedLocale] = useState<Locale>(locale);
  const wordLibrary = useSelector(getWordLibrary);
  useEffect(() => {
    if (router.query.tab) {
      handleChange(router.query.tab as string);
    }
  }, [handleChange, router.query.tab]);

  useEffect(() => {
    if (value === "none") {
      handleChange("seo");
      push({
        pathname,
        query: {
          ...query,
          tab: query.tab || "seo",
        },
      });
    }
  }, [pathname, push, query, handleChange, value]);
  const actionButton = useMemo(() => {
    if (tabValue !== "seo") {
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
  }, [selectedLocale, tabValue]);
  const translatedTitle = `${wordLibrary?.["網站管理"] ?? "網站管理"} - ${
    wordLibrary?.["首頁管理"] ?? "首頁管理"
  } | ${wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"}`;

  return (
    <PrivateLayout title={translatedTitle} actionsButton={actionButton}>
      <Main>
        <ResponsiveTabs
          value={value}
          tabData={[
            {
              value: "seo",
              label: "SEO",
            },
            {
              value: "carousel",
              label: "輪播圖",
            },
          ]}
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

        {tabValue === "seo" && (
          <CmsSeoPageEditSection
            dialogTabShow
            selectedLocale={selectedLocale}
            primary="首頁 SEO"
            pageType={PageType.INDEX}
            sx={{ mt: 3 }}
          />
        )}
        {tabValue === "carousel" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <OrgMediaSliderEditor
              openSortModel={openSortDialog}
              setOpenSortModel={setOpenSortDialog}
              tableSelectedLocale={selectedLocale}
              openAddDialog={openAddDialog}
              setOpenAddDialog={setOpenAddDialog}
              pageType={PageType.INDEX}
              title="首頁輪播圖"
            />
          </Container>
        )}
      </Main>
    </PrivateLayout>
  );
};

export default CmsHome;
