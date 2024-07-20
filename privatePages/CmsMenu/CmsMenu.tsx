import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { FormControl, MenuItem, Select } from "@mui/material";
import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import useTab from "@eGroupAI/hooks/useTab";
import PrivateLayout from "components/PrivateLayout";
import { Locale } from "interfaces/utils";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import ResponsiveTabs from "components/ResponsiveTabs";
import CmsMenuNavbar from "./CmsMenuNavbar";
import CmsMenuHome from "./CmsMenuHome";
import CmsMenuProduct from "./CmsMenuProduct";
import CmsMenuBlog from "./CmsMenuBlog";

const CmsMenu = function () {
  const { query, push, pathname } = useRouter();
  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, handleChange } = useTab<string>(
    "CMS_MENU",
    (tabValue as string) || "none",
    true
  );
  const locale = useSelector(getGlobalLocale);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [openSubEditDialog, setOpenSubEditDialog] = useState<boolean>(false);
  const [selectedLocale, setSelectedLocale] = useState<Locale>(locale);
  const wordLibrary = useSelector(getWordLibrary);

  useEffect(() => {
    if (query.tab) {
      handleChange(query.tab as string);
    }
  }, [handleChange, query.tab]);

  useEffect(() => {
    if (value === "none") {
      handleChange("navigation_var");
      push({
        pathname,
        query: {
          ...query,
          tab: "navigation_var",
        },
      });
    }
  }, [pathname, push, query, handleChange, value]);

  const actionButton = useMemo(
    () => (
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
    ),
    [selectedLocale]
  );

  const translatedTitle = `${wordLibrary?.["網站管理"] ?? "網站管理"} - ${
    wordLibrary?.["選單管理"] ?? "選單管理"
  } | ${wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"}`;

  return (
    <PrivateLayout title={translatedTitle} actionsButton={actionButton}>
      <Main>
        <ResponsiveTabs
          value={value}
          tabData={[
            {
              value: "navigation_var",
              label: "導覽列",
            },
            {
              value: "front_page",
              label: "首頁",
            },
            {
              value: "product_page",
              label: "產品頁",
            },
            {
              value: "article_page",
              label: "文章頁",
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
        {value === "navigation_var" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <CmsMenuNavbar
              tableSelectedLocale={selectedLocale}
              openEditDialog={openEditDialog}
              setOpenEditDialog={setOpenEditDialog}
              openSubEditDialog={openSubEditDialog}
              setOpenSubEditDialog={setOpenSubEditDialog}
            />
          </Container>
        )}
        {value === "front_page" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <CmsMenuHome
              tableSelectedLocale={selectedLocale}
              openEditDialog={openEditDialog}
              setOpenEditDialog={setOpenEditDialog}
            />
          </Container>
        )}
        {value === "product_page" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <CmsMenuProduct
              tableSelectedLocale={selectedLocale}
              openEditDialog={openEditDialog}
              setOpenEditDialog={setOpenEditDialog}
            />
          </Container>
        )}
        {value === "article_page" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <CmsMenuBlog
              tableSelectedLocale={selectedLocale}
              openEditDialog={openEditDialog}
              setOpenEditDialog={setOpenEditDialog}
            />
          </Container>
        )}
      </Main>
    </PrivateLayout>
  );
};

export default CmsMenu;
