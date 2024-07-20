import React, {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";

import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { useSelector } from "react-redux";

import Paper from "@eGroupAI/material/Paper";
import Tooltip from "@eGroupAI/material/Tooltip";
import SearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import {
  useDataTable,
  EachRowState,
} from "@eGroupAI/material-module/DataTable";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import I18nDataTable from "components/I18nDataTable";
import PermissionValid from "components/PermissionValid";
import OrgModuleShareTemplateTableRow from "components/OrgModuleShareTemplateTableRow";
import { DIALOG as DELETE_CONFIRM } from "components/ConfirmDeleteDialog";
import { ServiceModuleValue, Table } from "interfaces/utils";
import { ShareTemplateSearch } from "interfaces/entities";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import useOrgShareTemplateList from "utils/useOrgShareTemplateList";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { Button, IconButton } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";

export interface ShareTemplateTableChildRef {
  handleMutate: () => void;
}

interface Props {
  organizationId: string;
  onCreateShareTemplate?: () => void;
  onEditShareTemplate?: (row: ShareTemplateSearch) => void;
  serviceModuleValue: ServiceModuleValue;
  isLoading?: boolean;
}

const OrgModuleShareTemplateDataTable = forwardRef<
  ShareTemplateTableChildRef,
  Props
>((props, ref) => {
  const {
    organizationId,
    onCreateShareTemplate,
    onEditShareTemplate,
    serviceModuleValue,
    isLoading: loadingProp,
  } = props;

  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [eachRowState, setEachRowState] = useState<
    EachRowState<ShareTemplateSearch>
  >({});
  const wordLibrary = useSelector(getWordLibrary);
  const { excute: deleteOrgShareTemplate } = useAxiosApiWrapper(
    apis.org.deleteOrgShareTemplate,
    "Delete"
  );
  const {
    openDialog: openDeleteConfirmDialog,
    closeDialog: closeDeleteConfirmDialog,
  } = useReduxDialog(DELETE_CONFIRM);

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
  } = useDataTable(
    `ShareTemplatesDataTable-${serviceModuleValue}`,
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
    Table.COLUMN_TEMPLATES,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );

  const { data, isValidating, mutate } = useOrgShareTemplateList(
    {
      organizationId,
    },
    {
      ...filterSearch,
    },
    { serviceModuleValue },
    undefined,
    !filterSearch
  );

  useImperativeHandle(ref, () => ({
    handleMutate: () => {
      mutate();
    },
  }));

  const selectedTems = useMemo(() => {
    const checkedRows = Object.values(eachRowState).filter((el) => el?.checked);
    if (checkedRows.length === 0) {
      return [];
    }
    return checkedRows.reduce<ShareTemplateSearch[]>((a, b) => {
      if (!b) return a;
      if (b.checked) {
        return [...a, b.data as ShareTemplateSearch];
      }
      return a;
    }, []);
  }, [eachRowState]);

  const handleDeleteColumnTemplate = () => {
    openDeleteConfirmDialog({
      primary: `確定要刪除欄位範本?`,
      onConfirm: async () => {
        try {
          if (selectedTems && selectedTems[0]) {
            await deleteOrgShareTemplate({
              organizationId,
              organizationShareTemplateId:
                selectedTems[0]?.organizationShareTemplateId,
            });
            setDeleteState(true);
            closeDeleteConfirmDialog();
            mutate();
          }
        } catch (error) {
          apis.tools.createLog({
            function: "DatePicker: handleDeleteColumnTemplate",
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
  };

  const buttonTools = (
    <PermissionValid
      shouldBeOrgOwner
      modulePermissions={["CREATE"]}
      targetPath="/me/dynamic-columns"
    >
      <Button
        onClick={onCreateShareTemplate}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
        id="table-add-button"
        data-tid="table-add-button"
      >
        {wordLibrary?.add ?? "新增"}
      </Button>
    </PermissionValid>
  );

  const selectedToolsbar = (
    <>
      {selectedTems.length === 1 && (
        <PermissionValid
          shouldBeOrgOwner
          modulePermissions={["DELETE_ALL"]}
          targetPath="/me/dynamic-columns"
        >
          <Tooltip title={wordLibrary?.delete ?? "刪除"}>
            <IconButton onClick={handleDeleteColumnTemplate} color="primary">
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
          rowKey="organizationShareTemplateId"
          data={!data ? [] : data?.source}
          renderDataRow={(rowData) => {
            const row = rowData as ShareTemplateSearch;

            return (
              <OrgModuleShareTemplateTableRow
                columns={columns}
                row={row}
                key={row.organizationShareTemplateId}
                onClick={() => {
                  if (onEditShareTemplate) {
                    onEditShareTemplate(row);
                  }
                }}
              />
            );
          }}
          isEmpty={data?.total === 0}
          serverSide
          loading={
            isValidating ||
            isFilterConditionGroupsValidating ||
            !filterSearch ||
            loadingProp
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
    </>
  );
});

export default OrgModuleShareTemplateDataTable;
