import React from "react";

import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@eGroupAI/material/DialogActions";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import { Grid, IconButton, Stack, Typography } from "@mui/material";

import { makeStyles, useTheme } from "@mui/styles";
import { useSelector } from "react-redux";

import { ReportVariable } from "interfaces/form";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import Iconify from "minimal/components/iconify";

import { DIALOG as ALIAS_EDIT_DIALOG } from "./AliasEditDialog";

export const DIALOG = "AliasVariableDialog";

export interface AliasVariableDialogProps {
  selectedVariable?: ReportVariable;
  selectedIndex: number;
}

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

const AliasVariableDialog = (props: AliasVariableDialogProps) => {
  const { selectedVariable } = props;
  const classes = useStyles();
  const theme = useTheme();

  const wordLibrary = useSelector(getWordLibrary);
  const { isOpen, closeDialog } = useReduxDialog(DIALOG);
  const { openDialog: openAliasEditDialog } = useReduxDialog(ALIAS_EDIT_DIALOG);

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      fullWidth
      maxWidth={"sm"}
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle
        onClickClose={closeDialog}
        sx={{
          p: 3,
          "& .MuiTypography-root ~ .MuiBox-root": {
            position: "relative",
            top: 0,
            right: 0,
          },
        }}
      >
        {wordLibrary?.["variable alias"] ?? "維度別名"}
        <IconButton
          onClick={() => {
            closeDialog();
            openAliasEditDialog();
          }}
          sx={{ ml: 1 }}
        >
          <Iconify icon="fluent:edit-20-filled" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ position: "relative" }}>
        <Stack spacing={3}>
          <Grid container sx={{ alignItems: "center" }} rowSpacing={2.5}>
            <Grid item xs={6}>
              <Typography color={"text.secondary"}>
                {selectedVariable?.name}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography color={"text.primary"}>
                {selectedVariable?.axisName}
              </Typography>
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        {/* <DialogCloseButton onClick={closeDialog} disabled={false} rounded />
        <Box flexGrow={1} />
        <DialogCloseButton disabled={false} onClick={closeDialog} rounded>
          {wordLibrary?.store ?? "儲存"}
        </DialogCloseButton>

        <DialogConfirmButton
          loading={false}
          disabled={false}
          rounded
          onClick={() => {
            closeDialog();
          }}
        >
          {wordLibrary?.apply ?? "套用"}
        </DialogConfirmButton> */}
      </DialogActions>
    </Dialog>
  );
};

export default AliasVariableDialog;
