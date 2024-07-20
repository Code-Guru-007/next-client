import React, { FC, useState } from "react";

import { OrganizationMemberTargetAuth } from "interfaces/entities";
import { useDataTable } from "@eGroupAI/material-module/DataTable";
import apis from "utils/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { useSelector } from "react-redux";
import useOrgMemberTargetAuths from "utils/useOrgMemberTargetAuths";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SNACKBAR } from "components/App";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import I18nDataTable from "components/I18nDataTable";
import Dialog from "@eGroupAI/material/Dialog";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@eGroupAI/material/DialogActions";
import IconButton from "components/IconButton/StyledIconButton";
import TableCell from "@eGroupAI/material/TableCell";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ServiceModulePermissionMapping } from "@eGroupAI/typings/apis";
import DialogConfirmButton from "components/DialogConfirmButton";
import MemberTargetAuthEditDialog, {
  DIALOG as EDIT_DIALOG,
} from "./MemberTargetAuthEditDialog";

export const DIALOG = "MemberTargetAuthDialog";

export interface MemberTargetAuthProps {
  targetId?: string;
}

const MemberTargetAuthDialog: FC<MemberTargetAuthProps> = function (props) {
  const { targetId } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const wordLibrary = useSelector(getWordLibrary);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const { openDialog: openEditDialog } = useReduxDialog(EDIT_DIALOG);
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);
  const [deleteState, setDeleteState] = useState<boolean>(false);
  const {
    handleChangePage,
    handleRowsPerPageChange,
    payload,
    page,
    rowsPerPage,
  } = useDataTable(
    "MemberTargetAuthDialog",
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );
  const { data, isValidating, mutate } = useOrgMemberTargetAuths(
    {
      organizationId,
    },
    {
      ...payload,
      targetId,
    }
  );
  const [selectedAuth, setSelectedAuth] =
    useState<OrganizationMemberTargetAuth>();
  const { excute: deleteMemberTargetAuth } = useAxiosApiWrapper(
    apis.org.deleteMemberTargetAuth
  );
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

  return (
    <>
      <MemberTargetAuthEditDialog
        targetId={targetId}
        orgMemberTargetAuth={selectedAuth}
      />
      <Dialog open={isOpen} onClose={closeDialog} maxWidth="lg" fullWidth>
        <DialogTitle onClickClose={closeDialog}>指派權限</DialogTitle>
        <DialogContent>
          <I18nDataTable
            data={!data ? [] : data.source}
            rowKey="organizationMemberTargetAuthId"
            isEmpty={data?.total === 0}
            columns={[
              {
                id: "memberName",
                name: wordLibrary?.["full name"] ?? "姓名",
                dataKey: "member.memberName",
              },
              {
                id: "memberEmail",
                name: "Email",
                dataKey: "member.memberEmail",
              },
              {
                id: "organizationMemberTargetAuthPermission",
                name: wordLibrary?.permission ?? "權限",
                dataKey: "organizationMemberTargetAuthPermission",
                format: (val) =>
                  (val as string[])
                    .map((el) => ServiceModulePermissionMapping[el])
                    .join(", "),
              },
              {
                id: "action",
                name: `${wordLibrary?.edit ?? "編輯"}`,
                dataKey: "action",
                render: (el) => (
                  <TableCell key="action">
                    <IconButton
                      onClick={() => {
                        setSelectedAuth(el);
                        openEditDialog();
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        openConfirmDeleteDialog({
                          primary: `您確定要刪除${el.organizationMemberTargetAuthName}嗎？`,
                          onConfirm: async () => {
                            try {
                              if (organizationId) {
                                await deleteMemberTargetAuth({
                                  organizationId,
                                  organizationMemberTargetAuthId:
                                    el.organizationMemberTargetAuthId,
                                });
                                openSnackbar({
                                  message:
                                    wordLibrary?.["deletion successful"] ??
                                    "刪除成功",
                                  severity: "success",
                                });
                                setDeleteState(true);
                                closeConfirmDeleteDialog();
                                mutate();
                              }
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
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                ),
              },
            ]}
            serverSide
            loading={isValidating}
            MuiTablePaginationProps={{
              count: data?.total ?? 0,
              page,
              rowsPerPage,
              onPageChange: handleChangePage,
              onRowsPerPageChange: handleRowsPerPageChange,
            }}
            deleteState={deleteState}
            setDeleteState={setDeleteState}
          />
        </DialogContent>
        <DialogActions>
          <DialogConfirmButton
            onClick={() => {
              openEditDialog();
              setSelectedAuth(undefined);
            }}
          >
            {wordLibrary?.add ?? "新增"}
          </DialogConfirmButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MemberTargetAuthDialog;
