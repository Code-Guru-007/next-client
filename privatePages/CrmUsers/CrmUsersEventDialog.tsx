import React, { FC, useEffect, useMemo, useState } from "react";

import { useSelector } from "react-redux";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { useAppDispatch } from "redux/configureAppStore";
import useConfirmLeaveDialog from "utils/useConfirmLeaveDialog";
import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";

import Box from "@eGroupAI/material/Box";
import Grid from "@eGroupAI/material/Grid";
import Divider from "@eGroupAI/material/Divider";
import Dialog from "@eGroupAI/material/Dialog";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import DialogFullPagePaper from "components/DialogFullPagePaper";
import DialogConfirmButton from "components/DialogConfirmButton";
import DialogCloseButton from "components/DialogCloseButton";
import { getStates } from "redux/eventDialog/selectors";
import {
  setValues,
  setStates,
  initialState,
  InitialState,
} from "redux/eventDialog";
import EventForm, {
  FORM,
  EventFormProps,
} from "components/EventDialog/EventForm";
import TagsSection from "components/EventDialog/TagsSection";
import OrgPartnerSection from "components/EventDialog/OrgPartnerSection";
import MembersSection from "components/EventDialog/MembersSection";
import FilesSection from "components/EventDialog/FilesSection";

export const DIALOG = "CrmUsersEventDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface CrmUsersEventDialogProps {
  organizationEventId?: string;
  defaultValues?: InitialState["values"];
  onSubmit?: EventFormProps["onSubmit"];
  loading?: boolean;
  onClose?: () => void;
}

const CrmUsersEventDialog: FC<CrmUsersEventDialogProps> = function (props) {
  const { organizationEventId, defaultValues, onSubmit, loading, onClose } =
    props;
  const classes = useStyles(props);
  const theme = useTheme();
  const wordLibrary = useSelector(getWordLibrary);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const { isDirty } = useSelector(getStates);
  const dispatch = useAppDispatch();
  const editing = useMemo(
    () => organizationEventId !== undefined,
    [organizationEventId]
  );
  const [isFileUploading, setIsFileUploading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && defaultValues) {
      dispatch(setValues(defaultValues));
    }
  }, [defaultValues, dispatch, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      dispatch(setValues(initialState.values));
      dispatch(setStates(initialState.states));
    }
  }, [dispatch, isOpen]);

  const handleClose = () => {
    closeDialog();
    if (onClose) {
      onClose();
    }
  };

  const closeConfirm = useConfirmLeaveDialog({
    shouldOpen: isDirty,
    handleClose,
    onConfirm: handleClose,
  });

  return (
    <Dialog
      open={isOpen}
      onClose={() => closeConfirm()}
      maxWidth="md"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={() => closeConfirm()}>
        {wordLibrary?.edit ?? "編輯"}
        {editing
          ? `${wordLibrary?.edit ?? "編輯"}`
          : `${wordLibrary?.add ?? "新增"}`}
      </DialogTitle>
      <DialogFullPageContainer>
        <DialogFullPagePaper>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <EventForm onSubmit={onSubmit} />
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <TagsSection targetId={organizationEventId} />
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <OrgPartnerSection />
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <FilesSection
                onFileUploading={() => {
                  setIsFileUploading(true);
                }}
                onFileUploadFinish={() => {
                  setIsFileUploading(false);
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <MembersSection />
            </Grid>
          </Grid>
        </DialogFullPagePaper>
      </DialogFullPageContainer>
      <DialogActions>
        <Box flexGrow={1} />
        <DialogCloseButton disabled={loading} onClick={() => closeConfirm()} />
        <DialogConfirmButton
          disabled={isFileUploading}
          loading={loading}
          type="submit"
          form={FORM}
        >
          {wordLibrary?.save ?? "儲存"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default CrmUsersEventDialog;
