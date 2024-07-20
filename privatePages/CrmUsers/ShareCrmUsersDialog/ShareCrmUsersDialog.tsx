import React, { FC, useEffect, useState } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import isEmail from "validator/lib/isEmail";
import useReduxSteps from "utils/useReduxSteps";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import useOrgSharerOrgs from "utils/useOrgSharerOrgs";

import Stepper from "@eGroupAI/material/Stepper";
import Step from "@eGroupAI/material/Step";
import StepButton from "@eGroupAI/material/StepButton";
import Box from "@eGroupAI/material/Box";
import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import SelectShareWayStep from "./SelectShareWayStep";
import SelectShareInfoStep, {
  SelectShareInfoStepProps,
} from "./SelectShareInfoStep";

export const DIALOG = "ShareCrmUsersDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export type Values = {
  memberEmail?: string;
  sharerOrganizationId?: string;
};

export interface ShareCrmUsersDialogProps {
  onSubmit?: (values: Values) => void;
  loading?: boolean;
}

const steps = ["選擇分享方式", "選擇寄送資訊"];

const ShareCrmUsersDialog: FC<ShareCrmUsersDialogProps> = function (props) {
  const { onSubmit, loading } = props;
  const classes = useStyles();
  const theme = useTheme();
  const organizationId = useSelector(getSelectedOrgId);

  const maxActiveStep = steps.length - 1;
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const { setActiveStep, activeStep = 0 } = useReduxSteps(
    "ShareCrmUsersSteps",
    !isOpen
  );
  const [selectedWay, setSelectedWay] =
    useState<SelectShareInfoStepProps["variant"]>("organization");
  const [selectedInfo, setSelectedInfo] = useState("");
  const [hasEmailFormatError, setHasEmailFormatError] = useState(false);

  const { data: sharerOrgs } = useOrgSharerOrgs(
    {
      organizationId,
    },
    undefined,
    undefined,
    !isOpen
  );

  // Clear selectedInfo when selectedWay changed
  useEffect(() => {
    setSelectedInfo("");
  }, [selectedWay]);

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const handleNext = () => {
    if (activeStep < maxActiveStep) {
      setActiveStep(activeStep + 1);
    } else if (onSubmit) {
      if (selectedWay === "email" && !isEmail(selectedInfo)) {
        setHasEmailFormatError(true);
      } else {
        onSubmit({
          memberEmail: selectedWay === "email" ? selectedInfo : undefined,
          sharerOrganizationId:
            selectedWay === "organization" ? selectedInfo : undefined,
        });
      }
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleShareWayChange = (e) => {
    setSelectedWay(e.target.value);
  };

  const handleShareInfoChange = (e) => {
    setHasEmailFormatError(false);
    setSelectedInfo(e.target.value);
  };

  const wordLibrary = useSelector(getWordLibrary);

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      maxWidth="sm"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={closeDialog}>分享資訊</DialogTitle>
      <DialogContent sx={{ padding: 4, paddingTop: 0 }}>
        <Stepper nonLinear activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepButton color="inherit" onClick={handleStep(index)}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
        <Box mt={7}>
          {activeStep === 0 && (
            <SelectShareWayStep
              value={selectedWay}
              onChange={handleShareWayChange}
            />
          )}
          {activeStep === 1 && (
            <SelectShareInfoStep
              variant={selectedWay}
              value={selectedInfo}
              onChange={handleShareInfoChange}
              emailFormatError={hasEmailFormatError}
              sharerOrgs={sharerOrgs}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <DialogCloseButton onClick={closeDialog} />
        <Box flexGrow={1} />
        {activeStep !== 0 && (
          <DialogCloseButton
            rounded
            disabled={activeStep === 0 || loading}
            onClick={handlePrev}
          >
            {wordLibrary?.["previous step"] ?? "上一步"}
          </DialogCloseButton>
        )}
        <DialogConfirmButton rounded onClick={handleNext} loading={loading}>
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
      </DialogActions>
    </Dialog>
  );
};

export default ShareCrmUsersDialog;
