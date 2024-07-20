import React, { FC, useState } from "react";

import {
  getOrgShareEditList,
  getOrgFinanceTemplateList,
  getOrgShareEditNeedUpload,
  getOrgShareUploadDescription,
  getOrgShareWelcomeMessage,
  getOrgShareFinishMessage,
  getWelcomeUploadFiles,
  getFinishUploadFiles,
  getUploadFileTargetList,
  getOrgShareIsOneTime,
  getOrgShareExpiredDateString,
  getHasDueDate,
  getIsFileUploading,
  getOrgShareTemplateTitle,
  getOrgShareTemplateTagList,
  getWelcomeUploadFileId,
  getFinishUploadFileId,
  getHasRelativeTime,
  getOrgShareExpireRelativeDay,
} from "redux/createUserInfoFilledUrlDialog/selectors";

import sortOrgShareEditListByStaticDynamicColumns from "utils/sortOrgShareEditListByStaticDynamicColumns";
import sortOrgShareTemplateEditListByStaticDynamicColumns from "utils/sortOrgShareTemplateEditListByStaticDynamicColumns";
import useUploadFilesHandler from "utils/useUploadFilesHandler";
import { useSelector } from "react-redux";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import useReduxSteps from "utils/useReduxSteps";
import {
  ServiceModuleValue,
  OrganizationMediaSizeType,
  Table,
} from "interfaces/utils";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import Stepper from "@eGroupAI/material/Stepper";
import Step from "@eGroupAI/material/Step";
import StepButton from "@eGroupAI/material/StepButton";
import Box from "@eGroupAI/material/Box";
import Dialog from "@eGroupAI/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import PreviewFilledUserInfo from "publicPages/FilledUserInfo/PreviewFilledUserInfo";
import {
  FileTarget,
  ShareTemplateEditValuesType,
} from "components/OrgModuleShareTemplateDialog/typings";
import {
  OrganizationUser,
  ShareReurl,
  ShareTemplateSearch,
} from "interfaces/entities";

import useStaticColumns from "utils/useStaticColumns";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import SelectShareEditListStep from "./SelectShareEditListStep";
import SelectStatementStep from "./SelectStatementStep";
import SettingStep from "./SettingStep";
import SelectFinanceTemplate from "./SelectFinanceTemplate";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface OrgModuleShareTemplateDialogProps {
  open: boolean;
  closeDialog?: () => void;
  onSubmit?: (values: ShareTemplateEditValuesType) => void;
  loading?: boolean;
  orgUser?: OrganizationUser;
  columnTable: string;
  serviceModuleValue: ServiceModuleValue;
  shareTemplateToUpdate?: ShareTemplateSearch;
}

