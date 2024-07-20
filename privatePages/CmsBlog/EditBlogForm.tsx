import React, { FC, useCallback, useEffect } from "react";

import {
  Controller,
  FormProvider,
  useForm,
  useFieldArray,
} from "react-hook-form";
import { EditBlogFormInput, OrganizationMediaField } from "interfaces/form";
import useSetFormIsDirty, { SetFormIsDirty } from "utils/useSetFormIsDirty";
import useSetFormIsBusy, { SetFormIsBusy } from "utils/useSetFormIsBusy";

import useOrgBlog from "utils/useOrgBlog";
import {
  Locale,
  ServiceModuleValue,
  OrganizationMediaSizeType,
  OrganizationMediaType,
} from "interfaces/utils";
import { KeyedMutator } from "swr";
import { AxiosResponse } from "axios";
import { OrganizationBlog } from "interfaces/entities";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";

import apis from "utils/apis";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useUploadFilesHandler from "utils/useUploadFilesHandler";

import Grid from "@eGroupAI/material/Grid";
import Form from "components/Form";
import FormField from "components/FormField";
import FormFieldLabel from "components/FormFieldLabel";
import FroalaEditor from "components/FroalaEditor";
import OrgMediaFieldArray from "components/OrgMediaFieldArray";
import parseOrgMediaListFormValues from "utils/parseOrgMediaListFormValues";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";

export const FORM = "EditBlogForm";

export interface EditBlogFormProps {
  onSubmit: (
    values: EditBlogFormInput,
    mutate: KeyedMutator<AxiosResponse<OrganizationBlog>>
  ) => void;
  setFormIsDirty?: SetFormIsDirty;
  setFormIsBusy?: SetFormIsBusy;
  blogId: string;
  selectedLocale: Locale;
}

