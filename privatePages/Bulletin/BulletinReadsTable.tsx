import React, { FC } from "react";
import { useSelector } from "react-redux";
import { useDataTable } from "@eGroupAI/material-module/DataTable";
import { format as formatDate } from "@eGroupAI/utils/dateUtils";
import useBulletinReads from "utils/Bulletin/useBulletinReads";
import Paper from "@eGroupAI/material/Paper";
import I18nDataTable from "components/I18nDataTable";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export interface MembersMiniTableProps {
  bulletinId?: string;
  organizationId: string;
}

const BulletinReadsTable: FC<MembersMiniTableProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { organizationId, bulletinId } = props;
  const locale = useSelector(getGlobalLocale);
  const { handleChangePage, handleRowsPerPageChange, page, rowsPerPage } =
    useDataTable(
      "BulletinReadsTable",
      {},
      {
        fromKey: "startIndex",
        enableLocalStorageCache: true,
      }
    );

  const { data: bulletinReads, isValidating } = useBulletinReads(
    {
      organizationId,
      bulletinId,
    },
    {
      locale,
    }
  );
  const total = bulletinReads?.length;

  return (
    <>
      <Paper>
        <I18nDataTable
          rowKey="creator.loginId"
          columns={[
            {
              id: "creator.memberName",
              name: wordLibrary?.["full name"] ?? "姓名",
              dataKey: "creator.memberName",
            },
            {
              id: "targetActionCreateDate",
              name: "初次觀看日期",
              dataKey: "targetActionCreateDate",
              format: (val) => formatDate(val as string, "PP pp"),
            },
            {
              id: "lastTargetActionRecordCreateDate",
              name: "最後觀看日期",
              dataKey: "lastTargetActionRecordCreateDate",
              format: (val) => formatDate(val as string, "PP pp"),
            },
          ]}
          data={bulletinReads || []}
          isEmpty={total === 0}
          serverSide
          loading={isValidating}
          MuiTablePaginationProps={{
            count: total ?? 0,
            page,
            rowsPerPage,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
        />
      </Paper>
    </>
  );
};

export default BulletinReadsTable;
