import React, { FC, useEffect, useMemo, useState } from "react";

import { SNACKBAR as GLOBAL_SNACKBAR } from "components/App";
import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import useOrgRole from "@eGroupAI/hooks/apis/useOrgRole";
import useOrgModules from "@eGroupAI/hooks/apis/useOrgModules";
import useOrgRoleModules from "@eGroupAI/hooks/apis/useOrgRoleModules";
import useServiceModuleMap from "@eGroupAI/hooks/apis/useServiceModuleMap";
import apis from "utils/apis";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { ServiceModuleMap } from "@eGroupAI/typings/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { Collapse, SnackbarProps } from "@eGroupAI/material";
import useModulePermissionHandler from "utils/useModulePermissionHandler";

import Checkbox from "@eGroupAI/material/Checkbox";
import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TableContainer from "@eGroupAI/material/TableContainer";
import Table from "@eGroupAI/material/Table";
import TableHead from "@eGroupAI/material/TableHead";
import TableBody from "@eGroupAI/material/TableBody";
import TableRow from "@eGroupAI/material/TableRow";
import TableCell from "@eGroupAI/material/TableCell";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import { IconButton } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MainModuleTableRows from "./MainModuleTableRows";

import { getAllModuleChecked, getAllModulePartialChecked } from "./utils";

export const DIALOG = "UpdatePermissionDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

interface UpdatePermissionDialogProps {
  organizationRoleId?: string;
  updatePermission?: boolean;
}

const UpdatePermissionDialog: FC<UpdatePermissionDialogProps> = function (
  props
) {
  const [open, setOpen] = React.useState(true);
  const { organizationRoleId, updatePermission } = props;
  const theme = useTheme();
  const classes = useStyles();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const organizationId = useSelector(getSelectedOrgId);
  const { data: orgRole } = useOrgRole({
    organizationId,
    organizationRoleId,
  });
  const { data: orgModules } = useOrgModules({
    organizationId,
  });
  const { data: orgRoleModules, mutate } = useOrgRoleModules({
    organizationId,
    organizationRoleId,
  });
  const serviceModuleMap = useServiceModuleMap(orgRoleModules?.source);
  const [values, setValues] = useState<ServiceModuleMap>();
  const wordLibrary = useSelector(getWordLibrary);
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(GLOBAL_SNACKBAR);
  const { excute: updateOrgRoleModuleAndPermission, isLoading } =
    useAxiosApiWrapper(apis.org.updateOrgRoleModuleAndPermission, "Update");
  const {
    handleAllModuleChange,
    handleMainModuleChange,
    handleModuleChange,
    handleModulePermissionChange,
  } = useModulePermissionHandler(setValues, orgModules);

  // Set default values
  useEffect(() => {
    if (serviceModuleMap) {
      setValues(serviceModuleMap);
    }
  }, [serviceModuleMap]);

  const handleSave = async () => {
    if (organizationId && organizationRoleId && values) {
      try {
        await updateOrgRoleModuleAndPermission({
          organizationId,
          organizationRoleId,
          data: {
            serviceModuleMap: values,
          },
        });
        mutate();
        closeDialog();
        openSnackbar({
          message: wordLibrary?.["update successful"] ?? "更新成功",
          severity: "success",
        });
      } catch (error) {
        apis.tools.createLog({
          function: "DatePicker: handleSave",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
    }
  };

  const allChecked = useMemo(
    () => getAllModuleChecked(values, orgModules?.source),
    [orgModules?.source, values]
  );
  const partialChecked = useMemo(
    () => getAllModulePartialChecked(values, orgModules?.source),
    [orgModules?.source, values]
  );

  return (
    // serviceModuleMap !== undefined can fixed dialog flash issue
    <Dialog
      open={serviceModuleMap !== undefined && isOpen}
      onClose={closeDialog}
      maxWidth="sm"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      {updatePermission ? (
        <DialogTitle onClickClose={closeDialog}>
          {wordLibrary?.edit ?? "編輯"} - {orgRole?.organizationRoleNameZh}{" "}
          {wordLibrary?.["operational permissions"] ?? "操作權限"}
        </DialogTitle>
      ) : (
        <DialogTitle onClickClose={closeDialog}>
          {orgRole?.organizationRoleNameZh}
        </DialogTitle>
      )}
      <DialogContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    onChange={() => {
                      handleAllModuleChange(
                        (!allChecked && partialChecked) ||
                          (!allChecked && !partialChecked)
                      );
                    }}
                    checked={allChecked}
                    indeterminate={!allChecked && partialChecked}
                    disabled={!updatePermission}
                  />
                  {wordLibrary?.function ?? "功能"}
                  <IconButton
                    id="update-permisson-icon-btn"
                    data-tid="update-permisson-icon-btn"
                    aria-label="expand row"
                    size="small"
                    onClick={() => setOpen(!open)}
                  >
                    {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <Collapse in={open} timeout="auto" unmountOnExit>
                {values &&
                  orgModules?.source.map((orgModule) => (
                    <MainModuleTableRows
                      key={orgModule.serviceMainModule.serviceMainModuleId}
                      orgModule={orgModule}
                      values={values}
                      updatePermission={updatePermission}
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
              </Collapse>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <DialogCloseButton 
            id="update-permisson-dialog-close-button"
            data-tid="update-permisson-dialog-close-button"
            onClick={closeDialog} disabled={isLoading} />
          {updatePermission && (
            <DialogConfirmButton
              id="update-permisson-dialog-confirm-button"
              data-tid="update-permisson-dialog-confirm-button"
              sx={{ ml: 1 }}
              loading={isLoading}
              onClick={handleSave}
            >
              {wordLibrary?.save ?? "儲存"}
            </DialogConfirmButton>
          )}
      </DialogActions>
    </Dialog>
  );
};

export default UpdatePermissionDialog;
