import React from "react";
import { makeStyles } from "@mui/styles";

import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import { SNACKBAR } from "components/App";
import { ContentType, PageType } from "interfaces/utils";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import apis from "utils/apis";
import useOrgProducts from "utils/useOrgProducts";
import parseCreateMediaListApiPayload from "utils/parseCreateMediaListApiPayload";
import parseOrgMediaListToImgSrc from "utils/parseOrgMediaListToImgSrc";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";

import Tooltip from "@eGroupAI/material/Tooltip";
import IconButton from "components/IconButton/StyledIconButton";
import AddIcon from "@mui/icons-material/Add";
import MoveUpIcon from "@mui/icons-material/MoveUp";
import EditSectionDialog from "components/EditSectionDialog";
import CarouselManagement from "components/CarouselManagement";
import OrgMediaSliderEditor from "components/OrgMediaSliderEditor";
import EditSection from "components/EditSection";
import EditSectionLoader from "components/EditSectionLoader";
import ProductList from "components/ProductList";
import CmsSeoPageEditSection from "components/CmsSeoPageEditSection";
import CreateProductForm, { FORM } from "./CreateProductForm";

const useStyles = makeStyles({
  editSectionContainer: {
    borderRadius: 0,
    boxShadow: "none",
    marginBottom: 0,
    borderBottom: "1px solid #EEEEEE",
  },
});

const CmsProducts = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const classes = useStyles();
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const { isOpen, handleClose, handleOpen } = useIsOpen(false);
  const { data, mutate } = useOrgProducts(
    {
      organizationId,
    },
    {
      locale,
    }
  );
  const { excute: createOrgProduct, isLoading: isCreating } =
    useAxiosApiWrapper(apis.org.createOrgProduct, "Create");
  const { excute: updateOrgProductSort } = useAxiosApiWrapper(
    apis.org.updateOrgProductSort,
    "Update"
  );
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);

  return (
    <>
      <EditSectionDialog
        primary={wordLibrary?.["add products"] ?? "新增產品"}
        open={isOpen}
        onClose={handleClose}
        updating={isCreating}
        renderForm={(selectedLocale) => (
          <CreateProductForm
            onSubmit={async (values) => {
              const isImagesUploading =
                values.organizationMediaList.filter((el) => el.isUploading)
                  .length > 0;
              if (isImagesUploading) {
                openSnackbar({
                  message: wordLibrary?.["please wait"] ?? "請稍候",
                  severity: "error",
                  autoHideDuration: 4000,
                });
              } else {
                try {
                  await createOrgProduct({
                    organizationId,
                    organizationProductName: values.organizationProductName,
                    organizationProductDescription:
                      values.organizationProductDescription,
                    organizationMediaList: parseCreateMediaListApiPayload(
                      values.organizationMediaList
                    ),
                    organizationCmsContentList: [
                      {
                        organizationCmsContentSort: 1,
                        organizationCmsContentType:
                          ContentType.PRODUCT_DESCRIPTION,
                      },
                      {
                        organizationCmsContentSort: 2,
                        organizationCmsContentType:
                          ContentType.PRODUCT_FEATURES_MEDIA,
                      },
                      {
                        organizationCmsContentSort: 3,
                        organizationCmsContentType:
                          ContentType.PRODUCT_FEATURES_LIST,
                      },
                      {
                        organizationCmsContentSort: 4,
                        organizationCmsContentType:
                          ContentType.PRODUCT_CONFIGURATION,
                      },
                      {
                        organizationCmsContentSort: 5,
                        organizationCmsContentType:
                          ContentType.PRODUCT_SPECIFICATION,
                      },
                      {
                        organizationCmsContentSort: 6,
                        organizationCmsContentType:
                          ContentType.PRODUCT_PERIPHERAL_DEVICE,
                      },
                      {
                        organizationCmsContentSort: 7,
                        organizationCmsContentType: ContentType.DOWNLOAD_FILE,
                      },
                      {
                        organizationCmsContentSort: 8,
                        organizationCmsContentType: ContentType.PRODUCT_VIDEO,
                      },
                    ],
                    locale: selectedLocale,
                  });
                  mutate();
                  handleClose();
                } catch (error) {
                  apis.tools.createLog({
                    function: "createOrgProduct: error",
                    browserDescription: window.navigator.userAgent,
                    jsonData: {
                      data: error,
                      deviceInfo: getDeviceInfo(),
                    },
                    level: "ERROR",
                  });
                }
              }
            }}
          />
        )}
        form={FORM}
      />
      <CmsSeoPageEditSection
        primary={wordLibrary?.["product list seo"] ?? "產品列表SEO"}
        pageType={PageType.PRODUCTLIST}
        className={classes.editSectionContainer}
      />
      <EditSection
        sx={{ marginBottom: 3 }}
        className={classes.editSectionContainer}
      >
        <OrgMediaSliderEditor
          pageType={PageType.PRODUCTLIST}
          title={wordLibrary?.["product carousel"] ?? "產品輪播圖"}
        />
      </EditSection>
      <EditSection className={classes.editSectionContainer}>
        <CarouselManagement
          pageType={PageType.PRODUCTLIST}
          title={wordLibrary?.["product management"] ?? "產品管理"}
          disableEditable
          SortDialogProps={{
            title: wordLibrary?.["product sorting"] ?? "產品排序",
            onClose: () => {
              mutate();
            },
            hideCreateItem: true,
          }}
          items={data?.source?.map((el, index) => ({
            ids: {
              primaryId: el.organizationProductId,
              organizationProductId: el.organizationProductId,
            },
            order: index,
            title: el.organizationProductName,
            description: el.organizationProductDescription,
            imgSrc: parseOrgMediaListToImgSrc(el.organizationMediaList),
          }))}
          onItemOrderChange={(next) => {
            updateOrgProductSort({
              organizationId,
              organizationProductList: next.map((el) => ({
                organizationProductId: el.ids.organizationProductId as string,
              })),
            });
          }}
          editTooltip={wordLibrary?.["product sorting"] ?? "產品排序"}
          editIcon={<MoveUpIcon />}
          actions={
            <Tooltip title={wordLibrary?.["add products"] ?? "新增產品"}>
              <IconButton onClick={handleOpen}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          }
        >
          {(items) => (
            <ProductList
              items={items?.map((el) => ({
                id: el.ids.primaryId,
                title: el.title,
                description: el.description,
                imgSrc: el.imgSrc,
              }))}
              loader={<EditSectionLoader />}
            />
          )}
        </CarouselManagement>
      </EditSection>
    </>
  );
};

export default CmsProducts;
