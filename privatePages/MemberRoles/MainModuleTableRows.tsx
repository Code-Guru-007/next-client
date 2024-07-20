import React, { FC, useMemo } from "react";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import {
  ModulePermission,
  ServiceModuleMap,
  ServiceModulePermissionMapping,
  OrganizationModule,
  ServiceModule,
} from "@eGroupAI/typings/apis";

import Checkbox from "@eGroupAI/material/Checkbox";
import CheckboxWithLabel from "@eGroupAI/material/CheckboxWithLabel";
import TableRow, { TableRowProps } from "@eGroupAI/material/TableRow";
import TableCell from "@eGroupAI/material/TableCell";
import { Collapse, Divider, IconButton } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import { getMainModuleChecked, getMainModulePartialChecked } from "./utils";

const useStyles = makeStyles((theme) => ({
  mainModuleName: {
    paddingLeft: theme.spacing(4),
  },
  moduleName: {
    paddingLeft: theme.spacing(8),
  },
  subModuleName: {
    paddingLeft: theme.spacing(13),
  },
  paddingDivider: {
    marginLeft: theme.spacing(6),
  },
  permission: {
    display: "inline-block",
  },
  borderHidden: {
    border: "none",
  },
  paddingClose: {
    paddingTop: 0,
    paddingBottom: 0,
  },
}));

export interface MainModuleTableRowsProps extends TableRowProps {
  orgModule: OrganizationModule;
  values: ServiceModuleMap;
  updatePermission?: boolean;
  onMainModuleChange?: (partialChecked: boolean) => void;
  onModuleChange?: (partialChecked: boolean, m: ServiceModule) => void;
  onModulePermissionChange?: (
    checked: boolean,
    m: ServiceModule,
    permission: ModulePermission
  ) => void;
}

const MainModuleTableRows: FC<MainModuleTableRowsProps> = function (props) {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();
  const {
    className,
    orgModule,
    values,
    updatePermission,
    onMainModuleChange,
    onModuleChange,
    onModulePermissionChange,
    ...other
  } = props;
  const hasMainModules = useMemo(
    () =>
      orgModule.serviceMainModule.serviceModuleList &&
      orgModule.serviceMainModule.serviceModuleList?.length > 0,
    [orgModule.serviceMainModule.serviceModuleList]
  );
  const hasModules = useMemo(
    () =>
      orgModule.serviceMainModule.serviceModuleList &&
      orgModule.serviceMainModule.serviceModuleList?.length > 1,
    [orgModule.serviceMainModule.serviceModuleList]
  );

  const allChecked = useMemo(
    () => getMainModuleChecked(values, orgModule.serviceMainModule),
    [orgModule.serviceMainModule, values]
  );
  const partialChecked = useMemo(
    () => getMainModulePartialChecked(values, orgModule.serviceMainModule),
    [orgModule.serviceMainModule, values]
  );

  return (
    <>
      {hasMainModules && (
        <>
          <TableRow className={clsx(className)} {...other}>
            <TableCell
              colSpan={2}
              className={clsx(
                classes.borderHidden,
                classes.paddingClose,
                classes.mainModuleName
              )}
            >
              <Checkbox
                onChange={() => {
                  if (onMainModuleChange) {
                    onMainModuleChange(
                      !(
                        (!allChecked && partialChecked) ||
                        (!allChecked && !partialChecked)
                      )
                    );
                  }
                }}
                checked={allChecked}
                disabled={!updatePermission}
                indeterminate={!allChecked && partialChecked}
              />
              {orgModule.serviceMainModule.serviceMainModuleNameZh}
              <IconButton
                id="table-row-open-button"
                data-tid="table-row-open-button"
                aria-label="expand row"
                size="small"
                onClick={() => setOpen(!open)}
              >
                {open && <KeyboardArrowUpIcon />}
                {!open && <KeyboardArrowDownIcon />}
              </IconButton>
            </TableCell>
          </TableRow>
          {open && <Divider className={classes.paddingDivider} />}
        </>
      )}
      {orgModule.serviceMainModule.serviceModuleList?.map((m) => {
        const mp = values[m.serviceModuleId];
        const mpPartialChecked = mp !== undefined && mp.length > 0;
        const mpPartialAllchecked =
          values[m.serviceModuleId]?.length ===
          m.serviceModulePermissionList?.length;
        return (
          <Collapse
            in={open}
            timeout="auto"
            unmountOnExit
            key={m.serviceModuleId}
          >
            {hasModules && (
              <TableRow key={m.serviceModuleId}>
                <TableCell
                  className={clsx(
                    hasMainModules && classes.moduleName,
                    classes.borderHidden,
                    classes.paddingClose
                  )}
                >
                  <Checkbox
                    onChange={() => {
                      if (onModuleChange) {
                        onModuleChange(
                          !(
                            (!mpPartialAllchecked && mpPartialChecked) ||
                            (!mpPartialAllchecked && !mpPartialChecked)
                          ),
                          m
                        );
                      }
                    }}
                    checked={mpPartialAllchecked}
                    disabled={!updatePermission}
                    indeterminate={!mpPartialAllchecked && mpPartialChecked}
                  />
                  {m.serviceModuleNameZh}
                </TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell
                className={clsx(
                  hasMainModules && classes.subModuleName,
                  classes.borderHidden,
                  classes.paddingClose
                )}
              >
                {m.serviceModulePermissionList?.map((permission) => (
                  <div className={classes.permission} key={permission}>
                    <CheckboxWithLabel
                      label={ServiceModulePermissionMapping[permission]}
                      checked={Boolean(
                        values[m.serviceModuleId]?.includes(permission)
                      )}
                      disabled={!updatePermission}
                      onChange={(e, checked) => {
                        if (onModulePermissionChange) {
                          onModulePermissionChange(checked, m, permission);
                        }
                      }}
                    />
                  </div>
                ))}
              </TableCell>
            </TableRow>
          </Collapse>
        );
      })}
      {open && <Divider className={classes.paddingDivider} />}
    </>
  );
};

export default MainModuleTableRows;
