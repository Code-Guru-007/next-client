import React, { FC, useCallback, useMemo, useState } from "react";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";
import { useSelector } from "react-redux";

import { makeStyles } from "@mui/styles";

import { Button } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";

import Paper from "@eGroupAI/material/Paper";
import { format as formatDate } from "@eGroupAI/utils/dateUtils";
import { useDataTable } from "@eGroupAI/material-module/DataTable";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import I18nDataTable from "components/I18nDataTable";
import { OrganizationComment, OrganizationEvent } from "interfaces/entities";
import CreateCommentDialog, {
  DIALOG as COMMENT_DIALOG,
} from "./CreateCommentDialog";
import EventCommentViewDialog, {
  DIALOG as VIEW_COMMENT_DIALOG,
} from "./EventCommentViewDialog";

const useStyles = makeStyles(() => ({
  editSectionContainer: {
    padding: 0,
    borderRadius: 0,
    boxShadow: "none",
    marginBottom: 0,
    borderBottom: "1px solid #EEEEEE",
  },
}));

export interface Props {
  event?: OrganizationEvent;
  isLoadingEvent?: boolean;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const EventCommentList: FC<Props> = (props) => {
  const { event, isLoadingEvent = false, writable = false } = props;
  const classes = useStyles(props);
  const wordLibrary = useSelector(getWordLibrary);
  const { openDialog } = useReduxDialog(COMMENT_DIALOG);
  const { openDialog: openViewCommentDialog } =
    useReduxDialog(VIEW_COMMENT_DIALOG);

  const [commentData, setCommentData] = useState<OrganizationComment>(
    {} as OrganizationComment
  );

  const {
    handleChangePage,
    handleRowsPerPageChange,
    setPayload,

    page,
    rowsPerPage,
  } = useDataTable(
    `EventCommentsDataTable-${event?.organizationEventId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );

  const buttonTools = writable &&
    event?.organizationEventIsOpen === 1 &&
    !event?.isReviewing && (
      <Button
        id="table-add-button"
        data-tid="table-add-button"
        onClick={openDialog}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
      >
        {wordLibrary?.add ?? "新增"}
      </Button>
    );

  const handleOpenCommentDialog = useCallback(
    (el: OrganizationComment) => {
      setCommentData(el);
      openViewCommentDialog();
    },
    [setCommentData, openViewCommentDialog]
  );

  const tableData = useMemo(() => {
    const source = !event?.organizationCommnetList
      ? []
      : event?.organizationCommnetList.map((el) => ({
          ...el,
          TableRowProps: {
            hover: true,
            sx: { cursor: "pointer" },
            onClick: (e) => {
              e.stopPropagation();
              handleOpenCommentDialog(el);
            },
          },
        }));
    return {
      total: source.length,
      source,
    };
  }, [event?.organizationCommnetList, handleOpenCommentDialog]);

  return (
    <>
      <Paper className={classes.editSectionContainer}>
        <I18nDataTable
          columns={[
            {
              id: "creator.memberName",
              name: "評論者",
              dataKey: "creator.memberName",
            },
            {
              id: "organizationCommentTitle",
              name: wordLibrary?.title ?? "標題",
              dataKey: "organizationCommentTitle",
            },
            {
              id: "organizationCommentCreateDate",
              name: "時間",
              dataKey: "organizationCommentCreateDate",
              format: (val) =>
                formatDate(
                  zonedTimeToUtc(new Date(val), "Asia/Taipei"),
                  "PP pp",
                  {
                    locale: zhCN,
                  }
                ),
            },
          ]}
          rowKey="organizationCommentId"
          data={tableData.source}
          loading={isLoadingEvent}
          isEmpty={!tableData}
          MuiTablePaginationProps={{
            count: tableData.total,
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
          buttonTools={buttonTools}
        />
      </Paper>
      {event && <CreateCommentDialog event={event} writable={writable} />}
      {event && <EventCommentViewDialog commentData={commentData} />}
    </>
  );
};

export default EventCommentList;
