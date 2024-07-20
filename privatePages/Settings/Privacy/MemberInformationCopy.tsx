import React, { useCallback, useMemo, useState, VFC } from "react";
import { useSelector } from "react-redux";

import { makeStyles } from "@mui/styles";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useMemberInformationCopies from "@eGroupAI/hooks/apis/useMemberInformationCopies";
import { MemberInformationCopy as MemberInformationCopyType } from "@eGroupAI/typings/apis";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { Paper, TableRowProps, Tooltip } from "@eGroupAI/material";
import {
  EachRowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import I18nDataTable from "components/I18nDataTable";
import SearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";

import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";
import { format as formatDate } from "@eGroupAI/utils/dateUtils";

import { Button, IconButton } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";

import MemberInformationCopyDialog, {
  DIALOG,
} from "./MemberInformationCopyDialog";

const useStyles = makeStyles(() => ({
  editSectionClass: {
    borderRadius: 0,
  },
}));

const MemberInformationCopy: VFC = () => {
  const classes = useStyles();
  const wordLibrary = useSelector(getWordLibrary);

  const {
    data: copies,
    isValidating: isLoading,
    mutate,
  } = useMemberInformationCopies();

  const { excute: createMemberInformationCopy, isLoading: isCreating } =
    useAxiosApiWrapper(apis.member.createMemberInformationCopy, "Create");
  const { excute: deleteMemberInformationCopy, isLoading: isDeleting } =
    useAxiosApiWrapper(apis.member.deleteMemberInformationCopy, "Delete");
  const { excute: downloadMemberInformationCopy, isLoading: isDownloading } =
    useAxiosApiWrapper(apis.member.downloadMemberInformationCopy, "Read");

  const { openDialog: openInformationCopyDialog, closeDialog } =
    useReduxDialog(DIALOG);

  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [, setCheckedAll] = useState(false);
  const [eachRowState, setEachRowState] = useState<
    EachRowState<
      MemberInformationCopyType & {
        TableRowProps: TableRowProps;
      }
    >
  >({});

  const selectedCopies = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => el?.checked)
        .map((el) => {
          const { TableRowProps: trp, ...other } = el?.data || {};
          return other as MemberInformationCopyType;
        }),
    [eachRowState]
  );

  const handleCheckedAllClick = useCallback(() => {
    setCheckedAll(true);
  }, []);

  const handleCheckedAllClearClick = useCallback(() => {
    setCheckedAll(false);
  }, []);

  const {
    handleChangePage,
    handleRowsPerPageChange,
    handleSearchChange,
    payload,
    setPayload,

    page,
    rowsPerPage,
  } = useDataTable(
    `MemberInfoCopies`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );

  const handleConfirmCreateCopy = async () => {
    try {
      await createMemberInformationCopy();
      mutate();
      closeDialog();
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: handleConfirmCreateCopy",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  const handleDeleteCopy = useCallback(async () => {
    try {
      if (selectedCopies.length === 1) {
        await deleteMemberInformationCopy({
          memberInformationCopyId: selectedCopies[0]
            ?.memberInformationCopyId as string,
        });
        setDeleteState(true);
        mutate();
      }
    } catch (e) {
      apis.tools.createLog({
        function: "DatePicker: handleDeleteCopy",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: e,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  }, [deleteMemberInformationCopy, mutate, selectedCopies]);

  const handleDownload = useCallback(async () => {
    try {
      if (selectedCopies.length === 1) {
        await downloadMemberInformationCopy({
          memberInformationCopyId: selectedCopies[0]
            ?.memberInformationCopyId as string,
        });
      }
    } catch (e) {
      apis.tools.createLog({
        function: "DatePicker: handleDownload",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: e,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  }, [downloadMemberInformationCopy, selectedCopies]);

  const buttonTools = (
    <Button
      onClick={openInformationCopyDialog}
      variant="contained"
      startIcon={<Iconify icon="mingcute:add-line" />}
    >
      {wordLibrary?.add ?? "新增"}
    </Button>
  );

  const selectedToolsbar = useMemo(
    () => (
      <>
        {selectedCopies.length === 1 && (
          <Tooltip title={wordLibrary?.download ?? "下載"}>
            <IconButton
              onClick={handleDownload}
              disabled={isDownloading}
              color="primary"
            >
              <Iconify icon="ic:round-download" width={24} />
            </IconButton>
          </Tooltip>
        )}
        {selectedCopies.length === 1 && (
          <Tooltip title={wordLibrary?.delete ?? "刪除"}>
            <IconButton
              onClick={handleDeleteCopy}
              disabled={isDeleting}
              color="primary"
            >
              <Iconify icon="solar:trash-bin-trash-bold" width={24} />
            </IconButton>
          </Tooltip>
        )}
      </>
    ),
    [
      selectedCopies.length,
      handleDeleteCopy,
      handleDownload,
      isDeleting,
      isDownloading,
      wordLibrary,
    ]
  );
  return (
    <Paper className={classes.editSectionClass}>
      <MemberInformationCopyDialog
        primary="建立副本"
        description="您隨時可以下我您的 infocenter 資訊副本。除了包含單位內的所有檻案，也包含JSON 格式以便輕鬆將資訊匯入其他服路。
下戰資訊的程序受到密碼保護，只有您能夠存取。建立副本後，您將有數天時間可以下載。"
        onConfirm={handleConfirmCreateCopy}
        isLoading={isCreating}
      />
      <I18nDataTable
        columns={[
          {
            id: "file",
            name: `${wordLibrary?.file ?? "檔案"}`,
            dataKey: "memberInformationCopyFile",
            sortKey: "memberInformationCopyFile",
          },
          {
            id: "build time",
            name: `${wordLibrary?.["creation time"] ?? "建立時間"}`,
            dataKey: "memberInformationCopyCreateDate",
            sortKey: "memberInformationCopyCreateDate",
            format: (val) =>
              formatDate(
                zonedTimeToUtc(new Date(val), "Asia/Taipei"),
                "PP pp",
                {
                  locale: zhCN,
                }
              ),
          },
          {
            id: "file format",
            name: "檔案格式",
            dataKey: "memberInformationCopyType",
            sortKey: "memberInformationCopyType",
          },
          {
            id: "status",
            name: "狀態",
            dataKey: "memberInformationCopyStatus",
            sortKey: "memberInformationCopyStatus",
          },
        ]}
        serverSide
        loading={isLoading}
        rowKey="memberInformationCopyId"
        data={copies?.source || []}
        isEmpty={copies?.total === 0}
        enableRowCheckbox
        onEachRowStateChange={(state) => {
          setEachRowState(state);
        }}
        buttonTools={buttonTools}
        selectedToolsbar={selectedToolsbar}
        MuiTablePaginationProps={{
          count: copies?.total ?? 0,
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
        onCheckedAllClick={handleCheckedAllClick}
        onCheckedAllClearClick={handleCheckedAllClearClick}
        searchBar={
          <SearchBar
            handleSearchChange={handleSearchChange}
            value={payload.query}
            placeholder={wordLibrary?.search ?? "搜尋"}
          />
        }
        deleteState={deleteState}
        setDeleteState={setDeleteState}
      />
    </Paper>
  );
};

export default MemberInformationCopy;
