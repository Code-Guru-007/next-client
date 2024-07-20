import React, { useState, useMemo } from "react";

import { useSelector } from "react-redux";
import useOrgSalaryTemplatesTableFilterSearch from "utils/useOrgSalaryTemplatesTableFilterSearch";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import { useDataTable } from "@eGroupAI/material-module/DataTable";
import SearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";

import { useReduxDialog } from "@eGroupAI/redux-modules";
import { OrganizationSalaryTemplate } from "interfaces/entities";
import { ServiceModuleValue, Table } from "interfaces/utils";

import useModulePermissionValid from "components/PermissionValid/useModulePermissionValid";
import useOrgOwnerValid from "components/PermissionValid/useOrgOwnerValid";

import Paper from "@eGroupAI/material/Paper";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import I18nDataTable from "components/I18nDataTable";
import PermissionValid from "components/PermissionValid";
import { Button } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";

import SalaryTemplateDialog, { DIALOG } from "./SalaryTemplateDialog";

const SalaryTemplateTable = function () {
  const organizationId = useSelector(getSelectedOrgId);
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
    `HrmMemberSalaryTemplatesDataTable-${organizationId}`,
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

  const columnsAdd = columns.map((column) => ({
    ...column,
    sortKey: "organizationFinanceTemplateCreateDate",
  }));

  const { data, isValidating } = useOrgSalaryTemplatesTableFilterSearch(
    {
      organizationId,
    },
    filterSearch,
    {
      serviceModuleValue: ServiceModuleValue.HRM_MEMBERS,
    },
    undefined,
    !filterSearch
  );

  const [selectedTemplate, setSelectedTemplate] =
    useState<OrganizationSalaryTemplate>();

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

  const wordLibrary = useSelector(getWordLibrary);

  const openCreateFinanceTemplatesDialog = () => {
    setSelectedTemplate(undefined);
    openDialog();
  };

  const buttonTools = (
    <PermissionValid shouldBeOrgOwner modulePermissions={["CREATE"]}>
      <Button
        id="table-add-btn"
        data-tid="table-add-btn"
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
      <SalaryTemplateDialog
        organizationFinanceTemplateId={
          selectedTemplate?.organizationFinanceTemplateId
        }
        editable={editable || isOrgOwner}
        deletable={deletable || isOrgOwner}
      />
      <Paper>
        <I18nDataTable
          rowKey="organizationFinanceTemplateId"
          columns={columnsAdd}
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
          buttonTools={buttonTools}
          payload={payload}
          serviceModuleValue={ServiceModuleValue.HRM_MEMBERS}
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

export default SalaryTemplateTable;
