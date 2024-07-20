import React, { FC, useState, useEffect } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import { useSelector } from "react-redux";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import useOrgModules from "@eGroupAI/hooks/apis/useOrgModules";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { ServiceModuleMap, ModulePermission } from "@eGroupAI/typings/apis";
import { PermissionMember } from "interfaces/entities";
import useModulePermissionHandler from "utils/useModulePermissionHandler";

import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import TableContainer from "@eGroupAI/material/TableContainer";
import Table from "@eGroupAI/material/Table";
import TableBody from "@eGroupAI/material/TableBody";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import MainModuleTableRows from "privatePages/MemberRoles/MainModuleTableRows";

export const DIALOG = "UpdatePermissionDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

interface Props {
  selectedUsers?: PermissionMember[];
  onSave: (permissions?: string[]) => void;
  isLoading: boolean;
}

const UpdatePermissionDialog: FC<Props> = function (props) {
  const { selectedUsers, onSave, isLoading } = props;

  const classes = useStyles();
  const theme = useTheme();

  const organizationId = useSelector(getSelectedOrgId);

  const { closeDialog, isOpen } = useReduxDialog(DIALOG);

  const [values, setValues] = useState<ServiceModuleMap>();

  const wordLibrary = useSelector(getWordLibrary);

  const { data: orgModules } = useOrgModules(
    {
      organizationId,
    },
    {
      serviceModuleValue: "CRM_USER",
    }
  );
  const {
    handleMainModuleChange,
    handleModuleChange,
    handleModulePermissionChange,
  } = useModulePermissionHandler(setValues, orgModules);

  useEffect(() => {
    if (selectedUsers?.length === 1 && !!orgModules?.source) {
      if (orgModules.source[0]?.serviceMainModule) {
        if (
          orgModules.source[0].serviceMainModule.serviceModuleList &&
          selectedUsers[0]?.rolePermissionMap
        ) {
          setValues({
            [orgModules.source[0].serviceMainModule.serviceModuleList[0]
              ?.serviceModuleId ?? ""]: Object.keys(
              selectedUsers[0].rolePermissionMap
            )
              .map((role) => ModulePermission[role])
              .filter((val) => val !== undefined),
          });
        }
      }
    } else {
      setValues({});
    }
  }, [orgModules, selectedUsers, isOpen]);

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      maxWidth="lg"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={closeDialog}>
        {selectedUsers?.length === 1
          ? `${wordLibrary?.edit ?? "編輯"} - ${
              selectedUsers[0]?.member.memberName
            } 的操作權限`
          : `覆蓋 - ${selectedUsers?.length}筆資料 的操作權限`}
      </DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table>
            <TableBody>
              {values &&
                orgModules?.source.map((orgModule) => (
                  <MainModuleTableRows
                    key={orgModule.serviceMainModule.serviceMainModuleId}
                    orgModule={orgModule}
                    values={values}
                    onMainModuleChange={(pc) => {
                      if (pc) {
                        handleMainModuleChange(
                          false,
                          orgModule.serviceMainModule
                        );
                      } else {
                        handleMainModuleChange(
                          true,
                          orgModule.serviceMainModule
                        );
                      }
                    }}
                    onModuleChange={(pc, m) => {
                      if (pc) {
                        handleModuleChange(false, m);
                      } else {
                        handleModuleChange(true, m);
                      }
                    }}
                    onModulePermissionChange={handleModulePermissionChange}
                  />
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <DialogCloseButton onClick={closeDialog} disabled={isLoading} />
        <DialogConfirmButton
          sx={{ ml: 1 }}
          loading={isLoading}
          disabled={Object.keys(values ?? {}).length === 0}
          onClick={() => {
            if (values) {
              onSave(Object.values(values)[0]);
            }
          }}
        >
          {wordLibrary?.save ?? "儲存"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default UpdatePermissionDialog;
