import React, {
  useEffect,
  // useContext,
  FC,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { useSelector } from "react-redux";
import apis from "utils/apis";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { KeyedMutator } from "swr";
import { AxiosResponse } from "axios";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
  SolutionEditFormInput,
  OrganizationMediaField,
  // OrganizationMediaSliderField,
  OrganizationMediaSliderMediaField,
} from "interfaces/form";
import parseOrgMediaListFormValues from "utils/parseOrgMediaListFormValues";
// import parseOrgMediaSliderListFormValues from "utils/parseOrgMediaSliderMediaListFormValues";
import parseOrgMediaSliderListFormValues from "utils/parseOrgMediaSliderListFormValues";
// import parseOrgMediaSliderMediaListFormValues from "utils/parseOrgMediaSliderMediaListFormValues";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import useSetFormIsDirty from "utils/useSetFormIsDirty";
import {
  Locale,
  OrganizationMediaSizeType,
  OrganizationMediaType,
  PageType,
  ServiceModuleValue,
} from "interfaces/utils";

import Grid from "@eGroupAI/material/Grid";
import FormField from "components/FormField";
import { OrganizationSolution } from "interfaces/entities";
import OrgMediaField from "components/OrgMediaField";
import OrgMediaFieldSlider from "components/OrgMediaField/OrgMediaFieldSlider";

import Form from "components/Form";
import FormFieldLabel from "components/FormFieldLabel";
import useUploadFilesHandler from "utils/useUploadFilesHandler";
// import CarouselManagementContext from "./CarouselManagementContext";

export const FORM = "SolutionInfoEditForm";

export interface SolutionInfoEditFormProps {
  onSubmit: (
    values: SolutionEditFormInput,
    sliderId?: string,
    mutate?: KeyedMutator<AxiosResponse<OrganizationSolution>>
  ) => void;
  onStartSortClick?: (
    values: SolutionEditFormInput,
    mutate: KeyedMutator<AxiosResponse<OrganizationSolution>>
  ) => void;
  setFormIsDirty?: Dispatch<SetStateAction<boolean>>;
  setFormIsBusy?: Dispatch<SetStateAction<boolean>>;
  infoMutate?: KeyedMutator<AxiosResponse<OrganizationSolution, any>>;
  solutionInfo?: OrganizationSolution;
  selectedLocale: Locale;
  selectedDesktop?: boolean;
}

