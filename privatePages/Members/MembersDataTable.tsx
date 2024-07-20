import React, { useCallback, useMemo, useState } from "react";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import getDispositionFileName from "@eGroupAI/utils/getDispositionFileName";
import { OrganizationMember } from "@eGroupAI/typings/apis";
import apis from "utils/apis";
import useOrgMemberFilterSearch from "@eGroupAI/hooks/apis/useOrgMemberFilterSearch";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import FileSaver from "file-saver";
import {
  useDataTable,
  EachRowState,
} from "@eGroupAI/material-module/DataTable";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import useCheckOrgOwner from "@eGroupAI/hooks/apis/useCheckOrgOwner";

import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import Paper from "@eGroupAI/material/Paper";
import TableCell from "@eGroupAI/material/TableCell";
import Tooltip from "@eGroupAI/material/Tooltip";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import I18nDataTable from "components/I18nDataTable";
import { IconButton } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";

import { getGlobalLocale } from "components/PrivateLayout/selectors";
import { DeleteOrgMemberApiPayload } from "interfaces/payloads";
import PermissionValid from "components/PermissionValid";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import { ServiceModuleValue, Table } from "interfaces/utils";
import { TableRowProps } from "@eGroupAI/material/TableRow";
import { SNACKBAR as GLOBAL_SNACKBAR } from "components/App";
import OrgMemberRoleEditDialog, {
  DIALOG as ROLE_DIALOG,
} from "./OrgMemberRoleEditDialog";
import MemberDialog from "./MemberDialog";
import OrgMemberGroupEditDialog, {
  DIALOG as GROUP_DIALOG,
} from "./OrgMemberGroupEditDialog";

