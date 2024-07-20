import React, { FC, useMemo, useState } from "react";

import {
  EachRowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import { UploadFile } from "interfaces/entities";
import { useSelector } from "react-redux";
import useFileEvents from "utils/useFileEvents";
import { format as formatDate } from "@eGroupAI/utils/dateUtils";
import TableCell from "@eGroupAI/material/TableCell";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import I18nDataTable from "components/I18nDataTable";
import { IconButton, Tooltip } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";

export interface UserAgreementFilesProps {
  orgUserId?: string;
  data?: UploadFile[];
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const UserAgreementFiles: FC<UserAgreementFilesProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    orgUserId,
    data,
    readable = false,
    // writable = false,
    // deletable = false
  } = props;
  const { handleChangePage, handleRowsPerPageChange, page, rowsPerPage } =
    useDataTable(
      `UserAgreementFilesDataTable-${orgUserId}`,
      {},
      {
        fromKey: "startIndex",
        enableLocalStorageCache: true,
      }
    );
  const { handleDownloadFile, handlePreviewFile } = useFileEvents();

  const [eachRowState, setEachRowState] = useState<EachRowState<UploadFile>>(
    {}
  );
  const selectedFiles = useMemo(
    () => Object.values(eachRowState).filter((el) => el?.checked),
    [eachRowState]
  );
  const targetIdList = useMemo(
    () => selectedFiles.map((el) => el?.data?.uploadFileId),
    [selectedFiles]
  );

  const selectedToolsbar = (
    <>
      {readable && (
        <Tooltip title="下載檔案">
          <span>
            <IconButton
              onClick={() => {
                if (targetIdList.length > 0) {
                  const promises = targetIdList.map((id) =>
                    handleDownloadFile(id as string)
                  );
                  Promise.all(promises)
                    .then()
                    .catch(() => {});
                }
              }}
              disabled={selectedFiles.length === 0}
              color="primary"
            >
              <Iconify icon="ic:round-download" width={24} />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </>
  );
  return (
    <>
      <I18nDataTable
        title={wordLibrary?.["document signing"] ?? "文件簽署"}
        rowKey="uploadFileId"
        columns={[
          {
            id: "uploadFileName",
            name: wordLibrary?.["sign document"] ?? "簽署文件",
            dataKey: "uploadFileName",
          },
          {
            id: "uploadFileTargetCreateDate",
            name: wordLibrary?.["signing time"] ?? "簽署時間",
            dataKey: "uploadFileTargetCreateDate",
            format: (val) => formatDate(val as string, "PP pp"),
          },
          {
            name: wordLibrary?.action ?? "操作",
            render: (el) => (
              <TableCell key="fileName">
                <Tooltip title={wordLibrary?.["download file"] ?? "下載檔案"}>
                  <IconButton
                    onClick={() => {
                      handleDownloadFile(el.uploadFileId);
                    }}
                  >
                    <Iconify icon="ic:round-download" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={wordLibrary?.["preview file"] ?? "預覽檔案"}>
                  <IconButton
                    onClick={() => {
                      handlePreviewFile(el.uploadFileId);
                    }}
                  >
                    <Iconify icon="material-symbols:visibility-rounded" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            ),
          },
        ]}
        data={data}
        enableRowCheckbox
        selectedToolsbar={selectedToolsbar}
        onEachRowStateChange={(state) => setEachRowState(state)}
        isEmpty={data ? data.length === 0 : true}
        MuiTablePaginationProps={{
          count: data?.length ?? 0,
          page,
          rowsPerPage,
          onPageChange: handleChangePage,
          onRowsPerPageChange: handleRowsPerPageChange,
        }}
      />
    </>
  );
};

export default UserAgreementFiles;
