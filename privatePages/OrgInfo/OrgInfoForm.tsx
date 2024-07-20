import React, { FC, useEffect } from "react";

import { FormProvider, Controller, useForm } from "react-hook-form";
import { OrgInfoFormInput } from "interfaces/form";
import useSetFormIsDirty, { SetFormIsDirty } from "utils/useSetFormIsDirty";
import { Locale } from "interfaces/utils";

import Grid from "@eGroupAI/material/Grid";
import Form from "components/Form";
import FormField from "components/FormField";
import { useSelector } from "react-redux";
import useMemberOrgInfo from "utils/useMemberOrgInfo";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { KeyedMutator } from "swr";
import { AxiosResponse } from "axios";
import { Organization } from "interfaces/entities";

export const FORM = "OrgInfoForm";

export interface OrgInfoFormProps {
  onSubmit: (
    values: OrgInfoFormInput,
    mutate: KeyedMutator<AxiosResponse<Organization>>
  ) => void;
  selectedLocale: Locale;
  setFormIsDirty?: SetFormIsDirty;
}

const OrgInfoForm: FC<OrgInfoFormProps> = function (props) {
  const { onSubmit, setFormIsDirty, selectedLocale } = props;
  const methods = useForm<OrgInfoFormInput>({
    defaultValues: {
      organizationCountry: "",
      organizationCity: "",
      organizationArea: "",
      organizationAddress: "",
      organizationFacebookUrl: "",
      organizationYoutubeUrl: "",
      organizationInvoiceTaxIdNumber: "",
      organizationName: "",
      organizationWebsite: "",
      organizationZIPCode: "",
      organizationTelephone: "",
      organizationEmail: "",
    },
  });

  const { formState, handleSubmit, control, reset } = methods;
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const { data, mutate } = useMemberOrgInfo(
    {
      organizationId,
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
      organizationCountry: data?.organizationCountry,
      organizationCity: data?.organizationCity,
      organizationArea: data?.organizationArea,
      organizationAddress: data?.organizationAddress,
      organizationFacebookUrl: data?.organizationFacebookUrl,
      organizationYoutubeUrl: data?.organizationYoutubeUrl,
      organizationInvoiceTaxIdNumber: data?.organizationInvoiceTaxIdNumber,
      organizationName: data?.organizationName,
      organizationWebsite: data?.organizationWebsite,
      organizationZIPCode: data?.organizationZIPCode,
      organizationTelephone: data?.organizationTelephone,
      organizationEmail: data?.organizationEmail,
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
          <Grid item xs={6}>
            <Controller
              control={control}
              name="organizationName"
              render={({ field: { value, onChange } }) => (
                <FormField
                  primary="公司名稱"
                  TextFieldProps={{
                    onChange,
                    value,
                    placeholder: "輸入公司名稱",
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              control={control}
              name="organizationEmail"
              render={({ field: { value, onChange } }) => (
                <FormField
                  primary="公司 Email"
                  TextFieldProps={{
                    onChange,
                    value,
                    placeholder: "輸入公司 Email",
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              control={control}
              name="organizationTelephone"
              render={({ field: { value, onChange } }) => (
                <FormField
                  primary="公司電話"
                  TextFieldProps={{
                    onChange,
                    value,
                    placeholder: "輸入公司電話",
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              control={control}
              name="organizationInvoiceTaxIdNumber"
              render={({ field: { value, onChange } }) => (
                <FormField
                  primary={
                    wordLibrary?.["unified business number"] ?? "統一編號"
                  }
                  TextFieldProps={{
                    onChange,
                    value,
                    placeholder:
                      wordLibrary?.["unified business number"] ?? "統一編號",
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              control={control}
              name="organizationCountry"
              render={({ field: { value, onChange } }) => (
                <FormField
                  primary="所在國家"
                  TextFieldProps={{
                    onChange,
                    value,
                    placeholder: "輸入所在國家",
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              control={control}
              name="organizationCity"
              render={({ field: { value, onChange } }) => (
                <FormField
                  primary="所在城市"
                  TextFieldProps={{
                    onChange,
                    value,
                    placeholder: "輸入所在城市",
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              control={control}
              name="organizationArea"
              render={({ field: { value, onChange } }) => (
                <FormField
                  primary="所在地區"
                  TextFieldProps={{
                    onChange,
                    value,
                    placeholder: "輸入所在地區",
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              control={control}
              name="organizationAddress"
              render={({ field: { value, onChange } }) => (
                <FormField
                  primary={wordLibrary?.address ?? "地址"}
                  TextFieldProps={{
                    onChange,
                    value,
                    placeholder: "輸入地址",
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              control={control}
              name="organizationZIPCode"
              render={({ field: { value, onChange } }) => (
                <FormField
                  primary={wordLibrary?.["postal code"] ?? "郵遞區號"}
                  TextFieldProps={{
                    onChange,
                    value,
                    placeholder: "輸入郵遞區號",
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              control={control}
              name="organizationFacebookUrl"
              render={({ field: { value, onChange } }) => (
                <FormField
                  primary="FB粉絲團連結"
                  TextFieldProps={{
                    onChange,
                    value,
                    placeholder: "輸入FB粉絲團連結",
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              control={control}
              name="organizationYoutubeUrl"
              render={({ field: { value, onChange } }) => (
                <FormField
                  primary="Youtube頻道連結"
                  TextFieldProps={{
                    onChange,
                    value,
                    placeholder: "輸入Youtube頻道連結",
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
      </Form>
    </FormProvider>
  );
};

export default OrgInfoForm;