const SolutionInfoEditForm: FC<SolutionInfoEditFormProps> = function (props) {
  const {
    onSubmit,
    setFormIsDirty,
    setFormIsBusy,
    infoMutate,
    onStartSortClick,
    solutionInfo,
    selectedLocale,
    selectedDesktop,
  } = props;
  const organizationId = useSelector(getSelectedOrgId);
  // const { selectedItem, selectedLocale } = useContext(
  //   CarouselManagementContext
  // );
  const methods = useForm<SolutionEditFormInput>({
    defaultValues: {
      organizationSolutionName: "",
      organizationSolutionDescription: "",
      organizationSolutionURL: "",
      organizationMediaList: [],
      organizationMediaSliderMediaList: [],
    },
  });
  const { control, handleSubmit, reset, formState, setValue, getValues } =
    methods;
  const { excute: sortOrgMedia } = useAxiosApiWrapper(
    apis.org.sortOrgMedia,
    "Update"
  );

  const { uploadOrgFiles } = useUploadFilesHandler();

  const { excute: createOrgMediaSlider } = useAxiosApiWrapper(
    apis.org.createOrgMediaSlider,
    "Create"
  );
  const { excute: updateOrgMediaSliderMedia } = useAxiosApiWrapper(
    apis.org.updateOrgMediaSliderMedia,
    "Update"
  );
  // const { excute: deleteOrgMediaSlider } = useAxiosApiWrapper(
  //   apis.org.deleteOrgMediaSlider,
  //   "Update"
  // );

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
    "Delete"
  );
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

  useSetFormIsDirty({
    isDirty: formState.isDirty,
    setFormIsDirty,
  });

  useEffect(() => {
    reset({
      organizationSolutionName: solutionInfo?.organizationSolutionName,
      organizationSolutionDescription:
        solutionInfo?.organizationSolutionDescription,
      organizationSolutionURL: solutionInfo?.organizationSolutionURL,
      organizationMediaList: parseOrgMediaListFormValues(
        solutionInfo?.organizationMediaList
      ),
      organizationMediaSliderMediaList: parseOrgMediaSliderListFormValues(
        solutionInfo?.organizationMediaSliderList,
        solutionInfo?.organizationSolutionId
      ).mediaSliderMediaItems,
    });
  }, [solutionInfo, reset]);

  const handleDeleteItem = (
    item: OrganizationMediaField,
    remove: () => void
  ) => {
    openConfirmDeleteDialog({
      primary: `您確定要刪除嗎？`,
      onConfirm: async () => {
        if (item.organizationMediaId) {
          try {
            await deleteOrgMedia({
              organizationId,
              organizationMediaId: item.organizationMediaId,
            });
            closeConfirmDeleteDialog();
            remove();
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
          closeConfirmDeleteDialog();
        }
      },
    });
  };

  const handleSortItem = async (item: OrganizationMediaField[]) => {
    try {
      if (solutionInfo?.organizationSolutionId) {
        await sortOrgMedia({
          organizationId,
          targetId: solutionInfo.organizationSolutionId,
          organizationMediaList: item
            .filter((el) => el.organizationMediaId)
            .map((el) => ({
              organizationMediaId: el.organizationMediaId as string,
            })),
        });
        // mutate();
      }
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: handleSortItem",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  const handleUploadMediaSliderMediaImages = useCallback(
    async (sliderList: OrganizationMediaSliderMediaField[]) => {
      const newFilesInfo =
        sliderList
          ?.filter((el) => el.tempNewImage && el.organizationMediaSizeType)
          ?.map((el) => ({
            file: el.tempNewImage as File,
            organizationMediaType: "IMAGE",
            organizationMediaSizeType:
              el.organizationMediaSizeType as OrganizationMediaSizeType,
            uploadFile: { uploadFileId: "" },
          })) || [];
      const newFiles = newFilesInfo.map((info) => info.file);
      const res = await uploadOrgFiles({
        organizationId,
        files: newFiles,
        filePathType: ServiceModuleValue.CMS_SOLUTION,
        imageSizeType: "PC",
        eGroupService: "WEBSITE",
      });
      if (res?.data) {
        const uploadedFileIds = res.data.map((r) => r.uploadFileId);
        const uploadedFilesInfo = newFilesInfo.map((fileInfo, i) => ({
          organizationMediaType:
            fileInfo.organizationMediaType as OrganizationMediaType,
          organizationMediaSizeType:
            fileInfo.organizationMediaSizeType as OrganizationMediaSizeType,
          uploadFile: { uploadFileId: uploadedFileIds[i] as string },
        }));
        return uploadedFilesInfo;
      }
      return undefined;
    },
    [organizationId, uploadOrgFiles]
  );

  const handleCreateOrUpdateOrgMediaSlider = useCallback(
    async (
      sliderId?: string,
      uploadedSliderFiles?: {
        uploadFile: {
          uploadFileId: string;
        };
        organizationMediaType: OrganizationMediaType;
        organizationMediaSizeType: OrganizationMediaSizeType;
      }[]
    ) => {
      if (!uploadedSliderFiles) return undefined;
      try {
        if (sliderId) {
          // Update PC or Mobile
          const res = await updateOrgMediaSliderMedia({
            organizationId,
            organizationMediaSliderId: sliderId,
            organizationMediaList: uploadedSliderFiles || [],
          });
          return res.data.organizationMediaSliderid as string;
        }
        const response = await createOrgMediaSlider({
          organizationId,
          targetId: solutionInfo?.organizationSolutionId,
          locale: selectedLocale,
          organizationMediaSliderPageType: PageType.SOLUTIONDETAIL,
          organizationMediaSliderTitle: "",
          organizationMediaSliderDescription: "",
          organizationMediaSliderLinkURL: "",
          organizationMediaList: uploadedSliderFiles || [],
        });
        return response.data.organizationMediaSliderId as string;
      } catch (error) {
        // eslint-disable-next-line no-console
        apis.tools.createLog({
          function: "CarouselEditDailog: handleUploadFiles",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
        return undefined;
      }
    },
    [
      createOrgMediaSlider,
      organizationId,
      solutionInfo?.organizationSolutionId,
      selectedLocale,
      updateOrgMediaSliderMedia,
    ]
  );

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
        if (uploadedFile && solutionInfo?.organizationSolutionId) {
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
              targetId: solutionInfo?.organizationSolutionId,
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
      setValue,
      solutionInfo?.organizationSolutionId,
      updateOrgMedia,
      uploadOrgFiles,
    ]
  );

  const handleAddNewItems = useCallback(
    async (valuesParam?: SolutionEditFormInput) => {
      let values = getValues();
      if (valuesParam) values = valuesParam;
      const promises: Promise<unknown>[] = [];

      values?.organizationMediaList?.forEach((value, index) => {
        const newFile = value.tempNewImage;
        if (newFile) promises.push(handleAddNewItem(newFile, index));
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
    },
    [getValues, handleAddNewItem, setValue]
  );

  return (
    <FormProvider {...methods}>
      <Form
        id={FORM}
        onSubmit={handleSubmit(async () => {
          const values = methods.getValues();
          setValue("isFormBusy", true);
          if (setFormIsBusy) setFormIsBusy(true);
          await handleAddNewItems(values);
          const uploadedFilesInfo = await handleUploadMediaSliderMediaImages(
            values.organizationMediaSliderMediaList || []
          );
          const sliderId = await handleCreateOrUpdateOrgMediaSlider(
            solutionInfo?.organizationMediaSliderList?.[0]
              ?.organizationMediaSliderId,
            uploadedFilesInfo
          );
          setValue("isFormBusy", false);
          if (setFormIsBusy) setFormIsBusy(false);

          const valuesUpdated = methods.getValues();
          onSubmit(valuesUpdated, sliderId);
        })}
        // loading={isValidating}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="organizationSolutionName"
              render={({ field: { value, onChange } }) => (
                <FormField
                  primary="解決方案名稱"
                  TextFieldProps={{
                    onChange,
                    value,
                    placeholder: "輸入解決方案名稱",
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="organizationSolutionURL"
              render={({ field: { value, onChange } }) => (
                <FormField
                  primary="解決方案連結"
                  TextFieldProps={{
                    onChange,
                    value,
                    placeholder: "輸入解決方案連結",
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="organizationSolutionDescription"
              render={({ field: { value, onChange } }) => (
                <FormField
                  primary="解決方案描述"
                  TextFieldProps={{
                    onChange,
                    value,
                    placeholder: "輸入解決方案描述",
                    multiline: true,
                    minRows: 5,
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <FormFieldLabel primary="背景圖片">
              <OrgMediaFieldSlider
                filePathType={ServiceModuleValue.CMS_SOLUTION}
                targetId={
                  solutionInfo?.organizationMediaSliderList?.[0]
                    ?.organizationMediaSliderId
                }
                maxFields={1}
                onDeleteItemClick={handleDeleteItem}
                onItemOrderChange={handleSortItem}
                imageOnly
                useSliderImage
                selectedDesktop={selectedDesktop}
                onStartSortClick={() => {
                  const values = getValues();
                  if (onStartSortClick && infoMutate)
                    onStartSortClick(values, infoMutate);
                }}
              />
            </FormFieldLabel>
          </Grid>
          <Grid item xs={12}>
            <FormFieldLabel primary="Icon 編輯(建議比例1:1)">
              <OrgMediaField
                filePathType={ServiceModuleValue.CMS_SOLUTION}
                targetId={solutionInfo?.organizationSolutionId}
                useSliderImage
                maxFields={4}
                enableTitle
                onDeleteItemClick={handleDeleteItem}
                onItemOrderChange={handleSortItem}
                onStartSortClick={() => {
                  const values = getValues();
                  if (onStartSortClick && infoMutate)
                    onStartSortClick(values, infoMutate);
                }}
                useOneItemAtOnce={false}
              />
            </FormFieldLabel>
          </Grid>
        </Grid>
      </Form>
    </FormProvider>
  );
};

export default SolutionInfoEditForm;
