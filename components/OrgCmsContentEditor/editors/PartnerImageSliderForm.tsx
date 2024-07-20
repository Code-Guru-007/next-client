import React, { FC } from "react";

import { FormProvider } from "react-hook-form";

import Form from "components/Form";
import OrgMediaFieldArray from "components/OrgMediaFieldArray";
import OrgMediaField from "components/OrgMediaField";
import { ServiceModuleValue } from "interfaces/utils";
import useCmsContentForm from "./useCmsContentForm";
import { CmsContentFormProps } from "../typings";

export const FORM = "PartnerImageSliderForm";

const PartnerImageSliderForm: FC<CmsContentFormProps> = function (props) {
  const {
    onSubmit,
    cmsContentId,
    setFormIsDirty,
    selectedLocale,
    sortOpenDialog,
    dialogElementShow,
    setSortItems,
    selectedEditItem,
    setSelectedEditItem,
    useOneItemAtOnce,
    handleClose,
  } = props;
  const { mutate, isValidating, handleDeleteItem, handleSortItem, methods } =
    useCmsContentForm({
      setFormIsDirty,
      cmsContentId: cmsContentId || "",
      selectedLocale,
      selectedEditItem,
      setSelectedEditItem,
      useOneItemAtOnce,
    });
  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <Form
        id={FORM}
        onSubmit={handleSubmit((values) => {
          onSubmit(values, mutate, handleClose);
        })}
        loading={isValidating && !sortOpenDialog}
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
          />
        )}
      </Form>
    </FormProvider>
  );
};

export default PartnerImageSliderForm;
