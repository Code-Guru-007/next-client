import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import apis from "utils/apis";
import {
  Locale,
  OrganizationMediaSizeType,
  OrganizationMediaType,
  ServiceModuleValue,
} from "interfaces/utils";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import useSetFormIsDirty, { SetFormIsDirty } from "utils/useSetFormIsDirty";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import useOrgCmsContent from "utils/useOrgCmsContent";
import parseCmsContentFormValues from "utils/parseCmsContentFormValues";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import { useForm, useFieldArray } from "react-hook-form";
import { CmsContentFormInput, OrganizationMediaField } from "interfaces/form";
import { useCallback, useEffect } from "react";
import useUploadFilesHandler from "utils/useUploadFilesHandler";
import useSetFormIsBusy, { SetFormIsBusy } from "utils/useSetFormIsBusy";
import { OrganizationMedia } from "interfaces/entities";

type UseFormHandlerArgs = {
  setFormIsDirty?: SetFormIsDirty;
  setFormIsBusy?: SetFormIsBusy;
  selectedLocale: Locale;
  cmsContentId: string;
  uploadFilePathType?: ServiceModuleValue;
  selectedEditItem?: OrganizationMedia;
  setSelectedEditItem?: React.Dispatch<
    React.SetStateAction<OrganizationMedia | undefined>
  >;
  useOneItemAtOnce?: boolean;
};

export default function useCmsContentForm({
  setFormIsDirty,
  setFormIsBusy,
  cmsContentId,
  selectedLocale,
  uploadFilePathType: filePathType,
  selectedEditItem,
  setSelectedEditItem,
  useOneItemAtOnce = true,
}: UseFormHandlerArgs) {
  const methods = useForm<CmsContentFormInput>({
    defaultValues: {
      organizationCmsContentTitle: "",
      organizationCmsContentDescription: "",
      organizationMediaList: [],
    },
  });

  const { reset, formState, getValues, setValue, watch, control } = methods;

  const { remove } = useFieldArray({
    control,
    name: "organizationMediaList",
  });

  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
    setDialogStates: setConfirmDeleteDialogStates,
  } = useReduxDialog(DELETE_DIALOG);
  const organizationId = useSelector(getSelectedOrgId);
  const { excute: sortOrgMedia } = useAxiosApiWrapper(
    apis.org.sortOrgMedia,
    "Update"
  );
  const { excute: deleteOrgMedia } = useAxiosApiWrapper(
    apis.org.deleteOrgMedia,
    "Delete"
  );

  const { excute: createOrgMedia } = useAxiosApiWrapper(
    apis.org.createOrgMedia,
    "Create"
  );

  const { excute: updateOrgMedia } = useAxiosApiWrapper(
    apis.org.updateOrgMedia,
    "Create"
  );

  const { uploadOrgFiles, isOrgUploading } = useUploadFilesHandler();

  useSetFormIsDirty({
    isDirty: formState.isDirty,
    setFormIsDirty,
  });

  const isFormBusy = watch("isFormBusy") || false;

  useSetFormIsBusy({
    isBusy: isFormBusy,
    setFormIsBusy,
  });

  const { data, mutate, isValidating } = useOrgCmsContent(
    {
      organizationId,
      organizationCmsContentId: cmsContentId,
    },
    {
      locale: selectedLocale,
    }
  );

  useEffect(() => {
    if (data && selectedEditItem && setSelectedEditItem && selectedLocale) {
      setSelectedEditItem(
        data.organizationMediaList?.find(
          (el) =>
            el.organizationMediaId === selectedEditItem.organizationMediaId
        ) as OrganizationMedia
      );
    }
  }, [data, selectedEditItem, setSelectedEditItem, selectedLocale]);

  useEffect(() => {
    if (data) {
      reset(
        parseCmsContentFormValues(data, selectedEditItem, !useOneItemAtOnce)
      );
    }
  }, [data, reset, selectedEditItem, useOneItemAtOnce]);

  const handleSortItem = (item: OrganizationMediaField[]) => {
    sortOrgMedia({
      organizationId,
      targetId: cmsContentId,
      organizationMediaList: item
        .filter((el) => el.organizationMediaId)
        .map((el) => ({
          organizationMediaId: el.organizationMediaId as string,
        })),
    });
  };

  const handleDeleteItem = (
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
              setConfirmDeleteDialogStates({ isDeleting: true });
              for (let i = 0; i < items.length; i++) {
                // eslint-disable-next-line no-await-in-loop
                await deleteOrgMedia({
                  organizationId,
                  organizationMediaId: items[i].organizationMediaId,
                });
              }
              onEditClose();
            } else {
              setConfirmDeleteDialogStates({ isDeleting: true });
              await deleteOrgMedia({
                organizationId,
                organizationMediaId: item.organizationMediaId,
              });
            }
            setConfirmDeleteDialogStates({ isDeleting: false });
            mutate();
            remove();
            closeConfirmDeleteDialog();
          } catch (error) {
            // eslint-disable-next-line no-console
            setConfirmDeleteDialogStates({ isDeleting: false });
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

  const handleAddNewItem = useCallback(
    async (file: File, index: number) => {
      const res = await uploadOrgFiles({
        organizationId,
        files: [file],
        filePathType,
        imageSizeType: OrganizationMediaSizeType.NORMAL,
        eGroupService: "WEBSITE",
      });

      if (res) {
        const uploadedFile = res.data[0];
        if (uploadedFile && cmsContentId) {
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
              targetId: cmsContentId,
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
      cmsContentId,
      createOrgMedia,
      filePathType,
      getValues,
      organizationId,
      setValue,
      updateOrgMedia,
      uploadOrgFiles,
    ]
  );

  const handleUpdatedItems = useCallback(
    async (valuesParam?: CmsContentFormInput) => {
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
    [
      deleteOrgMedia,
      getValues,
      handleAddNewItem,
      organizationId,
      remove,
      setValue,
    ]
  );

  return {
    handleSortItem,
    handleDeleteItem,
    handleAddNewItem,
    handleUpdatedItems,
    isUploading: isOrgUploading,
    mutate,
    isValidating,
    methods,
  };
}