const OrgModuleShareTemplateDialog: FC<OrgModuleShareTemplateDialogProps> =
  function (props) {
    const wordLibrary = useSelector(getWordLibrary);
    const steps = [
      `${wordLibrary?.["select form fields"] ?? "選擇填寫欄位"}`,
      `${wordLibrary?.["select statement"] ?? "選擇聲明書"}`,
      `${wordLibrary?.["select financial template"] ?? "選擇財務範本"}`,
      `${wordLibrary?.settings ?? "設定"}`,
    ];

    const classes = useStyles();
    const theme = useTheme();
    const {
      open,
      onSubmit,
      loading,
      closeDialog,
      // orgUser,
      columnTable,
      serviceModuleValue,
      shareTemplateToUpdate,
    } = props;

    /**
     * org module (Currently in Crm-User only) Share Template
     * uses the same redux with Crm-User-Share.
     * So Initializing is important in each module when it needed.
     */
    const organizationId = useSelector(getSelectedOrgId);
    const orgShareEditList = useSelector(getOrgShareEditList) || [];
    const orgFinanceTemplateList = useSelector(getOrgFinanceTemplateList) || [];
    const uploadFileTargetList = useSelector(getUploadFileTargetList) || [];
    const orgShareEditNeedUpload = useSelector(getOrgShareEditNeedUpload);
    const orgShareIsOneTime = useSelector(getOrgShareIsOneTime);
    const orgShareUploadDescription = useSelector(getOrgShareUploadDescription);
    const orgShareWelcomeMessage = useSelector(getOrgShareWelcomeMessage);
    const orgShareFinishMessage = useSelector(getOrgShareFinishMessage);
    const orgShareTemplateTitle = useSelector(getOrgShareTemplateTitle);
    const orgShareTemplateTagList =
      useSelector(getOrgShareTemplateTagList) || [];

    const welcomeUploadFiles = useSelector(getWelcomeUploadFiles);
    const finishUploadFiles = useSelector(getFinishUploadFiles);
    const welcomeUploadedFileId = useSelector(getWelcomeUploadFileId);
    const finishUploadedFileId = useSelector(getFinishUploadFileId);
    const { uploadOrgFiles, setCompleted, clearValue } =
      useUploadFilesHandler();
    const orgShareExpiredDateString = useSelector(getOrgShareExpiredDateString);
    const orgShareExpireRelativeDay = useSelector(getOrgShareExpireRelativeDay);
    const isFileUploading = useSelector(getIsFileUploading);
    const hasDueDate = useSelector(getHasDueDate);
    const hasRelativeTime = useSelector(getHasRelativeTime);

    const maxActiveStep = steps.length - 1;
    const staticColumns = useStaticColumns(Table.USERS, "isEdit");
    const { data: orgColumns } = useOrgDynamicColumns(
      {
        organizationId,
      },
      {
        columnTable,
      }
    );

    const { setActiveStep, activeStep = 0 } = useReduxSteps(
      "CreateUserInfoFilledUrlSteps",
      !open
    );
    const [isPreview, setIsPreview] = useState<boolean>(false);
    const [previewStep, setPreviewStep] = useState<number | undefined>();
    const [shareEditPreviewValues, setShareEditPreviewValues] =
      useState<ShareReurl>();

    const handleStep = (step: number) => () => {
      setActiveStep(step);
    };

    const handleNext = async () => {
      if (activeStep < maxActiveStep) {
        setActiveStep(activeStep + 1);
      } else if (onSubmit) {
        const coverFiles: FileTarget[] = [];
        if (welcomeUploadFiles.length !== 0) {
          await uploadOrgFiles({
            organizationId,
            files: welcomeUploadFiles,
            filePathType: ServiceModuleValue.WELCOME_IMAGE,
            imageSizeType: OrganizationMediaSizeType.NORMAL,
          })
            .then((res) => {
              if (res) {
                if (res.data[0]) {
                  coverFiles.push({
                    uploadFile: {
                      uploadFileId: res.data[0].uploadFileId,
                    },
                  });
                }
              }
            })
            .finally(() => {
              clearValue();
              setCompleted(0);
            });
        } else if (welcomeUploadedFileId) {
          coverFiles.push({
            uploadFile: {
              uploadFileId: welcomeUploadedFileId,
            },
          });
        }
        if (finishUploadFiles.length !== 0) {
          await uploadOrgFiles({
            organizationId,
            files: finishUploadFiles,
            filePathType: ServiceModuleValue.FINISH_IMAGE,
            imageSizeType: OrganizationMediaSizeType.NORMAL,
          })
            .then((res) => {
              if (res) {
                if (res.data[0]) {
                  coverFiles.push({
                    uploadFile: {
                      uploadFileId: res.data[0].uploadFileId,
                    },
                  });
                }
              }
            })
            .finally(() => {
              clearValue();
              setCompleted(0);
            });
        } else if (finishUploadedFileId) {
          coverFiles.push({
            uploadFile: {
              uploadFileId: finishUploadedFileId,
            },
          });
        }

        if (staticColumns && orgColumns?.source) {
          onSubmit({
            organizationShareTemplateTitle: orgShareTemplateTitle || "",
            organizationShareTemplateTagList: orgShareTemplateTagList || [],
            organizationShareTemplateEditList:
              sortOrgShareTemplateEditListByStaticDynamicColumns(
                orgShareEditList,
                staticColumns,
                orgColumns.source
              ),
            organizationFinanceTemplateList: orgFinanceTemplateList.map(
              (el) => ({
                organizationFinanceTemplateId: el.organizationFinanceTemplateId,
              })
            ),
            uploadFileTargetList: [...uploadFileTargetList, ...coverFiles],
            organizationShareTemplateEditNeedUpload: orgShareEditNeedUpload,
            organizationShareTemplateIsOneTime: orgShareIsOneTime,
            organizationShareTemplateUploadDescription:
              orgShareUploadDescription,
            organizationShareTemplateWelcomeMessage: orgShareWelcomeMessage,
            organizationShareTemplateFinishMessage: orgShareFinishMessage,
            // eslint-disable-next-line no-nested-ternary
            ...(hasDueDate === "1"
              ? hasRelativeTime === "1"
                ? {
                    organizationShareTemplateEndDaysInterval:
                      orgShareExpireRelativeDay,
                  }
                : {
                    organizationShareTemplateExpiredDate:
                      orgShareExpiredDateString,
                  }
              : {}),
          });
        }
      }
    };

    const handlePrev = () => {
      if (activeStep > 0) {
        setActiveStep(activeStep - 1);
      }
    };

    const handleCloseDialog = () => {
      if (closeDialog) closeDialog();
      setIsPreview(false);
      setPreviewStep(undefined);
    };

    const handlePreview = () => {
      setIsPreview(!isPreview);
      if (isPreview) setPreviewStep(undefined);
      if (staticColumns && orgColumns?.source) {
        setShareEditPreviewValues((prev) => ({
          ...prev,
          organizationShareTargetType: ServiceModuleValue.CRM_USER,
          organizationShareEditList: sortOrgShareEditListByStaticDynamicColumns(
            orgShareEditList,
            staticColumns,
            orgColumns.source
          ),
          organizationUser: {
            organizationUserId: "",
            columnConditionList: staticColumns,
            dynamicColumnListAll: orgColumns.source,
          },
          organizationShareEditNeedUpload: Number(orgShareEditNeedUpload),
          organizationShareUploadDescription: orgShareUploadDescription,
          organizationShareWelcomeMessage: orgShareWelcomeMessage,
          organizationShareFinishMessage: orgShareFinishMessage,
        }));
      }
    };

    return (
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth={isPreview ? "xl" : "sm"}
        className={classes.dialogPaper}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
      >
        <DialogTitle onClickClose={handleCloseDialog}>
          {!shareTemplateToUpdate
            ? wordLibrary?.["create share template"] ?? "建立分享編輯範本"
            : `${
                wordLibrary?.["update share template"] ?? "更新分享編輯範本"
              } ${shareTemplateToUpdate.organizationShareTemplateTitle}`}
          {isPreview ? " 預覽模式" : ""}
        </DialogTitle>
        <DialogContent>
          {!isPreview && (
            <>
              <Stepper nonLinear activeStep={activeStep}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepButton color="inherit" onClick={handleStep(index)}>
                      {label}
                    </StepButton>
                  </Step>
                ))}
              </Stepper>
              <Box mt={3}>
                {activeStep === 0 && <SelectShareEditListStep />}
                {activeStep === 1 && (
                  <SelectStatementStep
                    setPreviewData={setShareEditPreviewValues}
                  />
                )}
                {activeStep === 2 && (
                  <SelectFinanceTemplate
                    setPreviewData={setShareEditPreviewValues}
                  />
                )}
                {activeStep === 3 && (
                  <SettingStep
                    shareTemplateToUpdate={shareTemplateToUpdate}
                    serviceModuleValue={serviceModuleValue}
                  />
                )}
              </Box>
            </>
          )}
          {isPreview && (
            <PreviewFilledUserInfo
              isBeforeCreateUrl
              step={previewStep}
              changeStep={setPreviewStep}
              shareEditPreviewValues={shareEditPreviewValues}
            />
          )}
        </DialogContent>
        <DialogActions>
          <DialogCloseButton
            onClick={handleCloseDialog}
            disabled={loading}
            rounded
          />
          <Box flexGrow={1} />
          {activeStep === maxActiveStep && (
            <DialogConfirmButton
              disabled={
                activeStep === maxActiveStep &&
                orgShareEditList.length === 0 &&
                orgFinanceTemplateList.length === 0 &&
                uploadFileTargetList.length === 0 &&
                orgShareEditNeedUpload === "0"
              }
              color="info"
              onClick={handlePreview}
              rounded
            >
              {!isPreview
                ? `${wordLibrary?.preview ?? "預覽"}`
                : `${wordLibrary?.["return to edit mode"] ?? "回到編輯模式"}`}
            </DialogConfirmButton>
          )}
          {!isPreview && activeStep !== 0 && (
            <DialogConfirmButton
              disabled={activeStep === 0 || loading}
              onClick={handlePrev}
              rounded
            >
              {wordLibrary?.["previous step"] ?? "上一步"}
            </DialogConfirmButton>
          )}
          {!isPreview && (
            <DialogConfirmButton
              onClick={handleNext}
              loading={isFileUploading || loading}
              disabled={
                (activeStep === maxActiveStep &&
                  orgShareEditList.length === 0 &&
                  orgFinanceTemplateList.length === 0 &&
                  uploadFileTargetList.length === 0 &&
                  orgShareEditNeedUpload === "0") ||
                (activeStep === maxActiveStep &&
                  orgShareTemplateTitle?.length === 0)
              }
              rounded
            >
              {(() => {
                let output = "";
                if (activeStep === maxActiveStep) {
                  output = wordLibrary?.save ?? "儲存";
                } else {
                  output = wordLibrary?.["next step"] ?? "下一步";
                }
                return output;
              })()}
            </DialogConfirmButton>
          )}
        </DialogActions>
      </Dialog>
    );
  };

export default OrgModuleShareTemplateDialog;
