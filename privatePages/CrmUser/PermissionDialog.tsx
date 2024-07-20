import React, { FC, useState, useEffect } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useOrgModules from "@eGroupAI/hooks/apis/useOrgModules";
import { ServiceModuleMap, OrganizationMember } from "@eGroupAI/typings/apis";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import useModulePermissionHandler from "utils/useModulePermissionHandler";

import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import TableContainer from "@eGroupAI/material/TableContainer";
import Table from "@eGroupAI/material/Table";
import TableBody from "@eGroupAI/material/TableBody";

import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import MainModuleTableRows from "privatePages/MemberRoles/MainModuleTableRows";

export const DIALOG = "PermissionDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

interface Props {
  onSave: (permissions?: string[]) => void;
  isLoading: boolean;
  selectedMemberList?: OrganizationMember[];
}

const PermissionDialog: FC<Props> = function (props) {
  const organizationId = useSelector(getSelectedOrgId);

  const { onSave, isLoading, selectedMemberList } = props;

  const classes = useStyles();
  const theme = useTheme();

  const [values, setValues] = useState<ServiceModuleMap>();

  const wordLibrary = useSelector(getWordLibrary);

  const { closeDialog, isOpen } = useReduxDialog(DIALOG);

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
    setValues({});
  }, []);

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
        新增 -{" "}
        {selectedMemberList?.length === 1
          ? selectedMemberList[0]?.member.memberName
          : `${selectedMemberList?.length}筆資料`}{" "}
        {wordLibrary?.["operational permissions"] ?? "操作權限"}
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

export default PermissionDialog;
