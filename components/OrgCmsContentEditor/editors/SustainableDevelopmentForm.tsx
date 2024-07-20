import React, { FC } from "react";

import { FormProvider } from "react-hook-form";

import Form from "components/Form";
import OrgMediaFieldArray from "components/OrgMediaFieldArray";
import OrgMediaField from "components/OrgMediaField";
import { ServiceModuleValue } from "interfaces/utils";
import useCmsContentForm from "./useCmsContentForm";
import { CmsContentFormProps } from "../typings";

export const FORM = "SustainableDevelopmentForm";

const SustainableDevelopmentForm: FC<CmsContentFormProps> = function (props) {
  const {
    onSubmit,
    cmsContentId,
    setFormIsDirty,
    setFormIsBusy,
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
    isUploading,
  } = useCmsContentForm({
    setFormIsDirty,
    setFormIsBusy,
    cmsContentId: cmsContentId || "",
    selectedLocale,
    uploadFilePathType: ServiceModuleValue.CMS,
    selectedEditItem,
    setSelectedEditItem,
    useOneItemAtOnce,
  });
  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <Form
        id={FORM}
        onSubmit={handleSubmit(async () => {
          await handleUpdatedItems();
          const updatedValues = methods.getValues();
          onSubmit(updatedValues, mutate, handleClose);
        })}
        loading={(isValidating && !sortOpenDialog) || isUploading}
      >
        {sortOpenDialog && (
          <OrgMediaFieldArray
            setSortItems={setSortItems}
            dialogElementShow={dialogElementShow}
            sortOpenDialog={sortOpenDialog}
            filePathType={ServiceModuleValue.CMS}
            targetId={cmsContentId}
            maxFields={4}
            enableTitle
            enableDescription
            onDeleteItemClick={handleDeleteItem}
            onItemOrderChange={handleSortItem}
          />
        )}
        {!sortOpenDialog && (
          <OrgMediaField
            filePathType={ServiceModuleValue.CMS}
            targetId={cmsContentId}
            maxFields={useOneItemAtOnce ? 1 : 4}
            enableTitle
            enableDescription
            onDeleteItemClick={handleDeleteItem}
            onItemOrderChange={handleSortItem}
            useOneItemAtOnce={useOneItemAtOnce}
          />
        )}
      </Form>
    </FormProvider>
  );
};

export default SustainableDevelopmentForm;
