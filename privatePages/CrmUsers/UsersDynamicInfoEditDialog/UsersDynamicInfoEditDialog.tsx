import React, { FC, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import { EachRowState } from "@eGroupAI/material-module/DataTable";
import { OrganizationColumn, OrganizationUser } from "interfaces/entities";
import { BatchUpdateOrgUserColumnApiPayload } from "interfaces/payloads";
import { FilterSearch } from "@eGroupAI/typings/apis";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import {
  Box,
  Dialog,
  DialogContent,
  Step,
  StepButton,
  Stepper,
} from "@eGroupAI/material";

import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import DynamicColumnMiniTable from "components/DynamicColumnGroupDialog/DynamicColumnMiniTable";
import UsersDynamicInfoEditStep from "./UsersDynamicInfoEditStep";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface UsersInfoEditDialogProps {
  isOpen: boolean;
  isUpdating?: boolean;
  organizationId: string;
  selectedUsers?: OrganizationUser[];
  onClose?: () => void;
  onConfirm?: (
    payload: Omit<BatchUpdateOrgUserColumnApiPayload, "organizationId">
  ) => Promise<void | string> | void;
}

const UsersInfoEditDialog: FC<UsersInfoEditDialogProps> = (props) => {
  const wordLibrary = useSelector(getWordLibrary);

  const steps = [
    `${wordLibrary?.["select field"] ?? "選擇欄位"}`,
    `${wordLibrary?.["edit content"] ?? "編輯內容"}`,
  ];

  const classes = useStyles();
  const theme = useTheme();
  const {
    isOpen,
    isUpdating = false,
    organizationId,
    selectedUsers,
    onClose,
    onConfirm,
  } = props;

  const [activeStep, setActiveStep] = useState<number>(0);
  const [dynamicColumnEachRowState, setDynamicColumnEachRowState] = useState<
    EachRowState<OrganizationColumn>
  >({});

  const [isAllColumns, setIsAllColumns] = useState<boolean>(false);
  const [filterObjectOfDynamicColumns, setFilterObjectOfDynamicColumns] =
    useState<FilterSearch | undefined>(undefined);

  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const selectedDynamicColumns = useMemo(
    () =>
      Object.keys(dynamicColumnEachRowState)
        .filter(
          (key) =>
            dynamicColumnEachRowState[key]?.checked &&
            dynamicColumnEachRowState[key]?.data
        )
        .map(
          (checkedKey) =>
            dynamicColumnEachRowState[checkedKey]?.data as OrganizationColumn
        ),
    [dynamicColumnEachRowState]
  );

  const handleSetStep = (step: number) => () => {
    setActiveStep(step);
  };

  const handlePrev = () => {
    if (activeStep === 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      setActiveStep(activeStep + 1);
    }
    if (activeStep === 1) {
      if (submitBtnRef.current) submitBtnRef.current.click();
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    if (onClose) onClose();
  };

  const handleCheckedAll = (checked: boolean, filterSearch?: FilterSearch) => {
    setIsAllColumns(checked);
    if (checked) setFilterObjectOfDynamicColumns(filterSearch);
    else setFilterObjectOfDynamicColumns(undefined);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={handleClose}>編輯動態欄位</DialogTitle>
      <DialogContent>
        <Stepper nonLinear activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepButton color="inherit" onClick={handleSetStep(index)}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
        <Box mt={3}>
          {activeStep === 0 && (
            <DynamicColumnMiniTable
              organizationId={organizationId}
              defaultCheckedRowIds={selectedDynamicColumns.map(
                (column) => column?.columnId
              )}
              onEachRowStateChange={(state) =>
                setDynamicColumnEachRowState(state)
              }
              onSetCheckedAll={handleCheckedAll}
              columnTable="ORGANIZATION_USER"
            />
          )}
          {activeStep === 1 && (
            <UsersDynamicInfoEditStep
              submitBtnRef={submitBtnRef}
              selectedUsers={selectedUsers}
              selectedColumns={selectedDynamicColumns}
              onConfirm={onConfirm}
              closeDialog={handleClose}
              isAllColumns={isAllColumns}
              dynamicColumnsFilterObject={filterObjectOfDynamicColumns}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <DialogCloseButton onClick={handleClose} rounded />
        <Box flexGrow={1} />
        {activeStep !== 0 && (
          <DialogCloseButton
            rounded
            disabled={activeStep === 0 || isUpdating}
            onClick={handlePrev}
          >
            {wordLibrary?.["previous step"] ?? "上一步"}
          </DialogCloseButton>
        )}
        <DialogConfirmButton
          rounded
          onClick={handleNext}
          loading={isUpdating}
          disabled={selectedDynamicColumns.length === 0 || isUpdating}
        >
          {(() => {
            let output = "";
            if (activeStep === 1) {
              output = wordLibrary?.save ?? "儲存";
            } else {
              output = wordLibrary?.["next step"] ?? "下一步";
            }
            return output;
          })()}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default UsersInfoEditDialog;
