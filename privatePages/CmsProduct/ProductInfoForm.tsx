import React, { FC, useCallback, useEffect } from "react";

import {
  FormProvider,
  Controller,
  useForm,
  useFieldArray,
} from "react-hook-form";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { ProductInfoFormInput, OrganizationMediaField } from "interfaces/form";
import useSetFormIsDirty, { SetFormIsDirty } from "utils/useSetFormIsDirty";
import useOrgProduct from "utils/useOrgProduct";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { KeyedMutator } from "swr";
import { AxiosResponse } from "axios";
import { OrganizationProduct } from "interfaces/entities";
import {
  ServiceModuleValue,
  Locale,
  OrganizationMediaSizeType,
  OrganizationMediaType,
} from "interfaces/utils";

import Grid from "@eGroupAI/material/Grid";
import OrgMediaField from "components/OrgMediaField";
import Form from "components/Form";
import FormField from "components/FormField";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import parseOrgMediaListFormValues from "utils/parseOrgMediaListFormValues";
import FormFieldLabel from "components/FormFieldLabel";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import { SetFormIsBusy } from "utils/useSetFormIsBusy";
import useUploadFilesHandler from "utils/useUploadFilesHandler";

export const FORM = "ProductInfoForm";

export interface ProductInfoFormProps {
  onSubmit: (
    values: ProductInfoFormInput,
    mutate: KeyedMutator<AxiosResponse<OrganizationProduct>>
  ) => void;
  productId: string;
  selectedLocale: Locale;
  setFormIsDirty?: SetFormIsDirty;
  setFormIsBusy?: SetFormIsBusy;
}

