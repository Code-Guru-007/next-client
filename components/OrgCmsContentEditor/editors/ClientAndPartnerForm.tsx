import React, { FC } from "react";

import { FormProvider } from "react-hook-form";
import { ServiceModuleValue } from "interfaces/utils";

import Form from "components/Form";
import OrgMediaFieldArray from "components/OrgMediaFieldArray";
import OrgMediaField from "components/OrgMediaField";
import useCmsContentForm from "./useCmsContentForm";
import { CmsContentFormProps } from "../typings";

export const FORM = "ClientAndPartnerForm";

const ClientAndPartnerForm: FC<CmsContentFormProps> = function (props) {
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
  const { mutate, isValidating, methods, handleDeleteItem, handleSortItem } =
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
            setSortItems={setSortItems}
            dialogElementShow={dialogElementShow}
            sortOpenDialog={sortOpenDialog}
            filePathType={ServiceModuleValue.CMS}
            targetId={cmsContentId}
            enableLinkURL
            tagGroup={ServiceModuleValue.CMS_ABOUT_US_CUSTOMER}
            onDeleteItemClick={handleDeleteItem}
            onItemOrderChange={handleSortItem}
          />
        )}
        {!sortOpenDialog && (
          <OrgMediaField
            filePathType={ServiceModuleValue.CMS}
            targetId={cmsContentId}
            maxFields={useOneItemAtOnce ? 1 : undefined}
            enableLinkURL
            tagGroup={ServiceModuleValue.CMS_ABOUT_US_CUSTOMER}
            onDeleteItemClick={handleDeleteItem}
            onItemOrderChange={handleSortItem}
            useOneItemAtOnce={useOneItemAtOnce}
          />
        )}
      </Form>
    </FormProvider>
  );
};

export default ClientAndPartnerForm;
