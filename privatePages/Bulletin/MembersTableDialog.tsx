import React, { FC, useCallback, useState, useMemo } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogActions from "@mui/material/DialogActions";
import useOrgMemberFilterSearch from "@eGroupAI/hooks/apis/useOrgMemberFilterSearch";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import {
  EachRowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import { useReduxDialog } from "@eGroupAI/redux-modules";

import DialogContent from "@eGroupAI/material/DialogContent";
import Dialog from "@eGroupAI/material/Dialog";

import TableCell from "@eGroupAI/material/TableCell";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import I18nDataTable from "components/I18nDataTable";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";

import { Table } from "interfaces/utils";
import { OrganizationMember, FilterSearch } from "@eGroupAI/typings/apis";
import { MemberLoginId } from "interfaces/entities";

export const DIALOG = "MembersTableDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

interface Props {
  onNext: (
    selectedList: OrganizationMember[],
    checkedAll: boolean,
    unselectedList: MemberLoginId[],
    filterObject?: FilterSearch
  ) => void;
}

const MembersTableDialog: FC<Props> = function (props) {
  const { onNext } = props;

  const classes = useStyles();
  const theme = useTheme();

  const organizationId = useSelector(getSelectedOrgId);

  const { closeDialog, isOpen } = useReduxDialog(DIALOG);

  const [checkedAll, setCheckedAll] = useState(false);

  const wordLibrary = useSelector(getWordLibrary);

  const [eachRowState, setEachRowState] = useState<
    EachRowState<OrganizationMember>
  >({});

  const {
    handleChangePage,
    handleRowsPerPageChange,
    handleSearchChange,
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
    "AddMembersDataTable",
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );

  const {
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

  const { data, isValidating } = useOrgMemberFilterSearch(
    {
      organizationId,
    },
    filterSearch
  );

  const handleCheckedAllClick = useCallback(() => {
    setCheckedAll(true);
  }, []);

  const handleCheckedAllClearClick = useCallback(() => {
    setCheckedAll(false);
  }, []);

  const [selectedUsers, unSelectedUsers] = useMemo(() => {
    const values = Object.values(eachRowState);
    const selected: OrganizationMember[] = [];
    const unSelected: OrganizationMember[] = [];
    for (let i = 0; i < values.length; i += 1) {
      const el = values[i];
      if (el && el.data) {
        if (el.checked) {
          selected.push(el.data);
        } else {
          unSelected.push(el.data);
        }
      }
    }
    return [selected, unSelected];
  }, [eachRowState]);

  const handleNext = () => {
    onNext(
      selectedUsers,
      checkedAll,
      unSelectedUsers.map((member) => ({
        loginId: member.member.loginId,
      })),
      filterSearch
    );
  };

  const tableData = useMemo(
    () =>
      data?.source.map((el) => ({
        ...el,
        ...el.member,
      })) || [],
    [data?.source]
  );

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      maxWidth="lg"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogContent>
        <I18nDataTable
          rowKey="member.loginId"
          data={tableData}
          enableRowCheckbox
          onEachRowStateChange={(state) => {
            setEachRowState(state);
          }}
          isEmpty={data?.total === 0}
          serverSide
          loading={
            isValidating || isFilterConditionGroupsValidating || !filterSearch
          }
          MuiTablePaginationProps={{
            count: data?.total ?? 0,
            page,
            rowsPerPage,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
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
          onCheckedAllClick={handleCheckedAllClick}
          onCheckedAllClearClick={handleCheckedAllClearClick}
          FilterDropDownProps={{
            onSubmit: handleFilterSubmit,
            onClear: handleFilterClear,
          }}
          SearchBarProps={{
            placeholder: wordLibrary?.search ?? "搜尋",
            onChange: handleSearchChange,
            defaultValue: payload.query,
          }}
          columns={[
            {
              id: "1",
              name: wordLibrary?.["full name"] ?? "姓名",
              sortKey: "memberName",
              dataKey: "memberName",
            },
            {
              id: "2",
              name: "聯絡電話",
              sortKey: "memberPhone",
              dataKey: "memberPhone",
            },
            {
              id: "3",
              name: "信箱",
              sortKey: "memberEmail",
              dataKey: "memberEmail",
            },
            {
              id: "4",
              name: wordLibrary?.["creation time"] ?? "建立時間",
              sortKey: "memberCreateDate",
              dataKey: "memberCreateDate",
            },
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
                </TableCell>
              ),
            },
          ]}
        />
      </DialogContent>
      <DialogActions>
        <DialogCloseButton onClick={closeDialog} />
        <DialogConfirmButton
          sx={{ ml: 1 }}
          onClick={handleNext}
          disabled={selectedUsers.length === 0}
        >
          {wordLibrary?.["next step"] ?? "下一步"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default MembersTableDialog;
