import React, { useState, useMemo } from "react";

import { useSelector } from "react-redux";
import useOrgFinanceTemplatesTableFilterSearch from "utils/useOrgFinanceTemplatesTableFilterSearch";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import { useDataTable } from "@eGroupAI/material-module/DataTable";
import SearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";

import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { OrganizationFinanceTemplate } from "interfaces/entities";
import { ServiceModuleValue, Table } from "interfaces/utils";

import useModulePermissionValid from "components/PermissionValid/useModulePermissionValid";
import useOrgOwnerValid from "components/PermissionValid/useOrgOwnerValid";

import { Button } from "@mui/material";
import Paper from "@eGroupAI/material/Paper";
import Iconify from "minimal/components/iconify/iconify";

import I18nDataTable from "components/I18nDataTable";
import PermissionValid from "components/PermissionValid";
import FinanceTemplatesDialog, { DIALOG } from "./FinanceTemplatesDialog";

const FinanceTemplatesTable = function () {
  const organizationId = useSelector(getSelectedOrgId);
  const wordLibrary = useSelector(getWordLibrary);
  const { openDialog } = useReduxDialog(DIALOG);
  const {
    handleChangePage,
    handleRowsPerPageChange,
    handleSearchChange,
    setPayload,
    payload,
    page,
    rowsPerPage,
    submitedPayload,
    setSubmitedPayload,
  } = useDataTable(
    "FinanceTemplatesTable",
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );

  const { columns, filterSearch } = useDataTableFilterColumns(
    Table.FINANCE_TEMPLATE,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );

  const { data, isValidating } = useOrgFinanceTemplatesTableFilterSearch(
    {
      organizationId,
    },
    filterSearch,
    undefined,
    undefined,
    !filterSearch
  );

  const [selectedTemplate, setSelectedTemplate] =
    useState<OrganizationFinanceTemplate>();

  const { hasModulePermission: editable } = useModulePermissionValid({
    modulePermissions: ["UPDATE_ALL"],
  });
  const { hasModulePermission: deletable } = useModulePermissionValid({
    modulePermissions: ["DELETE_ALL"],
  });
  const isOrgOwner = useOrgOwnerValid(true);

  const tableData = useMemo(
    () =>
      data?.source.map((el) => ({
        ...el,
        TableRowProps: {
          hover: true,
          sx: { cursor: "pointer", verticalAlign: "top" },
          onClick: () => {
            setSelectedTemplate(el);
            openDialog();
          },
        },
      })) || [],
    [data?.source, openDialog]
  );

  const openCreateFinanceTemplatesDialog = () => {
    setSelectedTemplate(undefined);
    openDialog();
  };

  const buttonTools = (
    <PermissionValid shouldBeOrgOwner modulePermissions={["CREATE"]}>
      <Button
        onClick={openCreateFinanceTemplatesDialog}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
      >
        {wordLibrary?.add ?? "新增"}
      </Button>
    </PermissionValid>
  );

  return (
    <>
      <FinanceTemplatesDialog
        organizationFinanceTemplateId={
          selectedTemplate?.organizationFinanceTemplateId
        }
        editable={editable || isOrgOwner}
        deletable={deletable || isOrgOwner}
      />
      <Paper>
        <I18nDataTable
          rowKey="organizationFinanceTemplateId"
          columns={columns}
          data={tableData}
          isEmpty={data?.total === 0}
          serverSide
          loading={isValidating}
          MuiTablePaginationProps={{
            count: data?.total ?? 0,
            page,
            rowsPerPage,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
          onSortLabelClick={(sortKey, order) => {
            setPayload((p) => ({
              ...p,
              sort: {
                sortKey,
                order: order.toUpperCase(),
              },
            }));
          }}
          buttonTools={buttonTools}
          payload={payload}
          serviceModuleValue={ServiceModuleValue.FINANCE_TEMPLATE}
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
    </>
  );
};

export default FinanceTemplatesTable;