const MembersDataTable = function () {
  const organizationId = useSelector(getSelectedOrgId);
  const [selectedOrgMember, setSelectedOrgMember] =
    useState<OrganizationMember>();
  const [checkedAll, setCheckedAll] = useState(false);

  const {
    handleChangePage,
    handleRowsPerPageChange,
    handleSearchChange,
    handleSelectFilterView,
    handleFilterValuesChange,
    handleFilterValuesSubmit,
    handleFilterValuesClear,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload,

    page,
    rowsPerPage,
  } = useDataTable(
    `HrmMembersDataTable-${organizationId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );
  const {
    columns,
    filterConditionGroups,
    isFilterConditionGroupsValidating,
    filterSearch,
    handleFilterSubmit,
    handleFilterClear,
  } = useDataTableFilterColumns(
    Table.MEMBERS,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );
  const { data, mutate, isValidating } = useOrgMemberFilterSearch(
    {
      organizationId,
    },
    filterSearch,
    undefined,
    undefined,
    !filterSearch
  );

  const { orgOwnerLoginId } = useCheckOrgOwner();
  const locale = useSelector(getGlobalLocale);
  const [deleteState, setDeleteState] = useState<boolean>(false);
  const wordLibrary = useSelector(getWordLibrary);

  const { excute: deleteOrgMember } = useAxiosApiWrapper(
    apis.org.deleteOrgMember,
    "Delete"
  );
  const { excute: updateMemberRole, isLoading: isMemberRoleUpdating } =
    useAxiosApiWrapper(apis.org.updateMemberRole, "Update");
  const { excute: updateMemberGroup, isLoading: isMemberGroupUpdating } =
    useAxiosApiWrapper(apis.org.updateMemberGroup, "Update");

  const { excute: exportOrgMembersExcel } = useAxiosApiWrapper(
    apis.org.exportOrgMembersExcel,
    "Create"
  );

  const { excute: exportSelectedOrgMembersExcel } = useAxiosApiWrapper(
    apis.org.exportSelectedOrgMembersExcel,
    "Create"
  );

  const { openDialog: openRoleDialog, closeDialog: closeRoleDialog } =
    useReduxDialog(ROLE_DIALOG);

  const { openDialog: openGroupDialog, closeDialog: closeGroupDialog } =
    useReduxDialog(GROUP_DIALOG);

  const { openSnackbar, closeSnackbar } =
    useReduxSnackbar<SnackbarProps>(GLOBAL_SNACKBAR);

  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

  const [eachRowState, setEachRowState] = useState<
    EachRowState<
      OrganizationMember & {
        TableRowProps: TableRowProps;
      }
    >
  >({});

  const handleCheckedAllClick = useCallback(() => {
    setCheckedAll(true);
  }, []);

  const handleCheckedAllClearClick = useCallback(() => {
    setCheckedAll(false);
  }, []);

  const selectedOrgMembers = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => el?.checked)
        .map((el) => {
          const { TableRowProps: trp, ...other } = el?.data || {};
          return other as OrganizationMember;
        }),
    [eachRowState]
  );

  const handleDisableToolClick = useCallback(() => {
    if (selectedOrgMembers.length === 0) {
      openSnackbar({
        message: "請勾選資料",
        severity: "warning",
      });
    }
  }, [openSnackbar, selectedOrgMembers.length]);

  const handleExportExcel = useCallback(() => {
    const messageKey = "please wait";
    if (checkedAll && filterSearch) {
      openSnackbar({
        message: wordLibrary?.[messageKey] ?? "請稍後",
        severity: "warning",
        autoHideDuration: null,
      });
      exportOrgMembersExcel({
        organizationId,
        locale,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        filterObject: filterSearch,
      })
        .then((res) => {
          const filename = getDispositionFileName(
            res.headers["content-disposition"] as string
          );
          FileSaver.saveAs(res.data, filename);
        })
        .finally(() => {
          closeSnackbar({
            autoHideDuration: 4000,
          });
        })
        .catch((err) => {
          apis.tools.createLog({
            function: "DatePicker: handleExportExcel",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: err,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
          });
        });
    } else if (!checkedAll && selectedOrgMembers.length > 0) {
      openSnackbar({
        message: wordLibrary?.[messageKey] ?? "請稍後",
        severity: "warning",
        autoHideDuration: null,
      });
      exportSelectedOrgMembersExcel({
        organizationId,
        locale,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        orgMemberIdList: selectedOrgMembers.map(
          (selectedOrgMember) =>
            ({
              organizationId,
              loginId: selectedOrgMember.loginId,
            } as DeleteOrgMemberApiPayload)
        ),
      })
        .then((res) => {
          const filename = getDispositionFileName(
            res.headers["content-disposition"] as string
          );
          FileSaver.saveAs(res.data, filename);
        })
        .finally(() => {
          closeSnackbar({
            message: wordLibrary?.success ?? "成功",
            autoHideDuration: 4000,
          });
        })
        .catch((err) => {
          apis.tools.createLog({
            function: "DatePicker: handleExportExcel",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: err,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
          });
        });
    }
  }, [
    checkedAll,
    filterSearch,
    selectedOrgMembers,
    openSnackbar,
    wordLibrary,
    exportOrgMembersExcel,
    organizationId,
    locale,
    closeSnackbar,
    exportSelectedOrgMembersExcel,
  ]);

  const selectedToolsbar = useMemo(
    () => (
      <>
        {selectedOrgMembers.length === 1 && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["DELETE_ALL"]}>
            <Tooltip title={wordLibrary?.delete ?? "刪除"}>
              <IconButton
                id="table-selected-tools-delete-btn"
                data-tid="table-selected-tools-delete-btn"
                color="primary"
                onClick={() => {
                  openConfirmDeleteDialog({
                    primary: `確定移除${selectedOrgMembers[0]?.member?.memberName}嗎？`,
                    deletableName: selectedOrgMembers[0]?.member?.memberName,
                    onConfirm: async () => {
                      if (organizationId) {
                        try {
                          await deleteOrgMember({
                            organizationId,
                            loginId:
                              selectedOrgMembers[0]?.member?.loginId ?? "",
                          }).then(() => {
                            mutate();
                            setDeleteState(true);
                            closeConfirmDeleteDialog();
                          });
                        } catch (error) {
                          apis.tools.createLog({
                            function: "DatePicker: openConfirmDeleteDialog",
                            browserDescription: window.navigator.userAgent,
                            jsonData: {
                              data: error,
                              deviceInfo: getDeviceInfo(),
                            },
                            level: "ERROR",
                          });
                        }
                      }
                    },
                  });
                }}
              >
                <Iconify icon="solar:trash-bin-trash-bold" width={24} />
              </IconButton>
            </Tooltip>
          </PermissionValid>
        )}
        {(checkedAll || selectedOrgMembers.length !== 0) && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
            <Tooltip title={wordLibrary?.download ?? "下載"}>
              <div
                id="table-selected-tools-disable-btn"
                data-tid="table-selected-tools-disable-btn"
                onClick={handleDisableToolClick}
                onKeyPress={handleDisableToolClick}
                role="button"
                tabIndex={-1}
              >
                <IconButton
                  id="table-selected-tools-export-btn"
                  data-tid="table-selected-tools-export-btn"
                  onClick={handleExportExcel}
                  disabled={
                    !checkedAll && selectedOrgMembers.length === 0
                    // ||
                    // (checkedAll && data?.total === excludedTargetIdList.length)
                  }
                  color="primary"
                >
                  <Iconify icon="uil:file-download" width={24} />
                </IconButton>
              </div>
            </Tooltip>
          </PermissionValid>
        )}
      </>
    ),
    [
      closeConfirmDeleteDialog,
      deleteOrgMember,
      mutate,
      openConfirmDeleteDialog,
      organizationId,
      selectedOrgMembers,
      wordLibrary,
      checkedAll,
      handleDisableToolClick,
      handleExportExcel,
    ]
  );

  const handleEditMemberRolesSubmit = async (values?: string[]) => {
    if (values && organizationId && selectedOrgMember) {
      try {
        updateMemberRole({
          organizationId,
          loginId: selectedOrgMember.member.loginId,
          organizationMemberRoleSet: values,
        })
          .then(() => {
            mutate();
          })
          .catch((err) => {
            apis.tools.createLog({
              function: "DatePicker: handleEditMemberRolesSubmit",
              browserDescription: window.navigator.userAgent,
              jsonData: {
                data: err,
                deviceInfo: getDeviceInfo(),
              },
              level: "ERROR",
            });
          });
        closeRoleDialog();
      } catch (error) {
        apis.tools.createLog({
          function: "DatePicker: handleEditMemberRolesSubmit",
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

  const handleEditMemberGroupsSubmit = async (values?: string[]) => {
    if (values && organizationId && selectedOrgMember) {
      try {
        updateMemberGroup({
          organizationId,
          loginId: selectedOrgMember.member.loginId,
          organizationMemberGroupSet: values,
        })
          .then(() => {
            mutate();
          })
          .catch((err) => {
            apis.tools.createLog({
              function: "DatePicker: handleEditMemberGroupsSubmit",
              browserDescription: window.navigator.userAgent,
              jsonData: {
                data: err,
                deviceInfo: getDeviceInfo(),
              },
              level: "ERROR",
            });
          });
        closeGroupDialog();
      } catch (error) {
        apis.tools.createLog({
          function: "DatePicker: handleEditMemberGroupsSubmit",
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

  const tableData = useMemo(
    () =>
      
      !data
        ? []
        : data.source.map((el) => ({
            ...el,
            ...el.member,
            TableRowProps: {
              hover: true,
              sx: { cursor: "pointer" },
              onClick: (e) => {
                e.stopPropagation();
                window.open(`/me/members/list/${el.member.loginId}`, "_blank");
              },
              DataTableRowCheckboxProps: {
                onClick: (e) => {
                  e.stopPropagation();
                },
              },
            },
          })),

    [data]
  );

  return (
    <>
      <OrgMemberRoleEditDialog
        loginId={selectedOrgMember?.member.loginId}
        memberName={selectedOrgMember?.member.memberName}
        onSubmit={handleEditMemberRolesSubmit}
        loading={isMemberRoleUpdating}
      />
      <OrgMemberGroupEditDialog
        loginId={selectedOrgMember?.member.loginId}
        onSubmit={handleEditMemberGroupsSubmit}
        loading={isMemberGroupUpdating}
      />
      <MemberDialog orgMember={selectedOrgMember} />
      <Paper>
        <I18nDataTable
          rowKey="member.loginId"
          columns={[
            ...columns,
            {
              id: "roles",
              name: wordLibrary?.role ?? "角色",
              render: (orgMember) => (
                <TableCell key="roles">
                  {orgMember.organizationRoleList
                    ? orgMember.organizationRoleList
                        .map((el) => el.organizationRoleNameZh)
                        .join(", ")
                    : "無角色"}
                  {orgMember.member.loginId !== orgOwnerLoginId && (
                    <PermissionValid
                      shouldBeOrgOwner
                      modulePermissions={["UPDATE_ALL"]}
                    >
                      <Tooltip title={wordLibrary?.edit ?? "編輯"}>
                        <IconButton
                          id="table-row-action-tools-updateAll-btn"
                          data-tid="table-row-action-tools-updateAll-btn"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openRoleDialog();
                            setSelectedOrgMember(orgMember);
                          }}
                        >
                          <Iconify icon="solar:pen-bold" width={24} />
                        </IconButton>
                      </Tooltip>
                    </PermissionValid>
                  )}
                </TableCell>
              ),
            },
            {
              id: "groups",
              name: wordLibrary?.["organization group"] ?? "單位群組",
              render: (orgMember) => (
                <TableCell key="groups">
                  {orgMember.organizationGroupList
                    ? orgMember.organizationGroupList
                        .map((el) => el.organizationGroupName)
                        .join(", ")
                    : "尚未指定"}
                  {orgMember.member.loginId !== orgOwnerLoginId && (
                    <PermissionValid
                      shouldBeOrgOwner
                      modulePermissions={["UPDATE_ALL"]}
                    >
                      <Tooltip title={wordLibrary?.edit ?? "編輯"}>
                        <IconButton
                          id="table-row-action-tools-update-btn"
                          data-tid="table-row-action-tools-update-button"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openGroupDialog();
                            setSelectedOrgMember(orgMember);
                          }}
                        >
                          <Iconify icon="solar:pen-bold" width={24} />
                        </IconButton>
                      </Tooltip>
                    </PermissionValid>
                  )}
                </TableCell>
              ),
            },
          ]}
          data={tableData}
          isEmpty={data?.total === 0}
          serverSide
          loading={
            isValidating || isFilterConditionGroupsValidating || !filterSearch
          }
          enableRowCheckbox
          selectedToolsbar={selectedToolsbar}
          enableSelectColumn
          payload={payload}
          serviceModuleValue={ServiceModuleValue.HRM_MEMBERS}
          onFilterViewSelect={handleSelectFilterView}
          enableFilter
          filterConditionGroups={filterConditionGroups}
          onFilterValuesChange={handleFilterValuesChange}
          onFilterValuesSubmit={handleFilterValuesSubmit}
          onFilterValuesClear={handleFilterValuesClear}
          filterValues={payload.filterValues}
          onSortLabelClick={(sortKey, order) => {
            setPayload((p) => ({
              ...p,
              sort: {
                sortKey,
                order: order.toUpperCase(),
              },
            }));
          }}
          MuiTablePaginationProps={{
            count: data?.total ?? 0,
            page,
            rowsPerPage,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
          FilterDropDownProps={{
            onSubmit: handleFilterSubmit,
            onClear: handleFilterClear,
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
          defaultColumnIds={["1", "2", "3", "4", "5", "roles", "groups"]}
          onEachRowStateChange={(state) => {
            setEachRowState(state);
          }}
          deleteState={deleteState}
          setDeleteState={setDeleteState}
          onCheckedAllClick={handleCheckedAllClick}
          onCheckedAllClearClick={handleCheckedAllClearClick}
        />
      </Paper>
    </>
  );
};

export default MembersDataTable;
