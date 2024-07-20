import React, { useState } from "react";

import { useTheme } from "@mui/styles";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { IconButton, Button as MuiButton, useMediaQuery } from "@mui/material";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import { useDataTable } from "@eGroupAI/material-module/DataTable";
import { useTableRWDStyles } from "@eGroupAI/material-module/DataTable/useTableRWDStyles";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useOrgRoles from "@eGroupAI/hooks/apis/useOrgRoles";
import useOrgMemberPermissions from "@eGroupAI/hooks/apis/useOrgMemberPermissions";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";
import { OrganizationRole } from "@eGroupAI/typings/apis";
import apis from "utils/apis";
import Box from "@eGroupAI/material/Box";
import Paper from "@eGroupAI/material/Paper";
import Button from "@eGroupAI/material/Button";
import Switch from "@mui/material/Switch";
import TableCell from "@eGroupAI/material/TableCell";
import TableRow from "@eGroupAI/material/TableRow";
import I18nDataTable from "components/I18nDataTable";
import PermissionValid from "components/PermissionValid";
import Iconify from "minimal/components/iconify/iconify";
import SearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import OrgRoleDialog, { DIALOG as ROLE_DIALOG } from "./OrgRoleDialog";
import UpdatePermissionDialog, {
  DIALOG as UPDATE_PERMISSION_DIALOG,
} from "./UpdatePermissionDialog";
import DeleteRoleDialog, {
  DIALOG as DELETE_ROLE_DIALOG,
} from "./DeleteRoleDialog";

