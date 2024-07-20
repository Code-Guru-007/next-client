import React, { useState, useMemo, useEffect } from "react";

import useBreadcrumb from "utils/useBreadcrumb";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { useRouter } from "next/router";
import useOrgProduct from "utils/useOrgProduct";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { ContentType, PageType, ServiceModuleValue } from "interfaces/utils";
import { Button, FormControl, MenuItem, Select } from "@mui/material";
import Iconify from "minimal/components/iconify";

import Main from "@eGroupAI/material-layout/Main";
import Center from "@eGroupAI/material-layout/Center";
import Container from "@eGroupAI/material/Container";
import Alert from "@eGroupAI/material/Alert";
import Box from "@eGroupAI/material/Box";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import PrivateLayout from "components/PrivateLayout";
import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import ResponsiveTabs from "components/ResponsiveTabs";
import OrgMediaSliderEditor from "components/OrgMediaSliderEditor";
import OrgCmsContentEditor from "components/OrgCmsContentEditor";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import TagsEditor from "components/TagsEditor";
import Typography from "@eGroupAI/material/Typography";
import ProductInfoEditor from "./ProductInfoEditor";
import CmsSeoProductEditSection from "./CmsSeoProductEditSection";

const CmsProduct = function () {
  const [tabValue, setTabValue] = useState<string>("seo");
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openSortDialog, setOpenSortDialog] = useState<boolean>(false);
  const locale = useSelector(getGlobalLocale);
  const router = useRouter();

  const [searchTableData, setSearchTableData] = useState("");
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const organizationId = useSelector(getSelectedOrgId);
  const wordLibrary = useSelector(getWordLibrary);
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

  const [addable, setAddable] = useState<boolean>(true);

  const { productId } = router.query;
  const { data, mutate, error, isValidating } = useOrgProduct(
    {
      organizationId,
      organizationProductId: productId as string,
    },
    {
      locale,
    }
  );

  useEffect(() => {
    if (data) {
      if (tabValue === "feature-multimedia") {
        setAddable(true);
      } else if (tabValue === "video") {
        setAddable(true);
      }
    }
  }, [data, tabValue]);

  const { excute: deleteOrgProduct } = useAxiosApiWrapper(
    apis.org.deleteOrgProduct,
    "Delete"
  );

  useBreadcrumb(data?.organizationProductName || "");

  const handleDelete = () => {
    if (!data) return;
    openConfirmDeleteDialog({
      primary: `您確定要刪除${data.organizationProductName}嗎？`,
      onConfirm: async () => {
        try {
          await deleteOrgProduct({
            organizationId,
            organizationProductId: data.organizationProductId,
          });
          closeConfirmDeleteDialog();
          router.replace("/me/cms/products");
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
    if (
      // data?.organizationCmsContentList?.length &&
      tabValue === "feature-multimedia" ||
      tabValue === "feature-cards" ||
      tabValue === "video"
    ) {
      return (
        <div>
          {addable && (
            <Button
              variant="contained"
              startIcon={<Iconify icon={"mingcute:add-line"} />}
              onClick={() => setOpenAddDialog(true)}
            >
              新增
            </Button>
          )}
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
    return <></>;
  }, [addable, selectedLocale, tabValue]);

  const renderContent = () => {
    if (error?.response?.status === 404) {
      return (
        <Center offsetTop={200}>
          <Typography variant="h6">
            {wordLibrary?.["no information found"] ?? "查無資料"}
          </Typography>
        </Center>
      );
    }

    return (
      <Main>
        <ResponsiveTabs
          value={tabValue}
          tabData={[
            {
              value: "seo",
              label: "產品SEO",
            },
            {
              value: "info",
              label: "產品資訊",
            },
            {
              value: "carousel",
              label: "產品輪播圖",
            },
            {
              value: "description",
              label: "產品描述",
            },
            {
              value: "feature-multimedia",
              label: "產品特色－多媒體",
            },
            {
              value: "feature-cards",
              label: "產品特色－卡片",
            },
            {
              value: "configuration",
              label: "產品配置",
            },
            {
              value: "specifications",
              label: "產品規格",
            },
            {
              value: "devices",
              label: "週邊裝置",
            },
            {
              value: "video",
              label: "產品影片",
            },
            {
              value: "tag",
              label: "標籤管理",
            },
            {
              value: "setting",
              label: "移除產品",
            },
          ]}
          onChange={(value) => {
            setTabValue(value);
            router.push({
              pathname: router.pathname,
              query: {
                ...router.query,
                tab: value,
              },
            });
          }}
        />
        {tabValue === "seo" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <CmsSeoProductEditSection
              selectedLocale={selectedLocale}
              primary="產品 SEO"
              productId={productId as string}
            />
          </Container>
        )}
        {tabValue === "info" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <EditSection>
              <ProductInfoEditor
                productId={productId as string}
                selectedLocale={selectedLocale}
              />
            </EditSection>
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
              pageType={PageType.PRODUCTDETAIL}
              title={wordLibrary?.["product carousel"] ?? "產品輪播圖"}
              targetId={productId as string}
            />
          </Container>
        )}
        {tabValue === "description" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <EditSection>
              <OrgCmsContentEditor
                contentType={ContentType.PRODUCT_DESCRIPTION}
                data={
                  data?.organizationCmsContentList &&
                  data?.organizationCmsContentList[0]
                }
                onEditClose={() => {
                  mutate();
                }}
                organizationProductId={data?.organizationProductId}
              />
            </EditSection>
          </Container>
        )}
        {tabValue === "feature-multimedia" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <EditSection>
              <OrgCmsContentEditor
                setSortOpenDialog={setOpenSortDialog}
                sortOpenDialog={openSortDialog}
                setSearchTableData={setSearchTableData}
                searchTableData={searchTableData}
                tableSelectedLocale={selectedLocale}
                openAddDialog={openAddDialog}
                setOpenAddDialog={setOpenAddDialog}
                contentType={ContentType.PRODUCT_FEATURES_MEDIA}
                data={
                  data?.organizationCmsContentList &&
                  data?.organizationCmsContentList[1]
                }
                onEditClose={() => {
                  mutate();
                }}
                organizationProductId={data?.organizationProductId}
                loading={isValidating}
              />
            </EditSection>
          </Container>
        )}
        {tabValue === "feature-cards" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <EditSection>
              <OrgCmsContentEditor
                setSortOpenDialog={setOpenSortDialog}
                sortOpenDialog={openSortDialog}
                setSearchTableData={setSearchTableData}
                searchTableData={searchTableData}
                tableSelectedLocale={selectedLocale}
                openAddDialog={openAddDialog}
                setOpenAddDialog={setOpenAddDialog}
                contentType={ContentType.PRODUCT_FEATURES_LIST}
                data={
                  data?.organizationCmsContentList &&
                  data?.organizationCmsContentList[2]
                }
                onEditClose={() => {
                  mutate();
                }}
                organizationProductId={data?.organizationProductId}
                setAddable={setAddable}
                loading={isValidating}
              />
            </EditSection>
          </Container>
        )}
        {tabValue === "configuration" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <EditSection>
              <OrgCmsContentEditor
                contentType={ContentType.PRODUCT_CONFIGURATION}
                data={
                  data?.organizationCmsContentList &&
                  data?.organizationCmsContentList[3]
                }
                onEditClose={() => {
                  mutate();
                }}
                organizationProductId={data?.organizationProductId}
              />
            </EditSection>
          </Container>
        )}
        {tabValue === "specifications" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <EditSection>
              <OrgCmsContentEditor
                contentType={ContentType.PRODUCT_SPECIFICATION}
                data={
                  data?.organizationCmsContentList &&
                  data?.organizationCmsContentList[4]
                }
                onEditClose={() => {
                  mutate();
                }}
                organizationProductId={data?.organizationProductId}
              />
            </EditSection>
          </Container>
        )}
        {tabValue === "devices" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <EditSection>
              <OrgCmsContentEditor
                contentType={ContentType.PRODUCT_PERIPHERAL_DEVICE}
                data={
                  data?.organizationCmsContentList &&
                  data?.organizationCmsContentList[5]
                }
                onEditClose={() => {
                  mutate();
                }}
                organizationProductId={data?.organizationProductId}
              />
            </EditSection>
          </Container>
        )}
        {tabValue === "devices" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <EditSection>
              <OrgCmsContentEditor
                contentType={ContentType.PRODUCT_PERIPHERAL_DEVICE}
                data={
                  data?.organizationCmsContentList &&
                  data?.organizationCmsContentList[6]
                }
                onEditClose={() => {
                  mutate();
                }}
                organizationProductId={data?.organizationProductId}
              />
            </EditSection>
          </Container>
        )}
        {tabValue === "video" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <EditSection>
              <OrgCmsContentEditor
                setSortOpenDialog={setOpenSortDialog}
                sortOpenDialog={openSortDialog}
                setSearchTableData={setSearchTableData}
                searchTableData={searchTableData}
                tableSelectedLocale={selectedLocale}
                openAddDialog={openAddDialog}
                setOpenAddDialog={setOpenAddDialog}
                contentType={ContentType.PRODUCT_VIDEO}
                data={
                  data?.organizationCmsContentList &&
                  data?.organizationCmsContentList[7]
                }
                onEditClose={() => {
                  mutate();
                }}
                organizationProductId={data?.organizationProductId}
                loading={isValidating}
              />
            </EditSection>
          </Container>
        )}
        {tabValue === "tag" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <EditSection>
              <TagsEditor
                targetId={productId as string}
                serviceModuleValue={ServiceModuleValue.CMS_PRODUCT}
                tags={data?.organizationTagTargetList?.map((el) => ({
                  ...el.organizationTag,
                  tagName: `${el.organizationTag.organizationTagGroup.tagGroupName}: ${el.organizationTag.tagName}`,
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
              <EditSectionHeader primary="移除產品" />
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
    );
  };

  const translatedTitle = `${data?.organizationProductName || ""} | ${
    wordLibrary?.["網站管理"] ?? "網站管理"
  } - ${wordLibrary?.["產品管理"] ?? "產品管理"} | ${
    wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
  }`;
  return (
    <PrivateLayout title={translatedTitle} actionsButton={actionButton}>
      {renderContent()}
    </PrivateLayout>
  );
};

export default CmsProduct;
