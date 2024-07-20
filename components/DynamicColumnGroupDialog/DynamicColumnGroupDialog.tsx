import React, { FC, useEffect } from "react";
import { useSelector } from "react-redux";
import { useForm, FormProvider } from "react-hook-form";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import Box from "@eGroupAI/material/Box";
import Dialog from "@eGroupAI/material/Dialog";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import Stack from "@mui/material/Stack";

import DialogActions from "@mui/material/DialogActions";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { ColumnGroup } from "interfaces/entities";
import { DynamicColumnGroupFormInput } from "interfaces/form";
import useConfirmLeaveDialog from "utils/useConfirmLeaveDialog";
import useReduxSteps from "utils/useReduxSteps";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { ServiceModuleValue } from "interfaces/utils";
import useOrgDynamicColumnGroup from "utils/useOrgDynamicColumnGroup";
import PermissionValid from "components/PermissionValid/PermissionValid";

import DynamicColumnGroupForm from "./DynamicColumnGroupForm";

export const DIALOG = "DynamicColumnsDialog";

export interface DynamicColumnsDialogProps {
  columnGroup?: ColumnGroup;
  onCloseDialog?: () => void;
  serviceModuleValue: ServiceModuleValue;
  columnTable: string;
  tagStatus?: boolean;
}

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

const DynamicColumnsDialog: FC<DynamicColumnsDialogProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    columnGroup,
    onCloseDialog,
    serviceModuleValue,
    columnTable,
    tagStatus,
  } = props;

  const stepsContext = [
    `${wordLibrary?.["select field"] ?? "選擇欄位"}`,
    `${wordLibrary?.setting ?? "設定"}`,
  ];
  const maxActiveStep = stepsContext.length - 1;
  const classes = useStyles();
  const theme = useTheme();
  const organizationId = useSelector(getSelectedOrgId);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const methods = useForm<DynamicColumnGroupFormInput>({
    defaultValues: {
      organizationColumnList: [],
      columnGroupName: "",
      organizationTagList: [],
    },
  });
  const { data: groupToUpdate, isValidating: isLoadingData } =
    useOrgDynamicColumnGroup({
      organizationId,
      organizationColumnGroupId: columnGroup?.columnGroupId,
    });
  const { excute: createOrgDynamicColumnGroup, isLoading: isCreating } =
    useAxiosApiWrapper(apis.org.createOrgDynamicColumnGroup, "Create");

  const { excute: updateOrgDynamicColumnGroup, isLoading: isUpdating } =
    useAxiosApiWrapper(apis.org.updateOrgDynamicColumnGroup, "Update");

  const { setActiveStep, activeStep = 0 } = useReduxSteps(
    "DynamicColumnGroupSteps"
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
        if (groupToUpdate) {
          await updateOrgDynamicColumnGroup({
            columnGroupId: groupToUpdate.columnGroupId,
            organizationId,
            columnGroupName: values.columnGroupName,
            organizationColumnList: values.organizationColumnList,
            organizationTagList: values.organizationTagList,
          });
        } else {
          await createOrgDynamicColumnGroup({
            organizationId,
            columnGroupName: values.columnGroupName,
            organizationColumnList: values.organizationColumnList,
            organizationTagList: values.organizationTagList,
            serviceModuleValue,
          });
        }
        matchMutate(
          new RegExp(
            `^/organizations/${organizationId}/search/column-groups\\?`,
            "g"
          )
        );
        handleCloseDialog();
      } catch (error) {
        // eslint-disable-next-line no-console
        apis.tools.createLog({
          function: "DynamicColumnGroupDialog: handleNext",
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
      organizationColumnList: groupToUpdate?.organizationColumnList || [],
      columnGroupName: groupToUpdate?.columnGroupName || "",
      organizationTagList:
        groupToUpdate?.organizationTagTargetList.map((tag) => ({
          tagId: tag.organizationTag.tagId,
        })) || [],
    };
    if (defaultValues) {
      methods.reset(defaultValues);
    }
  }, [groupToUpdate, methods]);

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
        {columnGroup
          ? `${wordLibrary?.edit ?? "編輯"}`
          : `${wordLibrary?.add ?? "新增"}`}
        {wordLibrary?.["dynamic field group"] ?? "動態欄位群組"}
      </DialogTitle>
      <Stack spacing={3} sx={{ px: 3, py: 1, overflow: "auto" }}>
        {!isLoadingData && (
          <FormProvider {...methods}>
            <DynamicColumnGroupForm
              selectedColumnList={groupToUpdate?.organizationColumnList}
              isLoading={isLoadingData}
              serviceModuleValue={serviceModuleValue}
              columnTable={columnTable}
              tagStatus={tagStatus}
              stepsContext={stepsContext}
            />
          </FormProvider>
        )}
      </Stack>
      <DialogActions>
        <DialogCloseButton sx={{ mr: 1 }} onClick={() => closeConfirm()} />
        <Box flexGrow={1} />
        <PermissionValid
          shouldBeOrgOwner
          modulePermissions={columnGroup ? ["UPDATE_ALL"] : ["CREATE"]}
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
              if (activeStep === maxActiveStep) {
                output = wordLibrary?.save ?? "儲存";
              } else {
                output = wordLibrary?.["next step"] ?? "下一步";
              }
              return output;
            })()}
          </DialogConfirmButton>
        </PermissionValid>
      </DialogActions>
    </Dialog>
  );
};

export default DynamicColumnsDialog;
