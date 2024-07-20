/* eslint-disable @typescript-eslint/no-shadow */
import React, { FC, useCallback } from "react";

import { useDataTable } from "@eGroupAI/material-module/DataTable";
import { DefaultPayload } from "@eGroupAI/material-module/DataTable/useDataTable";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";
import Paper from "@eGroupAI/material/Paper";
import { MessageItem } from "@eGroupAI/typings/apis";

import useMessageFilterSearch from "utils/useMessageFilterSearch";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { ServiceModuleValue } from "interfaces/utils";
import I18nDataTable from "components/I18nDataTable";
import MessagesDataTableRow from "./MessagesDataTableRow";

interface EventDefaultPayload extends DefaultPayload {
  startIndex?: number;
}

interface Props {
  organizationId: string;
}

const MessagesDataTable: FC<Props> = function (props) {
  const { organizationId } = props;

  const {
    handleChangePage,
    handleRowsPerPageChange,

    payload,
    setPayload,
    page,
    rowsPerPage,
  } = useDataTable<EventDefaultPayload>(
    `MessagesDataTable-${organizationId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );

  const { data, isValidating } = useMessageFilterSearch(
    {
      organizationId,
    },
    { ...payload }
  );

  const { excute: makeOneMessageHaveRead } = useAxiosApiWrapper(
    apis.message.makeOneMessageHaveRead,
    "Update"
  );

  const handleClickMessageItem = useCallback(
    async (message: MessageItem) => {
      try {
        await makeOneMessageHaveRead({
          organizationId,
          messageId: message.messageId,
          isRead: 1,
        });
      } catch (error) {
        apis.tools.createLog({
          function: "DatePicker: handleClickMessageItem",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
    },
    [makeOneMessageHaveRead, organizationId]
  );
  const wordLibrary = useSelector(getWordLibrary);

  return (
    <div>
      <Paper>
        <I18nDataTable
          columns={[
            {
              name: "訊息內容",
              id: "name",
              dataKey: "messageInfo.messageInfoTitle",
            },
            {
              name: wordLibrary?.["creation time"] ?? "建立時間",
              id: "time",
              dataKey: "messageCreateDate",
            },
          ]}
          rowKey="messageId"
          data={!data ? [] : data?.source}
          renderDataRow={(rowData) => {
            const row = rowData as MessageItem;

            return (
              <MessagesDataTableRow
                row={row}
                key={row.messageId}
                handleClick={(e) => {
                  e.stopPropagation();
                  window.location.assign(
                    `/me/${row.messageInfo.messageInfoType.toLocaleLowerCase()}s/${
                      row.messageInfo.messageInfoTargetId
                    }`
                  );
                  if (row.isRead === 0) {
                    handleClickMessageItem(row);
                  }
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
          payload={payload}
          serviceModuleValue={ServiceModuleValue.EVENT}
          onSortLabelClick={(sortKey, order) => {
            setPayload((p) => ({
              ...p,
              sort: {
                sortKey,
                order: order.toUpperCase(),
              },
            }));
          }}
        />
      </Paper>
    </div>
  );
};

export default MessagesDataTable;
