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
import SMSDataTableRow from "components/SMSDataTableRow";
import PermissionValid from "components/PermissionValid";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";

import { OrganizationSmsTemplate } from "interfaces/entities";
import useSMSFilterSearch from "utils/SmsTemplate/useSMSFilterSearch";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { Button, IconButton } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";

interface SMSDefaultPayload extends DefaultPayload {
  startIndex?: number;
}

interface Props {
  organizationId: string;
  openCreateSMSDialog: () => void;
  isCreated: boolean;
  tableName: string;
}

const SMSDataTable: FC<Props> = function (props) {
  const { organizationId, openCreateSMSDialog, isCreated, tableName } = props;
  const wordLibrary = useSelector(getWordLibrary);

  const [eachRowState, setEachRowState] = useState<
    EachRowState<
      OrganizationSmsTemplate & {
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
    setPayload,
    page,
    rowsPerPage,
  } = useDataTable<SMSDefaultPayload>(
    `${tableName}-${organizationId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );

  const { excute: deleteSmsTemplate } = useAxiosApiWrapper(
    apis.org.deleteSmsTemplate,
    "Delete"
  );

  const { data, isValidating, mutate } = useSMSFilterSearch(
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
          return other as OrganizationSmsTemplate;
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
            await deleteSmsTemplate({
              organizationId,
              organizationSmsTemplateId: el.organizationSmsTemplateId,
            });
            closeConfirmDeleteDialog();
            setDeleteState(true);
            mutate();
            matchMutate(
              new RegExp(
                `^ /organizations/${organizationId} /sms-templates`,
                "g"
              )
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
  }, [
    closeConfirmDeleteDialog,
    deleteSmsTemplate,
    matchMutate,
    mutate,
    openConfirmDeleteDialog,
    organizationId,
    selected,
    wordLibrary,
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

  const buttonTools = (
    <PermissionValid shouldBeOrgOwner modulePermissions={["CREATE"]}>
      <Button
        onClick={openCreateSMSDialog}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
        id="table-add-button"
        data-tid="table-add-button"
      >
        {wordLibrary?.["add sms template"] ?? "簡訊範本添加"}
      </Button>
    </PermissionValid>
  );

  return (
    <div>
      <Paper>
        <I18nDataTable
          columns={[
            {
              id: "organizationSmsTemplateTitle",
              name: wordLibrary?.title ?? "標題",
              dataKey: "organizationSmsTemplateTitle",
            },
            {
              id: "organizationSmsTemplateContent",
              name: `${wordLibrary?.content ?? "內容"}`,
              dataKey: "organizationSmsTemplateContent",
            },
            {
              id: "organizationSmsTemplateCreateDateToString",
              name: `${wordLibrary?.["creation time"] ?? "建立時間"}`,
              dataKey: "organizationSmsTemplateCreateDateToString",
            },
            {
              id: "organizationSmsTemplateUpdateDateToString",
              name: `${wordLibrary?.["update time"] ?? "更新時間"}`,
              dataKey: "organizationSmsTemplateUpdateDateToString",
            },
          ]}
          rowKey="organizationSmsTemplateId"
          data={!data ? [] : data?.source}
          renderDataRow={(rowData) => {
            const row = rowData as OrganizationSmsTemplate;

            return (
              <SMSDataTableRow
                columns={[
                  {
                    id: "organizationSmsTemplateTitle",
                    name: `${wordLibrary?.title ?? "標題"}`,
                    dataKey: "organizationSmsTemplateTitle",
                  },
                  {
                    id: "organizationSmsTemplateContent",
                    name: `${wordLibrary?.content ?? "內容"}`,
                    dataKey: "organizationSmsTemplateContent",
                  },
                  {
                    id: "organizationSmsTemplateCreateDateToString",
                    name: `${wordLibrary?.["creation time"] ?? "建立時間"}`,
                    dataKey: "organizationSmsTemplateCreateDateToString",
                  },
                  {
                    id: "organizationSmsTemplateUpdateDateToString",
                    name: `${wordLibrary?.["update time"] ?? "更新時間"}`,
                    dataKey: "organizationSmsTemplateUpdateDateToString",
                  },
                ]}
                row={row}
                key={row.organizationSmsTemplateId}
                handleClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `/me/sms-template/${row.organizationSmsTemplateId}`,
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
                <PermissionValid
                  shouldBeOrgOwner
                  modulePermissions={["DELETE_ALL"]}
                >
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
                </PermissionValid>
              )}
            </>
          }
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
    </div>
  );
};

export default SMSDataTable;
