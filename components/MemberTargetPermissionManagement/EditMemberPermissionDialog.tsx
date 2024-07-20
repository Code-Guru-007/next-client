import React, { FC, useState, useEffect } from "react";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import { useSelector } from "react-redux";

import { useReduxDialog } from "@eGroupAI/redux-modules";
import FormControlLabel from "@eGroupAI/material/FormControlLabel";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@eGroupAI/material/DialogActions";
import Dialog from "@eGroupAI/material/Dialog";
import DialogConfirmButton from "components/DialogConfirmButton";
import DialogCloseButton from "components/DialogCloseButton";
import DialogTitle from "@eGroupAI/material/DialogTitle";

import TableContainer from "@eGroupAI/material/TableContainer";
import Table from "@eGroupAI/material/Table";
import TableHead from "@eGroupAI/material/TableHead";
import TableBody from "@eGroupAI/material/TableBody";
import TableRow from "@eGroupAI/material/TableRow";
import TableCell from "@eGroupAI/material/TableCell";
import Checkbox from "@eGroupAI/material/Checkbox";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { ServiceSubModule } from "interfaces/entities";
import useServiceModules from "utils/useServiceModules";
import useServiceSubModules from "utils/useServiceSubModules";

const useStyles = makeStyles((theme) => ({
  mainPermissionName: {
    paddingLeft: theme.spacing(4),
  },
  permissionName: {
    paddingLeft: theme.spacing(8),
  },
  borderHidden: {
    border: "none",
  },
  paddingClose: {
    paddingTop: 0,
    paddingBottom: 0,
  },
}));
export interface EditMemberPermissionProps {
  defaultPermissions?: Pick<
    ServiceSubModule,
    "serviceSubModuleId" | "serviceSubModulePermission"
  >[];
  onSave?: (
    permissions: Pick<
      ServiceSubModule,
      "serviceSubModuleId" | "serviceSubModulePermission"
    >[]
  ) => void;
  onPrevStep?: () => void;
  variant?: "create" | "update";
  isSaving?: boolean;
  serviceModuleValue: string;
}

export const DIALOG = "EditMemberPermissionDialog";

