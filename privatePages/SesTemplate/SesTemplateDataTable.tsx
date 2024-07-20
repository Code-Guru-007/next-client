import React, { FC, useState, useEffect, useMemo, useCallback } from "react";

import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";
import {
  EachRowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import { DefaultPayload } from "@eGroupAI/material-module/DataTable/useDataTable";
import Paper from "@eGroupAI/material/Paper";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import { TableRowProps } from "@eGroupAI/material/TableRow";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";

import I18nDataTable from "components/I18nDataTable";
import SESDataTableRow from "components/SesDataTableRow";
import PermissionValid from "components/PermissionValid";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import { OrganizationSesTemplate } from "interfaces/entities";
import useSESFilterSearch from "utils/SesTemplate/useSESFilterSearch";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { Button, IconButton } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";

interface SESDefaultPayload extends DefaultPayload {
  startIndex?: number;
}

interface Props {
  organizationId: string;
  openCreateSESDialog: () => void;
  isCreated: boolean;
  tableName: string;
}

const SesTemplateDataTable: FC<Props> = function (props) {
  const { organizationId, openCreateSESDialog, isCreated, tableName } = props;

  const [eachRowState, setEachRowState] = useState<
    EachRowState<
      OrganizationSesTemplate & {
        TableRowProps: TableRowProps;
      }
    >
  >({});
  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [checkedAll, setCheckedAll] = useState(false);

  const matchMutate = useSwrMatchMutate();

  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

  const {
    handleChangePage,
    handleRowsPerPageChange,
    handleSearchChange,

    payload,
    setSubmitedPayload,
    page,
    rowsPerPage,
  } = useDataTable<SESDefaultPayload>(
    `${tableName}-${organizationId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );

  const { excute: deleteSesTemplate } = useAxiosApiWrapper(
    apis.org.deleteSesTemplate,
    "Delete"
  );

  const { data, isValidating, mutate } = useSESFilterSearch(
    {
      organizationId,
    },
    { ...payload }
  );
  const selected = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => el?.checked)
        .map((el) => {
          const { TableRowProps: trp, ...other } = el?.data || {};
          return other as OrganizationSesTemplate;
        }),
    [eachRowState]
  );

  const handleDelete = useCallback(() => {
    openConfirmDeleteDialog({
      primary: `${
        wordLibrary?.["are you sure you want to delete this item"] ??
        "你確定要刪除這個項目嗎？"
      }`,
      onConfirm: async () => {
        try {
          selected.map(async (el) => {
            await deleteSesTemplate({
              organizationId,
              organizationSesTemplateId: el.organizationSesTemplateId,
            });
            setDeleteState(true);
            closeConfirmDeleteDialog();
            mutate();
            matchMutate(
              new RegExp(`^/organizations/${organizationId}/ses-templates`, "g")
            );
          });
        } catch (error) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    closeConfirmDeleteDialog,
    deleteSesTemplate,
    matchMutate,
    mutate,
    openConfirmDeleteDialog,
    organizationId,
    selected,
  ]);

  const handleCheckedAllClick = useCallback(() => {
    setCheckedAll(true);
  }, []);

  const handleCheckedAllClearClick = useCallback(() => {
    setCheckedAll(false);
  }, []);

  useEffect(() => {
    if (isCreated) {
      mutate();
    }
  }, [isCreated, mutate]);
  const wordLibrary = useSelector(getWordLibrary);

  const buttonTools = (
    <PermissionValid shouldBeOrgOwner modulePermissions={["CREATE"]}>
      <Button
        onClick={openCreateSESDialog}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
        id="table-add-button"
        data-tid="table-add-button"
      >
        {wordLibrary?.["add email template"] ?? "電子郵件範本添加"}
      </Button>
    </PermissionValid>
  );

  return (
    <Paper>
      <I18nDataTable
        columns={[
          {
            id: "organizationSesTemplateTitle",
            name: wordLibrary?.title ?? "標題",
            dataKey: "organizationSesTemplateTitle",
          },
          {
            id: "organizationSesTemplateContent",
            name: `${wordLibrary?.content ?? "內容"}`,
            dataKey: "organizationSesTemplateContent",
          },
          {
            id: "organizationSesTemplateCreateDateToString",
            name: `${wordLibrary?.["creation time"] ?? "建立時間"}`,
            dataKey: "organizationSesTemplateCreateDateToString",
          },
          {
            id: "organizationSesTemplateUpdateDateToString",
            name: `${wordLibrary?.["update time"] ?? "更新時間"}`,
            dataKey: "organizationSesTemplateUpdateDateToString",
          },
        ]}
        rowKey="organizationSesTemplateId"
        data={!data ? [] : data?.source}
        renderDataRow={(rowData) => {
          const row = rowData as OrganizationSesTemplate;

          return (
            <SESDataTableRow
              columns={[
                {
                  id: "organizationSesTemplateTitle",
                  name: `${wordLibrary?.title ?? "標題"}`,
                  dataKey: "organizationSesTemplateTitle",
                },
                {
                  id: "organizationSesTemplateContent",
                  name: `${wordLibrary?.content ?? "內容"}`,
                  dataKey: "organizationSesTemplateContent",
                },
                {
                  id: "organizationSesTemplateCreateDateToString",
                  name: `${wordLibrary?.["creation time"] ?? "建立時間"}`,
                  dataKey: "organizationSesTemplateCreateDateToString",
                },
                {
                  id: "organizationSesTemplateUpdateDateToString",
                  name: `${wordLibrary?.["update time"] ?? "更新時間"}`,
                  dataKey: "organizationSesTemplateUpdateDateToString",
                },
              ]}
              row={row}
              key={row.organizationSesTemplateId}
              handleClick={(e) => {
                e.stopPropagation();
                window.open(
                  `/me/ses-template/${row.organizationSesTemplateId}`,
                  "_blank"
                );
              }}
            />
          );
        }}
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
        enableRowCheckbox
        onEachRowStateChange={(state) => {
          setEachRowState(state);
        }}
        buttonTools={buttonTools}
        selectedToolsbar={
          <>
            {(checkedAll || selected.length !== 0) && (
              <IconButton
                onClick={() => {
                  handleDelete();
                }}
                disabled={!checkedAll && selected.length === 0}
                color="primary"
                id="table-delete-btn"
                data-tid="table-delete-btn"
              >
                <Iconify icon="solar:trash-bin-trash-bold" width={24} />
              </IconButton>
            )}
          </>
        }
        onSortLabelClick={(sortKey, order) => {
          setSubmitedPayload((p) => ({
            ...p,
            sort: {
              sortKey,
              order: order.toUpperCase(),
            },
          }));
        }}
        onCheckedAllClick={handleCheckedAllClick}
        onCheckedAllClearClick={handleCheckedAllClearClick}
        searchBar={
          <StyledSearchBar
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
  );
};

export default SesTemplateDataTable;
