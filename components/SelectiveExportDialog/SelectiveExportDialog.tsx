import React, { FC, useEffect, useMemo, useState } from "react";

import { FilePathType, ServiceModuleValue, Table } from "interfaces/utils";
import useStaticColumns from "utils/useStaticColumns";

import { useTheme, makeStyles } from "@mui/styles";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import useReduxSteps from "utils/useReduxSteps";

import Stepper from "@eGroupAI/material/Stepper";
import Step from "@eGroupAI/material/Step";
import StepButton from "@eGroupAI/material/StepButton";
import Box from "@eGroupAI/material/Box";
import Dialog from "@eGroupAI/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import useOrgUploadFiles from "utils/useOrgUploadFiles";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useReduxDialog } from "@eGroupAI/redux-modules";

import SelectStaticColumnsStep from "./SelectStaticColumnsStep";
import SelectDynamicColumnsStep from "./SelectDynamicColumnsStep";
import SelectStatementStep from "./SelectStatementStep";
import {
  UserExportDialogApiPayload,
  UserExportDialogContext,
} from "./UserExportDialogContext";
import {
  ExtendedDynamicColumn,
  ExtendedStaticColumn,
  ExtendedUploadFile,
} from "./typings";

export interface SelectiveExportDialogProps {
  columnTable?: string;
  serviceModuleValue?: ServiceModuleValue;
  handleExport?: (values?: Partial<UserExportDialogApiPayload>) => void;
  loading?: boolean;
}

export const DIALOG = "USER_EXPORT_DIALOG";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

const SelectiveExportDialog: FC<SelectiveExportDialogProps> = (props) => {
  const { loading, handleExport } = props;
  const theme = useTheme();
  const classes = useStyles();

  const organizationId = useSelector(getSelectedOrgId);
  const wordLibrary = useSelector(getWordLibrary);
  const steps = [
    `${wordLibrary?.["select static column"] ?? "選擇基本資料"}`,
    `${wordLibrary?.["select statement"] ?? "選擇聲明書"}`,
    `${wordLibrary?.["select dynamic column"] ?? "選擇動態欄位"}`,
  ];
  const maxActiveStep = steps.length - 1;

  const { isOpen, closeDialog } = useReduxDialog(DIALOG);

  const { data: orgColumns } = useOrgDynamicColumns(
    {
      organizationId,
    },
    {
      columnTable: "ORGANIZATION_USER",
    },
    undefined,
    !isOpen
  );

  const { data: uploadFiles } = useOrgUploadFiles(
    {
      organizationId,
    },
    {
      filePathType: FilePathType.USER_AGREEMENT,
    },
    undefined,
    !isOpen
  );

  const { setActiveStep, activeStep = 0 } = useReduxSteps(
    "SelectiveUserExportSteps",
    !isOpen
  );
  const staticColumns = useStaticColumns(Table.USERS, "isEdit");

  const [isExportTag, setIsExportTag] = useState<boolean>(false);
  const [exportStaticColumnList, setExportStaticColumnList] = useState<
    ExtendedStaticColumn[]
  >([]);
  const [exportAgreementFileList, setExportAgreementFileList] = useState<
    ExtendedUploadFile[]
  >([]);
  const [exportDynamicColumnList, setExportDynamicColumnList] = useState<
    ExtendedDynamicColumn[]
  >([]);

  const contextValues = useMemo(
    () => ({
      exportStaticColumnList,
      setExportStaticColumnList,
      isExportTag,
      setIsExportTag,
      exportAgreementFileList,
      setExportAgreementFileList,
      exportDynamicColumnList,
      setExportDynamicColumnList,
    }),
    [
      exportAgreementFileList,
      exportDynamicColumnList,
      exportStaticColumnList,
      isExportTag,
    ]
  );

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleNext = async () => {
    if (activeStep < maxActiveStep) {
      setActiveStep(activeStep + 1);
    } else if (handleExport) {
      let apiPayload: UserExportDialogApiPayload = {
        isExportTag: isExportTag.toString().toUpperCase(),
        exportStaticColumnList: exportStaticColumnList.map((el) => ({
          sortKey: el.sortKey,
          columnName: el.columnName,
        })),
        exportDynamicColumnList: exportDynamicColumnList.map((el) => ({
          columnId: el.columnId,
          columnName: el.columnName,
        })),
        exportAgreementFileList: exportAgreementFileList.map((el) => ({
          uploadFileId: el.uploadFileId,
        })),
      };

      if (
        staticColumns?.length !== 0 &&
        staticColumns?.length === exportStaticColumnList.length
      )
        apiPayload = { ...apiPayload, exportStaticColumnList: undefined };
      if (
        uploadFiles?.source.length !== 0 &&
        uploadFiles?.source.length === exportAgreementFileList.length
      )
        apiPayload = { ...apiPayload, exportAgreementFileList: undefined };
      if (
        orgColumns?.source.length !== 0 &&
        orgColumns?.source.length === exportDynamicColumnList.length
      )
        apiPayload = { ...apiPayload, exportDynamicColumnList: undefined };

      handleExport(apiPayload);
    }
  };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const handleCloseDialog = () => {
    closeDialog();
  };

  useEffect(() => {
    if (!isOpen) {
      setExportAgreementFileList([]);
      setExportStaticColumnList([]);
      setExportDynamicColumnList([]);
      setIsExportTag(false);
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onClose={handleCloseDialog}
      fullWidth
      maxWidth={"md"}
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={handleCloseDialog}>
        {"匯出客戶資料"}
      </DialogTitle>
      <DialogContent>
        <Stepper nonLinear activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepButton color="inherit" onClick={handleStep(index)}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
        <UserExportDialogContext.Provider value={contextValues}>
          <Box mt={3}>
            {activeStep === 0 && (
              <SelectStaticColumnsStep
                staticColumns={staticColumns}
                useTagExport
              />
            )}
            {activeStep === 1 && (
              <SelectStatementStep uploadFiles={uploadFiles?.source} />
            )}
            {activeStep === 2 && (
              <SelectDynamicColumnsStep orgColumns={orgColumns?.source} />
            )}
          </Box>
        </UserExportDialogContext.Provider>
      </DialogContent>
      <DialogActions>
        <DialogCloseButton
          onClick={handleCloseDialog}
          disabled={loading}
          rounded
        />
        <Box flexGrow={1} />
        {activeStep !== 0 && (
          <DialogConfirmButton
            disabled={activeStep === 0 || loading}
            onClick={handlePrev}
            rounded
          >
            {wordLibrary?.["previous step"] ?? "上一步"}
          </DialogConfirmButton>
        )}
        {
          <DialogConfirmButton
            onClick={handleNext}
            loading={loading}
            disabled={activeStep === maxActiveStep && loading}
            rounded
          >
            {(() => {
              let output = "";
              if (activeStep === maxActiveStep) {
                output = wordLibrary?.export ?? "Export";
              } else {
                output = wordLibrary?.["next step"] ?? "下一步";
              }
              return output;
            })()}
          </DialogConfirmButton>
        }
      </DialogActions>
    </Dialog>
  );
};

export default SelectiveExportDialog;
