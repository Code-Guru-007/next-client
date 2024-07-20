import React, { FC, useMemo, useState } from "react";
import clsx from "clsx";
import I18nDataTable from "components/I18nDataTable";
import {
  EachRowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import useMemberOrgInfo from "utils/useMemberOrgInfo";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";

import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { Member, OrganizationMember } from "@eGroupAI/typings/apis";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import {
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Tooltip,
} from "@mui/material";
import EditSection from "components/EditSection";

import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import SelectMembersDialog, { DIALOG } from "components/SelectMembersDialog";
import { makeStyles } from "@mui/styles";
import { OrganizationEvent } from "interfaces/entities";
import Iconify from "minimal/components/iconify/iconify";
import { useSettingsContext } from "minimal/components/settings";

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

export interface EventMemberTableProps {
  /**
   * redux-store whole variable of Event Data
   */
  data?: OrganizationEvent;
  updater?: Member;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdateEvent?: (values: { [key: string]: any }) => void;
  loading?: boolean;
  writable?: boolean;
  deletable?: boolean;
  readable?: boolean;
}

const EventMemberTable: FC<EventMemberTableProps> = (props) => {
  const {
    data,
    onUpdateEvent,
    loading,
    writable = false,
    deletable = false,
    // readable = false
  } = props;

  const classes = useStyles();
  const settings = useSettingsContext();
  const organizationId = useSelector(getSelectedOrgId);
  const wordLibrary = useSelector(getWordLibrary);
  const { openDialog } = useReduxDialog(DIALOG);
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDialog,
  } = useReduxDialog(DELETE_DIALOG);

  const { data: memberOrgInfo } = useMemberOrgInfo({
    organizationId,
  });

  const orgMemberList = useMemo(
    () => data?.organizationMemberList || [],
    [data]
  );

  const { page, rowsPerPage, handleChangePage, handleRowsPerPageChange } =
    useDataTable(
      `EventMembersDataTable-${data?.organizationEventId}`,
      {},
      {
        fromKey: "startIndex",
        enableLocalStorageCache: true,
      }
    );

  const [deleteState, setDeleteState] = useState<boolean>(false);

  const [eachRowState, setEachRowState] = useState<
    EachRowState<OrganizationMember & { updater: Member }>
  >({});

  const selectedMembers = useMemo(
    () => Object.values(eachRowState).filter((el) => el?.checked) || [],
    [eachRowState]
  );

  const targetIdList = useMemo(
    () => selectedMembers.map((user) => user?.data?.member.loginId) || [],
    [selectedMembers]
  );

  const tableData = useMemo(
    () =>
      orgMemberList.map((el) => ({
        ...el,
        organization: memberOrgInfo,
        TableRowProps: {
          hover: true,
          sx: { cursor: "pointer" },
          onClick: (e) => {
            e.stopPropagation();
            window.open(`/me/members/list/${el.member.loginId}`, "_blank");
          },
        },
      })) || [],
    [memberOrgInfo, orgMemberList]
  );

  const handleAddOrgMember = (memberList) => {
    const defaultMemberIdList = orgMemberList.map((el) => el.member.loginId);
    const memberIdList = memberList.map((el) => el.member.loginId);
    const addedMemberIdList = memberList
      .filter((el) => !defaultMemberIdList?.includes(el.member.loginId))
      .map((el) => ({
        member: { loginId: el.member.loginId },
      }));
    const removedMemberIdList = orgMemberList
      ?.filter((el) => !memberIdList?.includes(el.member.loginId))
      .map((el) => ({
        member: { loginId: el.member.loginId },
      }));
    if (onUpdateEvent) {
      onUpdateEvent({
        organizationMemberList: addedMemberIdList,
        removeOrganizationMemberList: removedMemberIdList,
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
                    const removedMemberList = targetIdList.map((id) => ({
                      member: { loginId: id },
                    }));
                    if (onUpdateEvent) {
                      onUpdateEvent({
                        removeOrganizationMemberList: removedMemberList,
                      });
                      setDeleteState(true);
                      closeConfirmDialog();
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
      id: "member.memberName",
      name: "成員姓名",
      dataKey: "member.memberName",
    },
    {
      id: "member.memberEmail",
      name: "成員Email",
      dataKey: "member.memberEmail",
    },
  ];

  return (
    <EditSection className={classes.editSectionContainer}>
      <SelectMembersDialog
        defaultValue={orgMemberList}
        onSubmit={handleAddOrgMember}
        loading={loading}
      />
      <div
        className={clsx(classes.loader, loading && classes.showLoader, {
          [classes.lightOpacity]: settings.themeMode === "light",
          [classes.darkOpacity]: settings.themeMode !== "light",
        })}
      >
        <CircularProgress />
      </div>
      <Paper>
        <I18nDataTable
          serverSide
          title={wordLibrary?.["organization member"] ?? "單位成員"}
          TitleTypographyProps={{ className: classes.sectionHeader }}
          rowKey="member.loginId"
          columns={columns}
          enableRowCheckbox
          data={tableData}
          buttonTools={buttonTools}
          selectedToolsbar={selectedToolsbar}
          onEachRowStateChange={(state) => setEachRowState(state)}
          isEmpty={orgMemberList.length === 0}
          MuiTablePaginationProps={{
            count: orgMemberList.length ?? 0,
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

export default EventMemberTable;
