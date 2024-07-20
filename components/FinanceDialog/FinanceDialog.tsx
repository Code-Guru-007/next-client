import React, { FC, useState } from "react";

import { OrganizationFinanceType } from "interfaces/utils";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import useConfirmLeaveDialog from "utils/useConfirmLeaveDialog";
import { useSelector } from "react-redux";

import { makeStyles } from "@mui/styles";
import { useTheme } from "@mui/material/styles";

import Dialog from "@eGroupAI/material/Dialog";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@eGroupAI/material/Typography";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import FinanceForm, { FinanceFormProps, FORM } from "./FinanceForm";

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
  tabValue?: FinanceFormProps["tabValue"];
  description?: string;
  defaultValues?: FinanceFormProps["defaultValues"];
  loading?: boolean;
}

const FinanceDialog: FC<FinanceDialogProps> = function (props) {
  const { primary, description, tabValue, defaultValues, onSubmit, loading } =
    props;
  const classes = useStyles();
  const theme = useTheme();
  const wordLibrary = useSelector(getWordLibrary);
  const { isOpen, closeDialog } = useReduxDialog(DIALOG);
  const [formIsDirty, setFormIsDirty] = useState(false);

  const closeConfirm = useConfirmLeaveDialog({
    shouldOpen: formIsDirty,
    handleClose: closeDialog,
    onConfirm: closeDialog,
  });

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
          tabValue={tabValue as OrganizationFinanceType}
          setFormIsDirty={setFormIsDirty}
        />
      </DialogFullPageContainer>
      <DialogActions>
        <DialogCloseButton onClick={() => closeConfirm()} />
        <DialogConfirmButton
          type="submit"
          form={FORM}
          loading={loading}
          disabled={!formIsDirty || loading}
        >
          {wordLibrary?.save ?? "儲存"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default FinanceDialog;
