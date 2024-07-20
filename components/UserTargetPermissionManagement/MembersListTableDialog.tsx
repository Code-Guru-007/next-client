import React, { FC, useCallback, useState, useMemo } from "react";
import { useSelector } from "react-redux";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import useOrgMemberFilterSearch from "@eGroupAI/hooks/apis/useOrgMemberFilterSearch";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import {
  EachRowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@eGroupAI/material/DialogActions";
import Dialog from "@eGroupAI/material/Dialog";
import { Box } from "@eGroupAI/material";
import TableCell from "@eGroupAI/material/TableCell";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import { OrganizationMember, FilterSearch } from "@eGroupAI/typings/apis";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import I18nDataTable from "components/I18nDataTable";
import DialogConfirmButton from "components/DialogConfirmButton";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogCloseButton from "components/DialogCloseButton/DialogCloseButton";

import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import { Table } from "interfaces/utils";
import { MemberLoginId } from "interfaces/entities";

export const DIALOG = "MembersListTableDialog";

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

const MembersListTableDialog: FC<Props> = function (props) {
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
    "AddMembersListDataTable",
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
    filterSearch,
    undefined,
    undefined,
    !filterSearch
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
      data
        ? data.source.map((el) => ({
            ...el,
            ...el.member,
          }))
        : [],
    [data]
  );

  return (
    <Dialog
      sx={{
        "& .MuiDialog-paper": {
          height: "calc(100% - 64px)",
        },
      }}
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
      <DialogTitle onClickClose={closeDialog} />
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
          searchBar={
            <StyledSearchBar
              handleSearchChange={handleSearchChange}
              value={payload.query}
              placeholder={
                wordLibrary?.["search and press Enter"] ?? "搜尋並按Enter"
              }
            />
          }
          columns={[
            {
              id: "1",
              name: wordLibrary?.["full name"] ?? "姓名",
              sortKey: "memberName",
              dataKey: "memberName",
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
          TableContainerProps={{
            sx: {
              minHeight: 580,
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <DialogCloseButton sx={{ mr: 1 }} onClick={closeDialog} />
        <Box flexGrow={1} />
        <DialogConfirmButton
          sx={{ ml: 1 }}
          onClick={handleNext}
          disabled={selectedUsers.length === 0}
          id="dialog-next-step-button"
          data-tid="dialog-next-step-button"
        >
          {wordLibrary?.["next step"] ?? "下一步"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default MembersListTableDialog;
