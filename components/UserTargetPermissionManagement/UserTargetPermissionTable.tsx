/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@mui/styles";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import {
  EachRowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import StyledDataTableCell from "@eGroupAI/material-module/DataTable/StyledDataTableCell";
import { TextListItemWrapper } from "@eGroupAI/material-module/DataTable/DataTableTextListItem";
import StyledTypography from "@eGroupAI/material-module/DataTable/StyledTypography";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import DataTableTextList from "@eGroupAI/material-module/DataTable/DataTableTextList";
import { FilterSearch, OrganizationMember } from "@eGroupAI/typings/apis";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import useOrgMemberDetailPermissions from "utils/useOrgMemberDetailPermissions";
import { MemberLoginId, UserDetailPermission } from "interfaces/entities";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";

import Paper from "@eGroupAI/material/Paper";

import Tooltip from "@eGroupAI/material/Tooltip";

import { Button, IconButton } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";
import I18nDataTable from "components/I18nDataTable";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import UnModuleAuthorized from "components/PrivateLayout/UnModuleAuthorized";
import MembersListTableDialog, {
  DIALOG as MEMBERS_LIST_DIALOG,
} from "./MembersListTableDialog";
import EditUserPermissionDialog, {
  DIALOG as EDIT_PERMISSION_DIALOG,
} from "./EditUserPermissionDialog";

export interface UserTargetPermissionTableProps {
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
  serviceModuleValue?: string;
  targetId: string;
  disabledPermissions?: string[];
}

const useStyles = makeStyles(() => ({
  paper: {
    "& .MuiTablePagination-root": {},
  },
}));

