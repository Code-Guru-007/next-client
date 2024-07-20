import React, { FC } from "react";

import { FormProvider } from "react-hook-form";

import Form from "components/Form";
import OrgMediaFieldArray from "components/OrgMediaFieldArray";
import OrgMediaField from "components/OrgMediaField";
import { ServiceModuleValue } from "interfaces/utils";
import useCmsContentForm from "components/OrgCmsContentEditor/editors/useCmsContentForm";
import { CmsContentFormProps } from "components/OrgCmsContentEditor/typings";

export const FORM = "SolutionCmsContentEditorForm";

const SolutionCmsContentEditorForm: FC<CmsContentFormProps> = function (props) {
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
          const values = methods.getValues();
          onSubmit(values, mutate, handleClose);
        })}
        loading={(isValidating && !sortOpenDialog) || isUploading}
      >
        {sortOpenDialog && (
          <OrgMediaFieldArray
            dialogElementShow={dialogElementShow}
            sortOpenDialog={sortOpenDialog}
            setSortItems={setSortItems}
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
            useOneItemAtOnce={useOneItemAtOnce}
            enableMediaSizeSetting
          />
        )}
      </Form>
    </FormProvider>
  );
};

export default SolutionCmsContentEditorForm;
