import React, { FC, useEffect } from "react";
import { useSelector } from "react-redux";
import { useForm, FormProvider } from "react-hook-form";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import Box from "@eGroupAI/material/Box";
import Dialog from "@eGroupAI/material/Dialog";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";

import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import DialogActions from "@mui/material/DialogActions";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";

import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import { ColumnTemplate } from "interfaces/entities";
import { DynamicColumnTemplateUserFormInput } from "interfaces/form";
import useConfirmLeaveDialog from "utils/useConfirmLeaveDialog";
import useReduxSteps from "utils/useReduxSteps";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { ServiceModuleValue } from "interfaces/utils";
import useOrgDynamicColumnTemplate from "utils/useOrgDynamicColumnTemplate";
import PermissionValid from "components/PermissionValid/PermissionValid";

import DynamicColumnTemplateUserForm from "./DynamicColumnTemplateUserForm";

export const DIALOG = "DynamicColumnsTemplateUserDialog";

interface DynamicColumnTemplateDialogProps {
  columnTemplate?: ColumnTemplate;
  onCloseDialog?: () => void;
  serviceModuleValue: ServiceModuleValue;
  columnTable: string;
}

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

const DynamicColumnTemplateUserDialog: FC<DynamicColumnTemplateDialogProps> =
  function (props) {
    const wordLibrary = useSelector(getWordLibrary);
    const { columnTemplate, onCloseDialog, serviceModuleValue, columnTable } =
      props;
    const classes = useStyles();
    const theme = useTheme();
    const organizationId = useSelector(getSelectedOrgId);
    const { closeDialog, isOpen } = useReduxDialog(DIALOG);
    const methods = useForm<DynamicColumnTemplateUserFormInput>({
      defaultValues: {
        organizationColumnList: [],
        organizationColumnTemplateTitle: "",
      },
    });
    const { data: templateToUpdate, isValidating: isLoadingData } =
      useOrgDynamicColumnTemplate({
        organizationId,
        organizationColumnTemplateId:
          columnTemplate?.organizationColumnTemplateId,
      });

    const {
      excute: createOrgDynamicColumnTemplateUser,
      isLoading: isCreating,
    } = useAxiosApiWrapper(
      apis.org.createOrgDynamicColumnTemplateUser,
      "Create"
    );

    const {
      excute: updateOrgDynamicColumnTemplateUser,
      isLoading: isUpdating,
    } = useAxiosApiWrapper(
      apis.org.updateOrgDynamicColumnTemplateUser,
      "Update"
    );

    const { setActiveStep, activeStep = 0 } = useReduxSteps(
      "DynamicColumnTemplateSteps"
    );

    const matchMutate = useSwrMatchMutate();

    const handleCloseDialog = () => {
      if (onCloseDialog) onCloseDialog();
      closeDialog();
      setActiveStep(0);
      methods.reset();
    };

    const closeConfirm = useConfirmLeaveDialog({
      shouldOpen: methods.formState.isDirty,
      handleClose: handleCloseDialog,
      onConfirm: handleCloseDialog,
    });

    const handleNext = async () => {
      if (activeStep === 0) {
        setActiveStep(1);
      }
      if (activeStep === 1) {
        const values = methods.getValues();
        try {
          if (templateToUpdate) {
            await updateOrgDynamicColumnTemplateUser({
              organizationColumnTemplateId:
                templateToUpdate.organizationColumnTemplateId,
              organizationId,
              organizationColumnTemplateTitle:
                values.organizationColumnTemplateTitle,
              organizationColumnList: values.organizationColumnList,
            });
          } else {
            await createOrgDynamicColumnTemplateUser({
              organizationId,
              organizationColumnTemplateTitle:
                values.organizationColumnTemplateTitle,
              organizationColumnList: values.organizationColumnList,
              serviceModuleValue,
            });
          }
          matchMutate(
            new RegExp(
              `^/organizations/${organizationId}/search/column-templates\\?`,
              "g"
            )
          );
          handleCloseDialog();
        } catch (error) {
          // eslint-disable-next-line no-console
          apis.tools.createLog({
            function: "DatePicker: handleNext",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: error,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
          });
        }
      }
    };

    const handlePrev = () => {
      if (activeStep === 1) {
        setActiveStep(0);
      }
    };

    useEffect(() => {
      const defaultValues = {
        organizationColumnList: templateToUpdate?.organizationColumnList || [],
        organizationColumnTemplateTitle:
          templateToUpdate?.organizationColumnTemplateTitle || "",
      };
      if (defaultValues) {
        methods.reset(defaultValues);
      }
    }, [methods, templateToUpdate]);

    return (
      <Dialog
        open={isOpen}
        onClose={() => closeConfirm()}
        maxWidth="lg"
        fullWidth
        className={classes.dialogPaper}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
      >
        <DialogTitle onClickClose={() => closeConfirm()}>
          {columnTemplate ? "編輯" : "新增"} 範本
        </DialogTitle>
        <DialogFullPageContainer>
          <FormProvider {...methods}>
            <DynamicColumnTemplateUserForm
              selectedColumnList={templateToUpdate?.organizationColumnList}
              isLoading={isLoadingData}
              serviceModuleValue={serviceModuleValue}
              columnTable={columnTable}
            />
          </FormProvider>
        </DialogFullPageContainer>
        <DialogActions>
          <DialogCloseButton sx={{ mr: 1 }} onClick={() => closeConfirm()} />
          <Box flexGrow={1} />
          <PermissionValid
            shouldBeOrgOwner
            modulePermissions={columnTemplate ? ["UPDATE_ALL"] : ["CREATE"]}
            targetPath="/me/dynamic-columns"
          >
            {activeStep !== 0 && (
              <DialogConfirmButton onClick={handlePrev}>
                {wordLibrary?.["previous step"] ?? "上一步"}
              </DialogConfirmButton>
            )}
            <DialogConfirmButton
              onClick={handleNext}
              disabled={isCreating || isUpdating}
              loading={isCreating || isUpdating}
            >
              {(() => {
                let output = "";
                if (activeStep === 0) {
                  output = wordLibrary?.["next step"] ?? "下一步";
                } else {
                  output = wordLibrary?.save ?? "儲存";
                }
                return output;
              })()}
            </DialogConfirmButton>
          </PermissionValid>
        </DialogActions>
      </Dialog>
    );
  };

export default DynamicColumnTemplateUserDialog;
