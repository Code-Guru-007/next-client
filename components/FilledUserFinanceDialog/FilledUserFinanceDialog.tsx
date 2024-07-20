import React, { FC, useEffect, useState } from "react";

import { OrganizationFinanceType } from "interfaces/utils";
import useTab from "@eGroupAI/hooks/useTab";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import useConfirmLeaveDialog from "utils/useConfirmLeaveDialog";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";

import Dialog from "@eGroupAI/material/Dialog";
import Typography from "@eGroupAI/material/Typography";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import FinanceForm, { FinanceFormProps, FORM } from "./FilledUserFinanceForm";

export const DIALOG = "FinanceDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface FinanceDialogProps {
  onSubmit: FinanceFormProps["onSubmit"];
  onDelete?: FinanceFormProps["onDelete"];
  primary?: string;
  description?: string;
  defaultValues?: FinanceFormProps["defaultValues"];
  loading?: boolean;
}
const FinanceDialog: FC<FinanceDialogProps> = function (props) {
  const classes = useStyles();
  const theme = useTheme();
  const wordLibrary = useSelector(getWordLibrary);
  const { primary, description, defaultValues, onSubmit, onDelete, loading } =
    props;
  const { isOpen, closeDialog } = useReduxDialog(DIALOG);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const { value: tabValue, handleChange } = useTab(
    "FinanceDialog",
    OrganizationFinanceType.INCOME
  );

  const closeConfirm = useConfirmLeaveDialog({
    shouldOpen: formIsDirty,
    handleClose: closeDialog,
    onConfirm: closeDialog,
  });

  useEffect(() => {
    if (!isOpen) {
      handleChange(OrganizationFinanceType.INCOME);
    }
  }, [handleChange, isOpen]);

  return (
    <Dialog
      open={isOpen}
      onClose={() => closeConfirm()}
      maxWidth="sm"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={() => closeConfirm()}>{primary}</DialogTitle>
      <DialogFullPageContainer>
        <Typography variant="body1">{description}</Typography>
        <FinanceForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          onDelete={onDelete}
          tabValue={tabValue}
          handleTabChange={handleChange}
          setFormIsDirty={setFormIsDirty}
        />
      </DialogFullPageContainer>
      <DialogActions>
        <DialogCloseButton onClick={() => closeConfirm()} />
        <DialogConfirmButton type="submit" form={FORM} loading={loading}>
          {(() => {
            let output = "";
            if (tabValue === OrganizationFinanceType.INCOME) {
              output = wordLibrary?.["next step"] ?? "下一步";
            } else {
              output = wordLibrary?.save ?? "儲存";
            }
            return output;
          })()}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default FinanceDialog;
