import { FC, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import {
  EachRowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import SearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import { DefaultPayload } from "@eGroupAI/material-module/DataTable/useDataTable";
import Paper from "@eGroupAI/material/Paper";
import Tooltip from "@eGroupAI/material/Tooltip";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { Button, IconButton } from "@mui/material";
import { DIALOG as CONFIRM_DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import I18nDataTable from "components/I18nDataTable";
import LocaleDropDown from "components/LocaleDropDown";
import PermissionValid from "components/PermissionValid";
import useModulePermissionValid from "components/PermissionValid/useModulePermissionValid";
import useOrgOwnerValid from "components/PermissionValid/useOrgOwnerValid";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import TagGroupDataTableRow from "components/TagGroupDataTableRow";
import TagGroupDialog, { DIALOG } from "components/TagGroupDialog";
import { OrganizationTagGroup } from "interfaces/entities";
import { Locale, Table } from "interfaces/utils";
import Iconify from "minimal/components/iconify/iconify";
import { useRouter } from "next/router";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import useOrgTagGroupTableFilterSearch from "utils/useOrgTagGroupTableFilterSearch";

interface TagsDefaultPayload extends DefaultPayload {
  startIndex?: number;
}

interface Props {
  organizationId: string;
  serviceModuleValue: string;
}

const TagGroupsDataTable: FC<Props> = function (props) {
  const { organizationId, serviceModuleValue } = props;
  const [enableFilter, setEnableFilter] = useState<boolean>(true);
  const [eachRowState, setEachRowState] = useState<
    EachRowState<OrganizationTagGroup>
  >({});
  const [deleteState, setDeleteState] = useState<boolean>(false);
  const globalLocale = useSelector(getGlobalLocale);
  const [locale, setLocale] = useState<string>(globalLocale);
  const [selectedTagGroupId, setSelectedTagGroupId] = useState<
    string | undefined
  >();

  const { hasModulePermission: addable } = useModulePermissionValid({
    modulePermissions: ["CREATE"],
  });
  const { pathname, query } = useRouter();

  const queryTabValue = useMemo(() => {
    if (query.tab === "tagGroup") return "tag-groups";
    return "finance-tag-management";
  }, [query.tab]);

  const { hasModulePermission: editable } = useModulePermissionValid({
    modulePermissions: ["UPDATE_ALL"],
  });
  const isOrgOwner = useOrgOwnerValid(true);
  const wordLibrary = useSelector(getWordLibrary);
  const { openDialog, closeDialog } = useReduxDialog(DIALOG);
  const {
    openDialog: openConfirmDialog,
    closeDialog: closeConfirmDialog,
    setDialogStates: setConfirmDeleteDialogStates,
  } = useReduxDialog(CONFIRM_DELETE_DIALOG);
  const { excute: deleteTagGroup, isLoading: isDeleting } = useAxiosApiWrapper(
    apis.org.deleteTagGroup,
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
    `TagGroupsDataTable-${serviceModuleValue}`,
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
    Table.TAGGROUPS,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );

  const { data, mutate, isValidating } = useOrgTagGroupTableFilterSearch(
    {
      organizationId,
    },
    { ...filterSearch, locale: Locale[locale.toLocaleUpperCase()] },
    {
      serviceModuleValue,
    },
    undefined,
    !serviceModuleValue || !filterSearch
  );

  const selectedTagGroups = useMemo(() => {
    const checkedRows = Object.values(eachRowState).filter((el) => el?.checked);
    if (checkedRows.length === 0) {
      return [];
    }
    return checkedRows.reduce<OrganizationTagGroup[]>((a, b) => {
      if (!b) return a;
      if (b.checked) {
        return [...a, b.data as OrganizationTagGroup];
      }
      return a;
    }, []);
  }, [eachRowState]);

  const handleOpenCreateTagGroupDialog = () => {
    openDialog();
    setSelectedTagGroupId("");
  };

  const handleOpenUpdateTagGroupDialog = (selectedId?: string) => {
    if (!selectedId) {
      setSelectedTagGroupId(undefined);
    } else {
      setSelectedTagGroupId(selectedId);
    }
    openDialog();
  };

  const handleDeleteTagGroup = () => {
    openConfirmDialog({
      primary: `${wordLibrary?.delete ?? "刪除"}`,
      message: "Are you sure to delete tag group?",
      isDeleting,
      onConfirm: async () => {
        if (organizationId) {
          if (selectedTagGroups[0]) {
            try {
              setConfirmDeleteDialogStates({ isDeleting: true });
              await deleteTagGroup({
                organizationId,
                tagGroupId: selectedTagGroups[0].tagGroupId,
              });
              closeConfirmDialog();
              setDeleteState(true);
              mutate();
            } catch (error) {
              // eslint-disable-next-line no-console
              apis.tools.createLog({
                function: "DatePicker: handleDeleteTagGroup",
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
    if (
      serviceModuleValue === "ORGANIZATION_GROUP" ||
      serviceModuleValue === "ARTICLE" ||
      serviceModuleValue === "EVENT" ||
      serviceModuleValue === "CRM_USER" ||
      serviceModuleValue === "CRM_PARTNER" ||
      serviceModuleValue === "BULLETIN" ||
      serviceModuleValue === "FILES" ||
      serviceModuleValue === "SES_TEMPLATE" ||
      serviceModuleValue === "CMS_PRODUCT" ||
      serviceModuleValue === "CMS_SOLUTION" ||
      serviceModuleValue === "SMS_TEMPLATE"
    ) {
      setEnableFilter(false);
    }
    mutate();
  }, [locale, mutate, serviceModuleValue]);
  const buttonTools = (
    <>
      <PermissionValid
        shouldBeOrgOwner
        modulePermissions={["CREATE"]}
        targetPath="/me/tag-groups"
      >
        <Button
          onClick={handleOpenCreateTagGroupDialog}
          variant="contained"
          startIcon={<Iconify width={15} icon="mingcute:add-line" />}
          id="tag-groups-add-btn"
          data-tid="tag-groups-add-btn"
        >
          {wordLibrary?.add ?? "新增"}
        </Button>
      </PermissionValid>
      <PermissionValid shouldBeOrgOwner modulePermissions={["READ"]}>
        <LocaleDropDown
          defaultLocale={locale}
          onChange={handleChangeLocale}
          editable
          id="locale-droupdown"
          data-tid="locale-droupdown"
        />
      </PermissionValid>
    </>
  );

  const selectedToolsbar = (
    <>
      {selectedTagGroups.length === 1 && (
        <PermissionValid
          shouldBeOrgOwner
          modulePermissions={["UPDATE_ALL"]}
          /**
           * TODO: should be adjusted to in future when tag permission management separatedly comes true.
           *       all kind of code lines of "/me/tag-groups" in system -->  "{{pathname}}/{{tagCategory}}"
           * */
          targetPath="/me/tag-groups"
        >
          <Tooltip title={wordLibrary?.edit ?? "編輯"}>
            <IconButton
              onClick={() =>
                handleOpenUpdateTagGroupDialog(
                  selectedTagGroups?.[0]?.tagGroupId
                )
              }
              color="primary"
              id="table-tools-selected-edit-btn"
              data-tid="table-tools-selected-edit-btn"
            >
              <Iconify icon="solar:pen-bold" width={24} />
            </IconButton>
          </Tooltip>
        </PermissionValid>
      )}
      {selectedTagGroups.length === 1 && (
        <PermissionValid
          shouldBeOrgOwner
          modulePermissions={["DELETE_ALL"]}
          targetPath="/me/tag-groups"
        >
          <Tooltip title={wordLibrary?.delete ?? "刪除"}>
            <IconButton
              onClick={handleDeleteTagGroup}
              color="primary"
              id="table-tools-selected-delete-btn"
              data-tid="table-tools-selected-delete-btn"
            >
              <Iconify icon="solar:trash-bin-trash-bold" width={24} />
            </IconButton>
          </Tooltip>
        </PermissionValid>
      )}
    </>
  );

  return (
    <>
      <Paper>
        <I18nDataTable
          columns={columns}
          rowKey="tagGroupId"
          data={!data ? [] : data?.source}
          renderDataRow={(rowData) => {
            const row = rowData as OrganizationTagGroup;

            return (
              <TagGroupDataTableRow
                columns={columns}
                row={row}
                key={row.tagGroupId}
                handleClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `${pathname}/${queryTabValue}/${row.tagGroupId}`,
                    "_blank"
                  );
                }}
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
          enableFilter={enableFilter}
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
          deleteState={deleteState}
          setDeleteState={setDeleteState}
          searchBar={
            <SearchBar
              handleSearchChange={handleSearchChange}
              value={payload.query}
              placeholder={
                wordLibrary?.["search and press Enter"] ?? "搜尋並按Enter"
              }
            />
          }
        />
      </Paper>
      <TagGroupDialog
        organizationId={organizationId}
        onSuccess={(tagGroupId) => {
          mutate();
          closeDialog();
          if (tagGroupId) {
            window.open(`${pathname}/${queryTabValue}/${tagGroupId}`, "_blank");
          }
        }}
        tagGroupId={selectedTagGroupId}
        tagServiceModuleValue={serviceModuleValue}
        editable={
          selectedTagGroups.length !== 0
            ? isOrgOwner || editable
            : isOrgOwner || addable
        }
      />
    </>
  );
};

export default TagGroupsDataTable;
