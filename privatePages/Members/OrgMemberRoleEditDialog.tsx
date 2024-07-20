import React, { FC, useEffect, useState } from "react";

import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import useOrgRoles from "@eGroupAI/hooks/apis/useOrgRoles";
import useOrgMemberRoles from "@eGroupAI/hooks/apis/useOrgMemberRoles";
import { useSelector } from "react-redux";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import DialogTitle from "@eGroupAI/material/DialogTitle";

import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@eGroupAI/material/DialogActions";
import Box from "@eGroupAI/material/Box";
import CheckboxWithLabel from "@eGroupAI/material/CheckboxWithLabel";
import CircularProgress from "@eGroupAI/material/CircularProgress";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";

export const DIALOG = "OrgMemberEditRoleDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface OrgMemberEditRoleDialogProps {
  onSubmit?: (values?: string[]) => void;
  loading?: boolean;
  loginId?: string;
  memberName?: string;
}

const OrgMemberEditRoleDialog: FC<OrgMemberEditRoleDialogProps> = function (
  props
) {
  const { onSubmit, loading, loginId, memberName } = props;
  const theme = useTheme();
  const classes = useStyles();
  const wordLibrary = useSelector(getWordLibrary);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const organizationId = useSelector(getSelectedOrgId);
  const [values, setValues] = useState<string[] | undefined>();
  const { data: roles } = useOrgRoles(
    {
      organizationId,
    },
    {
      organizationRoleStatus: "1",
    }
  );
  const { mutate, data: memberRoles } = useOrgMemberRoles(
    {
      organizationId,
      loginId,
    },
    undefined,
    {
      onSuccess: (response) => {
        const { source = [] } = response.data;
        setValues(source.map((el) => el.organizationRole.organizationRoleId));
      },
    }
  );

  useEffect(() => {
    if (!isOpen) {
      setValues(undefined);
    } else if (memberRoles) {
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const renderContent = () => {
    if (!roles || !values) {
      return (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      );
    }
    return roles.source.map((role) => (
      <Box key={role.organizationRoleId} display="block">
        <CheckboxWithLabel
          label={role.organizationRoleNameZh}
          value={role.organizationRoleId}
          MuiCheckboxProps={{
            onChange: (e) => {
              if (e.target.checked) {
                setValues((v) => {
                  if (v) {
                    return [...v, e.target.value];
                  }
                  return [e.target.value];
                });
              } else {
                setValues((v) => {
                  if (v) {
                    return v.filter((el) => el !== e.target.value);
                  }
                  return v;
                });
              }
            },
            checked: values.includes(role.organizationRoleId),
          }}
        />
      </Box>
    ));
  };

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
        {wordLibrary?.change ?? "修改"} {memberName}{" "}
        {wordLibrary?.role ?? "角色"}
      </DialogTitle>
      <DialogContent>{renderContent()}</DialogContent>
      <DialogActions>
        <DialogCloseButton 
            id="member-role-close-button"
            data-tid="member-role-close-button"
            onClick={closeDialog} 
          />
        <DialogConfirmButton
          id="member-role-confirm-button"
          data-tid="member-role-confirm-button"
          loading={loading}
          onClick={() => {
            if (onSubmit) {
              onSubmit(values);
            }
          }}
        >
          {wordLibrary?.save ?? "儲存"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default OrgMemberEditRoleDialog;
