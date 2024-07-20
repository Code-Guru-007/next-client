import React, { FC, useState } from "react";

import { useReduxDialog } from "@eGroupAI/redux-modules";
import { useSelector } from "react-redux";
import { useDataTable } from "@eGroupAI/material-module/DataTable";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { UploadFile } from "interfaces/entities";
import useFileEvents from "utils/useFileEvents";
import {
  ServiceModuleValue,
  OrganizationMediaSizeType,
} from "interfaces/utils";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import { format as formatDate } from "@eGroupAI/utils/dateUtils";

import Typography from "@eGroupAI/material/Typography";
import IconButton from "@eGroupAI/material/IconButton";
import Tooltip from "@eGroupAI/material/Tooltip";
import TableCell from "@eGroupAI/material/TableCell";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import I18nDataTable from "components/I18nDataTable";
import EditSectionHeader from "components/EditSectionHeader";
import PermissionValid from "components/PermissionValid";
import BulletinUploadFileDialog, { DIALOG } from "./BulletinUploadFileDialog";

export interface BulletinUploadFilesProps {
  bulletinId: string;
  data?: UploadFile[];
}

const BulletinUploadFiles: FC<BulletinUploadFilesProps> = function (props) {
  const { bulletinId, data } = props;
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const [deleteState, setDeleteState] = useState<boolean>(false);
  const { openDialog } = useReduxDialog(DIALOG);
  const { handleChangePage, handleRowsPerPageChange, page, rowsPerPage } =
    useDataTable(
      "BulletinSmses",
      {},
      {
        fromKey: "startIndex",
        enableLocalStorageCache: true,
      }
    );
  const {
    handleUploadFile,
    handleDownloadFile,
    handlePreviewFile,
    handleDeleteFile,
    inputEl,
  } = useFileEvents();
  const matchMutate = useSwrMatchMutate();
  const [selectedFile, setSelectedFile] = useState<UploadFile>();

  return (
    <>
      <BulletinUploadFileDialog bulletinId={bulletinId} data={selectedFile} />
      <EditSectionHeader primary={wordLibrary?.file ?? "檔案"}>
        <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
          <Tooltip title={wordLibrary?.upload ?? "上傳"}>
            <IconButton component="label">
              <input
                id="uploadBulletinFileInput"
                style={{ display: "none" }}
                type="file"
                onChange={(e) => {
                  if (e.target.files) {
                    handleUploadFile({
                      files: Array.from(e.target.files),
                      filePathType: ServiceModuleValue.BULLETIN_FILE,
                      imageSizeType: OrganizationMediaSizeType.NORMAL,
                      targetId: bulletinId,
                      onSuccess: () => {
                        matchMutate(
                          new RegExp(
                            `^/organizations/${organizationId}/users/${bulletinId}\\?`,
                            "g"
                          )
                        );
                      },
                    });
                  }
                }}
                ref={inputEl}
              />
              <UploadIcon />
            </IconButton>
          </Tooltip>
        </PermissionValid>
      </EditSectionHeader>
      <I18nDataTable
        rowKey="uploadFileId"
        columns={[
          {
            id: "uploadFileName",
            name: `${wordLibrary?.file ?? "檔案"}`,
            dataKey: "uploadFileName",
            render: (el) => (
              <TableCell key="fileName">
                <Typography
                  color="primary"
                  variant="body2"
                  sx={{ cursor: "pointer", display: "flex", align: "center" }}
                  onClick={() => {
                    openDialog();
                    setSelectedFile(el);
                  }}
                >
                  {el.uploadFileName}
                  <EditIcon fontSize="small" sx={{ ml: 1 }} />
                </Typography>
              </TableCell>
            ),
          },
          {
            id: "uploadFileTargetCreateDate",
            name: "上傳時間",
            dataKey: "uploadFileTargetCreateDate",
            format: (val) => formatDate(val as string, "PP pp"),
          },
          {
            id: "action",
            name: "操作",
            dataKey: "action",
            align: "center",
            render: (el) => (
              <TableCell key="action" align="center">
                <PermissionValid
                  shouldBeOrgOwner
                  modulePermissions={["DELETE_ALL"]}
                >
                  <Tooltip title={wordLibrary?.["delete file"] ?? "刪除檔案"}>
                    <IconButton
                      onClick={() => {
                        handleDeleteFile(el.uploadFileId, () => {
                          setDeleteState(true);
                          matchMutate(
                            new RegExp(
                              `^/organizations/${organizationId}/users/${bulletinId}\\?`,
                              "g"
                            )
                          );
                        });
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </PermissionValid>
                <Tooltip title={wordLibrary?.["download file"] ?? "下載檔案"}>
                  <IconButton
                    onClick={() => {
                      handleDownloadFile(el.uploadFileId);
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={wordLibrary?.["preview file"] ?? "預覽檔案"}>
                  <IconButton
                    onClick={() => {
                      handlePreviewFile(el.uploadFileId);
                    }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            ),
          },
        ]}
        data={data || []}
        isEmpty={data ? data.length === 0 : true}
        MuiTablePaginationProps={{
          count: data?.length ?? 0,
          page,
          rowsPerPage,
          onPageChange: handleChangePage,
          onRowsPerPageChange: handleRowsPerPageChange,
        }}
        deleteState={deleteState}
        setDeleteState={setDeleteState}
      />
    </>
  );
};

export default BulletinUploadFiles;
