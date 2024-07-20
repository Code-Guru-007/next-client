import React, { FC, useEffect, useMemo, useState } from "react";

import DialogTitle from "@eGroupAI/material/DialogTitle";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { ColumnType } from "@eGroupAI/typings/apis";
import DialogActions from "@mui/material/DialogActions";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import Button from "@eGroupAI/material/Button";
import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import Typography from "@eGroupAI/material/Typography";
import { Grid, Stack } from "@mui/material";
import FroalaEditorView from "components/FroalaEditorView";
import {
  OrganizationTargetHistoryFullContent,
  OrganizationTargetHistoryRecord,
} from "interfaces/entities";
import { Table } from "interfaces/utils";
import Markdown from "minimal/components/markdown";
import Scrollbar from "minimal/components/scrollbar";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useOrgTargetHistoryRecords from "utils/useOrgTargetHistoryRecords";

import { HistoryFullContentBodySkeleton } from "./HistoryFullContentBodySkeleton";
import HistoryFullContentHeaderDetail from "./HistoryFullContentHeaderDetail";
import HistoryHeaderDetail from "./history-header-detail";
import HistoryNav from "./history-nav";

export const DIALOG = "TargetHistoryRecordDialog";

export type RecordTarget = {
  key?: string;
  type?: ColumnType;
  name?: string;
  permission?: {
    readable?: boolean;
    writable?: boolean;
    deletable?: boolean;
  };
};
export interface TargetHistoryRecordDialogProps {
  targetId: string;
  recordTarget: RecordTarget;
  targetTitle: string;
  targetContent: string;
  targetIsRelease: number;
  advancedSearchTable: Table;
  onUpdate?: () => void;
  onHandleClose?: () => void;
}

