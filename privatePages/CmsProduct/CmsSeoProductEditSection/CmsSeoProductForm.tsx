import React, { FC, useEffect } from "react";

import { FormProvider, Controller, useForm } from "react-hook-form";
import { CmsSeoProductFormInput } from "interfaces/form";
import useSetFormIsDirty, { SetFormIsDirty } from "utils/useSetFormIsDirty";
import { Locale } from "interfaces/utils";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import useOrgProduct from "utils/useOrgProduct";
import { KeyedMutator } from "swr";
import { AxiosResponse } from "axios";
import { OrganizationProduct } from "interfaces/entities";

import Grid from "@eGroupAI/material/Grid";
import TextField from "@eGroupAI/material/TextField";
import Form from "components/Form";

export const FORM = "CmsSeoProductForm";

export interface CmsSeoProductFormProps {
  onSubmit: (
    values: CmsSeoProductFormInput,
    mutate: KeyedMutator<AxiosResponse<OrganizationProduct>>
  ) => void;
  selectedLocale: Locale;
  setFormIsDirty?: SetFormIsDirty;
  organizationProductId?: string;
}

const CmsSeoProductForm: FC<CmsSeoProductFormProps> = function (props) {
  const { onSubmit, setFormIsDirty, selectedLocale, organizationProductId } =
    props;
  const methods = useForm<CmsSeoProductFormInput>({
    defaultValues: {
      organizationCmsSeoTitle: "",
      organizationCmsSeoDescription: "",
    },
  });

  const { formState, handleSubmit, control, reset } = methods;
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const { data, mutate } = useOrgProduct(
    {
      organizationId,
      organizationProductId,
    },
    {
      locale: selectedLocale,
    }
  );

  useSetFormIsDirty({
    isDirty: formState.isDirty,
    setFormIsDirty,
  });

  useEffect(() => {
    reset({
      organizationCmsSeoTitle:
        data?.organizationCmsSeo?.organizationCmsSeoTitle,
      organizationCmsSeoDescription:
        data?.organizationCmsSeo?.organizationCmsSeoDescription,
    });
  }, [data, reset]);

  return (
    <FormProvider {...methods}>
      <Form
        id={FORM}
        onSubmit={handleSubmit((values) => {
          onSubmit(values, mutate);
        })}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="organizationCmsSeoTitle"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label={wordLibrary?.title ?? "標題"}
                  fullWidth
                  onChange={onChange}
                  value={value}
                  multiline
                  minRows={4}
                  placeholder="建議字數25-30字"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="organizationCmsSeoDescription"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label={wordLibrary?.description ?? "描述"}
                  fullWidth
                  onChange={onChange}
                  value={value}
                  multiline
                  minRows={4}
                  placeholder="建議字數70-90字"
                />
              )}
            />
          </Grid>
        </Grid>
      </Form>
    </FormProvider>
  );
};

export default CmsSeoProductForm;
