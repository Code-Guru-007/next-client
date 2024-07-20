import React, { FC } from "react";

import { FormProvider, Controller, useForm } from "react-hook-form";
import { CreateProductFormInput } from "interfaces/form";
import useSetFormIsDirty, { SetFormIsDirty } from "utils/useSetFormIsDirty";
import { ServiceModuleValue } from "interfaces/utils";

import Grid from "@eGroupAI/material/Grid";
import OrgMediaFieldArray from "components/OrgMediaFieldArray";
import Form from "components/Form";
import FormField from "components/FormField";
import FormFieldLabel from "components/FormFieldLabel";

export const FORM = "CreateProductForm";

export interface CreateProductFormProps {
  onSubmit: (values: CreateProductFormInput) => void;
  setFormIsDirty?: SetFormIsDirty;
}

const CreateProductForm: FC<CreateProductFormProps> = function (props) {
  const { onSubmit, setFormIsDirty } = props;
  const methods = useForm<CreateProductFormInput>({
    defaultValues: {
      organizationProductName: "",
      organizationProductDescription: "",
      organizationMediaList: [],
    },
  });

  const { formState, handleSubmit, control } = methods;

  useSetFormIsDirty({
    isDirty: formState.isDirty,
    setFormIsDirty,
  });

  return (
    <FormProvider {...methods}>
      <Form id={FORM} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="organizationProductName"
              render={({ field: { value, onChange } }) => (
                <FormField
                  primary="產品名稱"
                  TextFieldProps={{
                    onChange,
                    value,
                    placeholder: "輸入產品名稱",
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="organizationProductDescription"
              render={({ field: { value, onChange } }) => (
                <FormField
                  primary="產品介紹"
                  TextFieldProps={{
                    onChange,
                    value,
                    placeholder: "輸入產品介紹",
                    multiline: true,
                    minRows: 5,
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <FormFieldLabel primary="產品縮圖(建議比例1:1)">
              <OrgMediaFieldArray
                filePathType={ServiceModuleValue.CMS_PRODUCT}
                maxFields={1}
              />
            </FormFieldLabel>
          </Grid>
        </Grid>
      </Form>
    </FormProvider>
  );
};

export default CreateProductForm;
