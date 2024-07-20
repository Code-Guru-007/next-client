import React, { FC, useEffect } from "react";

import { FormProvider, Controller, useForm } from "react-hook-form";
import { CmsSeoPageFormInput } from "interfaces/form";
import useSetFormIsDirty, { SetFormIsDirty } from "utils/useSetFormIsDirty";
import { Locale } from "interfaces/utils";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useOrgCmsMenu from "utils/useOrgCmsMenu";
import { KeyedMutator } from "swr";
import { AxiosResponse } from "axios";
import { OrganizationCmsMenu } from "interfaces/entities";

import Grid from "@eGroupAI/material/Grid";
import TextField from "@eGroupAI/material/TextField";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import Form from "components/Form";

export const FORM = "CmsSeoPageForm";

export interface CmsSeoPageFormProps {
  onSubmit: (
    values: CmsSeoPageFormInput,
    mutate: KeyedMutator<AxiosResponse<OrganizationCmsMenu>>
  ) => void;
  selectedLocale: Locale;
  setFormIsDirty?: SetFormIsDirty;
  organizationCmsMenuId?: string;
}

const CmsSeoPageForm: FC<CmsSeoPageFormProps> = function (props) {
  const { onSubmit, setFormIsDirty, selectedLocale, organizationCmsMenuId } =
    props;
  const methods = useForm<CmsSeoPageFormInput>({
    defaultValues: {
      organizationCmsSeoTitle: "",
      organizationCmsSeoDescription: "",
    },
  });

  const { formState, handleSubmit, control, reset } = methods;
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const { data, mutate } = useOrgCmsMenu(
    {
      organizationId,
      organizationCmsMenuId,
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

export default CmsSeoPageForm;