const ProductInfoForm: FC<ProductInfoFormProps> = function (props) {
  const { onSubmit, productId, setFormIsDirty, setFormIsBusy, selectedLocale } =
    props;
  const organizationId = useSelector(getSelectedOrgId);

  const { uploadOrgFiles } = useUploadFilesHandler();

  const { excute: updateOrgMedia } = useAxiosApiWrapper(
    apis.org.updateOrgMedia,
    "Create"
  );

  const { excute: createOrgMedia } = useAxiosApiWrapper(
    apis.org.createOrgMedia,
    "Create"
  );

  const { excute: deleteOrgMedia } = useAxiosApiWrapper(
    apis.org.deleteOrgMedia,
    "Create"
  );

  const methods = useForm<ProductInfoFormInput>({
    defaultValues: {
      organizationProductName: "",
      organizationProductDescription: "",
      organizationMediaList: [],
    },
  });

  const { formState, handleSubmit, control, reset, getValues, setValue } =
    methods;

  const { remove } = useFieldArray({
    control,
    name: "organizationMediaList",
  });

  const handleAddNewItem = useCallback(
    async (file: File, index: number) => {
      const res = await uploadOrgFiles({
        organizationId,
        files: [file],
        filePathType: ServiceModuleValue.CMS_PRODUCT,
        imageSizeType: OrganizationMediaSizeType.NORMAL,
        eGroupService: "WEBSITE",
      });

      if (res) {
        const uploadedFile = res.data[0];
        if (uploadedFile && productId) {
          setValue(
            `organizationMediaList.${index}.uploadFileId`,
            uploadedFile.uploadFileId
          );
          const values = getValues();
          const orgMedia = values?.organizationMediaList?.[index];
          const organizationMediaId =
            values?.organizationMediaList?.[index]?.organizationMediaId;
          if (organizationMediaId) {
            const updatedResponse = await updateOrgMedia({
              organizationId,
              organizationMediaId,
              organizationMediaTitle: orgMedia?.organizationMediaTitle || "",
              organizationMediaLinkURL:
                orgMedia?.organizationMediaLinkURL || "",
              organizationMediaYoutubeURL:
                orgMedia?.organizationMediaYoutubeURL || "",
              organizationMediaDescription:
                orgMedia?.organizationMediaDescription || "",
              organizationTagList: orgMedia?.organizationTagList || [],
              uploadFile: {
                uploadFileId: uploadedFile.uploadFileId,
              },
            });
            setValue(
              `organizationMediaList.${index}.organizationMediaId`,
              updatedResponse.data[0].organizationMediaId,
              { shouldDirty: true }
            );
            setValue(`organizationMediaList.${index}.isUploading`, false);
          } else {
            const createResponse = await createOrgMedia({
              organizationId,
              targetId: productId,
              organizationMediaList: [
                {
                  organizationMediaType: OrganizationMediaType.IMAGE,
                  organizationMediaSizeType: OrganizationMediaSizeType.NORMAL,
                  organizationMediaTitle:
                    orgMedia?.organizationMediaTitle || "",
                  organizationMediaLinkURL:
                    orgMedia?.organizationMediaLinkURL || "",
                  organizationMediaYoutubeURL:
                    orgMedia?.organizationMediaYoutubeURL || "",
                  organizationMediaDescription:
                    orgMedia?.organizationMediaDescription || "",
                  organizationTagList: orgMedia?.organizationTagList || [],
                  uploadFile: {
                    uploadFileId: uploadedFile.uploadFileId,
                  },
                },
              ],
            });
            setValue(
              `organizationMediaList.${index}.organizationMediaId`,
              createResponse.data[0].organizationMediaId,
              { shouldDirty: true }
            );
            setValue(`organizationMediaList.${index}.isUploading`, false);
          }
        }
      }
    },
    [
      createOrgMedia,
      getValues,
      organizationId,
      productId,
      setValue,
      updateOrgMedia,
      uploadOrgFiles,
    ]
  );

  const handleUpdatedItems = useCallback(
    async (valuesParam?: ProductInfoFormInput) => {
      let values = getValues();
      if (valuesParam) values = valuesParam;
      const promises: Promise<unknown>[] = [];

      values?.organizationMediaList?.forEach((value, index) => {
        const {
          organizationMediaId = "",
          tempNewImage: newFile,
          mediaImageDeleted,
        } = value;
        if (newFile) promises.push(handleAddNewItem(newFile, index));
        if (organizationMediaId && mediaImageDeleted && !newFile) {
          promises.push(
            deleteOrgMedia({
              organizationId,
              organizationMediaId,
            }).then(() => {
              remove(index);
            })
          );
        }
      });
      setValue("isFormBusy", true);
      if (setFormIsBusy) setFormIsBusy(true);
      return Promise.all(promises)
        .then(() => {
          setValue("isFormBusy", false);
          if (setFormIsBusy) setFormIsBusy(false);
        })
        .catch((err) => {
          setValue("isFormBusy", false);
          if (setFormIsBusy) setFormIsBusy(false);
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
    },
    [
      deleteOrgMedia,
      getValues,
      handleAddNewItem,
      organizationId,
      remove,
      setFormIsBusy,
      setValue,
    ]
  );

  useSetFormIsDirty({
    isDirty: formState.isDirty,
    setFormIsDirty,
  });

  const { data, mutate, isValidating } = useOrgProduct(
    {
      organizationId,
      organizationProductId: productId,
    },
    {
      locale: selectedLocale,
    }
  );

  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

  useEffect(() => {
    reset({
      organizationProductName: data?.organizationProductName,
      organizationProductDescription: data?.organizationProductDescription,
      organizationMediaList: parseOrgMediaListFormValues(
        data?.organizationMediaList
      ),
    });
  }, [data, reset]);

  return (
    <FormProvider {...methods}>
      <Form
        id={FORM}
        onSubmit={handleSubmit(async () => {
          const values = methods.getValues();
          await handleUpdatedItems(values);
          const updatedValues = methods.getValues();
          onSubmit(updatedValues, mutate);
        })}
        loading={isValidating}
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
              <OrgMediaField
                filePathType={ServiceModuleValue.CMS_PRODUCT}
                targetId={productId}
                maxFields={1}
                onDeleteItemClick={(
                  selectedItem: OrganizationMediaField,
                  remove: () => void
                ) => {
                  if (selectedItem) {
                    openConfirmDeleteDialog({
                      primary: `您確定要刪除${selectedItem.organizationMediaTitle}嗎？`,
                      onConfirm: async () => {
                        if (selectedItem.organizationMediaId) {
                          try {
                            await deleteOrgMedia({
                              organizationId,
                              organizationMediaId:
                                selectedItem.organizationMediaId || "",
                            });
                            mutate();
                            if (setFormIsDirty) {
                              setFormIsDirty(true);
                            }
                            closeConfirmDeleteDialog();
                          } catch (error) {
                            apis.tools.createLog({
                              function: "DatePicker: handleDeleteItem",
                              browserDescription: window.navigator.userAgent,
                              jsonData: {
                                data: error,
                                deviceInfo: getDeviceInfo(),
                              },
                              level: "ERROR",
                            });
                          }
                        } else {
                          remove();
                          if (setFormIsDirty) {
                            setFormIsDirty(true);
                          }
                          closeConfirmDeleteDialog();
                        }
                      },
                    });
                  }
                }}
                imageOnly
              />
            </FormFieldLabel>
          </Grid>
        </Grid>
      </Form>
    </FormProvider>
  );
};

export default ProductInfoForm;