const MemberRolesDataTable = function () {
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));
  const tableRWDClasses = useTableRWDStyles();

  const organizationId = useSelector(getSelectedOrgId);
  const {
    handleChangePage,
    handleRowsPerPageChange,
    handleSearchChange,
    payload,

    page,
    rowsPerPage,
  } = useDataTable(
    `HrmRolesDataTable-${organizationId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );
  const { data, isValidating, mutate } = useOrgRoles(
    {
      organizationId,
    },
    payload
  );
  const [memberPermissions] = useOrgMemberPermissions();
  const [isEdit, setIsEdit] = useState(false);
  const [selectedOrgRole, setSelectedOrgRole] = useState<OrganizationRole>();
  const wordLibrary = useSelector(getWordLibrary);
  const { excute: updateOrgRole, isLoading: isUpdating } = useAxiosApiWrapper(
    apis.org.updateOrgRole,
    "Update"
  );
  const { excute: createOrgRole, isLoading: isCreating } = useAxiosApiWrapper(
    apis.org.createOrgRole,
    "Create"
  );
  const { openDialog: openRoleDialog, closeDialog: closeRoleDialog } =
    useReduxDialog(ROLE_DIALOG);
  const { openDialog: openUpdatePermissionDialog } = useReduxDialog(
    UPDATE_PERMISSION_DIALOG
  );
  const { openDialog: openDeleteRoleDialog } =
    useReduxDialog(DELETE_ROLE_DIALOG);

  const handleDeleteRoleDialog = (rowData) => {
    setSelectedOrgRole(rowData);
    openDeleteRoleDialog();
  };

  const updatePermission = memberPermissions.HRM_ROLES?.includes("UPDATE_ALL");
  const deletePermission = memberPermissions.HRM_ROLES?.includes("DELETE_ALL");

  const buttonTools = (
    <PermissionValid shouldBeOrgOwner modulePermissions={["CREATE"]}>
      <MuiButton
        id="add-role-button"
        data-tid="add-role-button"
        onClick={() => {
          setSelectedOrgRole(undefined);
          setIsEdit(false);
          openRoleDialog();
        }}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
      >
        {wordLibrary?.add ?? "新增"}
      </MuiButton>
    </PermissionValid>
  );

  return (
    <>
      <DeleteRoleDialog
        organizationRole={selectedOrgRole}
        organizationId={organizationId}
        mutate={mutate}
      />
      <UpdatePermissionDialog
        organizationRoleId={selectedOrgRole?.organizationRoleId}
        updatePermission={updatePermission}
      />
      <OrgRoleDialog
        organizationRoleName={selectedOrgRole?.organizationRoleNameZh}
        isEdit={isEdit}
        loading={isUpdating || isCreating}
        onSave={async (organizationRoleNameZh) => {
          try {
            if (organizationId && selectedOrgRole && isEdit) {
              await updateOrgRole({
                organizationId,
                organizationRoleId: selectedOrgRole.organizationRoleId,
                organizationRoleNameZh,
              });
              mutate();
              closeRoleDialog();
            } else if (!isEdit && organizationId) {
              const res = await createOrgRole({
                organizationId,
                organizationRoleNameZh,
              });
              mutate();
              setSelectedOrgRole(res.data);
              openUpdatePermissionDialog();
              closeRoleDialog();
            }
          } catch (error) {
            apis.tools.createLog({
              function: "updateOrgRole: error",
              browserDescription: window.navigator.userAgent,
              jsonData: {
                data: error,
                deviceInfo: getDeviceInfo(),
              },
              level: "ERROR",
            });
          }
        }}
      />
      <Paper>
        <I18nDataTable
          columns={[
            {
              id: "1",
              name: wordLibrary?.enabled ?? "是否啟用",
            },
            {
              id: "2",
              name: wordLibrary?.["role name"] ?? "角色名稱",
            },
            {
              id: "3",
              name: wordLibrary?.actions ?? "操作",
              align: "right",
            },
          ]}
          data={!data ? [] : data.source}
          isEmpty={data?.total === 0}
          serverSide
          searchBar={
            <SearchBar
              handleSearchChange={handleSearchChange}
              value={payload.query}
              placeholder={
                wordLibrary?.["search and press Enter"] ?? "搜尋並按Enter"
              }
            />
          }
          minWidth={600}
          loading={isValidating}
          renderDataRow={(rowData) => (
            <>
              {!isDownSm && (
                <TableRow key={rowData.organizationRoleId}>
                  <TableCell width={100}>
                    <Switch
                      color="success"
                      defaultChecked={Boolean(rowData.organizationRoleStatus)}
                      onChange={async (event) => {
                        if (organizationId) {
                          try {
                            await updateOrgRole({
                              organizationId,
                              organizationRoleId: rowData.organizationRoleId,
                              organizationRoleStatus: Number(
                                event.target.checked
                              ),
                            });
                            mutate();
                          } catch (error) {
                            apis.tools.createLog({
                              function: "updateOrgRole: error",
                              browserDescription: window.navigator.userAgent,
                              jsonData: {
                                data: error,
                                deviceInfo: getDeviceInfo(),
                              },
                              level: "ERROR",
                            });
                          }
                        }
                      }}
                      disabled={
                        Boolean(rowData.organizationRoleFix) ||
                        !updatePermission
                      }
                    />
                  </TableCell>
                  <TableCell>{rowData.organizationRoleNameZh}</TableCell>
                  <TableCell align="right">
                    {updatePermission ? (
                      <Button
                        id="roles-update-permission-button"
                        data-tid="roles-update-permission-button"
                        color="primary"
                        variant="contained"
                        onClick={() => {
                          setSelectedOrgRole(rowData);
                          openUpdatePermissionDialog();
                      }}
                      rounded
                      disabled={Boolean(rowData.organizationRoleFix)}
                    >
                      {wordLibrary?.["editing permissions"] ?? "編輯權限"}
                    </Button>
                  ) : (
                    <Button
                      id="roles-update-permission-btn"
                      data-tid="roles-update-permission-btn"
                      color="primary"
                      variant="contained"
                      onClick={() => {
                        setSelectedOrgRole(rowData);
                        openUpdatePermissionDialog();
                      }}
                      rounded
                      disabled={Boolean(rowData.organizationRoleFix)}
                    >
                      {wordLibrary?.["view permissions"]
                        ? wordLibrary?.["view permissions"]
                        : "查看權限"}
                    </Button>
                  )}
                    <PermissionValid modulePermissions={["UPDATE_ALL"]}>
                      <Button
                        id="member-roles-edit-button"
                        data-tid="member-roles-edit-button"
                        color="primary"
                        variant="contained"
                        onClick={() => {
                          setSelectedOrgRole(rowData);
                          setIsEdit(true);
                          openRoleDialog();
                        }}
                        rounded
                        sx={{ marginLeft: 1 }}
                      >
                        {wordLibrary?.["edit name"] ?? "編輯名稱"}
                      </Button>
                    </PermissionValid>
                    <IconButton
                      id="member-roles-delete-button"
                      data-tid="member-roles-roles-button"
                      disabled={
                        Boolean(rowData.organizationRoleFix) ||
                        !deletePermission
                      }
                      onClick={() => {
                        handleDeleteRoleDialog(rowData);
                      }}
                      sx={{ marginLeft: 1 }}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" width={24} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )}
              {isDownSm && (
                <TableRow
                  key={rowData.organizationRoleId}
                  className={tableRWDClasses.tableRowRWD}
                >
                  <TableCell width={100}>
                    <Box className={tableRWDClasses.columnCell}>
                      {wordLibrary?.enabled ?? "是否啟用"}
                    </Box>
                    <Box className={tableRWDClasses.rowCell}>
                      <Switch
                        color="success"
                        defaultChecked={Boolean(rowData.organizationRoleStatus)}
                        onChange={async (event) => {
                          if (organizationId) {
                            try {
                              await updateOrgRole({
                                organizationId,
                                organizationRoleId: rowData.organizationRoleId,
                                organizationRoleStatus: Number(
                                  event.target.checked
                                ),
                              });
                              mutate();
                            } catch (error) {
                              apis.tools.createLog({
                                function: "updateOrgRole: error",
                                browserDescription: window.navigator.userAgent,
                                jsonData: {
                                  data: error,
                                  deviceInfo: getDeviceInfo(),
                                },
                                level: "ERROR",
                              });
                            }
                          }
                        }}
                        disabled={
                          Boolean(rowData.organizationRoleFix) ||
                          !updatePermission
                        }
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    {" "}
                    <Box className={tableRWDClasses.columnCell}>
                      {wordLibrary?.["role name"] ?? "角色名稱"}
                    </Box>
                    <Box className={tableRWDClasses.rowCell}>
                      {rowData.organizationRoleNameZh}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box className={tableRWDClasses.columnCell}>
                      {wordLibrary?.actions ?? "操作"}
                    </Box>
                    <Box className={tableRWDClasses.rowCell}>
                      {updatePermission ? (
                        <Button
                          id="roles-update-permission-button"
                          data-tid="roles-update-permission-button"
                          color="primary"
                          variant="contained"
                          onClick={() => {
                            setSelectedOrgRole(rowData);
                            openUpdatePermissionDialog();
                          }}
                          rounded
                          disabled={Boolean(rowData.organizationRoleFix)}
                      >
                        {wordLibrary?.["editing permissions"] ?? "編輯權限"}
                      </Button>
                    ) : (
                      <Button
                        id="roles-update-permission-dialog-button"
                        data-tid="roles-update-permission-dialog-button"
                        color="primary"
                        variant="contained"
                        onClick={() => {
                          setSelectedOrgRole(rowData);
                          openUpdatePermissionDialog();
                        }}
                        rounded
                        disabled={Boolean(rowData.organizationRoleFix)}
                      >
                        {wordLibrary?.["view permissions"]
                          ? wordLibrary?.["view permissions"]
                          : "查看權限"}
                      </Button>
                      )}
                      <PermissionValid modulePermissions={["UPDATE_ALL"]}>
                      <Button
                        id="open-role-dialog-button"
                        data-tid="open-role-dialog-button"
                        color="primary"
                        variant="contained"
                        onClick={() => {
                          setSelectedOrgRole(rowData);
                          setIsEdit(true);
                          openRoleDialog();
                        }}
                        rounded
                        disabled={
                          Boolean(rowData.organizationRoleFix) ||
                          !updatePermission
                        }
                        sx={{ marginLeft: 1 }}
                        >
                          {wordLibrary?.["edit name"] ?? "編輯名稱"}
                        </Button>
                      </PermissionValid>
                      <IconButton
                        id="roles-delete-button"
                        data-tid="roles-delete-button"
                        disabled={
                          Boolean(rowData.organizationRoleFix) ||
                          !deletePermission
                        }
                        onClick={() => {
                          handleDeleteRoleDialog(rowData);
                        }}
                        sx={{ marginLeft: 1 }}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" width={24} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
          MuiTablePaginationProps={{
            count: data?.total ?? 0,
            page,
            rowsPerPage,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
          buttonTools={buttonTools}
        />
      </Paper>
    </>
  );
};

export default MemberRolesDataTable;
