import React, { FC, useCallback } from "react";

import { FormProvider, Controller, useForm } from "react-hook-form";
import { CreateProductFormInput } from "interfaces/form";
import useSetFormIsDirty, { SetFormIsDirty } from "utils/useSetFormIsDirty";
import {
  OrganizationMediaSizeType,
  ServiceModuleValue,
} from "interfaces/utils";

import Grid from "@eGroupAI/material/Grid";
import OrgMediaFieldArray from "components/OrgMediaFieldArray";
import Form from "components/Form";
import FormField from "components/FormField";
import FormFieldLabel from "components/FormFieldLabel";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useUploadFilesHandler from "utils/useUploadFilesHandler";
import apis from "utils/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";
import useSetFormIsBusy, { SetFormIsBusy } from "utils/useSetFormIsBusy";

export const FORM = "CreateProductForm";

export interface CreateProductFormProps {
  onSubmit: (values: CreateProductFormInput) => void;
  setFormIsDirty?: SetFormIsDirty;
  setFormIsBusy?: SetFormIsBusy;
}

const CreateProductForm: FC<CreateProductFormProps> = function (props) {
  const { onSubmit, setFormIsDirty, setFormIsBusy } = props;
  const methods = useForm<CreateProductFormInput>({
    defaultValues: {
      organizationProductName: "",
      organizationProductDescription: "",
      organizationMediaList: [],
    },
  });

  const { formState, handleSubmit, control, setValue, watch, getValues } =
    methods;
  const isFormBusy = watch("isFormBusy") || false;

  useSetFormIsDirty({
    isDirty: formState.isDirty,
    setFormIsDirty,
  });

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
