import React, { FC, useMemo, useState } from "react";
import I18nDataTable from "components/I18nDataTable";
import {
  EachRowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";

import { useSelector } from "react-redux";

import { GenderMap } from "interfaces/utils";
import { Member } from "@eGroupAI/typings/apis";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { OrganizationEvent, OrganizationUser } from "interfaces/entities";

import { Button, IconButton, Paper, Tooltip } from "@mui/material";
import EditSection from "components/EditSection";

import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import SelectUsersDialog, { DIALOG } from "components/SelectUsersDialog";
import { makeStyles } from "@mui/styles";
import Iconify from "minimal/components/iconify/iconify";

const useStyles = makeStyles(() => ({
  editSectionContainer: {
    padding: 0,
    borderRadius: 0,
    boxShadow: "none",
  },
  sectionHeader: {
    margin: "10px 20px 0",
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  showLoader: {
    display: "flex",
  },
  lightOpacity: {
    background: "rgba(255,255,255,0.6)",
  },
  darkOpacity: {
    background: "rgba(33, 43, 54, 0.6)",
  },
}));

export interface EventUserTableProps {
  data?: OrganizationEvent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdateEvent?: (values: { [key: string]: any }) => void;
  loading?: boolean;
  writable?: boolean;
  deletable?: boolean;
  readable?: boolean;
}

const EventUserTable: FC<EventUserTableProps> = (props) => {
  const {
    data,
    onUpdateEvent,
    loading,
    writable = false,
    deletable = false,
    // readable = false
  } = props;

  const classes = useStyles();
  const wordLibrary = useSelector(getWordLibrary);
  const [deleteState, setDeleteState] = useState<boolean>(false);
  const { openDialog } = useReduxDialog(DIALOG);
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDialog,
  } = useReduxDialog(DELETE_DIALOG);

  const orgUserList = useMemo(() => data?.organizationUserList || [], [data]);

  const tableData = useMemo(
    () =>
      orgUserList.map((el) => ({
        ...el,
        TableRowProps: {
          hover: true,
          sx: { cursor: "pointer" },
          onClick: (e) => {
            e.stopPropagation();
            window.open(`/me/crm/users/${el.organizationUserId}`, "_blank");
          },
        },
      })),
    [orgUserList]
  );

  const { page, rowsPerPage, handleChangePage, handleRowsPerPageChange } =
    useDataTable(
      `EventUsersDataTable-${data?.organizationEventId}`,
      {},
      {
        fromKey: "startIndex",
        enableLocalStorageCache: true,
      }
    );

  const [eachRowState, setEachRowState] = useState<
    EachRowState<OrganizationUser & { updaterMember: Member }>
  >({});

  const selectedUsers = useMemo(
    () => Object.values(eachRowState).filter((el) => el?.checked) || [],
    [eachRowState]
  );

  const targetIdList = useMemo(
    () => selectedUsers.map((user) => user?.data?.organizationUserId) || [],
    [selectedUsers]
  );

  const handleAddNewUser = (userList) => {
    const defaultUserIdList = orgUserList.map((el) => el.organizationUserId);
    const userIdList = userList.map((el) => el.organizationUserId);
    const addedUserIdList = userList
      .filter((user) => !defaultUserIdList?.includes(user.organizationUserId))
      .map((el) => ({
        organizationUserId: el.organizationUserId,
      }));
    const removedUserIdList = orgUserList
      ?.filter((user) => !userIdList?.includes(user.organizationUserId))
      .map((el) => ({
        organizationUserId: el.organizationUserId,
      }));
    if (onUpdateEvent) {
      onUpdateEvent({
        organizationUserList: addedUserIdList,
        removeOrganizationUserList: removedUserIdList,
      });
    }
  };

  const buttonTools = writable && (
    <Button
      onClick={openDialog}
      variant="contained"
      startIcon={<Iconify icon="mingcute:add-line" />}
    >
      {wordLibrary?.add ?? "新增"}
    </Button>
  );

  const selectedToolsbar = (
    <>
      {deletable && targetIdList.length > 0 && (
        <Tooltip title={wordLibrary?.delete ?? "刪除"}>
          <IconButton
            onClick={() => {
              openConfirmDeleteDialog({
                primary: "您確定要刪除此關聯?",
                onConfirm: async () => {
                  if (data) {
                    const removeIdList = targetIdList.map((id) => ({
                      organizationUserId: id,
                    }));
                    if (onUpdateEvent) {
                      onUpdateEvent({
                        removeOrganizationUserList: removeIdList,
                      });
                      closeConfirmDialog();
                      setDeleteState(true);
                    }
                  }
                },
              });
            }}
            color="primary"
          >
            <Iconify icon="solar:trash-bin-trash-bold" width={24} />
          </IconButton>
        </Tooltip>
      )}
    </>
  );

  const columns = [
    {
      id: "organizationUserNameZh",
      name: `${wordLibrary?.["chinese name"] ?? "中文姓名"}`,
      dataKey: "organizationUserNameZh",
    },
    {
      id: "organizationUserNameEn",
      name: `${wordLibrary?.["english name"] ?? "英文姓名"}`,
      dataKey: "organizationUserNameEn",
    },
    {
      id: "organizationUserIdCardNumber",
      name: `${wordLibrary?.["id number"] ?? "身份證字號"}`,
      dataKey: "organizationUserIdCardNumber",
    },
    {
      id: "organizationUserEmail",
      name: `${wordLibrary?.email ?? "Email"}`,
      dataKey: "organizationUserEmail",
    },
    {
      id: "organizationUserGender",
      name: `${wordLibrary?.gender ?? "性別"}`,
      dataKey: "organizationUserGender",
      format: (val) => (val ? GenderMap[val] : undefined),
    },
    {
      id: "organizationUserPhone",
      name: `${wordLibrary?.phone ?? "電話"}`,
      dataKey: "organizationUserPhone",
    },
    {
      id: "organizationUserZIPCode",
      name: `${wordLibrary?.["postal code"] ?? "郵遞區號"}`,
      dataKey: "organizationUserZIPCode",
    },
    {
      id: "organizationUserCity",
      name: `${wordLibrary?.["county/city"] ?? "縣市"}`,
      dataKey: "organizationUserCity",
    },
    {
      id: "organizationUserArea",
      name: `${wordLibrary?.region ?? "地區"}`,
      dataKey: "organizationUserArea",
    },
    {
      id: "organizationUserAddress",
      name: `${wordLibrary?.address ?? "地址"} `,
      dataKey: "organizationUserAddress",
    },
    {
      id: "updater.memberName",
      name: `${wordLibrary?.updater ?? "更新者"} `,
      dataKey: "updater.memberName",
    },
  ];

  return (
    <EditSection className={classes.editSectionContainer}>
      <SelectUsersDialog
        defaultValue={orgUserList}
        onSubmit={handleAddNewUser}
        loading={loading}
      />
      <Paper>
        <I18nDataTable
          title="客戶"
          TitleTypographyProps={{ className: classes.sectionHeader }}
          rowKey="organizationUserNameZh"
          columns={columns}
          enableRowCheckbox
          data={tableData}
          buttonTools={buttonTools}
          selectedToolsbar={selectedToolsbar}
          onEachRowStateChange={(state) => setEachRowState(state)}
          isEmpty={orgUserList.length === 0}
          MuiTablePaginationProps={{
            count: orgUserList.length ?? 0,
            page,
            rowsPerPage,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
          deleteState={deleteState}
          setDeleteState={setDeleteState}
        />
      </Paper>
    </EditSection>
  );
};

export default EventUserTable;
