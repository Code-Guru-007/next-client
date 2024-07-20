import React, { FC, useEffect } from "react";

import { FormProvider, Controller, useForm } from "react-hook-form";
import { TagGroupFormInput } from "interfaces/form";
import useSetFormIsDirty, { SetFormIsDirty } from "utils/useSetFormIsDirty";
import {
  Locale,
  ServiceModuleValue,
  ServiceModuleValueMap,
} from "interfaces/utils";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { KeyedMutator } from "swr";
import { AxiosResponse } from "axios";
import { OrganizationTagGroup } from "interfaces/entities";
import useOrgTagGroup from "utils/useOrgTagGroup";

import Grid from "@eGroupAI/material/Grid";
import TextField from "@eGroupAI/material/TextField";
import MenuItem from "components/MenuItem";
import Form from "components/Form";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export const FORM = "TagGroupForm";

export interface TagGroupFormProps {
  onSubmit: (
    values: TagGroupFormInput,
    mutate: KeyedMutator<AxiosResponse<OrganizationTagGroup>>
  ) => void;
  selectedLocale: Locale;
  setFormIsDirty?: SetFormIsDirty;
  tagGroupId?: string;
}

const TagGroupForm: FC<TagGroupFormProps> = function (props) {
  const { onSubmit, setFormIsDirty, selectedLocale, tagGroupId } = props;
  const methods = useForm<TagGroupFormInput>({
    defaultValues: {
      tagGroupName: "",
      serviceModuleValue: ServiceModuleValue.CMS_PRODUCT,
    },
  });

  const { formState, handleSubmit, control, reset } = methods;
  const organizationId = useSelector(getSelectedOrgId);
  const wordLibrary = useSelector(getWordLibrary);
  const { data, mutate } = useOrgTagGroup(
    {
      organizationId,
      tagGroupId,
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
      tagGroupName: data?.tagGroupName,
      serviceModuleValue: data?.serviceModuleValue,
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
              name="tagGroupName"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label={wordLibrary?.["tag group name"] ?? "標籤群組名稱"}
                  fullWidth
                  onChange={onChange}
                  value={value}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              control={control}
              name="serviceModuleValue"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="使用頁面"
                  select
                  value={value}
                  onChange={onChange}
                  fullWidth
                >
                  <MenuItem value={ServiceModuleValue.CMS_PRODUCT}>
                    {ServiceModuleValueMap[ServiceModuleValue.CMS_PRODUCT]}
                  </MenuItem>
                  <MenuItem value={ServiceModuleValue.CMS_BLOG}>
                    {ServiceModuleValueMap[ServiceModuleValue.CMS_BLOG]}
                  </MenuItem>
                  <MenuItem value={ServiceModuleValue.FEEDBACK}>
                    {ServiceModuleValueMap[ServiceModuleValue.FEEDBACK]}
                  </MenuItem>
                  <MenuItem value={ServiceModuleValue.EVENT}>
                    {ServiceModuleValueMap[ServiceModuleValue.EVENT]}
                  </MenuItem>
                  <MenuItem value={ServiceModuleValue.CRM_USER}>
                    {ServiceModuleValueMap[ServiceModuleValue.CRM_USER]}
                  </MenuItem>
                  <MenuItem value={ServiceModuleValue.CRM_PARTNER}>
                    {ServiceModuleValueMap[ServiceModuleValue.CRM_PARTNER]}
                  </MenuItem>
                  <MenuItem value={ServiceModuleValue.BULLETIN}>
                    {ServiceModuleValueMap[ServiceModuleValue.BULLETIN]}
                  </MenuItem>
                  <MenuItem value={ServiceModuleValue.ARTICLE}>
                    {ServiceModuleValueMap[ServiceModuleValue.ARTICLE]}
                  </MenuItem>
                  <MenuItem value={ServiceModuleValue.FILES}>
                    {ServiceModuleValueMap[ServiceModuleValue.FILES]}
                  </MenuItem>
                </TextField>
              )}
            />
          </Grid>
        </Grid>
      </Form>
    </FormProvider>
  );
};

export default TagGroupForm;
