import React, { FC } from "react";

import { FormProvider, Controller } from "react-hook-form";

import Grid from "@eGroupAI/material/Grid";
import Form from "components/Form";
import OrgMediaFieldArray from "components/OrgMediaFieldArray";
import FormField from "components/FormField";
import { ServiceModuleValue } from "interfaces/utils";

import useCmsContentForm from "./useCmsContentForm";
import { CmsContentFormProps } from "../typings";

export const FORM = "AboutUsForm";

const AboutUsForm: FC<CmsContentFormProps> = function (props) {
  const {
    onSubmit,
    cmsContentId,
    setFormIsDirty,
    setFormIsBusy,
    selectedLocale,
    dialogElementShow,
    handleClose,
    selectedEditItem,
    setSelectedEditItem,
    useOneItemAtOnce,
  } = props;

  const {
    mutate,
    isValidating,
    methods,
    handleDeleteItem,
    handleSortItem,
    handleUpdatedItems,
    isUploading,
  } = useCmsContentForm({
    setFormIsDirty,
    setFormIsBusy,
    cmsContentId: cmsContentId || "",
    selectedLocale,
    uploadFilePathType: ServiceModuleValue.CMS_ABOUT_US,
    selectedEditItem,
    setSelectedEditItem,
    useOneItemAtOnce,
  });

  const { handleSubmit, control } = methods;

  return (
    <FormProvider {...methods}>
      <Form
        id={FORM}
        onSubmit={handleSubmit(async () => {
          await handleUpdatedItems();
          const values = methods.getValues();
          onSubmit(values, mutate, handleClose);
        })}
        loading={isValidating || isUploading}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={useOneItemAtOnce ? 12 : 6}>
            <Controller
              control={control}
              name="organizationCmsContentDescription"
              render={({ field: { value, onChange } }) => (
                <FormField
                  primary="關於我們描述"
                  TextFieldProps={{
                    onChange,
                    value,
                    placeholder: "輸入關於我們描述",
                    multiline: true,
                    minRows: 5,
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <OrgMediaFieldArray
              dialogElementShow={dialogElementShow}
              filePathType={ServiceModuleValue.CMS}
              targetId={cmsContentId}
              maxFields={1}
              onDeleteItemClick={handleDeleteItem}
              onItemOrderChange={handleSortItem}
              useOneItemAtOnce={useOneItemAtOnce}
            />
          </Grid>
        </Grid>
      </Form>
    </FormProvider>
  );
};

export default AboutUsForm;
