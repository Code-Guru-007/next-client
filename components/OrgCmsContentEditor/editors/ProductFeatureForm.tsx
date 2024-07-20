import React, { FC } from "react";

import { FormProvider } from "react-hook-form";
import { ServiceModuleValue } from "interfaces/utils";

import Grid from "@eGroupAI/material/Grid";
import Form from "components/Form";
import OrgMediaFieldArray from "components/OrgMediaFieldArray";
import OrgMediaField from "components/OrgMediaField";
import FormFieldLabel from "components/FormFieldLabel";
import useCmsContentForm from "./useCmsContentForm";
import { CmsContentFormProps } from "../typings";

export const FORM = "ProductFeatureForm";

const ProductFeatureForm: FC<CmsContentFormProps> = function (props) {
  const {
    onSubmit,
    cmsContentId,
    setFormIsDirty,
    selectedLocale,
    sortOpenDialog,
    dialogElementShow,
    setSortItems,
    handleClose,
    selectedEditItem,
    setSelectedEditItem,
    useOneItemAtOnce,
  } = props;
  const {
    mutate,
    isValidating,
    handleDeleteItem,
    handleSortItem,
    methods,
    handleUpdatedItems,
  } = useCmsContentForm({
    setFormIsDirty,
    cmsContentId: cmsContentId || "",
    selectedLocale,
    uploadFilePathType: ServiceModuleValue.CMS,
    selectedEditItem,
    setSelectedEditItem,
    useOneItemAtOnce,
  });
  const { handleSubmit, getValues } = methods;

  return (
    <FormProvider {...methods}>
      <Form
        id={FORM}
        onSubmit={handleSubmit(async () => {
          await handleUpdatedItems();
          const updatedValues = getValues();
          onSubmit(updatedValues, mutate, handleClose);
        })}
        loading={isValidating && !sortOpenDialog}
      >
        {sortOpenDialog && (
          <OrgMediaFieldArray
            setSortItems={setSortItems}
            dialogElementShow={dialogElementShow}
            sortOpenDialog={sortOpenDialog}
            filePathType={ServiceModuleValue.CMS}
            targetId={cmsContentId}
            enableLinkURL
            tagGroup={ServiceModuleValue.CMS_PRODUCT}
            onDeleteItemClick={handleDeleteItem}
            onItemOrderChange={handleSortItem}
          />
        )}
        {!sortOpenDialog && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormFieldLabel primary="影片縮圖(建議比例16:9)">
                <OrgMediaField
                  filePathType={ServiceModuleValue.CMS}
                  targetId={cmsContentId}
                  maxFields={useOneItemAtOnce ? 1 : undefined}
                  enableYoutubeUrl
                  onDeleteItemClick={handleDeleteItem}
                  onItemOrderChange={handleSortItem}
                  useOneItemAtOnce={useOneItemAtOnce}
                />
              </FormFieldLabel>
            </Grid>
          </Grid>
        )}
      </Form>
    </FormProvider>
  );
};

export default ProductFeatureForm;
