import React, { FC, useEffect, useState } from "react";

import { useSelector } from "react-redux";
import apis from "utils/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import parseOrgMediaListToImgSrc from "utils/parseOrgMediaListToImgSrc";
import useOrgProducts from "utils/useOrgProducts";
import useOrgCmsContent from "utils/useOrgCmsContent";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { Locale, ServiceModuleValue } from "interfaces/utils";

import TextField from "@mui/material/TextField";
import Grid from "@eGroupAI/material/Grid";
import Autocomplete from "@eGroupAI/material/Autocomplete";
import Form from "components/Form";
import ProductList from "components/ProductList";
import FormFieldLabel from "components/FormFieldLabel";
import { ImgSrc } from "interfaces/components";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";

export interface TargetRelated {
  targetIdB: string;
  organizationProductName?: string;
  organizationProductDescription?: string;
  imgSrc?: ImgSrc;
}

export interface ProductTargetRelationsFormProps {
  cmsContentId: string | undefined;
  organizationProductId: string;
  selectedLocale: Locale;
}

const ProductTargetRelationsForm: FC<ProductTargetRelationsFormProps> =
  function (props) {
    const { cmsContentId, organizationProductId, selectedLocale } = props;
    const organizationId = useSelector(getSelectedOrgId);
    const [query, setQuery] = useState("");
    const [targetRelatedList, setTargetRelatedList] = useState<TargetRelated[]>(
      []
    );
    const { excute: createOrgTargetRelation, isLoading: isCreating } =
      useAxiosApiWrapper(apis.org.createOrgTargetRelation, "Create");
    const { excute: deleteOrgTargetRelation, isLoading: isDeleting } =
      useAxiosApiWrapper(apis.org.deleteOrgTargetRelation, "Delete");

    const { data: products, isValidating: isSearching } = useOrgProducts(
      {
        organizationId,
      },
      {
        query,
        locale: selectedLocale,
      }
    );

    const { data: cmsContent, mutate } = useOrgCmsContent(
      {
        organizationId,
        organizationCmsContentId: cmsContentId,
      },
      {
        locale: selectedLocale,
      }
    );

    useEffect(() => {
      setTargetRelatedList(
        cmsContent?.organizationProductRelatedList?.map((el) => ({
          targetIdB: el.organizationProductId,
          organizationProductName: el.organizationProductName,
          organizationProductDescription: el.organizationProductDescription,
          imgSrc: parseOrgMediaListToImgSrc(el.organizationMediaList),
        })) || []
      );
    }, [cmsContent]);

    return (
      <Form loading={isCreating || isDeleting}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormFieldLabel primary="週邊裝置">
              <Autocomplete
                options={
                  products?.source
                    ?.filter(
                      (prod) =>
                        prod.organizationProductId !== organizationProductId
                    )
                    ?.filter(
                      (prod) =>
                        !cmsContent?.organizationProductRelatedList?.find(
                          (el) =>
                            el.organizationProductId ===
                            prod?.organizationProductId
                        )
                    )
                    ?.map((el) => ({
                      productId: el.organizationProductId,
                      label: el.organizationProductName || "",
                      desc: el.organizationProductDescription || "",
                      imgSrc: parseOrgMediaListToImgSrc(
                        el.organizationMediaList
                      ),
                    })) || []
                }
                loading={isSearching}
                renderInput={(params) => (
                  <TextField
                    variant="outlined"
                    placeholder="新增週邊裝置"
                    {...params}
                    onChange={(e) => {
                      setQuery(e.target.value);
                    }}
                  />
                )}
                onChange={async (e, value) => {
                  try {
                    if (
                      value?.productId &&
                      !targetRelatedList.find(
                        (el) => el.targetIdB === value?.productId
                      )
                    ) {
                      await createOrgTargetRelation({
                        organizationId,
                        targetIdA: organizationProductId,
                        targetTypeA: ServiceModuleValue.PRODUCT,
                        targetIdB: value?.productId,
                        targetTypeB: ServiceModuleValue.PRODUCT,
                      });
                      mutate();
                    }
                  } catch (error) {
                    // eslint-disable-next-line no-console
                    apis.tools.createLog({
                      function: "createOrgTargetRelation: error",
                      browserDescription: window.navigator.userAgent,
                      jsonData: {
                        data: error,
                        deviceInfo: getDeviceInfo(),
                      },
                      level: "ERROR",
                    });
                  }
                }}
              />
            </FormFieldLabel>
          </Grid>
          <Grid item xs={12}>
            <ProductList
              items={cmsContent?.organizationProductRelatedList?.map((el) => ({
                id: el.organizationProductId,
                title: el.organizationProductName,
                description: el.organizationProductDescription,
                imgSrc: parseOrgMediaListToImgSrc(el.organizationMediaList),
                onDeleteClick: async () => {
                  try {
                    await deleteOrgTargetRelation({
                      organizationId,
                      targetIdA: organizationProductId,
                      targetIdB: el.organizationProductId,
                    });
                    mutate();
                  } catch (error) {
                    // eslint-disable-next-line no-console
                    apis.tools.createLog({
                      function: "deleteOrgTargetRelation: error",
                      browserDescription: window.navigator.userAgent,
                      jsonData: {
                        data: error,
                        deviceInfo: getDeviceInfo(),
                      },
                      level: "ERROR",
                    });
                  }
                },
              }))}
            />
          </Grid>
        </Grid>
      </Form>
    );
  };

export default ProductTargetRelationsForm;
