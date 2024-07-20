import React, { FC, useEffect, useState } from "react";

import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import { useSelector } from "react-redux";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";

import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@eGroupAI/material/DialogActions";
import TextField from "@eGroupAI/material/TextField";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";

export const DIALOG = "OrgRoleDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

interface OrgRoleDialogProps {
  organizationRoleName?: string;
  isEdit: boolean;
  loading?: boolean;
  onSave?: (organizationRoleNameZh: string) => void;
}

const OrgRoleDialog: FC<OrgRoleDialogProps> = function (props) {
  const {
    isEdit,
    loading,
    organizationRoleName: nameProp = "",
    onSave,
  } = props;
  const theme = useTheme();
  const classes = useStyles();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const [organizationRoleNameZh, setOrganizationRoleNameZh] = useState("");
  const wordLibrary = useSelector(getWordLibrary);
  useEffect(() => {
    setOrganizationRoleNameZh(nameProp);
  }, [nameProp]);

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
      <DialogTitle onClickClose={closeDialog}>
        {isEdit
          ? `${wordLibrary?.edit ?? "編輯"}`
          : `${wordLibrary?.add ?? "新增"}`}
      </DialogTitle>
      <DialogContent>
        <TextField
          id="org-role-input"
          data-tid="org-role-input"
          label={wordLibrary?.["role name"] ?? "角色名稱"}
          fullWidth
          value={organizationRoleNameZh}
          onChange={(e) => {
            setOrganizationRoleNameZh(e.target.value);
          }}
          margin="normal"
          autoFocus
          required
          />
      </DialogContent>
      <DialogActions>
        <DialogCloseButton
          id="org-role-dialog-close-button"
          data-tid="org-role-dialog-close-button"
          onClick={closeDialog} 
          disabled={loading} 
        />
        <DialogConfirmButton
          id="org-role-dialog-confirm-button"
          data-tid="org-role-dialog-confirm-button"
          sx={{ ml: 1 }}
          loading={loading}
          disabled={loading || !organizationRoleNameZh}
          onClick={() => {
            if (onSave && organizationRoleNameZh) {
              onSave(organizationRoleNameZh);
            }
          }}
        >
          {wordLibrary?.save ?? "儲存"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default OrgRoleDialog;
