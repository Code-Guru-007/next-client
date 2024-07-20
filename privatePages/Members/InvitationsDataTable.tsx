import { useMemo, useState } from "react";
import PermissionValid from "components/PermissionValid";
import { useSelector } from "react-redux";
import { AxiosError } from "axios";
import { format as formatDate } from "@eGroupAI/utils/dateUtils";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { Button, IconButton, Typography } from "@mui/material";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import apis from "utils/apis";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import { DIALOG as ALERT_DIALOG, SNACKBAR } from "components/App";
import { DIALOG as CONFIRM_DIALOG } from "components/ConfirmDialog";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { OrganizationInvitation } from "interfaces/entities";

import Tooltip from "@eGroupAI/material/Tooltip";
import Paper from "@eGroupAI/material/Paper";
import Box from "@eGroupAI/material/Box";
import TableCell from "@eGroupAI/material/TableCell";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import Iconify from "minimal/components/iconify/iconify";

import I18nDataTable from "components/I18nDataTable";
import {
  EachRowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import useOrgInvitations from "utils/useOrgInvitations";
import {
  OrganizationInvitationStatus,
  OrganizationInvitationStatusMap,
} from "interfaces/utils";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import SearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import { TableRowProps } from "@eGroupAI/material/TableRow";
import InvitateMemberDialog, { DIALOG } from "./InvitateMemberDialog";

const InvitationsDataTable = function () {
  const organizationId = useSelector(getSelectedOrgId);
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);
  const { openDialog: openInvitateDialog, closeDialog: closeInvitateDialog } =
    useReduxDialog(DIALOG);
  const { openDialog: openAlertDialog } = useReduxDialog(ALERT_DIALOG);
  const { openDialog: openConfirmDialog, closeDialog: closeConfirmDialog } =
    useReduxDialog(CONFIRM_DIALOG);
  const { openSnackbar, closeSnackbar } =
    useReduxSnackbar<SnackbarProps>(SNACKBAR);
  const {
    handleChangePage,
    handleSearchChange,
    handleRowsPerPageChange,
    payload,

    page,
    rowsPerPage,
  } = useDataTable(
    `HrmMemberInvitationsDataTable-${organizationId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );
  const { data, mutate, isValidating } = useOrgInvitations(
    {
      organizationId,
    },
    payload
  );
  const { excute: deleteOrgInvitation } = useAxiosApiWrapper(
    apis.org.deleteOrgInvitation,
    "Delete"
  );
  const { excute: createOrgInvitation, isLoading } = useAxiosApiWrapper(
    apis.org.createOrgInvitation,
    "Create"
  );
  const { excute: resendInvitations, isLoading: isResending } =
    useAxiosApiWrapper(apis.org.resendInvitations, "None");

  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [eachRowState, setEachRowState] = useState<
    EachRowState<
      OrganizationInvitation & {
        TableRowProps: TableRowProps;
      }
    >
  >({});
  const [checkedAll] = useState(false);
  const wordLibrary = useSelector(getWordLibrary);
  const selectedInvites = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => el?.checked)
        .map((el) => {
          const { TableRowProps: trp, ...other } = el?.data || {};
          return other as OrganizationInvitation;
        }),
    [eachRowState]
  );

  const buttonTools = (
    <PermissionValid shouldBeOrgOwner modulePermissions={["CREATE"]}>
      <Button
        id="invite-open-button"
        data-tid="invite-open-button"
        onClick={openInvitateDialog}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
      >
        {wordLibrary?.add ?? "新增"}
      </Button>
    </PermissionValid>
  );

  const selectedToolsbar = useMemo(
    () => (
      <>
        {(checkedAll || selectedInvites.length === 1) && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["DELETE_ALL"]}>
            <Tooltip title={wordLibrary?.delete ?? "刪除"}>
            <IconButton
                id="confirm-delete-button"
                data-tid="confirm-delete-button"
                onClick={() => {
                  openConfirmDeleteDialog({
                    primary: "您確定要刪除嗎？",
                    onConfirm: async () => {
                      try {
                        await deleteOrgInvitation({
                          organizationId,
                          organizationInvitationId: selectedInvites[0]
                            ?.organizationInvitationId as string,
                        });
                        setDeleteState(true);
                        mutate();
                        closeConfirmDeleteDialog();
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
                    },
                  });
                }}
                color="primary"
              >
                <Iconify icon="solar:trash-bin-trash-bold" width={24} />
              </IconButton>
            </Tooltip>
          </PermissionValid>
        )}
        {selectedInvites.filter(
          (inv) =>
            inv.organizationInvitationStatus !==
            OrganizationInvitationStatus.INVITATION_EXPIRED
        ).length === 0 && (
          <Tooltip title={wordLibrary?.["re-invite"] ?? "重新邀請"}>
            <IconButton
              id="invite-list-icon-btn"
              data-tid="invite-list-icon-btn"
              onClick={() => {
                const organizationInvitationList = selectedInvites.map(
                  (inv) => ({
                    organizationInvitationId: inv.organizationInvitationId,
                  })
                );
                openConfirmDialog({
                  primary: `您確定要批量重新邀請${organizationInvitationList.length}位使用者嗎？`,
                  onConfirm: async () => {
                    try {
                      closeConfirmDialog();
                      openSnackbar({
                        message: wordLibrary?.["please wait"] ?? "請稍後",
                        severity: "warning",
                        autoHideDuration: 999999,
                      });
                      await resendInvitations({
                        organizationId,
                        organizationInvitationList,
                      });
                      closeSnackbar();
                      openSnackbar({
                        message:
                          wordLibrary?.["re-invite success"] ?? "重新邀請成功",
                        severity: "success",
                      });
                      mutate();
                    } catch (error) {
                      apis.tools.createLog({
                        function: "resendInvitations: error",
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
              color="primary"
            >
              <Iconify
                icon="material-symbols:forward-to-inbox-rounded"
                width={24}
              />
            </IconButton>
          </Tooltip>
        )}
      </>
    ),
    [
      checkedAll,
      closeConfirmDeleteDialog,
      closeConfirmDialog,
      closeSnackbar,
      deleteOrgInvitation,
      mutate,
      openConfirmDeleteDialog,
      openConfirmDialog,
      openSnackbar,
      organizationId,
      resendInvitations,
      selectedInvites,
      wordLibrary,
    ]
  );

  return (
    <>
      <InvitateMemberDialog
        loading={isLoading}
        organizationId={organizationId}
        onSubmit={async (values) => {
          try {
            await createOrgInvitation({
              organizationId,
              organizationInvitationEmailList:
                values.organizationInvitationEmailList,
              organizationMemberRoleSet: values.organizationMemberRoleSet,
            });
            closeInvitateDialog();
            mutate();
          } catch (err) {
            const error = err as AxiosError;
            if (error.response?.status === 409) {
              openAlertDialog({
                variant: "confirm",
                title: "Email 已存在",
                message: "此 Email 已存在，請使用不同 Email",
              });
            }
          }
        }}
      />
      <Box display="flex" mb={1} alignItems="center">
        <Box flexGrow={1} />
      </Box>
      <Paper>
        <I18nDataTable
          columns={[
            {
              id: "organizationInvitationEmail",
              name: "邀請Email",
              dataKey: "organizationInvitationEmail",
            },
            {
              id: "organizationInvitationStatus",
              name: "邀請狀態",
              dataKey: "organizationInvitationStatus",
              format: (val) =>
                val
                  ? OrganizationInvitationStatusMap[val as string]
                  : undefined,
            },
            {
              id: "organizationInvitationCreateDate",
              name: "建立時間",
              dataKey: "organizationInvitationCreateDate",
              format: (val) => formatDate(val as string, "PP pp"),
            },
            {
              id: "copy",
              name: "邀請連結",
              render: (orgInvitation) => (
                <TableCell key="copy">
                  {orgInvitation.organizationInvitationStatus === 5 ? (
                    <Typography>
                      {wordLibrary?.["link has expired,please re-invite"] ??
                        "連結已失效，請重新邀請"}
                    </Typography>
                  ) : (
                    <Box display="flex" alignItems="center">
                      <Tooltip
                        title={
                          wordLibrary?.["copy invitation link"] ??
                          "複製邀請連結"
                        }
                      >
                        <IconButton
                          id="invite-list-icon-btn"
                          data-tid="invite-list-icon-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `https://${window.location.host}/org-invitation?orgId=${orgInvitation.organization.organizationId}&token=${orgInvitation.organizationInvitationToken}`
                            );
                            openSnackbar({
                              message:
                                wordLibrary?.["copy successful"] ?? "複製成功",
                              severity: "success",
                            });
                          }}
                        >
                          <Iconify icon="mdi:link" width={24} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </TableCell>
              ),
            },
            {
              id: "action",
              name: wordLibrary?.action ?? "操作",
              render: (orgInvitation: OrganizationInvitation) => (
                <TableCell key="action">
                  {orgInvitation.organizationInvitationStatus ===
                    OrganizationInvitationStatus.INVITATION_EXPIRED && (
                    <Button
                      id="open-snackbar-button"
                      data-tid="open-snakcbar-button"
                      variant="contained"
                      color="primary"
                      onClick={async () => {
                        try {
                          openSnackbar({
                            message: wordLibrary?.["please wait"] ?? "請稍後",
                            severity: "warning",
                            autoHideDuration: 999999,
                          });
                          await resendInvitations({
                            organizationId,
                            organizationInvitationList: [
                              {
                                organizationInvitationId:
                                  orgInvitation.organizationInvitationId,
                              },
                            ],
                          });
                          closeSnackbar();
                          openSnackbar({
                            message:
                              wordLibrary?.["re-invite successful"] ??
                              "重新邀請成功",
                            severity: "success",
                          });
                          mutate();
                        } catch (error) {
                          apis.tools.createLog({
                            function: "resendInvitations: error",
                            browserDescription: window.navigator.userAgent,
                            jsonData: {
                              data: error,
                              deviceInfo: getDeviceInfo(),
                            },
                            level: "ERROR",
                          });
                        }
                      }}
                    >
                      {wordLibrary?.["re-invite"] ?? "重新邀請"}
                    </Button>
                  )}
                </TableCell>
              ),
            },
          ]}
          data={!data ? [] : data.source}
          rowKey="organizationInvitationId"
          isEmpty={data?.total === 0}
          serverSide
          enableRowCheckbox
          onEachRowStateChange={(state) => {
            setEachRowState(state);
          }}
          searchBar={
            <SearchBar
              handleSearchChange={handleSearchChange}
              value={payload.query}
              placeholder={
                wordLibrary?.["search and press Enter"] ?? "搜尋並按Enter"
              }
            />
          }
          loading={isValidating || isResending}
          MuiTablePaginationProps={{
            count: data?.total ?? 0,
            page,
            rowsPerPage,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
          buttonTools={buttonTools}
          selectedToolsbar={selectedToolsbar}
          deleteState={deleteState}
          setDeleteState={setDeleteState}
        />
      </Paper>
    </>
  );
};

export default InvitationsDataTable;