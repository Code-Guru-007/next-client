import React, { FC, useCallback } from "react";

import { FormProvider, Controller, useForm } from "react-hook-form";
import { CreateBlogFormInput } from "interfaces/form";
import useSetFormIsDirty, { SetFormIsDirty } from "utils/useSetFormIsDirty";
import {
  OrganizationMediaSizeType,
  ServiceModuleValue,
} from "interfaces/utils";

import Grid from "@eGroupAI/material/Grid";
import Form from "components/Form";
import FormField from "components/FormField";
import FormFieldLabel from "components/FormFieldLabel";
import FroalaEditor from "components/FroalaEditor";
import OrgMediaFieldArray from "components/OrgMediaFieldArray";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import apis from "utils/apis";
import useUploadFilesHandler from "utils/useUploadFilesHandler";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";
import useSetFormIsBusy, { SetFormIsBusy } from "utils/useSetFormIsBusy";

export const FORM = "CreateBlogForm";

export interface CreateBlogFormProps {
  onSubmit: (values: CreateBlogFormInput) => void;
  setFormIsDirty?: SetFormIsDirty;
  setFormIsBusy?: SetFormIsBusy;
}

const CreateBlogForm: FC<CreateBlogFormProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { onSubmit, setFormIsDirty, setFormIsBusy } = props;
  const methods = useForm<CreateBlogFormInput>({
    defaultValues: {
      organizationBlogTitle: "",
      organizationBlogContent: "",
      organizationMediaList: [],
    },
  });
  const { formState, handleSubmit, control, setValue, getValues, watch } =
    methods;

  useSetFormIsDirty({
    isDirty: formState.isDirty,
    setFormIsDirty,
  });

  const isFormBusy = watch("isFormBusy") || false;

  useSetFormIsBusy({
    isBusy: isFormBusy,
    setFormIsBusy,
  });

  const { uploadOrgFiles, isOrgUploading } = useUploadFilesHandler();

  const organizationId = useSelector(getSelectedOrgId);

  const handleUploadNewFile = useCallback(
    async (file: File, index: number) => {
      const res = await uploadOrgFiles({
        organizationId,
        files: [file],
        filePathType: ServiceModuleValue.CMS_BLOG,
        imageSizeType: OrganizationMediaSizeType.NORMAL,
        eGroupService: "WEBSITE",
      });

      if (res) {
        const uploadedFile = res.data[0];
        if (uploadedFile) {
          setValue(
            `organizationMediaList.${index}.uploadFileId`,
            uploadedFile.uploadFileId
          );
        }
      }
    },
    [organizationId, setValue, uploadOrgFiles]
  );

  const handleUploadNewFiles = useCallback(async () => {
    const values = getValues();
    const promises: Promise<unknown>[] = [];

    values?.organizationMediaList?.forEach((value, index) => {
      const newFile = value.tempNewImage;
      if (newFile) promises.push(handleUploadNewFile(newFile, index));
    });

    setValue("isFormBusy", true);
    return Promise.all(promises)
      .then(() => {
        setValue("isFormBusy", false);
      })
      .catch((err) => {
        setValue("isFormBusy", false);
        apis.tools.createLog({
          function: "UpdateBlogAndMedia: error",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: err,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      });
  }, [getValues, handleUploadNewFile, setValue]);

  return (
    <FormProvider {...methods}>
      <Form
        id={FORM}
        onSubmit={handleSubmit(async () => {
          await handleUploadNewFiles();
          const values = methods.getValues();
          onSubmit(values);
        })}
        loading={isOrgUploading}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <Controller
              control={control}
              name="organizationBlogTitle"
              render={({ field: { value, onChange } }) => (
                <FormField
                  primary={wordLibrary?.["article title"] ?? "文章標題"}
                  TextFieldProps={{
                    onChange,
                    value,
                    placeholder:
                      wordLibrary?.["enter article title"] ?? "輸入文章標題",
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="organizationBlogContent"
              render={({ field: { value, onChange } }) => (
                <FormFieldLabel
                  primary={wordLibrary?.["article content"] ?? "文章內容"}
                >
                  <FroalaEditor
                    filePathType={ServiceModuleValue.CMS_BLOG}
                    model={value}
                    onModelChange={(model) => {
                      onChange(model);
                    }}
                    config={{
                      toolbarSticky: true,
                      heightMin: 300,
                      placeholderText:
                        wordLibrary?.["edit article content"] ?? "編輯文章內容",
                    }}
                  />
                </FormFieldLabel>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <FormFieldLabel primary="文章縮圖(建議比例16:9)">
              <OrgMediaFieldArray
                filePathType={ServiceModuleValue.CMS_BLOG}
                maxFields={1}
              />
            </FormFieldLabel>
          </Grid>
        </Grid>
      </Form>
    </FormProvider>
  );
};

export default CreateBlogForm;
