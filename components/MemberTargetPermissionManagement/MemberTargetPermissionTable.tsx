/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@mui/styles";

import { Button, IconButton } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import {
  EachRowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import StyledDataTableCell from "@eGroupAI/material-module/DataTable/StyledDataTableCell";
import { TextListItemWrapper } from "@eGroupAI/material-module/DataTable/DataTableTextListItem";
import StyledTypography from "@eGroupAI/material-module/DataTable/StyledTypography";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import DataTableTextList from "@eGroupAI/material-module/DataTable/DataTableTextList";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { FilterSearch, OrganizationMember } from "@eGroupAI/typings/apis";
import useOrgMemberDetailPermissions from "utils/useOrgMemberDetailPermissions";
import { MemberLoginId, MemberDetailPermission } from "interfaces/entities";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";

import Paper from "@eGroupAI/material/Paper";

import Tooltip from "@eGroupAI/material/Tooltip";

import I18nDataTable from "components/I18nDataTable";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import UnModuleAuthorized from "components/PrivateLayout/UnModuleAuthorized";
import MembersListTableDialog, {
  DIALOG as MEMBERS_LIST_DIALOG,
} from "./MembersListTableDialog";
import EditMemberPermissionDialog, {
  DIALOG as EDIT_PERMISSION_DIALOG,
} from "./EditMemberPermissionDialog";

export interface MemberTargetPermissionTableProps {
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
  serviceModuleValue: string;
  targetId: string;
}

const useStyles = makeStyles(() => ({
  paper: {
    "& .MuiTablePagination-root": {},
  },
}));

const MemberTargetPermissionTable: FC<MemberTargetPermissionTableProps> = (
  props
) => {
  const { readable, writable, deletable, serviceModuleValue, targetId } = props;
  const classes = useStyles(props);

  const organizationId = useSelector(getSelectedOrgId);

  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [eachRowState, setEachRowState] = useState<
    EachRowState<MemberDetailPermission>
  >({});

  const [selectedMemberList, setSelectedMemberList] =
    useState<OrganizationMember[]>();
  const [membersTableCheckedAll, setMembersTableCheckedAll] =
    useState<boolean>(false);
  const [memberFilter, setMemberFilter] = useState<FilterSearch>();
  const [memberTableCheckedAll, setMemberTableCheckedAll] = useState(false);
  const [
    editMemberPermissionDialogVariant,
    setEditMemberPermissionDialogVariant,
  ] = useState<"create" | "update">("create");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const wordLibrary = useSelector(getWordLibrary);

  const {
    handleChangePage,
    handleRowsPerPageChange,
    handleSearchChange,
    payload,
    setPayload,
    page,
    rowsPerPage,
  } = useDataTable(
    `HrmPermissionDataTable-${targetId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );

  const { excute: createMemberTargetModuleAuth } = useAxiosApiWrapper(
    apis.org.createMemberTargetModuleAuth,
    "Create"
  );

  const { excute: deleteMembertargetModuleAuth, isLoading: isDeleting } =
    useAxiosApiWrapper(apis.org.deleteMembertargetModuleAuth, "Delete");

  const { data, isValidating, mutate } = useOrgMemberDetailPermissions(
    {
      organizationId,
      targetId,
      serviceModuleValue,
    },
    { ...payload }
  );

  const selectedMembers = useMemo(() => {
    const checkedRows = Object.values(eachRowState).filter((el) => el?.checked);
    if (checkedRows.length === 0) {
      return [];
    }
    return checkedRows.reduce<MemberDetailPermission[]>((a, b) => {
      if (!b) return a;
      const row = data?.source.filter(
        (d) => d.member.loginId === b?.data?.member.loginId
      );
      if (row && row[0]) {
        return [...a, row[0] as MemberDetailPermission];
      }
      return a;
    }, []);
  }, [eachRowState, data]);

  const defaultPermissionsForSelectedMembers = useMemo(() => {
    if (selectedMembers.length === 1) {
      return selectedMembers[0]?.serviceSubModuleList.reduce<any[]>((a, b) => {
        const permissionList = Object.keys(b.permissionMap).reduce<string[]>(
          (ap, bp) => {
            if (b.permissionMap[bp] === "TARGET") return [...ap, bp];
            return ap;
          },
          []
        );
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
  }, [selectedMembers]);

  const renderNameCell = (member: MemberDetailPermission) => (
    <StyledDataTableCell key={member.member.loginId} verticalAlign="top">
      <TextListItemWrapper>
        <StyledTypography variant="body2">
          {member.member.memberName}
        </StyledTypography>
      </TextListItemWrapper>
    </StyledDataTableCell>
  );

  const renderPermissionCell = (
    member: MemberDetailPermission,
    permissionFrom: string
  ) => {
    const renderData = member.serviceSubModuleList.reduce<any[]>((a, b) => {
      const permissions = Object?.keys(b.permissionMap).reduce<string[]>(
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
    openDialog: openEditMemberPermissionDialog,
    closeDialog: closeEditMemberPermissionDialog,
  } = useReduxDialog(EDIT_PERMISSION_DIALOG);

  const buttonTools = writable && (
    <Tooltip title={wordLibrary?.add ?? "新增"}>
      <Button
        id="member-add-btn"
        data-tid="member-add-btn"
        onClick={openMemberListDialog}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
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
                setEditMemberPermissionDialogVariant("update");
                openEditMemberPermissionDialog();
              }}
              disabled={selectedMembers.length === 0}
              color="primary"
            >
              <Iconify icon="solar:pen-bold" width={24} />
            </IconButton>
          </Tooltip>
        )}
        {deletable && (
          <Tooltip title={wordLibrary?.delete ?? "刪除"}>
            <IconButton
              disabled={selectedMembers.length === 0}
              color="primary"
              onClick={() => {
                openConfirmDeleteDialog({
                  primary: `${wordLibrary?.delete ?? "刪除"}`,
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
                        memberList: selectedMembers?.reduce<any[]>((a, b) => {
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
                      setMemberTableCheckedAll(false);
                      mutate();
                      closeConfirmDeleteDialog();
                      setEachRowState({});
                      setMembersTableCheckedAll(false);
                    } catch (error) {
                      // eslint-disable-next-line no-console
                      apis.tools.createLog({
                        function: "deleteMembertargetModuleAuth: error",
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
      wordLibrary?.edit,
      wordLibrary?.delete,
      selectedMembers,
      deletable,
      openEditMemberPermissionDialog,
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

  const handleSavePermissions = async (permissions) => {
    try {
      if (!writable) {
        throw new Error("Pemission Error.");
      }
      if (memberTableCheckedAll) {
        if (editMemberPermissionDialogVariant === "create") {
          setIsSaving(true);
          await createMemberTargetModuleAuth({
            organizationId,
            filterObject: memberFilter,
            targetIdList: [targetId],
            serviceSubModuleList: permissions,
            serviceModuleValue,
          });
          setIsSaving(false);
          setMemberTableCheckedAll(false);
          mutate();
          closeEditMemberPermissionDialog();
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
          setMemberTableCheckedAll(false);
          mutate();
          closeEditMemberPermissionDialog();
        }
      } else if (editMemberPermissionDialogVariant === "create") {
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
        setMemberTableCheckedAll(false);
        mutate();
        closeEditMemberPermissionDialog();
      } else {
        setIsSaving(true);
        await createMemberTargetModuleAuth({
          organizationId,
          targetIdList: [targetId],
          memberList: selectedMembers?.reduce<any[]>((a, b) => {
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
          isSelected: membersTableCheckedAll ? undefined : 1,
          serviceModuleValue,
        });
        setIsSaving(false);
        setMemberTableCheckedAll(false);
        mutate();
        closeEditMemberPermissionDialog();
      }
    } catch (error) {
      setIsSaving(false);
    }
  };

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
              data={data?.source ?? []}
              enableRowCheckbox={deletable || writable}
              onEachRowStateChange={(state) => {
                setEachRowState(state);
              }}
              isEmpty={!data}
              serverSide
              loading={isValidating}
              onCheckedAllClick={() => {
                setMembersTableCheckedAll(true);
              }}
              onCheckedAllClearClick={() => {
                setMembersTableCheckedAll(false);
              }}
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
              setEditMemberPermissionDialogVariant("create");
              openEditMemberPermissionDialog();
            }}
          />
          <EditMemberPermissionDialog
            defaultPermissions={defaultPermissionsForSelectedMembers}
            variant={editMemberPermissionDialogVariant}
            onPrevStep={() => {
              openMemberListDialog();
            }}
            onSave={handleSavePermissions}
            isSaving={isSaving}
            serviceModuleValue={serviceModuleValue}
          />
        </>
      )}
      {!readable && <UnModuleAuthorized />}
    </>
  );
};

export default MemberTargetPermissionTable;
