import React, { FC, useContext, useEffect } from "react";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";

import { makeStyles, useTheme } from "@mui/styles";
import {
  Divider,
  IconButton,
  MenuItem,
  alpha,
  tableCellClasses,
  tableRowClasses,
  useMediaQuery,
} from "@mui/material";
import { useSelector } from "react-redux";

import Box from "@eGroupAI/material/Box";
import DataTableRow from "@eGroupAI/material-module/DataTable/DataTableRow";
import DataTableCell from "@eGroupAI/material-module/DataTable/DataTableCell";
import DataTableRowCheckbox from "@eGroupAI/material-module/DataTable/StyledDataTableRowCheckbox";
import { useTableRWDStyles } from "@eGroupAI/material-module/DataTable/useTableRWDStyles";
import { format } from "@eGroupAI/utils/dateUtils";
import { ColumnType } from "@eGroupAI/typings/apis";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { DIALOG as DELTE_CONFIRM } from "components/ConfirmDeleteDialog";
import DynamicFieldWithAction from "components/DynamicField/DynamicFieldWithAction";
import PermissionValid from "components/PermissionValid";
import { UploadFile } from "interfaces/entities";
import useFileEvents from "utils/useFileEvents";
import FileThumbnail from "minimal/components/file-thumbnail/file-thumbnail";
import { DataTableContext } from "@eGroupAI/material-module/DataTable";
import Iconify from "minimal/components/iconify/iconify";
import { usePopover } from "minimal/components/custom-popover";
import CustomPopover from "minimal/components/custom-popover/custom-popover";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";
import apis from "utils/apis";
import OrgTagsInDataTableRow from "components/OrgTagsInDataTableRow";

const useStyles = makeStyles((theme) => ({
  tableRow: {
    cursor: "pointer",
    "& .MuiTableCell-root:first-child": {
      maxWidth: "300px",
    },
    "& .MuiTableCell-root": {
      verticalAlign: "middle",
    },
  },
  checkboxCell: {
    width: "50px",
  },
  displayIcon: {
    display: "flex",
  },
  iconButton: {
    color: theme.palette.grey[300],
    backgroundColor: "transparent",
  },
  tag: {
    color: "white",
    border: "1px solid transparent",
    padding: "0.375rem 1rem",
    borderRadius: "10000px",
    width: "fit-content",
    display: "flex",
    justifyContent: "center",
    fontSize: "0.9375rem",
    margin: "1px 0px",
  },
}));

const formatFileSize = (fileSizeInKBytes: number) => {
  const units = ["KB", "MB", "GB"];
  let i = 0;
  let fileSize = fileSizeInKBytes;
  while (fileSize >= 1024 && i < units.length - 1) {
    fileSize /= 1024;
    i++;
  }
  const unit = units[i];

  return `${fileSize.toFixed(1)} ${unit}`;
};

interface Props {
  row: UploadFile;
  setSelectedFile: React.Dispatch<React.SetStateAction<UploadFile | undefined>>;
  openDialog: () => void;
  onUpdateFileName?: (fileId: string, name: string) => void;
  columns?: {
    id: string;
    name: string;
    sortKey: string | undefined;
    dataKey: string | undefined;
    format: ((val: React.ReactNode) => React.ReactNode) | undefined;
  }[];
  mutate: () => void;
  organizationId: string;
  tagShow?: boolean;
  fileNameEditable?: boolean;
  specifiedTargetPermission?: boolean;
}

