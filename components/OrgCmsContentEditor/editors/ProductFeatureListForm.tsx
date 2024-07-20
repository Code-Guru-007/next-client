import React, { FC } from "react";

import { FormProvider } from "react-hook-form";
import { ServiceModuleValue } from "interfaces/utils";

import Form from "components/Form";
import OrgMediaFieldArray from "components/OrgMediaFieldArray";
import OrgMediaField from "components/OrgMediaField";
import FormFieldLabel from "components/FormFieldLabel";
import useCmsContentForm from "./useCmsContentForm";
import { CmsContentFormProps } from "../typings";

export const FORM = "ProductFeatureListForm";

const ProductFeatureListForm: FC<CmsContentFormProps> = function (props) {
  const {
    onSubmit,
    cmsContentId,
    setFormIsDirty,
    selectedLocale,
    sortOpenDialog,
    dialogElementShow,
    setSortItems,
    handleClose,
    setAddable,
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
  const { handleSubmit, watch, getValues } = methods;

  const mediaList = watch("organizationMediaList");
  if (setAddable && mediaList) setAddable(mediaList.length < 6);

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
          <FormFieldLabel primary="卡片 Icon (建議比例1:1)">
            <OrgMediaField
              filePathType={ServiceModuleValue.CMS}
              targetId={cmsContentId}
              maxFields={useOneItemAtOnce ? 1 : 6}
              enableTitle
              onDeleteItemClick={handleDeleteItem}
              onItemOrderChange={handleSortItem}
              useOneItemAtOnce={useOneItemAtOnce}
            />
          </FormFieldLabel>
        )}
      </Form>
    </FormProvider>
  );
};

export default ProductFeatureListForm;