const EditMemberPermission: FC<EditMemberPermissionProps> = (props) => {
  const classes = useStyles();
  const {
    defaultPermissions,
    onSave,
    onPrevStep,
    variant,
    isSaving = false,
    serviceModuleValue,
  } = props;

  const { closeDialog, isOpen } = useReduxDialog(DIALOG);

  const [permissions, setPermissions] = useState<
    Pick<
      ServiceSubModule,
      "serviceSubModuleId" | "serviceSubModulePermission"
    >[]
  >([]);

  const wordLibrary = useSelector(getWordLibrary);

  const { data: serviceModules } = useServiceModules();

  const { data: subModules } = useServiceSubModules({
    serviceModuleId: serviceModules?.source.filter(
      (module) => module.serviceModuleValue === serviceModuleValue
    )[0]?.serviceModuleId,
  });

  useEffect(() => {
    if (isOpen) {
      const newPermissions = subModules?.source.map((module) => {
        if (variant === "update") {
          const permission = defaultPermissions?.filter(
            (p) => p.serviceSubModuleId === module.serviceSubModuleId
          )[0];
          if (permission) {
            return permission;
          }
        }
        return {
          serviceSubModuleId: module.serviceSubModuleId,
          serviceSubModulePermission: [],
        };
      });
      setPermissions(newPermissions || []);
    } else {
      setPermissions([]);
    }
  }, [subModules, defaultPermissions, isOpen, variant]);

  const isAllChecked = () => {
    const allPermissions = permissions.reduce<string[]>(
      (a, b) => [...a, ...b.serviceSubModulePermission],
      []
    );
    if (!subModules) return false;
    return allPermissions.length === subModules.source.length * 3;
  };

  const isAllIndeterminate = () => {
    const allPermissions = permissions.reduce<string[]>(
      (a, b) => [...a, ...b.serviceSubModulePermission],
      []
    );
    return !isAllChecked() && allPermissions.length !== 0;
  };

  const isSubModuleAllChecked = (serviceSubModuleId) => {
    const permission = permissions.filter(
      (p) => p.serviceSubModuleId === serviceSubModuleId
    )[0];

    return permission?.serviceSubModulePermission.length === 3;
  };

  const isSubModuleIndeterminate = (serviceSubModuleId) => {
    const permission = permissions.filter(
      (p) => p.serviceSubModuleId === serviceSubModuleId
    )[0];

    return (
      permission &&
      permission?.serviceSubModulePermission.length !== 3 &&
      permission?.serviceSubModulePermission.length !== 0
    );
  };

  const isPermissionChecked = (serviceSubModuleId, permissionName) => {
    const permission = permissions.filter(
      (p) => p.serviceSubModuleId === serviceSubModuleId
    )[0];
    return !!permission?.serviceSubModulePermission.includes(permissionName);
  };

  const handleCheckAll = (e) => {
    if (e.target.checked === true) {
      const newPermissions = subModules?.source.map((module) => ({
        serviceSubModuleId: module.serviceSubModuleId,
        serviceSubModulePermission: ["READ", "WRITE", "DELETE"],
      }));
      setPermissions(newPermissions || []);
    } else {
      const newPermissions = subModules?.source.map((module) => ({
        serviceSubModuleId: module.serviceSubModuleId,
        serviceSubModulePermission: [],
      }));
      setPermissions(newPermissions || []);
    }
  };

  const handleSubModuleCheckAll = (e, serviceSubModuleId) => {
    if (e.target.checked) {
      const newPermissions = permissions?.map((permission) => {
        if (permission.serviceSubModuleId === serviceSubModuleId) {
          const newPermission = { ...permission };
          newPermission.serviceSubModulePermission = [
            "READ",
            "WRITE",
            "DELETE",
          ];
          return newPermission;
        }
        return permission;
      });
      setPermissions(newPermissions);
    } else {
      const newPermissions = permissions?.map((permission) => {
        if (permission.serviceSubModuleId === serviceSubModuleId) {
          const newPermission = { ...permission };
          newPermission.serviceSubModulePermission = [];
          return newPermission;
        }
        return permission;
      });
      setPermissions(newPermissions);
    }
  };

  const handlePermissionCheck = (e, serviceSubModuleId, permissionName) => {
    if (e.target.checked) {
      const newPermissions = permissions?.map((permission) => {
        if (permission.serviceSubModuleId === serviceSubModuleId) {
          const newPermission = { ...permission };
          newPermission.serviceSubModulePermission.push(permissionName);
          return newPermission;
        }
        return permission;
      });
      setPermissions(newPermissions);
    } else {
      const newPermissions = permissions?.map((permission) => {
        if (permission.serviceSubModuleId === serviceSubModuleId) {
          const newPermission = { ...permission };
          newPermission.serviceSubModulePermission =
            permission.serviceSubModulePermission.filter(
              (p) => p !== permissionName
            );
          return newPermission;
        }
        return permission;
      });
      setPermissions(newPermissions);
    }
  };

  const handleComfirmDialog = () => {
    if (onSave) onSave(permissions);
  };

  return (
    <Dialog open={isOpen} onClose={closeDialog} maxWidth="lg" fullWidth>
      <DialogTitle onClickClose={closeDialog}>
        {variant === "create"
          ? `${wordLibrary?.add ?? "新增"}`
          : `${wordLibrary?.edit ?? "編輯"}`}
        {wordLibrary?.["operational permissions"] ?? "操作權限"}
      </DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <FormControlLabel
                    label={wordLibrary?.function ?? "功能"}
                    control={
                      <Checkbox
                        checked={isAllChecked() as boolean}
                        indeterminate={isAllIndeterminate()}
                        onChange={handleCheckAll}
                      />
                    }
                  />
                </TableCell>
              </TableRow>
            </TableHead>
            {subModules?.source.map((module) => (
              <TableBody key={module.serviceSubModuleId}>
                <TableRow>
                  <TableCell
                    className={clsx(
                      classes.borderHidden,
                      classes.paddingClose,
                      classes.mainPermissionName
                    )}
                  >
                    <FormControlLabel
                      label={module.serviceSubModuleNameZh}
                      control={
                        <Checkbox
                          checked={isSubModuleAllChecked(
                            module.serviceSubModuleId
                          )}
                          indeterminate={isSubModuleIndeterminate(
                            module.serviceSubModuleId
                          )}
                          onChange={(e) => {
                            handleSubModuleCheckAll(
                              e,
                              module.serviceSubModuleId
                            );
                          }}
                        />
                      }
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    className={clsx(
                      classes.borderHidden,
                      classes.paddingClose,
                      classes.permissionName
                    )}
                  >
                    <FormControlLabel
                      label={wordLibrary?.read ?? "讀取"}
                      control={
                        <Checkbox
                          checked={
                            isPermissionChecked(
                              module.serviceSubModuleId,
                              "READ"
                            ) as boolean
                          }
                          onChange={(e) => {
                            handlePermissionCheck(
                              e,
                              module.serviceSubModuleId,
                              "READ"
                            );
                          }}
                        />
                      }
                    />

                    <FormControlLabel
                      label={wordLibrary?.edit ?? "編輯"}
                      control={
                        <Checkbox
                          checked={isPermissionChecked(
                            module.serviceSubModuleId,
                            "WRITE"
                          )}
                          onChange={(e) => {
                            handlePermissionCheck(
                              e,
                              module.serviceSubModuleId,
                              "WRITE"
                            );
                          }}
                        />
                      }
                    />

                    <FormControlLabel
                      label={wordLibrary?.delete ?? "刪除"}
                      control={
                        <Checkbox
                          checked={isPermissionChecked(
                            module.serviceSubModuleId,
                            "DELETE"
                          )}
                          onChange={(e) => {
                            handlePermissionCheck(
                              e,
                              module.serviceSubModuleId,
                              "DELETE"
                            );
                          }}
                        />
                      }
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            ))}
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        {variant === "create" && (
          <DialogCloseButton
            onClick={() => {
              closeDialog();
              if (onPrevStep) onPrevStep();
            }}
          >
            {wordLibrary?.["previous step"] ?? "上一步"}
          </DialogCloseButton>
        )}
        {variant === "update" && (
          <DialogCloseButton
            onClick={() => {
              closeDialog();
            }}
          />
        )}
        <DialogConfirmButton
          sx={{ ml: 1 }}
          onClick={handleComfirmDialog}
          loading={isSaving}
        >
          {wordLibrary?.save ?? "儲存"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default EditMemberPermission;
