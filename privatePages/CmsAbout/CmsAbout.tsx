import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { PageType } from "interfaces/utils";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import useOrgCmsContents from "utils/useOrgCmsContents";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getGlobalLocale } from "components/PrivateLayout/selectors";

import Main from "@eGroupAI/material-layout/Main";
import useTab from "@eGroupAI/hooks/useTab";
import PrivateLayout from "components/PrivateLayout";
import OrgMediaSliderEditor from "components/OrgMediaSliderEditor";
import OrgCmsContentEditor from "components/OrgCmsContentEditor";
import CmsSeoPageEditSection from "components/CmsSeoPageEditSection";
import ResponsiveTabs from "components/ResponsiveTabs";
import { Button, FormControl, MenuItem, Select } from "@mui/material";
import Iconify from "minimal/components/iconify";

const type = [
  {
    label: "SEO",
    value: "seo",
  },
  {
    label: "輪播圖",
    value: "carousel",
  },
  {
    label: "關於我們",
    value: "aboutus",
  },
  {
    label: "核心價值",
    value: "value",
  },
  {
    label: "精神",
    value: "spirit",
  },
  {
    label: "合作夥伴",
    value: "partner",
  },
  {
    label: "與世界同在",
    value: "world",
  },
  {
    label: "我們的服務對象",
    value: "clients",
  },
  {
    label: "優勢",
    value: "advantage",
  },
  {
    label: "合作夥伴輪播圖",
    value: "partner-carousel",
  },
];

const CmsAbout = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const { query, push, pathname } = useRouter();
  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, handleChange } = useTab<string>(
    "CMS_ABOUT",
    (tabValue as string) || "none",
    true
  );
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const [searchTableData, setSearchTableData] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [sortOpenDialog, setSortOpenDialog] = useState<boolean>(false);

  const [addable, setAddable] = useState<boolean>(true);

  useEffect(() => {
    if (query.tab) {
      handleChange(query.tab as string);
    }
  }, [handleChange, query.tab]);

  useEffect(() => {
    if (value === "none") {
      handleChange("seo");
      push({
        pathname,
        query: {
          ...query,
          tab: "seo",
        },
      });
    }
  }, [pathname, push, query, handleChange, value]);
  const { data, mutate, isValidating } = useOrgCmsContents(
    {
      organizationId,
    },
    {
      locale: selectedLocale,
      PAGE_TYPE_: PageType.ABOUTUS,
    }
  );

  useEffect(() => {
    if (data?.source) {
      data.source.forEach((el) => {
        if (
          tabValue === "value" &&
          el.organizationCmsContentType === "CORE_VALUE"
        ) {
          setAddable((el.organizationMediaList?.length || 0) < 4);
        } else if (
          tabValue === "spirit" &&
          el.organizationCmsContentType === "CORE_SPIRIT"
        ) {
          setAddable((el.organizationMediaList?.length || 0) < 5);
        } else if (
          tabValue === "partner" &&
          el.organizationCmsContentType === "OUR_PARTNERS"
        ) {
          setAddable(true);
        } else if (
          tabValue === "world" &&
          el.organizationCmsContentType === "SUSTAINABLE_DEVELOPMENT"
        ) {
          setAddable((el.organizationMediaList?.length || 0) < 4);
        } else if (
          tabValue === "clients" &&
          el.organizationCmsContentType === "OUR_CLIENT"
        ) {
          setAddable(true);
        } else if (
          tabValue === "advantage" &&
          el.organizationCmsContentType === "ADVANTAGE"
        ) {
          setAddable((el.organizationMediaList?.length || 0) < 4);
        } else if (
          tabValue === "partner-carousel" &&
          el.organizationCmsContentType === "OUR_PARTNERS_SLIDER"
        ) {
          setAddable((el.organizationMediaList?.length || 0) < 4);
        }
      });
    }
  }, [data, tabValue]);

  const actionButton = useMemo(() => {
    if (tabValue === "carousel") {
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
    if (tabValue === "seo" || tabValue === "aboutus") {
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
    return (
      <div>
        {addable && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setOpenAddDialog(true)}
          >
            新增
          </Button>
        )}
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
  }, [addable, selectedLocale, tabValue]);

  useEffect(() => {
    setOpenAddDialog(false);
    setSortOpenDialog(false);
  }, [tabValue]);

  const translatedTitle = `${wordLibrary?.["網站管理"] ?? "網站管理"} - ${
    wordLibrary?.["關於我們"] ?? "關於我們"
  } | ${wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"}`;

  return (
    <PrivateLayout title={translatedTitle} actionsButton={actionButton}>
      <Main>
        <ResponsiveTabs
          value={value}
          tabData={type}
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
            primary="關於我們 SEO"
            dialogTabShow
            pageType={PageType.ABOUTUS}
            selectedLocale={selectedLocale}
            sx={{ mt: 3 }}
          />
        )}
        {tabValue === "carousel" && (
          <OrgMediaSliderEditor
            openSortModel={sortOpenDialog}
            setOpenSortModel={setSortOpenDialog}
            openAddDialog={openAddDialog}
            setOpenAddDialog={setOpenAddDialog}
            pageType={PageType.ABOUTUS}
            title="關於我們輪播圖"
            tableSelectedLocale={selectedLocale}
          />
        )}
        {data?.source.map(
          (el) =>
            ((tabValue === "aboutus" &&
              el.organizationCmsContentType === "ABOUTUS") ||
              (tabValue === "value" &&
                el.organizationCmsContentType === "CORE_VALUE") ||
              (tabValue === "spirit" &&
                el.organizationCmsContentType === "CORE_SPIRIT") ||
              (tabValue === "partner" &&
                el.organizationCmsContentType === "OUR_PARTNERS") ||
              (tabValue === "world" &&
                el.organizationCmsContentType === "SUSTAINABLE_DEVELOPMENT") ||
              (tabValue === "clients" &&
                el.organizationCmsContentType === "OUR_CLIENT") ||
              (tabValue === "advantage" &&
                el.organizationCmsContentType === "ADVANTAGE") ||
              (tabValue === "partner-carousel" &&
                el.organizationCmsContentType === "OUR_PARTNERS_SLIDER")) && (
              <OrgCmsContentEditor
                setSortOpenDialog={setSortOpenDialog}
                sortOpenDialog={sortOpenDialog}
                setSearchTableData={setSearchTableData}
                searchTableData={searchTableData}
                tableSelectedLocale={selectedLocale}
                openAddDialog={openAddDialog}
                setOpenAddDialog={setOpenAddDialog}
                key={el.organizationCmsContentId}
                data={el}
                onEditClose={() => {
                  mutate();
                }}
                loading={isValidating}
              />
            )
        )}
      </Main>
    </PrivateLayout>
  );
};

export default CmsAbout;
