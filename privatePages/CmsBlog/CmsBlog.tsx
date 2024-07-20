import React, { useMemo, useState } from "react";

import useBreadcrumb from "utils/useBreadcrumb";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { PageType, ServiceModuleValue } from "interfaces/utils";
import useOrgBlog from "utils/useOrgBlog";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getGlobalLocale } from "components/PrivateLayout/selectors";

import { Button, FormControl, MenuItem, Select } from "@mui/material";
import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import Alert from "@eGroupAI/material/Alert";
import Box from "@eGroupAI/material/Box";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import Iconify from "minimal/components/iconify";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import PrivateLayout from "components/PrivateLayout";
import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import ResponsiveTabs from "components/ResponsiveTabs";
import OrgMediaSliderEditor from "components/OrgMediaSliderEditor";
import TagsEditor from "components/TagsEditor";
import BlogEditor from "./BlogEditor";
import RelatedProductsEditor from "./RelatedProductsEditor";
import CmsSeoBlogEditSection from "./CmsSeoBlogEditSection";

const CmsBlog = function () {
  const router = useRouter();
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const wordLibrary = useSelector(getWordLibrary);
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);
  const { blogId } = router.query;
  const [tabValue, setTabValue] = useState<string>("seo");
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openSortDialog, setOpenSortDialog] = useState<boolean>(false);
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const { data, mutate } = useOrgBlog(
    {
      organizationId,
      organizationBlogId: blogId as string,
    },
    {
      locale,
    }
  );

  const { excute: deleteOrgBlog } = useAxiosApiWrapper(
    apis.org.deleteOrgBlog,
    "Delete"
  );

  useBreadcrumb(data?.organizationBlogTitle || "");

  const handleDelete = () => {
    if (!data) return;
    openConfirmDeleteDialog({
      primary: `您確定要刪除${data.organizationBlogTitle}嗎？`,
      onConfirm: async () => {
        try {
          await deleteOrgBlog({
            organizationId,
            organizationBlogId: data.organizationBlogId,
          });
          closeConfirmDeleteDialog();
          router.replace("/me/cms/blogs");
        } catch (error) {
          apis.tools.createLog({
            function: "DatePicker: handleDelete",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: error,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
          });
        }
      },
    });
  };

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

    if (tabValue === "seo") {
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
  }, [selectedLocale, tabValue]);

  const translatedTitle = `${data?.organizationBlogTitle || ""} | ${
    wordLibrary?.["網站管理"] ?? "網站管理"
  } - ${wordLibrary?.["文章管理"] ?? "文章管理"} | ${
    wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
  } `;

  return (
    <PrivateLayout title={translatedTitle} actionsButton={actionButton}>
      <Main>
        <ResponsiveTabs
          value={tabValue}
          tabData={[
            {
              value: "seo",
              label: "文章SEO",
            },
            {
              value: "carousel",
              label: "文章輪播圖",
            },
            {
              value: "article-edit",
              label: "編輯文章",
            },
            {
              value: "related-products",
              label: "相關產品",
            },
            {
              value: "tag",
              label: "標籤管理",
            },
            {
              value: "setting",
              label: "移除文章",
            },
          ]}
          onChange={(value) => {
            setTabValue(value);
            router.push({
              pathname: router.pathname,
              query: { ...router.query, tab: value },
            });
          }}
        />
        {tabValue === "seo" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <CmsSeoBlogEditSection
              primary="文章 SEO"
              blogId={blogId as string}
              selectedLocale={selectedLocale}
            />
          </Container>
        )}
        {tabValue === "carousel" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <OrgMediaSliderEditor
              openSortModel={openSortDialog}
              setOpenSortModel={setOpenSortDialog}
              tableSelectedLocale={selectedLocale}
              openAddDialog={openAddDialog}
              setOpenAddDialog={setOpenAddDialog}
              pageType={PageType.BLOG}
              title="文章輪播圖"
              targetId={blogId as string}
            />
          </Container>
        )}
        {tabValue === "article-edit" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <EditSection>
              <BlogEditor
                blogId={blogId as string}
                selectedLocale={selectedLocale}
              />
            </EditSection>
          </Container>
        )}
        {tabValue === "related-products" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <EditSection>
              <RelatedProductsEditor blogId={blogId as string} />
            </EditSection>
          </Container>
        )}
        {tabValue === "tag" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <EditSection>
              <TagsEditor
                targetId={blogId as string}
                serviceModuleValue={ServiceModuleValue.CMS_BLOG}
                tags={data?.organizationTagTargetList?.map((el) => ({
                  ...el.organizationTag,
                  tagName: `${el.organizationTag.organizationTagGroup.tagGroupName}: ${el.organizationTag.tagName} `,
                }))}
                onClose={() => {
                  mutate();
                }}
              />
            </EditSection>
          </Container>
        )}
        {tabValue === "setting" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <EditSection>
              <EditSectionHeader primary="移除文章" />
              <Alert severity="warning">警告:刪除後將無法復原。</Alert>
              <Box display="flex" mt={1}>
                <Box flexGrow={1} />
                <Button
                  color="error"
                  variant="contained"
                  onClick={handleDelete}
                >
                  {wordLibrary?.delete ?? "刪除"}
                </Button>
              </Box>
            </EditSection>
          </Container>
        )}
      </Main>
    </PrivateLayout>
  );
};

export default CmsBlog;
