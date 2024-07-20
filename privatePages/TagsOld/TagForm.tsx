import React, { FC, useEffect } from "react";

import { FormProvider, Controller, useForm } from "react-hook-form";
import { TagFormInput } from "interfaces/form";
import useSetFormIsDirty, { SetFormIsDirty } from "utils/useSetFormIsDirty";
import { Locale, ServiceModuleValue } from "interfaces/utils";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { KeyedMutator } from "swr";
import { AxiosResponse } from "axios";
import { OrganizationTag } from "interfaces/entities";
import useOrgTag from "utils/useOrgTag";

import Grid from "@eGroupAI/material/Grid";
import TextField from "@eGroupAI/material/TextField";
import Form from "components/Form";
import FormFieldLabel from "components/FormFieldLabel";
import OrgMediaFieldArray from "components/OrgMediaFieldArray";
import parseOrgMediaListFormValues from "utils/parseOrgMediaListFormValues";

import { getWordLibrary } from "redux/wordLibrary/selectors";

export const FORM = "TagForm";

export interface TagFormProps {
  onSubmit: (
    values: TagFormInput,
    mutate: KeyedMutator<AxiosResponse<OrganizationTag>>
  ) => void;
  selectedLocale: Locale;
  setFormIsDirty?: SetFormIsDirty;
  tagGroupId?: string;
  tagId?: string;
}

const TagForm: FC<TagFormProps> = function (props) {
  const { onSubmit, setFormIsDirty, selectedLocale, tagGroupId, tagId } = props;
  const methods = useForm<TagFormInput>({
    defaultValues: {
      tagName: "",
      tagColor: "#000000",
      organizationMediaList: [
        {
          organizationMediaTitle: "",
          organizationMediaId: "1",
          uploadFileId: "",
          uploadFilePath: "",
          organizationMediaYoutubeURL: "",
          organizationMediaLinkURL: "",
        },
      ],
    },
  });

  const { formState, handleSubmit, control, reset } = methods;
  const organizationId = useSelector(getSelectedOrgId);
  const { data, mutate } = useOrgTag(
    {
      organizationId,
      tagGroupId,
      tagId,
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
    /**
     * If data organizationMediaList is empty then init default media item to avoid trigger form dirty.
     * Because when form is dirty then submit button will be enable and cause #676.
     */
    const organizationMediaList = parseOrgMediaListFormValues(
      data?.organizationMediaList
    );
    reset({
      tagName: data?.tagName,
      tagColor: data?.tagColor,
      organizationMediaList:
        organizationMediaList && organizationMediaList.length > 0
          ? organizationMediaList
          : [
              {
                organizationMediaTitle: "",
                organizationMediaId: "1",
                uploadFileId: "",
                uploadFilePath: "",
                organizationMediaYoutubeURL: "",
                organizationMediaLinkURL: "",
              },
            ],
    });
  }, [data, reset]);

  const wordLibrary = useSelector(getWordLibrary);

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
              name="tagName"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label={wordLibrary?.["tag name"] ?? "標籤名稱"}
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
              name="tagColor"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label={wordLibrary?.["tag color"] ?? "標籤顏色"}
                  fullWidth
                  onChange={onChange}
                  value={value}
                  inputProps={{
                    type: "color",
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <FormFieldLabel
              primary={
                wordLibrary?.[
                  "tag thumbnail (suggested dimensions of 263x147)"
                ] ?? "標籤縮圖(建議長寬263:147)"
              }
            >
              <OrgMediaFieldArray
                filePathType={ServiceModuleValue.TAG}
                targetId={tagId}
                maxFields={1}
              />
            </FormFieldLabel>
          </Grid>
        </Grid>
      </Form>
    </FormProvider>
  );
};

export default TagForm;
