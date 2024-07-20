import React from "react";

import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";

import TextField, { TextFieldProps } from "@eGroupAI/material/TextField";
import MenuItem from "components/MenuItem";
import ConfirmDialog from "@eGroupAI/material-module/ConfirmDialog";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useOrgSharerOrgs from "utils/useOrgSharerOrgs";
import { useSelector } from "react-redux";

export const DIALOG = "ConfirmDeleteShareDialog";

export interface ConfirmDeleteShareDialogProps {
  onChange?: TextFieldProps["onChange"];
  value?: TextFieldProps["value"];
  loading?: boolean;
}

const ConfirmDeleteShareDialog = function (
  props: ConfirmDeleteShareDialogProps
) {
  const { onChange, value, loading } = props;
  const { closeDialog, openDialog, isOpen, ...other } = useReduxDialog(DIALOG);

  const organizationId = useSelector(getSelectedOrgId);

  const { data: sharerOrgs } = useOrgSharerOrgs(
    {
      organizationId,
    },
    undefined,
    undefined,
    !isOpen
  );

  return (
    <ConfirmDialog
      open={isOpen}
      onClose={closeDialog}
      onCancel={closeDialog}
      MuiConfirmButtonProps={{
        color: "secondary",
        variant: "contained",
        disabled: !value,
        loading,
      }}
      {...other}
    >
      <TextField
        label="歷史分享單位"
        fullWidth
        select
        onChange={onChange}
        value={value}
        sx={{ marginTop: 1 }}
      >
        {sharerOrgs?.map((el) => (
          <MenuItem key={el.organizationId} value={el.organizationId}>
            {el.organizationName}
          </MenuItem>
        ))}
      </TextField>
    </ConfirmDialog>
  );
};

export default ConfirmDeleteShareDialog;
