import React, { FC, useEffect, useState } from "react";

import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import useOrgMemberGroups from "@eGroupAI/hooks/apis/useOrgMemberGroups";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";

import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@eGroupAI/material/DialogActions";
import Box from "@eGroupAI/material/Box";
import CheckboxWithLabel from "@eGroupAI/material/CheckboxWithLabel";
import CircularProgress from "@eGroupAI/material/CircularProgress";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import useOrgGroups from "utils/useOrgGroups";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export const DIALOG = "OrgGroupEditRoleDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface OrgGroupEditRoleDialogProps {
  onSubmit?: (values?: string[]) => void;
  loading?: boolean;
  loginId?: string;
}

const OrgGroupEditRoleDialog: FC<OrgGroupEditRoleDialogProps> = function (
  props
) {
  const { onSubmit, loading, loginId } = props;
  const theme = useTheme();
  const classes = useStyles();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const organizationId = useSelector(getSelectedOrgId);
  const [values, setValues] = useState<string[] | undefined>();
  const { data: orgGroups } = useOrgGroups({ organizationId });
  const wordLibrary = useSelector(getWordLibrary);
  const { mutate, data: memberGroups } = useOrgMemberGroups(
    {
      organizationId,
      loginId,
    },
    undefined,
    {
      onSuccess: (response) => {
        const { source = [] } = response.data;
        setValues(source.map((el) => el.organizationGroup.organizationGroupId));
      },
    }
  );

  useEffect(() => {
    if (!isOpen) {
      setValues(undefined);
    } else if (memberGroups) {
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const renderContent = () => {
    if (!orgGroups || !values) {
      return (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      );
    }
    return orgGroups.source.map((org) => (
      <Box key={org.organizationGroupId} display="block">
        <CheckboxWithLabel
          label={org.organizationGroupName || ""}
          value={org.organizationGroupId}
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
            checked: values.includes(org.organizationGroupId),
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
        {wordLibrary?.["change organization group"] ?? "修改單位群組"}
      </DialogTitle>

      <DialogContent>{renderContent()}</DialogContent>
      <DialogActions>
        <DialogCloseButton
          id="membergroup-dialog-close-button"
          data-tid="membergroup-dialog-close-button"
          onClick={closeDialog} />
        <DialogConfirmButton
          id="membergroup-dialog-confirm-button"
          data-tid="membergroup-dialog-confirm-button"
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

export default OrgGroupEditRoleDialog;
