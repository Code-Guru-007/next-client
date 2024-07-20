import React, { FC, useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import Paper from "@eGroupAI/material/Paper";
import Tooltip from "@eGroupAI/material/Tooltip";
import SearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import {
  useDataTable,
  EachRowState,
} from "@eGroupAI/material-module/DataTable";
import { DefaultPayload } from "@eGroupAI/material-module/DataTable/useDataTable";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import I18nDataTable from "components/I18nDataTable";
import PermissionValid from "components/PermissionValid";
import TagDataTableRow from "components/TagDataTableRow";
import TagDialog, { DIALOG } from "components/TagDialog";
import { DIALOG as CONFIRM_DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import useModulePermissionValid from "components/PermissionValid/useModulePermissionValid";
import useOrgOwnerValid from "components/PermissionValid/useOrgOwnerValid";

import { getGlobalLocale } from "components/PrivateLayout/selectors";
import LocaleDropDown from "components/LocaleDropDown";
import { Table, Locale } from "interfaces/utils";
import { OrganizationTag } from "interfaces/entities";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import useOrgTagTableFilterSearch from "utils/useOrgTagTableFilterSearch";
import useOrgTagGroup from "utils/useOrgTagGroup";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import useBreadcrumb from "utils/useBreadcrumb";

import { Button, IconButton } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";

interface TagsDefaultPayload extends DefaultPayload {
  startIndex?: number;
}

interface Props {
  organizationId: string;
  tagGroupId: string;
}

const TagsDataTable: FC<Props> = function (props) {
  const { organizationId, tagGroupId } = props;
  const globalLocale = useSelector(getGlobalLocale);
  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [locale, setLocale] = useState<string>(globalLocale);
  const [eachRowState, setEachRowState] = useState<
    EachRowState<OrganizationTag>
  >({});
  const [selectedTag, setSelectedTag] = useState<OrganizationTag | null>(null);

  const wordLibrary = useSelector(getWordLibrary);

  const { hasModulePermission: addable } = useModulePermissionValid({
    modulePermissions: ["CREATE"],
  });
  const { hasModulePermission: editable } = useModulePermissionValid({
    modulePermissions: ["UPDATE_ALL"],
  });
  const isOrgOwner = useOrgOwnerValid(true);

  const { data: tagGroup } = useOrgTagGroup(
    {
      organizationId,
      tagGroupId,
    },
    {
      locale,
    }
  );
  useBreadcrumb(tagGroup?.tagGroupName || "");

  const { openDialog } = useReduxDialog(DIALOG);
  const { openDialog: openConfirmDialog, closeDialog: closeConfirmDialog } =
    useReduxDialog(CONFIRM_DELETE_DIALOG);
  const { excute: deleteTag } = useAxiosApiWrapper(
    apis.org.deleteTag,
    "Delete"
  );

  const {
    handleChangePage,
    handleRowsPerPageChange,
    handleSearchChange,
    handleFilterValuesChange,
    handleFilterValuesSubmit,
    handleFilterValuesClear,

    payload,
    setPayload,
    submitedPayload,
    setSubmitedPayload,
    page,
    rowsPerPage,
  } = useDataTable<TagsDefaultPayload>(
    `TagsDataTable-${tagGroupId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );

  const {
    columns,
    filterSearch,
    filterConditionGroups,
    isFilterConditionGroupsValidating,
    handleFilterSubmit,
    handleFilterClear,
  } = useDataTableFilterColumns(
    Table.TAGS,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );

  const { data, mutate, isValidating } = useOrgTagTableFilterSearch(
    {
      organizationId,
    },
    {
      ...filterSearch,
      locale: Locale[locale.toLocaleUpperCase()],
      equal: [
        {
          filterKey: "C24_2",
          value: [tagGroupId],
        },
      ],
    },
    undefined,
    undefined,
    !filterSearch
  );

  const selectedTags = useMemo(() => {
    const checkedRows = Object.values(eachRowState).filter((el) => el?.checked);
    if (checkedRows.length === 0) {
      return [];
    }
    return checkedRows.reduce<OrganizationTag[]>((a, b) => {
      if (!b) return a;
      if (b.checked) {
        return [...a, b.data as OrganizationTag];
      }
      return a;
    }, []);
  }, [eachRowState]);

  const handleOpenCreateTagDialog = () => {
    openDialog();
  };

  const handleOpenUpdateTagDialog = () => {
    openDialog();
  };

  const handleDeleteTag = () => {
    openConfirmDialog({
      primary: `${wordLibrary?.delete ?? "刪除"}`,
      message: "Are you sure to delete tag?",
      onConfirm: async () => {
        if (organizationId && tagGroup) {
          if (selectedTags[0]) {
            try {
              closeConfirmDialog();
              await deleteTag({
                organizationId,
                tagGroupId: tagGroup.tagGroupId,
                tagId: selectedTags[0].tagId,
              });
              setDeleteState(true);
              mutate();
            } catch (error) {
              apis.tools.createLog({
                function: "DatePicker: handleDeleteTag",
                browserDescription: window.navigator.userAgent,
                jsonData: {
                  data: error,
                  deviceInfo: getDeviceInfo(),
                },
                level: "ERROR",
              });
            }
          }
        }
      },
    });
  };

  const handleChangeLocale = (loca) => {
    setLocale(loca);
  };

  useEffect(() => {
    mutate();
  }, [locale, mutate]);

  const buttonTools = (
    <>
      <PermissionValid shouldBeOrgOwner modulePermissions={["CREATE"]}>
        <Button
          onClick={handleOpenCreateTagDialog}
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          id="table-add-button"
          data-tid="table-add-button"
        >
          {wordLibrary?.add ?? "新增"}
        </Button>
      </PermissionValid>
      <PermissionValid shouldBeOrgOwner modulePermissions={["READ"]}>
        <LocaleDropDown
          defaultLocale={locale}
          onChange={handleChangeLocale}
          editable
        />
      </PermissionValid>
    </>
  );

  const selectedToolsbar = (
    <>
      {selectedTags.length === 1 && (
        <PermissionValid shouldBeOrgOwner modulePermissions={["DELETE_ALL"]}>
          <Tooltip title="刪除標籤">
            <IconButton
              onClick={handleDeleteTag}
              color="primary"
              id="table-delete-btn"
            >
              <Iconify icon="solar:trash-bin-trash-bold" width={24} />
            </IconButton>
          </Tooltip>
        </PermissionValid>
      )}
    </>
  );

  const handleClickRow = (row) => {
    setSelectedTag(row);
    handleOpenUpdateTagDialog();
  };

  return (
    <>
      <Paper>
        <I18nDataTable
          columns={columns}
          rowKey="tagId"
          data={!data ? [] : data?.source}
          renderDataRow={(rowData) => {
            const row = rowData as OrganizationTag;

            return (
              <TagDataTableRow
                columns={columns}
                row={row}
                key={row.tagId}
                onClick={() => handleClickRow(rowData)}
              />
            );
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
          enableRowCheckbox
          buttonTools={buttonTools}
          selectedToolsbar={selectedToolsbar}
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
          FilterDropDownProps={{
            onSubmit: handleFilterSubmit,
            onClear: handleFilterClear,
          }}
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
          deleteState={deleteState}
          setDeleteState={setDeleteState}
        />
      </Paper>
      {tagGroup && (
        <TagDialog
          editable={
            selectedTag?.tagId ? isOrgOwner || editable : isOrgOwner || addable
          }
          organizationId={organizationId}
          tagGroupId={tagGroup.tagGroupId}
          tagGroupName={tagGroup.tagGroupName}
          onSuccess={() => {
            mutate();
          }}
          tagId={selectedTag?.tagId || undefined}
          onCloseDialog={() => setSelectedTag(null)}
        />
      )}
    </>
  );
};

export default TagsDataTable;
