import React, { FC, useEffect, useState } from "react";

import useOrgProduct from "utils/useOrgProduct";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import apis from "utils/apis";
import parseOrgMediaListToImgSrc from "utils/parseOrgMediaListToImgSrc";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";

import Image from "next/legacy/image";
import EditSectionHeader from "components/EditSectionHeader";
import IconButton from "components/IconButton/StyledIconButton";
import Iconify from "minimal/components/iconify";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import { MenuItem } from "@mui/material";

import EditSectionDialog from "components/EditSectionDialog";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import parseUpdateMediaPromises from "utils/parseUpdateMediaPromises";
import { Locale } from "interfaces/utils";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import CustomPopover from "minimal/components/custom-popover/custom-popover";
import { usePopover } from "minimal/components/custom-popover";
import { LoadingButton } from "@mui/lab";
import ProductInfoForm, { FORM } from "./ProductInfoForm";

export interface ProductInfoEditorProps {
  productId: string;
  selectedLocale?: Locale;
}

const ProductInfoEditor: FC<ProductInfoEditorProps> = function (props) {
  const { productId, selectedLocale } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const wordLibrary = useSelector(getWordLibrary);
  const locale = useSelector(getGlobalLocale);
  const publishedPopover = usePopover();
  const publishOptions = [
    {
      value: 1,
      label: wordLibrary?.published ?? "已發布",
    },
    {
      value: 0,
      label: wordLibrary?.draft ?? "未發布",
    },
  ];
  const { data, mutate, isValidating } = useOrgProduct(
    {
      organizationId,
      organizationProductId: productId,
    },
    {
      locale,
    }
  );
  const [organizationProductIsVisible, setOrganizationProductIsVisible] =
    useState<number>();
  const { excute: updateOrgProduct, isLoading } = useAxiosApiWrapper(
    apis.org.updateOrgProduct,
    "Update"
  );

  const { isOpen, handleClose, handleOpen } = useIsOpen(false);

  const imgUrl = parseOrgMediaListToImgSrc(data?.organizationMediaList);

  useEffect(() => {
    if (organizationProductIsVisible !== undefined)
      updateOrgProduct({
        organizationId,
        organizationProductId: productId,
        organizationProductIsVisible,
        organizationProductName: data?.organizationProductName,
        organizationProductDescription: data?.organizationProductDescription,
        locale: selectedLocale || Locale.ZH_TW,
      })
        .then(() => {
          mutate();
        })
        .catch((err) => {
          apis.tools.createLog({
            function: "updateOrgProduct: error",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: err,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
          });
        });
  }, [organizationProductIsVisible]);

  return (
    <>
      <EditSectionDialog
        tableSelectedLocale={selectedLocale}
        primary="產品資訊"
        open={isOpen}
        onClose={handleClose}
        updating={isLoading}
        renderForm={(selectedLocale) => (
          <ProductInfoForm
            onSubmit={(values, mutate) => {
              const promises: Promise<unknown>[] = parseUpdateMediaPromises(
                organizationId,
                selectedLocale,
                values.organizationMediaList
              );
              promises.push(
                updateOrgProduct({
                  organizationId,
                  organizationProductId: productId,
                  organizationProductName: values.organizationProductName,
                  organizationProductDescription:
                    values.organizationProductDescription,
                  locale: selectedLocale,
                })
              );
              Promise.all(promises)
                .then(() => {
                  mutate();
                  handleClose();
                })
                .catch((err) => {
                  apis.tools.createLog({
                    function: "updateOrgProduct: error",
                    browserDescription: window.navigator.userAgent,
                    jsonData: {
                      data: err,
                      deviceInfo: getDeviceInfo(),
                    },
                    level: "ERROR",
                  });
                });
            }}
            productId={productId}
            selectedLocale={selectedLocale}
          />
        )}
        form={FORM}
        isWidthSM={false}
      />
      <EditSectionHeader primary="產品資訊">
        <IconButton onClick={handleOpen} sx={{ mr: 1 }}>
          <Iconify icon="solar:pen-bold" />
        </IconButton>
        <LoadingButton
          color="inherit"
          variant="contained"
          loading={isValidating}
          endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
          onClick={publishedPopover.onOpen}
          sx={{
            textTransform: "capitalize",
          }}
        >
          {data?.organizationProductIsVisible === 1
            ? `${wordLibrary?.published ?? "已發布"}`
            : `${wordLibrary?.draft ?? "未發布"}`}
        </LoadingButton>
        <CustomPopover
          open={publishedPopover.open}
          onClose={publishedPopover.onClose}
          arrow="top-right"
          sx={{ width: 140 }}
        >
          {publishOptions.map((option) => (
            <MenuItem
              key={option.value}
              selected={option.value === data?.organizationProductIsVisible}
              onClick={() => {
                publishedPopover.onClose();
                setOrganizationProductIsVisible(option.value);
              }}
            >
              {option.value === 1 && (
                <Iconify icon="eva:cloud-upload-fill" sx={{ mr: 1 }} />
              )}
              {option.value === 0 && (
                <Iconify icon="solar:file-text-bold" sx={{ mr: 1 }} />
              )}
              {option.label}
            </MenuItem>
          ))}
        </CustomPopover>
      </EditSectionHeader>
      <Stack direction="column" marginBottom={2}>
        <ListItemText
          primary="產品名稱"
          secondary={data?.organizationProductName}
          primaryTypographyProps={{
            typography: "body2",
            color: "text.secondary",
            mb: 0.5,
          }}
          secondaryTypographyProps={{
            typography: "subtitle2",
            color: "text.primary",
            component: "span",
          }}
        />
      </Stack>
      <Stack direction="column" marginBottom={2}>
        <ListItemText
          primary="產品簡介"
          secondary={data?.organizationProductDescription}
          primaryTypographyProps={{
            typography: "body2",
            color: "text.secondary",
            mb: 0.5,
          }}
          secondaryTypographyProps={{
            typography: "subtitle2",
            color: "text.primary",
            component: "span",
          }}
        />
      </Stack>
      <Stack direction="column" marginBottom={2}>
        <ListItemText
          primary="產品縮圖"
          secondary=""
          primaryTypographyProps={{
            typography: "body2",
            color: "text.secondary",
            mb: 0.5,
          }}
          secondaryTypographyProps={{
            typography: "subtitle2",
            color: "text.primary",
            component: "span",
          }}
        />
      </Stack>
      {imgUrl.normal && (
        <Image src={imgUrl.normal} width={250} height={250} unoptimized />
      )}
    </>
  );
};

export default ProductInfoEditor;
