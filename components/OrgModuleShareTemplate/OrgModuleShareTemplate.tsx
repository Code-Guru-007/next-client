import { FC, useCallback, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import { ShareTemplateSearch, UploadFile } from "interfaces/entities";
import { ServiceModuleValue } from "interfaces/utils";

import OrgModuleShareTemplateDataTable from "components/OrgModuleShareTemplateDataTable";
import OrgModuleShareTemplateDialog from "components/OrgModuleShareTemplateDialog";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { ShareTemplateEditValuesType } from "components/OrgModuleShareTemplateDialog/typings";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";
import {
  initializeOrgShareValues,
  setOrgShareValues,
  setFinishUploadFile,
  setWelcomeUploadFile,
  setHasDueDate,
  setHasRelativeTime,
} from "redux/createUserInfoFilledUrlDialog";
import { useAppDispatch } from "redux/configureAppStore";
import { ShareTemplateTableChildRef } from "components/OrgModuleShareTemplateDataTable/OrgModuleShareTemplateDataTable";

interface Props {
  serviceModuleValue: ServiceModuleValue;
  columnTable: string;
}

const OrgModuleShareTemplate: FC<Props> = function (props) {
  const { serviceModuleValue, columnTable } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const dispatch = useAppDispatch();

  const templateTableChildRef = useRef<ShareTemplateTableChildRef>(null);
  const [shareTemplateToUpdate, setShareTemplateToUpdate] = useState<
    ShareTemplateSearch | undefined
  >();

  const { excute: createOrgShareTemplate, isLoading: isCreatingShareTemplate } =
    useAxiosApiWrapper(apis.org.createOrgShareTemplate);

  const { excute: updateOrgShareTemplate, isLoading: isUpdatingShareTemplate } =
    useAxiosApiWrapper(apis.org.updateOrgShareTemplate);

  const { excute: getOrgShareTemplate, isLoading: isGettingShareTemplate } =
    useAxiosApiWrapper(apis.org.getOrgShareTemplate, "None");

  const {
    isOpen: isShareTemplateDialogOpen,
    handleClose: closeShareTemplateDialog,
    handleOpen: openShareTemplateDialog,
  } = useIsOpen(false);

  const handleOnSubmit = useCallback(
    async (values: ShareTemplateEditValuesType) => {
      if (!shareTemplateToUpdate) {
        try {
          await createOrgShareTemplate({
            organizationId,
            organizationShareTemplateTargetType: ServiceModuleValue.CRM_USER,
            organizationShareTemplateTitle:
              values.organizationShareTemplateTitle || "",
            organizationTagList: values.organizationShareTemplateTagList.map(
              (templateTag) => ({
                tagId: templateTag.tagId,
              })
            ),
            organizationShareTemplateEditList:
              values.organizationShareTemplateEditList,
            organizationFinanceTemplateList:
              values.organizationFinanceTemplateList,
            uploadFileTargetList: values.uploadFileTargetList,
            organizationShareTemplateEditNeedUpload:
              values.organizationShareTemplateEditNeedUpload || "0",
            organizationShareTemplateIsOneTime:
              values.organizationShareTemplateIsOneTime,
            organizationShareTemplateExpiredDate:
              values.organizationShareTemplateExpiredDate,
            organizationShareTemplateEndDaysInterval:
              values.organizationShareTemplateEndDaysInterval,
            organizationShareTemplateUploadDescription:
              values.organizationShareTemplateUploadDescription || "",
            organizationShareTemplateWelcomeMessage:
              values.organizationShareTemplateWelcomeMessage || "",
            organizationShareTemplateFinishMessage:
              values.organizationShareTemplateFinishMessage || "",
          });
          // dispatch(setOrgShareTemplate(res.data));
          // closeFilledDialog();
          closeShareTemplateDialog();
          templateTableChildRef.current?.handleMutate();
          // dispatch(setOrgShareTemplateEdits([]));
        } catch (error) {
          apis.tools.createLog({
            function: "DatePicker: handleOnSubmit_CreateOrgShareTemplate",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: error,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
          });
        }
      } else {
        try {
          await updateOrgShareTemplate({
            organizationId,
            organizationShareTemplateTargetType: ServiceModuleValue.CRM_USER,
            organizationShareTemplateId:
              shareTemplateToUpdate.organizationShareTemplateId,
            organizationShareTemplateTitle:
              values.organizationShareTemplateTitle,
            organizationTagList: values.organizationShareTemplateTagList.map(
              (templateTag) => ({
                tagId: templateTag.tagId,
              })
            ),
            organizationShareTemplateEditList:
              values.organizationShareTemplateEditList,
            organizationFinanceTemplateList:
              values.organizationFinanceTemplateList,
            uploadFileTargetList: values.uploadFileTargetList,
            organizationShareTemplateEditNeedUpload:
              values.organizationShareTemplateEditNeedUpload || "0",
            organizationShareTemplateIsOneTime:
              values.organizationShareTemplateIsOneTime,
            organizationShareTemplateExpiredDate:
              values.organizationShareTemplateExpiredDate,
            organizationShareTemplateEndDaysInterval:
              values.organizationShareTemplateEndDaysInterval,
            organizationShareTemplateUploadDescription:
              values.organizationShareTemplateUploadDescription || "",
            organizationShareTemplateWelcomeMessage:
              values.organizationShareTemplateWelcomeMessage || "",
            organizationShareTemplateFinishMessage:
              values.organizationShareTemplateFinishMessage || "",
          });
          // dispatch(setOrgShareTemplate(res.data));
          // closeFilledDialog();
          closeShareTemplateDialog();
          templateTableChildRef.current?.handleMutate();
          // dispatch(setOrgShareTemplateEdits([]));
        } catch (error) {
          apis.tools.createLog({
            function: "DatePicker: handleOnSubmit_CreateOrgShareTemplate",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: error,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
          });
        }
      }
    },
    [
      closeShareTemplateDialog,
      createOrgShareTemplate,
      organizationId,
      shareTemplateToUpdate,
      updateOrgShareTemplate,
    ]
  );

  const handleOpenCreateShareDialog = () => {
    setShareTemplateToUpdate(undefined);
    dispatch(initializeOrgShareValues());
    if (serviceModuleValue === ServiceModuleValue.CRM_USER)
      openShareTemplateDialog();
  };

  const handleOpenEditShareDialog = async (
    shareTemplate: ShareTemplateSearch
  ) => {
    setShareTemplateToUpdate(shareTemplate);
    const resp = await getOrgShareTemplate({
      organizationId,
      organizationShareTemplateId: shareTemplate.organizationShareTemplateId,
    });
    const selectedDetails = resp.data;
    dispatch(
      setOrgShareValues({
        values: {
          orgShareTemplateTitle: selectedDetails.organizationShareTemplateTitle,
          orgShareTemplateTagList: shareTemplate.organizationTagTargetList.map(
            ({ organizationTag }) => organizationTag
          ),
          orgShareEditList:
            selectedDetails.organizationShareTemplateEditList?.map((edit) => ({
              organizationShareEditKey: edit.organizationShareTemplateEditKey,
              organizationShareEditType: edit.organizationShareTemplateEditType,
              organizationShareEditIsRequired:
                edit.organizationShareTemplateEditIsRequired,
              isDynamicColumn: edit.isDynamicColumn,
              isAutoFill: edit.isAutoFill,
            })),
          orgFinanceTemplateList:
            selectedDetails.organizationFinanceTemplateList,
          uploadFileTargetList:
            selectedDetails.uploadFileList
              ?.filter(
                (uploadedFile) =>
                  uploadedFile.uploadFilePathType === "USER_AGREEMENT"
              )
              ?.map((file) => ({
                uploadFile: {
                  uploadFileId: file.uploadFileId,
                },
              })) || [],
          orgShareEditNeedUpload: String(
            selectedDetails.organizationShareTemplateEditNeedUpload
          ),
          orgShareIsOneTime: String(
            selectedDetails.organizationShareTemplateIsOneTime
          ),
          orgShareUploadDescription:
            selectedDetails.organizationShareTemplateUploadDescription,
          orgShareWelcomeMessage:
            selectedDetails.organizationShareTemplateWelcomeMessage,
          orgShareFinishMessage:
            selectedDetails.organizationShareTemplateFinishMessage,
          welcomeUploadFileId:
            selectedDetails.uploadFileList?.find(
              (el) => el.uploadFilePathType === ServiceModuleValue.WELCOME_IMAGE
            )?.uploadFileId || "",
          finishUploadFileId:
            selectedDetails.uploadFileList?.find(
              (el) => el.uploadFilePathType === ServiceModuleValue.FINISH_IMAGE
            )?.uploadFileId || "",
          welcomeUploadFiles: [],
          finishUploadFiles: [],
          orgShareExpiredDateString:
            selectedDetails.organizationShareTemplateExpiredDate
              ? new Date(
                  selectedDetails.organizationShareTemplateExpiredDate
                ).toISOString()
              : "",
          orgShareExpireRelativeDay:
            selectedDetails.organizationShareTemplateEndDaysInterval ?? 0,
        },
      })
    );
    dispatch(
      setHasRelativeTime(
        selectedDetails.organizationShareTemplateEndDaysInterval ? "1" : "0"
      )
    );
    dispatch(
      setHasDueDate(
        selectedDetails.organizationShareTemplateExpiredDate ||
          selectedDetails.organizationShareTemplateEndDaysInterval
          ? "1"
          : "0"
      )
    );
    dispatch(
      setWelcomeUploadFile(
        selectedDetails.uploadFileList?.find(
          (el) => el.uploadFilePathType === ServiceModuleValue.WELCOME_IMAGE
        ) as UploadFile
      )
    );
    dispatch(
      setFinishUploadFile(
        selectedDetails.uploadFileList?.find(
          (el) => el.uploadFilePathType === ServiceModuleValue.FINISH_IMAGE
        ) as UploadFile
      )
    );
    if (serviceModuleValue === ServiceModuleValue.CRM_USER)
      openShareTemplateDialog();
  };

  return (
    <>
      <OrgModuleShareTemplateDataTable
        ref={templateTableChildRef}
        organizationId={organizationId}
        onCreateShareTemplate={handleOpenCreateShareDialog}
        onEditShareTemplate={handleOpenEditShareDialog}
        serviceModuleValue={serviceModuleValue}
        isLoading={isGettingShareTemplate}
      />

      <OrgModuleShareTemplateDialog
        columnTable={columnTable}
        serviceModuleValue={serviceModuleValue}
        shareTemplateToUpdate={shareTemplateToUpdate}
        loading={isCreatingShareTemplate || isUpdatingShareTemplate}
        onSubmit={handleOnSubmit}
        open={isShareTemplateDialogOpen}
        closeDialog={closeShareTemplateDialog}
      />
    </>
  );
};

export default OrgModuleShareTemplate;