const EditBlogForm: FC<EditBlogFormProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { onSubmit, setFormIsDirty, setFormIsBusy, blogId, selectedLocale } =
    props;
  const organizationId = useSelector(getSelectedOrgId);

  const { uploadOrgFiles, isOrgUploading } = useUploadFilesHandler();

  const { excute: createOrgMedia, isLoading } = useAxiosApiWrapper(
    apis.org.createOrgMedia,
    "Create"
  );

  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

  const { excute: deleteOrgMedia } = useAxiosApiWrapper(
    apis.org.deleteOrgMedia,
    "Delete"
  );

  const methods = useForm<EditBlogFormInput>({
    defaultValues: {
      organizationBlogTitle: "",
      organizationBlogContent: "",
      organizationMediaList: [],
    },
  });
  const {
    reset,
    formState,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
  } = methods;

  const { remove } = useFieldArray({ control, name: "organizationMediaList" });

  const isFormBusy = watch("isFormBusy") || false;

  useSetFormIsDirty({
    isDirty: formState.isDirty,
    setFormIsDirty,
  });

  useSetFormIsBusy({
    isBusy: isFormBusy,
    setFormIsBusy,
  });

  const { data, mutate, isValidating } = useOrgBlog(
    {
      organizationId,
      organizationBlogId: blogId,
    },
    {
      locale: selectedLocale,
    }
  );

  useEffect(() => {
    reset({
      organizationBlogTitle: data?.organizationBlogTitle,
      organizationBlogContent: data?.organizationBlogContent,
      organizationMediaList: parseOrgMediaListFormValues(
        data?.organizationMediaList
      ),
    });
  }, [data, reset]);

  const handleUpdateItem = useCallback(
    async (orgMedia: OrganizationMediaField, index: number) => {
      try {
        // const values = getValues();
        setValue(`organizationMediaList.${index}.isUploading`, true);
        const uploadedResult = await uploadOrgFiles({
          organizationId,
          files: [orgMedia.tempNewImage as File],
          filePathType: ServiceModuleValue.CMS_BLOG,
          imageSizeType: OrganizationMediaSizeType.NORMAL,
          eGroupService: "WEBSITE",
        });
        if (uploadedResult) {
          const data = uploadedResult.data[0];

          // delete old orgMedia
          if (orgMedia && orgMedia.organizationMediaId) {
            await deleteOrgMedia({
              organizationId,
              organizationMediaId: orgMedia.organizationMediaId,
            });
          }

          // create new orgMedia
          if (data && blogId) {
            const response = await createOrgMedia({
              organizationId,
              targetId: blogId,
              organizationMediaList: [
                {
                  organizationMediaType: OrganizationMediaType.IMAGE,
                  organizationMediaSizeType: OrganizationMediaSizeType.NORMAL,
                  organizationMediaTitle: orgMedia?.organizationMediaTitle,
                  organizationMediaLinkURL: orgMedia?.organizationMediaLinkURL,
                  organizationMediaYoutubeURL:
                    orgMedia?.organizationMediaYoutubeURL,
                  organizationMediaDescription:
                    orgMedia?.organizationMediaDescription,
                  organizationTagList: orgMedia?.organizationTagList?.map(
                    (el) => ({
                      tagId: el.tagId,
                    })
                  ),
                  uploadFile: {
                    uploadFileId: data.uploadFileId,
                  },
                },
              ],
            });
            setValue(
              `organizationMediaList.${index}.organizationMediaId`,
              response.data[0].organizationMediaId,
              { shouldDirty: true }
            );
            setValue(`organizationMediaList.${index}.isUploading`, false);
          }

          //
          if (data) {
            setValue(
              `organizationMediaList.${index}.uploadFilePath`,
              data.uploadFilePath,
              { shouldDirty: true }
            );
            setValue(
              `organizationMediaList.${index}.uploadFileId`,
              data.uploadFileId,
              { shouldDirty: true }
            );
            if (!blogId) {
              setValue(`organizationMediaList.${index}.isUploading`, false);
            }
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        apis.tools.createLog({
          function: "DatePicker: handleUploadFiles",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
    },
    [
      blogId,
      createOrgMedia,
      deleteOrgMedia,
      organizationId,
      setValue,
      uploadOrgFiles,
    ]
  );

  const handleUpdatedItems = useCallback(
    async (mediaList: OrganizationMediaField[]) => {
      // if (mediaList.filter((el) => el.tempNewImage).length === 0) return;
      const promises: Promise<unknown>[] = [];
      mediaList.forEach((media, index) => {
        const {
          organizationMediaId = "",
          tempNewImage: newFile,
          mediaImageDeleted,
        } = media;

        if (newFile) promises.push(handleUpdateItem(media, index));
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

      return Promise.all(promises)
        .then(() => {
          setValue("isFormBusy", false);
          // mutate();
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
    },
    [deleteOrgMedia, handleUpdateItem, organizationId, remove, setValue]
  );

  const handleDeleteUploadedItem = (
    item: OrganizationMediaField,
    remove: () => void,
    items?: OrganizationMediaField[] | any[],
    onEditClose?: any
  ) => {
    openConfirmDeleteDialog({
      primary: "您確定要刪除嗎？",
      onConfirm: async () => {
        if (item.organizationMediaId) {
          try {
            if (items?.length) {
              for (let i = 0; i < items.length; i++) {
                // eslint-disable-next-line no-await-in-loop
                await deleteOrgMedia({
                  organizationId,
                  organizationMediaId: items[i].organizationMediaId,
                });
              }
              onEditClose();
            } else {
              await deleteOrgMedia({
                organizationId,
                organizationMediaId: item.organizationMediaId,
              });
            }
            mutate();
            remove();
            closeConfirmDeleteDialog();
          } catch (error) {
            // eslint-disable-next-line no-console
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
          closeConfirmDeleteDialog();
        }
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <Form
        id={FORM}
        onSubmit={handleSubmit(async (values) => {
          // await handleUploadFilesNewFiles();
          await handleUpdatedItems(values.organizationMediaList);
          const updatedValues = getValues();
          onSubmit(updatedValues, mutate);
        })}
        loading={isValidating || isOrgUploading || isLoading}
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
                targetId={blogId}
                maxFields={1}
                onDeleteItemClick={handleDeleteUploadedItem}
              />
            </FormFieldLabel>
          </Grid>
        </Grid>
      </Form>
    </FormProvider>
  );
};

export default EditBlogForm;