const TargetHistoryRecordDialog: FC<TargetHistoryRecordDialogProps> = function (
  props
) {
  const {
    targetTitle,
    targetIsRelease,
    targetId,
    advancedSearchTable,
    onUpdate,
    onHandleClose,
  } = props;
  const theme = useTheme();
  const wordLibrary = useSelector(getWordLibrary);

  const { closeDialog, isOpen } = useReduxDialog(
    `${advancedSearchTable}-${DIALOG}`
  );

  const organizationId = useSelector(getSelectedOrgId);
  const [isViewFullDoc, setIsViewFullDoc] = useState<boolean>(false);
  const buttonLabel = isViewFullDoc
    ? wordLibrary?.["view change logs"] ?? "查看更改日誌"
    : wordLibrary?.["view full content"] ?? "瀏覽完整文件";
  const [selectedFullDocument, setSelectedFullDocument] =
    useState<OrganizationTargetHistoryFullContent>();
  const [selectedRecordId, setSelectedRecordId] = useState<string>();
  const [selectedRecord, setSelectedRecord] =
    useState<OrganizationTargetHistoryRecord>();
  const [isCurrentDoc] = React.useState(false);
  const [startIndex, setStartIndex] = useState<number>(0);
  const [recordListContent, setRecordListContent] = useState<
    OrganizationTargetHistoryRecord[]
  >([]);

  const {
    data: recordList,
    isValidating: isLoadingRecordList,
    mutate,
  } = useOrgTargetHistoryRecords(
    {
      organizationId,
      advancedSearchTable,
      targetId,
    },
    { startIndex, size: 10 }
  );

  const historyListitemIndex = useMemo(
    () =>
      recordListContent.findIndex(
        (record) => record.targetHistoryRecordId === selectedRecordId
      ),
    [recordListContent, selectedRecordId]
  );

  useEffect(() => {
    setSelectedRecord(
      recordListContent.find(
        (record) => record.targetHistoryRecordId === selectedRecordId
      )
    );
  }, [selectedRecordId, recordListContent]);

  const { excute: restoreOrgTargetHistoryRecord, isLoading: isRestoring } =
    useAxiosApiWrapper(apis.org.restoreOrgTargetHistoryRecord, "Update");

  const { excute: targetHistoryRecordsRestore, isLoading: isHistoryRestoring } =
    useAxiosApiWrapper(apis.org.targetHistoryRecordsRestore, "Update");

  const {
    excute: getOrgTargetHistoryRecordVersion,
    isLoading: isLoadingFullContent,
  } = useAxiosApiWrapper(apis.org.getOrgTargetHistoryRecordVersion, "None");

  useEffect(() => {
    if (selectedRecordId && isOpen && isViewFullDoc)
      getOrgTargetHistoryRecordVersion({
        organizationId,
        targetId,
        advancedSearchTable,
        targetHistoryRecordId: selectedRecordId,
      })
        .then((res) => {
          setSelectedFullDocument(res.data);
        })
        .catch(() => {});
    else if (isOpen && !selectedRecordId && recordList?.content[0]) {
      setSelectedRecordId(recordList?.content[0].targetHistoryRecordId);
    }
  }, [
    getOrgTargetHistoryRecordVersion,
    organizationId,
    selectedRecordId,
    advancedSearchTable,
    targetId,
    isOpen,
    isViewFullDoc,
    recordList?.content,
  ]);

  useEffect(() => {
    if (!isOpen) {
      setIsViewFullDoc(false);
      setSelectedRecordId(undefined);
    }
    return () => {
      setIsViewFullDoc(false);
      setSelectedRecordId(undefined);
    };
  }, [isOpen]);
  useEffect(() => {
    if (recordList?.content) {
      setRecordListContent((prevList) => {
        const combinedList = [...prevList, ...recordList.content];
        const uniqueList = Array.from(
          new Map(
            combinedList.map((item) => [item.targetHistoryRecordId, item])
          ).values()
        );
        return uniqueList;
      });
    }
  }, [recordList?.content]);

  const handleRestoreSelectedVersion = () => {
    if (selectedRecordId) {
      getOrgTargetHistoryRecordVersion({
        organizationId,
        targetId,
        advancedSearchTable,
        targetHistoryRecordId: selectedRecordId,
      }).then((res) => {
        restoreOrgTargetHistoryRecord({
          organizationId,
          advancedSearchTable,
          targetId,
          title: res.data?.targetHistoryRecordTitle || targetTitle,
          content: res.data?.targetHistoryRecordContent || "",
          isRelease: targetIsRelease,
        })
          .then(async () => {
            await targetHistoryRecordsRestore({
              organizationId,
              advancedSearchTable,
              targetId,
              title: res.data?.targetHistoryRecordTitle || targetTitle,
              content: res.data?.targetHistoryRecordContent || "",
              isRelease: targetIsRelease,
            });
            closeDialog();
            if (onHandleClose) onHandleClose();

            mutate();
            if (onUpdate) onUpdate();
          })
          .catch(() => {});
      });
    }
  };

  const handleViewFullContent = () => {
    if (isViewFullDoc) {
      setIsViewFullDoc(false);
    } else if (selectedRecordId) {
      setIsViewFullDoc(true);
    }
  };

  const renderHistoryRecordContent = () => {
    if (recordList?.totalElements === 0) {
      return (
        <Typography variant="body2">
          {wordLibrary?.["no data available"] ?? "無資料"}
        </Typography>
      );
    }

    const renderNav = (
      <HistoryNav
        records={recordListContent || []}
        loading={isLoadingRecordList}
        currentRecordId={selectedRecordId}
        onClickRecordItem={(recordId) => {
          setSelectedRecordId(recordId);
        }}
        onScrollToBottom={() => {
          setStartIndex(startIndex + 1);
        }}
        size={recordListContent?.length}
        totalElements={recordList?.totalElements || 0}
      />
    );

    const renderHead = (
      <Stack
        direction="row"
        alignItems="center"
        flexShrink={0}
        sx={{ pr: 1, pl: 2.5, py: 1, minHeight: 72 }}
      >
        <HistoryHeaderDetail
          selectedRecord={selectedRecord}
          isCurrentVersion={historyListitemIndex === 0}
        />
      </Stack>
    );

    const renderRecordHistoryContents = (
      <Scrollbar sx={{ px: 3, py: 5, height: 1 }}>
        <Stack spacing={3}>
          <Markdown
            sx={{
              "& p": {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.success.lighter,
              },
            }}
            children={selectedRecord?.targetHistoryRecordTitleAdded || ""}
          />
          <Markdown
            sx={{
              "& p": {
                textDecoration: "line-through",
                color: theme.palette.text.disabled,
                backgroundColor: theme.palette.grey[200],
              },
            }}
            children={selectedRecord?.targetHistoryRecordTitleDeleted || ""}
          />
          <Markdown
            sx={{
              "& p, & h1, & h2, & h3, & h4, & pre": {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.success.lighter,
              },
            }}
            children={selectedRecord?.targetHistoryRecordContentAdded || ""}
          />
          <Markdown
            sx={{
              "& p, & h1, & h2, & h3, & h4, & pre": {
                textDecoration: "line-through",
                color: theme.palette.text.disabled,
                backgroundColor: theme.palette.grey[200],
              },
            }}
            children={selectedRecord?.targetHistoryRecordContentDeleted || ""}
          />
        </Stack>
      </Scrollbar>
    );

    return (
      <Stack direction="row" sx={{ height: "72vh" }}>
        {renderNav}
        <Stack
          sx={{
            width: 1,
            height: 1,
            overflow: "hidden",
          }}
        >
          {renderHead}
          <Stack
            direction="row"
            sx={{
              width: 1,
              height: 1,
              overflow: "hidden",
              borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
          >
            {renderRecordHistoryContents}
          </Stack>
        </Stack>
      </Stack>
    );
  };

  const renderFullDocumentContent = () => {
    const renderFullContentHeader = (
      <Stack
        direction="row"
        alignItems="center"
        flexShrink={0}
        sx={{ minHeight: 72 }}
      >
        <HistoryFullContentHeaderDetail
          isLoading={isLoadingFullContent}
          selectedFullDocument={selectedFullDocument}
          itemIndex={historyListitemIndex}
          itemLength={recordList?.totalElements}
          records={recordListContent || []}
          setSelectedRecordId={setSelectedRecordId}
          closeDialog={() => {
            if (onHandleClose) onHandleClose();
            closeDialog();
          }}
          handleRestoreSelectedVersion={handleRestoreSelectedVersion}
          isRestoring={isRestoring}
        />
      </Stack>
    );
    const renderFullContentBody = (
      <Scrollbar
        sx={{
          height: 1,
          padding: "24px 24px 16px",
        }}
      >
        <Stack spacing={3} sx={{ mx: "auto", alignItems: "center" }}>
          {isLoadingFullContent && <HistoryFullContentBodySkeleton />}
          {!isLoadingFullContent && selectedFullDocument && (
            <Stack alignItems="center" sx={{ width: "100%" }}>
              <Grid
                sx={{
                  width: "100%",
                  maxWidth: "825px",
                  padding: "92px 40px 178px",
                  mx: "auto",
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    textAlign: "left",
                    fontSize: "40px!important",
                    fontWeight: "bold",
                    margin: "auto",
                    width: "100%",
                    marginBottom: "32px",
                    wordWrap: "break-word",
                  }}
                >
                  {selectedFullDocument?.targetHistoryRecordTitle}
                </Typography>
                <Stack
                  sx={{
                    textAlign: "left",
                    fontWeight: "bold",
                    margin: "auto",
                    width: "100%",
                    marginBottom: "32px",
                    wordWrap: "break-word",
                  }}
                >
                  <FroalaEditorView
                    model={selectedFullDocument.targetHistoryRecordContent}
                  />
                </Stack>
              </Grid>
            </Stack>
          )}
        </Stack>
      </Scrollbar>
    );

    return (
      <Stack sx={{ height: "95vh" }}>
        <Stack
          sx={{
            width: 1,
            height: 1,
            overflow: "hidden",
          }}
        >
          {renderFullContentHeader}
          <Stack
            direction="row"
            sx={{
              width: 1,
              height: 1,
              overflow: "hidden",
              borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
              justifyContent: "center",
            }}
          >
            {renderFullContentBody}
          </Stack>
        </Stack>
      </Stack>
    );
  };
  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        if (onHandleClose) onHandleClose();
        closeDialog();
      }}
      fullWidth
      fullScreen={isViewFullDoc}
      maxWidth="lg"
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
      sx={{
        m: isViewFullDoc ? "0" : "2",
        ".MuiDialog-paper": { borderRadius: isViewFullDoc ? 0 : "16px" },
      }}
    >
      {!isViewFullDoc && (
        <DialogTitle
          onClickClose={() => {
            if (onHandleClose) onHandleClose();
            closeDialog();
          }}
          isCenter
        >
          <Typography variant="h4">
            {wordLibrary?.["document change logs"] ?? "文件變更紀錄"}
          </Typography>
        </DialogTitle>
      )}
      <DialogContent>
        {isViewFullDoc
          ? renderFullDocumentContent()
          : renderHistoryRecordContent()}
      </DialogContent>
      {!isViewFullDoc && (
        <DialogActions>
          <Button
            onClick={handleRestoreSelectedVersion}
            variant="outlined"
            disabled={
              (isViewFullDoc && isCurrentDoc) ||
              isRestoring ||
              !selectedRecordId ||
              historyListitemIndex === 0
            }
            loading={isRestoring || isHistoryRestoring}
          >
            {wordLibrary?.["restore to this version"] ?? "復原至這個版本"}
          </Button>
          <Button
            onClick={handleViewFullContent}
            variant="contained"
            disabled={!selectedRecordId}
          >
            {buttonLabel}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default TargetHistoryRecordDialog;