const UserTargetPermissionTable: FC<UserTargetPermissionTableProps> = (
  props
) => {
  const {
    targetId,
    readable = false,
    writable = false,
    deletable = false,
    serviceModuleValue,
    disabledPermissions,
  } = props;
  const classes = useStyles(props);

  const organizationId = useSelector(getSelectedOrgId);

  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [eachRowState, setEachRowState] = useState<
    EachRowState<UserDetailPermission>
  >({});

  const [selectedMemberList, setSelectedMemberList] =
    useState<OrganizationMember[]>();
  const [userTableCheckedAll, setUserTableCheckedAll] =
    useState<boolean>(false);
  const [memberFilter, setMemberFilter] = useState<FilterSearch>();
  const [memberTableCheckedAll, setMemberTableCheckedAll] = useState(false);
  const [EditUserPermissionDialogVariant, setEditUserPermissionDialogVariant] =
    useState<"create" | "update">("create");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const {
    handleChangePage,
    handleRowsPerPageChange,
    handleSearchChange,
    payload,
    setPayload,
    page,
    rowsPerPage,
  } = useDataTable(
    `PermissionsDataTable-${serviceModuleValue}-${targetId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );

  const wordLibrary = useSelector(getWordLibrary);

  const { excute: createMemberTargetModuleAuth } = useAxiosApiWrapper(
    apis.org.createMemberTargetModuleAuth,
    "Create"
  );

  const { excute: deleteMembertargetModuleAuth, isLoading: isDeleting } =
    useAxiosApiWrapper(apis.org.deleteMembertargetModuleAuth, "Delete");

  const { data, isValidating, mutate } = useOrgMemberDetailPermissions({
    organizationId,
    targetId,
    serviceModuleValue,
  });

  const selectedUsers = useMemo(() => {
    const checkedRows = Object.values(eachRowState).filter((el) => el?.checked);
    if (checkedRows.length === 0) {
      return [];
    }
    return checkedRows.reduce<UserDetailPermission[]>((a, b) => {
      if (!b) return a;
      const row = data?.source.filter(
        (d) => d.member.loginId === b?.data?.member.loginId
      );
      if (row && row[0]) {
        return [...a, row[0] as UserDetailPermission];
      }
      return a;
    }, []);
  }, [eachRowState, data]);

  const defaultPermissionsForSelectedUsers = useMemo(() => {
    if (selectedUsers.length === 1) {
      return selectedUsers[0]?.serviceSubModuleList?.reduce<any[]>((a, b) => {
        const permissionList = Object.keys(b.permissionMap || {}).reduce<
          string[]
        >((ap, bp) => {
          if (b.permissionMap[bp] === "TARGET") return [...ap, bp];
          return ap;
        }, []);
        if (permissionList.length !== 0) {
          return [
            ...a,
            {
              serviceSubModuleId: b.serviceSubModuleId,
              serviceSubModulePermission: permissionList,
            },
          ];
        }
        return a;
      }, []);
    }
    return [];
  }, [selectedUsers]);

  const renderNameCell = (member: UserDetailPermission) => (
    <StyledDataTableCell key={member.member.loginId} verticalAlign="top">
      <TextListItemWrapper>
        <StyledTypography variant="body2">
          {member.member.memberName}
        </StyledTypography>
      </TextListItemWrapper>
    </StyledDataTableCell>
  );

  const renderPermissionCell = (
    member: UserDetailPermission,
    permissionFrom: string
  ) => {
    const renderData = member.serviceSubModuleList?.reduce<any[]>((a, b) => {
      const permissions = Object.keys(b.permissionMap || {})?.reduce<string[]>(
        (aa, bb) => {
          if (b.permissionMap[bb] === permissionFrom) {
            return [...aa, bb];
          }
          return aa;
        },
        []
      );
      if (permissions.length !== 0) {
        return [
          ...a,
          {
            name: b.serviceSubModuleNameZh,
            value: permissions
              .join(",")
              .replace("READ", `${wordLibrary?.read ?? "讀取"}`)
              .replace("WRITE", `${wordLibrary?.edit ?? "編輯"}`)
              .replace("DELETE", `${wordLibrary?.delete ?? "刪除"}`),
          },
        ];
      }
      return a;
    }, []);

    return (
      <StyledDataTableCell
        key={permissionFrom === "TARGET" ? member.member.loginId : ""}
        verticalAlign="top"
      >
        <DataTableTextList
          renderData={renderData}
          limitShow={3}
          sx={{ padding: 0 }}
        />
      </StyledDataTableCell>
    );
  };

  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
    setDialogStates: setConfirmDeleteDialogStates,
  } = useReduxDialog(DELETE_DIALOG);

  const {
    openDialog: openMemberListDialog,
    closeDialog: closeMemberListDialog,
  } = useReduxDialog(MEMBERS_LIST_DIALOG);

  const {
    openDialog: openEditUserPermissionDialog,
    closeDialog: closeEditUserPermissionDialog,
  } = useReduxDialog(EDIT_PERMISSION_DIALOG);

  const buttonTools = writable && (
    <Tooltip title={wordLibrary?.add ?? "新增"}>
      <Button
        onClick={openMemberListDialog}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
        id="table-add-button"
      >
        {wordLibrary?.add ?? "新增"}
      </Button>
    </Tooltip>
  );

  const selectedToolsbar = useMemo(
    () => (
      <>
        {writable && (
          <Tooltip title={wordLibrary?.edit ?? "編輯"}>
            <IconButton
              onClick={() => {
                setEditUserPermissionDialogVariant("update");
                openEditUserPermissionDialog();
              }}
              disabled={selectedUsers.length === 0}
              color="primary"
              id="table-edit-btn"
            >
              <Iconify icon="solar:pen-bold" width={24} />
            </IconButton>
          </Tooltip>
        )}
        {deletable && (
          <Tooltip title={wordLibrary?.delete ?? "刪除"}>
            <IconButton
              id="table-delete-btn"
              disabled={selectedUsers.length === 0}
              color="primary"
              onClick={() => {
                openConfirmDeleteDialog({
                  primary: `${
                    wordLibrary?.[
                      "This action will remove the selected member's permissions and remove them from the event's participant list. Do you confirm"
                    ] ?? "執行此操作將移除選定成員的權限，您確定要繼續嗎？"
                  }`,
                  isDeleting,
                  onConfirm: async () => {
                    try {
                      if (!deletable) {
                        throw new Error("Permission Error");
                      }
                      setConfirmDeleteDialogStates({ isDeleting: true });
                      await deleteMembertargetModuleAuth({
                        organizationId,
                        targetIdList: [targetId],
                        memberList: selectedUsers?.reduce<any[]>((a, b) => {
                          if (b) {
                            return [
                              ...a,
                              {
                                loginId: b?.member.loginId,
                              },
                            ];
                          }
                          return a;
                        }, []),
                      });
                      setDeleteState(true);
                      mutate();
                      closeConfirmDeleteDialog();
                      setEachRowState({});
                      setUserTableCheckedAll(false);
                    } catch (error) {
                      // eslint-disable-next-line no-console
                      apis.tools.createLog({
                        function: "DatePicker: handleDelete",
                        browserDescription: window.navigator.userAgent,
                        jsonData: {
                          data: error,
                          deviceInfo: getDeviceInfo(),
                        },
                        level: "ERROR",
                      });
                    }
                  },
                });
              }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" width={24} />
            </IconButton>
          </Tooltip>
        )}
      </>
    ),
    [
      writable,
      wordLibrary,
      selectedUsers,
      deletable,
      openEditUserPermissionDialog,
      openConfirmDeleteDialog,
      isDeleting,
      setConfirmDeleteDialogStates,
      deleteMembertargetModuleAuth,
      organizationId,
      targetId,
      mutate,
      closeConfirmDeleteDialog,
    ]
  );

  const editAllUnCheckToDelete = (permissions) => {
    openConfirmDeleteDialog({
      primary: wordLibrary
        ? wordLibrary["Would you also delete this member from the event"]
        : "您是否也要從事件中刪除該成員",
      onStore: () => {
        handleSavePermissions(permissions);
      },
      onConfirm: async () => {
        try {
          if (!deletable) {
            throw new Error("Permission Error");
          }
          closeEditUserPermissionDialog();

          await deleteMembertargetModuleAuth({
            organizationId,
            targetIdList: [targetId],
            memberList: selectedUsers?.reduce<any[]>((a, b) => {
              if (b) {
                return [
                  ...a,
                  {
                    loginId: b?.member.loginId,
                  },
                ];
              }
              return a;
            }, []),
          });
          setDeleteState(true);
          mutate();
          closeConfirmDeleteDialog();
          setEachRowState({});
          setUserTableCheckedAll(false);
        } catch (error) {
          // eslint-disable-next-line no-console
          apis.tools.createLog({
            function: "DatePicker: handleDelete",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: error,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
          });
        }
      },
    });
  };

  const handleSavePermissions = async (permissions) => {
    try {
      if (!writable) {
        throw new Error("Pemission Error.");
      }
      if (memberTableCheckedAll) {
        if (EditUserPermissionDialogVariant === "create") {
          setIsSaving(true);
          await createMemberTargetModuleAuth({
            organizationId,
            filterObject: memberFilter,
            targetIdList: [targetId],
            serviceSubModuleList: permissions,
            serviceModuleValue,
          });
          setIsSaving(false);
          mutate();
          closeEditUserPermissionDialog();
        } else {
          setIsSaving(true);
          await createMemberTargetModuleAuth({
            organizationId,
            filterObject: payload,
            targetIdList: [targetId],
            serviceSubModuleList: permissions,
            serviceModuleValue,
          });
          setIsSaving(false);
          mutate();
          closeEditUserPermissionDialog();
        }
      } else if (EditUserPermissionDialogVariant === "create") {
        setIsSaving(true);
        await createMemberTargetModuleAuth({
          organizationId,
          targetIdList: [targetId],
          memberList: selectedMemberList?.map((member) => ({
            loginId: member.member.loginId,
          })),
          serviceSubModuleList: permissions,
          isSelected: 1,
          serviceModuleValue,
        });
        setIsSaving(false);
        mutate();
        closeEditUserPermissionDialog();
      } else {
        setIsSaving(true);
        await createMemberTargetModuleAuth({
          organizationId,
          targetIdList: [targetId],
          memberList: selectedUsers?.reduce<any[]>((a, b) => {
            if (b) {
              return [
                ...a,
                {
                  loginId: b?.member.loginId,
                },
              ];
            }
            return a;
          }, []),
          serviceSubModuleList: permissions,
          isSelected: userTableCheckedAll ? undefined : 1,
          serviceModuleValue,
        });
        setIsSaving(false);
        mutate();
        closeEditUserPermissionDialog();
      }
    } catch (error) {
      setIsSaving(false);
    }
  };

  const tableData = useMemo(
    () =>
      data?.source.map((item) => ({
        ...item,
        serviceSubModuleList: item.serviceSubModuleList?.filter(
          (subModule) =>
            !disabledPermissions?.includes(subModule.serviceSubModuleNameEn)
        ),
      })),
    [data?.source, disabledPermissions]
  );

  return (
    <>
      {readable && (
        <>
          <Paper className={classes.paper}>
            <I18nDataTable
              columns={[
                {
                  name: wordLibrary?.["full name"] ?? "姓名",
                  id: "1",
                  dataKey: "member.memberName",
                  render: (columnData) => renderNameCell(columnData),
                },
                {
                  name: wordLibrary?.["role permissions"] ?? "角色權限",
                  id: "role",
                  dataKey: "member.organizationRoleList",
                  render: (columnData) =>
                    renderPermissionCell(columnData, "ROLE"),
                },
                {
                  name: wordLibrary?.["assign permissions"] ?? "指定權限",
                  id: "permissions",
                  dataKey: "permissions",
                  render: (columnData) =>
                    renderPermissionCell(columnData, "TARGET"),
                },
              ]}
              rowKey="member.loginId"
              buttonTools={buttonTools}
              selectedToolsbar={selectedToolsbar}
              data={tableData ?? []}
              enableRowCheckbox={deletable || writable}
              onEachRowStateChange={(state) => {
                setEachRowState(state);
              }}
              isEmpty={!data}
              serverSide
              loading={isValidating}
              onCheckedAllClick={() => {
                setUserTableCheckedAll(true);
              }}
              onCheckedAllClearClick={() => {
                setUserTableCheckedAll(false);
              }}
              serviceModuleValue={serviceModuleValue}
              filterConditionGroups={[]}
              MuiTablePaginationProps={{
                count: data?.total ?? 0,
                page,
                rowsPerPage,
                onPageChange: handleChangePage,
                onRowsPerPageChange: handleRowsPerPageChange,
              }}
              onSortLabelClick={(sortKey, order) => {
                setPayload((p) => ({
                  ...p,
                  sort: {
                    sortKey,
                    order: order.toUpperCase(),
                  },
                }));
              }}
              searchBar={
                <StyledSearchBar
                  handleSearchChange={handleSearchChange}
                  value={payload.query}
                  placeholder={
                    wordLibrary?.["search and press Enter"] ?? "搜尋並按Enter"
                  }
                />
              }
              sx={{
                "& .MuiTableCell-root": {
                  padding: "12px 6px",
                },
              }}
              deleteState={deleteState}
              setDeleteState={setDeleteState}
            />
          </Paper>
          <MembersListTableDialog
            onNext={(
              selectedList: OrganizationMember[],
              checkedAll: boolean,
              unselectedList: MemberLoginId[],
              filterSearch?: FilterSearch
            ) => {
              setSelectedMemberList(selectedList);
              setMemberFilter(filterSearch);
              setMemberTableCheckedAll(checkedAll);
              closeMemberListDialog();
              setEditUserPermissionDialogVariant("create");
              openEditUserPermissionDialog();
            }}
          />
          <EditUserPermissionDialog
            editAllUnCheckToDelete={editAllUnCheckToDelete}
            defaultPermissions={defaultPermissionsForSelectedUsers}
            variant={EditUserPermissionDialogVariant}
            onPrevStep={() => {
              openMemberListDialog();
            }}
            onSave={handleSavePermissions}
            isSaving={isSaving}
            serviceModuleValue={(serviceModuleValue as string) || ""}
            disabledPermissions={disabledPermissions}
          />
        </>
      )}
      {!readable && <UnModuleAuthorized />}
    </>
  );
};

export default UserTargetPermissionTable;