const UploadFilesDataTableRow: FC<Props> = function (props) {
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    fileNameEditable = true,
    tagShow = true,
    columns,
    row,
    onUpdateFileName,
    setSelectedFile,
    openDialog,
    mutate,
    organizationId,
    specifiedTargetPermission = false,
  } = props;
  const popover = usePopover();

  const wordLibrary = useSelector(getWordLibrary);
  const classes = useStyles();
  const tableRWDClasses = useTableRWDStyles();

  const {
    openDialog: openDeleteConfirmDialog,
    closeDialog: closeDeleteConfirmDialog,
  } = useReduxDialog(DELTE_CONFIRM);

  const { excute: deleteOrgFile } = useAxiosApiWrapper(
    apis.org.deleteOrgFile,
    "Update"
  );
  const { handleDownloadFile, handlePreviewFile } = useFileEvents();

  const { eachRowState } = useContext(DataTableContext);
  const checked = eachRowState[row.uploadFileId]?.checked;

  const handleUpdateFileName = async (value) => {
    if (onUpdateFileName) {
      try {
        await onUpdateFileName(row.uploadFileId, value);
        return "success";
      } catch (error) {
        return "failed";
      }
    }
    return "failed";
  };

  const defaultStyles = {
    borderTop: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    borderBottom: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    "&:first-of-type": {
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
      borderLeft: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    },
    "&:last-of-type": {
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
      borderRight: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    },
  };

  const handleDeleteUploadFiles = () => {
    openDeleteConfirmDialog({
      primary: "您確定要刪除此欄位嗎？",
      onConfirm: async () => {
        try {
          deleteOrgFile({
            organizationId,
            uploadFileId: row.uploadFileId,
            eGroupService: "WEBSITE",
          })
            .then(() => {
              mutate();
              closeDeleteConfirmDialog();
            })
            .catch(() => {});
        } catch (error) {
          apis.tools.createLog({
            function: "DatePicker: handleDeleteUploadFiles",
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
  const searchWord = localStorage.getItem("searchWord");

  useEffect(() => {
    const tbodyElement = document?.getElementsByClassName(
      "MuiTableBody-root"
    )[0] as HTMLElement;
    if (tbodyElement) {
      const regex = searchWord ? new RegExp(searchWord, "gi") : null;

      const highlightText = (node: HTMLElement) => {
        const walker = document.createTreeWalker(
          node,
          NodeFilter.SHOW_TEXT,
          null
        );
        let textNode = walker.nextNode();
        const nodesToReplace: { oldNode: Node; newNode: Node }[] = [];
        while (textNode) {
          if (
            textNode.nodeValue &&
            regex?.test(textNode.nodeValue.toLowerCase())
          ) {
            const span = document.createElement("span");
            span.innerHTML = textNode.nodeValue.replace(
              regex,
              `<span style="color: #ec623f;">${searchWord}</span>`
            );
            nodesToReplace.push({ oldNode: textNode, newNode: span });
          }
          textNode = walker.nextNode();
        }
        nodesToReplace.forEach(({ oldNode, newNode }) => {
          oldNode?.parentNode?.replaceChild(newNode, oldNode);
        });
      };

      const removeHighlight = (node: HTMLElement) => {
        const spans = node.querySelectorAll('span[style="color: #ec623f;"]');
        spans.forEach((span) => {
          const parent = span.parentNode;
          if (parent) {
            parent.replaceChild(
              document.createTextNode(span.textContent || ""),
              span
            );
            parent.normalize();
          }
        });
      };

      removeHighlight(tbodyElement);
      if (searchWord && searchWord.trim()) {
        highlightText(tbodyElement);
      }
    }
  }, [searchWord]);
  return (
    <>
      {!isDownSm && (
        <>
          <DataTableRow
            className={classes.tableRow}
            hover
            sx={{
              borderRadius: 2,
              borderTop: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
              borderBottom: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
              [`&.${tableRowClasses.root}`]: checked && {
                backgroundColor: "background.paper",
                boxShadow: theme.customShadows.z20,
                transition: theme.transitions.create(
                  ["background-color", "box-shadow"],
                  {
                    duration: theme.transitions.duration.shortest,
                  }
                ),
                "&:hover": {
                  backgroundColor: "background.paper",
                  boxShadow: theme.customShadows.z20,
                },
              },
              [`&:hover`]: {
                backgroundColor: "background.paper",
                boxShadow: theme.customShadows.z20,
                transition: theme.transitions.create(
                  ["background-color", "box-shadow"],
                  {
                    duration: theme.transitions.duration.shortest,
                  }
                ),
                "&:hover": {
                  backgroundColor: "background.paper",
                  boxShadow: theme.customShadows.z20,
                },
              },
              [`& .${tableCellClasses.root}`]: {
                ...defaultStyles,
              },
              ...{
                [`& .${tableCellClasses.root}`]: {
                  ...defaultStyles,
                },
              },
            }}
          >
            <DataTableCell>
              <DataTableRowCheckbox
                onClick={(e) => {
                  e.stopPropagation();
                }}
                dataId={`${row.uploadFileId}`}
                data={row}
                size="small"
                id="upload-files-checkbox"
                data-tid="upload-files-checkbox"
              />
            </DataTableCell>
            {tagShow && (
              <DataTableCell>
                <OrgTagsInDataTableRow
                  organizationTagTargetList={row.organizationTagTargetList}
                />
              </DataTableCell>
            )}
            <DataTableCell>
              <FileThumbnail
                file={row.uploadFileExtensionName}
                sx={{ width: 36, height: 36 }}
              />
              <DynamicFieldWithAction
                value={row.uploadFileName}
                name="uploadFileName"
                columnType={ColumnType.TEXT}
                handleChange={handleUpdateFileName}
                showHistoryIcon={false}
              />
            </DataTableCell>
            <DataTableCell>{row.uploadFileExtensionName}</DataTableCell>
            <DataTableCell>{formatFileSize(row.uploadFileSize)}</DataTableCell>
            <DataTableCell>{row.creator?.memberName}</DataTableCell>
            <DataTableCell>
              {format(
                zonedTimeToUtc(
                  new Date(row.uploadFileCreateDate),
                  "Asia/Taipei"
                ),
                "PP pp",
                { locale: zhCN }
              )}
            </DataTableCell>
            <DataTableCell
              align="left"
              sx={{
                px: 1,
                whiteSpace: "nowrap",
              }}
            >
              <IconButton
                id="upload-files-action-btn"
                data-tid="upload-files-action-btn"
                color={popover.open ? "inherit" : "default"}
                onClick={popover.onOpen}
              >
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            </DataTableCell>
          </DataTableRow>

          <CustomPopover
            open={popover.open}
            onClose={popover.onClose}
            arrow="right-top"
            sx={{ width: 160 }}
          >
            {fileNameEditable && (
              <PermissionValid
                shouldBeOrgOwner
                modulePermissions={["UPDATE_ALL"]}
                specifiedTargetPermission={specifiedTargetPermission}
              >
                <MenuItem
                  id="upload-files-edit-btn"
                  data-tid="upload-files-edit-btn"
                  onClick={() => {
                    popover.onClose();
                    openDialog();
                    setSelectedFile(row);
                  }}
                >
                  <Iconify icon="ant-design:edit-filled" sx={{ mr: 1 }} />
                  {wordLibrary?.edit ?? "編輯"}
                </MenuItem>
              </PermissionValid>
            )}
            <PermissionValid shouldBeOrgOwner modulePermissions={["READ"]}>
              <MenuItem
                id="upload-files-preview-btn"
                data-tid="upload-files-preview-btn"
                onClick={() => {
                  popover.onClose();
                  handlePreviewFile(row.uploadFileId);
                }}
              >
                <Iconify
                  icon="material-symbols:visibility-rounded"
                  sx={{ mr: 1 }}
                />
                {wordLibrary?.preview ?? "預覽"}
              </MenuItem>
            </PermissionValid>

            <Divider sx={{ borderStyle: "dashed" }} />

            <PermissionValid shouldBeOrgOwner modulePermissions={["READ"]}>
              <MenuItem
                id="upload-files-download-btn"
                data-tid="upload-files-download-btn"
                onClick={() => {
                  handleDownloadFile(row.uploadFileId);
                  popover.onClose();
                }}
                // sx={{ color: "error.main" }}
              >
                <Iconify icon="ic:round-download" sx={{ mr: 1 }} />
                {wordLibrary?.download ?? "下載"}
              </MenuItem>
            </PermissionValid>
            <PermissionValid shouldBeOrgOwner modulePermissions={["READ"]}>
              <MenuItem onClick={handleDeleteUploadFiles}>
                <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} />
                {wordLibrary?.delete ?? "刪除"}
              </MenuItem>
            </PermissionValid>
          </CustomPopover>
        </>
      )}
      {isDownSm && (
        <DataTableRow
          className={tableRWDClasses.tableRowRWD}
          hover
          sx={{
            borderRadius: 2,
            [`&.${tableRowClasses.root}`]: checked && {
              backgroundColor: "background.paper",
              boxShadow: theme.customShadows.z20,
              transition: theme.transitions.create(
                ["background-color", "box-shadow"],
                {
                  duration: theme.transitions.duration.shortest,
                }
              ),
              "&:hover": {
                backgroundColor: "background.paper",
                boxShadow: theme.customShadows.z20,
              },
            },
            [`&:hover`]: {
              backgroundColor: "background.paper",
              boxShadow: theme.customShadows.z20,
              transition: theme.transitions.create(
                ["background-color", "box-shadow"],
                {
                  duration: theme.transitions.duration.shortest,
                }
              ),
              "&:hover": {
                backgroundColor: "background.paper",
                boxShadow: theme.customShadows.z20,
              },
            },
            [`& .${tableCellClasses.root}`]: {
              ...defaultStyles,
            },
            ...{
              [`& .${tableCellClasses.root}`]: {
                ...defaultStyles,
              },
            },
          }}
        >
          <DataTableCell className={tableRWDClasses.checkBox}>
            <DataTableRowCheckbox
              onClick={(e) => {
                e.stopPropagation();
              }}
              dataId={`${row.uploadFileId}`}
              data={row}
              size="small"
              id="upload-files-checkbox"
              data-tid="upload-files-checkbox"
            />{" "}
            <IconButton
              color={popover.open ? "inherit" : "default"}
              onClick={popover.onOpen}
              id="upload-files-action-btn"
              data-tid="upload-files-action-btn"
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </DataTableCell>
          <DataTableCell>
            <OrgTagsInDataTableRow
              organizationTagTargetList={row.organizationTagTargetList}
            />
          </DataTableCell>
          <DataTableCell
            sx={{
              px: 1,
            }}
          >
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[0]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              <FileThumbnail
                file={row.uploadFileExtensionName}
                sx={{ width: 36, height: 36 }}
              />
              <DynamicFieldWithAction
                value={row.uploadFileName}
                name="uploadFileName"
                columnType={ColumnType.TEXT}
                handleChange={handleUpdateFileName}
                showHistoryIcon={false}
              />
            </Box>
          </DataTableCell>
          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[1]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>{row.uploadFileSize}</Box>
          </DataTableCell>
          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[2]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              {row.creator?.memberName}
            </Box>
          </DataTableCell>
          <DataTableCell>
            <Box className={tableRWDClasses.columnCell}>
              {columns ? columns[3]?.name : ""}
            </Box>
            <Box className={tableRWDClasses.rowCell}>
              {format(
                zonedTimeToUtc(
                  new Date(row.uploadFileCreateDate),
                  "Asia/Taipei"
                ),
                "PP pp",
                { locale: zhCN }
              )}
            </Box>
          </DataTableCell>
          <CustomPopover
            open={popover.open}
            onClose={popover.onClose}
            arrow="right-top"
            sx={{ width: 160 }}
          >
            {fileNameEditable && (
              <PermissionValid
                shouldBeOrgOwner
                modulePermissions={["UPDATE_ALL"]}
                specifiedTargetPermission={specifiedTargetPermission}
              >
                <MenuItem
                  id="upload-files-edit-btn"
                  data-tid="upload-files-edit-btn"
                  onClick={() => {
                    popover.onClose();
                    openDialog();
                    setSelectedFile(row);
                  }}
                >
                  <Iconify icon="ant-design:edit-filled" />
                  {wordLibrary?.edit ?? "編輯"}
                </MenuItem>
              </PermissionValid>
            )}
            <PermissionValid shouldBeOrgOwner modulePermissions={["READ"]}>
              <MenuItem
                id="upload-files-preview-btn"
                data-tid="upload-files-preview-btn"
                onClick={() => {
                  popover.onClose();
                  handlePreviewFile(row.uploadFileId);
                }}
              >
                <Iconify icon="material-symbols:visibility-rounded" />
                {wordLibrary?.preview ?? "預覽"}
              </MenuItem>
            </PermissionValid>

            <Divider sx={{ borderStyle: "dashed" }} />

            <PermissionValid shouldBeOrgOwner modulePermissions={["READ"]}>
              <MenuItem
                id="upload-files-download-btn"
                data-tid="upload-files-download-btn"
                onClick={() => {
                  handleDownloadFile(row.uploadFileId);
                  popover.onClose();
                }}
                // sx={{ color: "error.main" }}
              >
                <Iconify icon="ic:round-download" />
                {wordLibrary?.download ?? "下載"}
              </MenuItem>
            </PermissionValid>
            <PermissionValid shouldBeOrgOwner modulePermissions={["READ"]}>
              <MenuItem onClick={handleDeleteUploadFiles}>
                <Iconify icon="solar:trash-bin-trash-bold" />
                {wordLibrary?.delete ?? "刪除"}
              </MenuItem>
            </PermissionValid>
          </CustomPopover>
        </DataTableRow>
      )}
    </>
  );
};

export default UploadFilesDataTableRow;
