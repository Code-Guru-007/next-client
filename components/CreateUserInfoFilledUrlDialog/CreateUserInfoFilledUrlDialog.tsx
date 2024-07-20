import { FC, useEffect, useState } from "react";
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
  getWelcomeUploadFileId,
  getFinishUploadFileId,
} from "redux/createUserInfoFilledUrlDialog/selectors";
import useOrgFinanceTemplates from "utils/useOrgFinanceTemplates";
import sortOrgShareEditListByStaticDynamicColumns from "utils/sortOrgShareEditListByStaticDynamicColumns";
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
  FilePathType,
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
  ShareEditValuesType,
} from "components/CreateUserInfoFilledUrlDialog/typings";
import {
  OrganizationShareTemplate,
  OrganizationUser,
  ShareReurl,
} from "interfaces/entities";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import useOrgUploadFiles from "utils/useOrgUploadFiles";

import useStaticColumns from "utils/useStaticColumns";
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

export interface CreateUserInfoFilledUrlDialogProps {
  open: boolean;
  closeDialog?: () => void;
  onSubmit?: (values: ShareEditValuesType) => void;
  loading?: boolean;
  orgUser?: OrganizationUser;
}

const CreateUserInfoFilledUrlDialog: FC<CreateUserInfoFilledUrlDialogProps> =
  function (props) {
    const wordLibrary = useSelector(getWordLibrary);
    const organizationId = useSelector(getSelectedOrgId);
    const { data: financeData } = useOrgFinanceTemplates({
      organizationId,
    });

    const steps = [
      `${wordLibrary?.["select form fields"] ?? "選擇填寫欄位"}`,
      `${wordLibrary?.["select statement"] ?? "選擇聲明書"}`,
      `${wordLibrary?.["select financial template"] ?? "選擇財務範本"}`,
      `${wordLibrary?.["sharing settings"] ?? "設定"}`,
    ];

    const classes = useStyles();
    const theme = useTheme();
    const { open, onSubmit, loading, closeDialog, orgUser } = props;

    const { data: orgColumns } = useOrgDynamicColumns(
      {
        organizationId,
      },
      {
        columnTable: "ORGANIZATION_USER",
      },
      undefined,
      !open
    );

    const { data: uploadFiles } = useOrgUploadFiles(
      {
        organizationId,
      },
      {
        filePathType: FilePathType.USER_AGREEMENT,
      },
      undefined,
      !open
    );

    /**
     * org module (Currently in Crm-User only) Share Template
     * uses the same redux with Crm-User-Share.
     * So Initializing is important in each module when it needed.
     */
    const orgShareEditList = useSelector(getOrgShareEditList) || [];
    const orgFinanceTemplateList = useSelector(getOrgFinanceTemplateList) || [];
    const uploadFileTargetList = useSelector(getUploadFileTargetList) || [];
    const orgShareEditNeedUpload = useSelector(getOrgShareEditNeedUpload);
    const orgShareIsOneTime = useSelector(getOrgShareIsOneTime);
    const orgShareUploadDescription = useSelector(getOrgShareUploadDescription);
    const orgShareWelcomeMessage = useSelector(getOrgShareWelcomeMessage);
    const orgShareFinishMessage = useSelector(getOrgShareFinishMessage);
    const welcomeUploadFiles = useSelector(getWelcomeUploadFiles);
    const finishUploadFiles = useSelector(getFinishUploadFiles);
    const welcomeUploadedFileId = useSelector(getWelcomeUploadFileId);
    const finishUploadedFileId = useSelector(getFinishUploadFileId);

    const { uploadOrgFiles, setCompleted, clearValue } =
      useUploadFilesHandler();
    const orgShareExpiredDateString = useSelector(getOrgShareExpiredDateString);
    const isFileUploading = useSelector(getIsFileUploading);
    const hasDueDate = useSelector(getHasDueDate);

    const maxActiveStep = steps.length - 1;
    const staticColumns = useStaticColumns(Table.USERS, "isEdit");

    const { setActiveStep, activeStep = 0 } = useReduxSteps(
      "CreateUserInfoFilledUrlSteps",
      !open
    );
    const [isPreview, setIsPreview] = useState<boolean>(false);
    const [previewStep, setPreviewStep] = useState<number | undefined>();
    const [shareEditPreviewValues, setShareEditPreviewValues] =
      useState<ShareReurl>();
    const [selectedTemplate, setSelectedTemplate] = useState<
      OrganizationShareTemplate | undefined
    >(undefined);

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
            organizationShareEditList:
              sortOrgShareEditListByStaticDynamicColumns(
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
            organizationShareEditNeedUpload: orgShareEditNeedUpload,
            organizationShareIsOneTime: orgShareIsOneTime,
            organizationShareUploadDescription: orgShareUploadDescription,
            organizationShareWelcomeMessage: orgShareWelcomeMessage,
            organizationShareFinishMessage: orgShareFinishMessage,
            organizationShareExpiredDate:
              hasDueDate === "1" ? orgShareExpiredDateString : undefined,
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

    useEffect(() => {
      if (isPreview) setPreviewStep(undefined);
    }, [isPreview]);

    const handlePreview = () => {
      setIsPreview(!isPreview);
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
            ...(orgUser as OrganizationUser),
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

    useEffect(() => {
      if (!open) setSelectedTemplate(undefined);
    }, [open]);

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
          {wordLibrary?.["generate customer information fill-in link"] ??
            "產生分享編輯連結"}
          {isPreview ? " 預覽模式" : ""}
        </DialogTitle>
        <DialogContent sx={{ position: "relative" }}>
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
                {activeStep === 0 && (
                  <SelectShareEditListStep
                    selectedTemplate={selectedTemplate}
                    setSelectedTemplate={setSelectedTemplate}
                    orgColumns={orgColumns}
                  />
                )}
                {activeStep === 1 && (
                  <SelectStatementStep
                    setPreviewData={setShareEditPreviewValues}
                    uploadFiles={uploadFiles}
                  />
                )}
                {activeStep === 2 && financeData?.source && (
                  <SelectFinanceTemplate
                    setPreviewData={setShareEditPreviewValues}
                    data={financeData}
                  />
                )}
                {activeStep === 3 && <SettingStep />}
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
              id={
                !isPreview
                  ? "dialog-preview-button"
                  : "dialog-return-to-edit-button"
              }
              data-tid={
                !isPreview
                  ? "dialog-preview-button"
                  : "dialog-return-to-edit-button"
              }
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
              id="dialog-prev-button"
              data-tid="dialog-prev-button"
            >
              {wordLibrary?.["previous step"] ?? "上一步"}
            </DialogConfirmButton>
          )}
          {!isPreview && (
            <DialogConfirmButton
              onClick={handleNext}
              loading={isFileUploading || loading}
              disabled={
                activeStep === maxActiveStep &&
                orgShareEditList.length === 0 &&
                orgFinanceTemplateList.length === 0 &&
                uploadFileTargetList.length === 0 &&
                orgShareEditNeedUpload === "0"
              }
              id={
                activeStep === maxActiveStep
                  ? "dialog-confirm-button"
                  : "dialog-next-button"
              }
              data-tid={
                activeStep === maxActiveStep
                  ? "dialog-confirm-button"
                  : "dialog-next-button"
              }
              rounded
            >
              {(() => {
                let output = "";
                if (activeStep === maxActiveStep) {
                  output = wordLibrary?.generate ?? "產生";
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

export default CreateUserInfoFilledUrlDialog;
