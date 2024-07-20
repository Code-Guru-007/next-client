import React, { FC, useMemo, useState } from "react";
import { zhTW } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";
import { makeStyles } from "@mui/styles";

import { format as formatDate } from "@eGroupAI/utils/dateUtils";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useOrgReviews from "utils/useOrgReviews";
import {
  useDataTable,
  EachRowState,
} from "@eGroupAI/material-module/DataTable";

import Box from "@eGroupAI/material/Box";
import Button from "@mui/material/Button";
import Iconify from "minimal/components/iconify/iconify";

import { getWordLibrary } from "redux/wordLibrary/selectors";
import PermissionValid from "components/PermissionValid";

import I18nDataTable from "components/I18nDataTable";
import EditSection from "components/EditSection";
import {
  OrganizationReviewStatusType,
  OrganizationReviewStatusTypeMap,
} from "interfaces/utils";
import { OrganizationReview, OrganizationEvent } from "interfaces/entities";
import UpdateReviewDialog, {
  DIALOG as UPDATE_DIALOG,
} from "./UpdateReviewDialog";
import ReviewDialog, { DIALOG as REVIEW_DIALOG } from "./ReviewDialog";
import CreateReviewDialog, {
  DIALOG as CREATE_REVIEW_DIALOG,
} from "./CreateReviewDialog";

const useStyles = makeStyles(() => ({
  editSectionContainer: {
    padding: 0,
    borderRadius: 0,
    boxShadow: "none",
    marginBottom: 0,
    borderBottom: "1px solid #EEEEEE",
  },
}));
export interface EventReviewTableProps {
  event: OrganizationEvent;
  editable?: boolean;
}

const EventReviewTable: FC<EventReviewTableProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { event, editable } = props;
  const eventId = event.organizationEventId;
  const classes = useStyles();
  const organizationId = useSelector(getSelectedOrgId);
  const [eachRowState, setEachRowState] = useState<
    EachRowState<OrganizationReview>
  >({});
  const { data: reviews } = useOrgReviews(
    {
      organizationId,
    },
    {
      targetId: eventId,
    }
  );
  const {
    handleChangePage,
    handleRowsPerPageChange,

    page,
    rowsPerPage,
  } = useDataTable(
    `EventReviewsDataTable-${event?.organizationEventId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );
  const { openDialog: openUpdateReviewDialog } = useReduxDialog(UPDATE_DIALOG);
  const { openDialog: openReviewDialog } = useReduxDialog(REVIEW_DIALOG);
  const { openDialog: openCreateReviewDialog } =
    useReduxDialog(CREATE_REVIEW_DIALOG);
  const [selectedReviewStatus, setSelectedReviewStatus] =
    useState<OrganizationReviewStatusType>();
  const [selectedReview, setSelectedReview] = useState<string | undefined>();

  const selectedReviews = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => el?.checked)
        .map((el) => el?.data),
    [eachRowState]
  );

  const canAddReview = () =>
    !reviews?.source
      .map((el) => el.organizationReviewStatusType as string)
      .includes("PROCESSING");

  const buttonTools = editable && canAddReview() && (
    <Button
      onClick={openCreateReviewDialog}
      variant="contained"
      startIcon={<Iconify icon="mingcute:add-line" />}
      id="table-add-button"
      data-tid="table-add-button"
    >
      {wordLibrary?.["submit for review"] ?? "提交審核"}
    </Button>
  );

  const tableData = useMemo(
    () =>
      reviews?.source.map((el) => ({
        ...el,
        TableRowProps: {
          hover: true,
          sx: { cursor: "pointer" },
          onClick: () => {
            setSelectedReview(el.organizationReviewId);
            openReviewDialog();
          },
        },
      })) || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reviews?.source]
  );

  return (
    <>
      <UpdateReviewDialog
        orgReviewId={selectedReviews[0]?.organizationReviewId}
        reviewStatus={selectedReviewStatus}
        eventId={eventId}
      />
      <ReviewDialog orgReviewId={selectedReview} />
      <CreateReviewDialog event={event} />
      <EditSection
        sx={{ marginBottom: 2 }}
        className={classes.editSectionContainer}
      >
        <>
          <I18nDataTable
            rowKey="organizationReviewId"
            columns={[
              {
                id: "organizationReviewStatusType",
                name: wordLibrary?.["review status"] ?? "審核狀態",
                dataKey: "organizationReviewStatusType",
                format: (val) =>
                  val ? OrganizationReviewStatusTypeMap[val as string] : val,
              },
              {
                id: "submiter",
                name: wordLibrary?.submitter ?? "提交人員",
                dataKey: "submiter.memberName",
              },
              {
                id: "reviewer",
                name: wordLibrary?.reviewers ?? "審核人員",
                dataKey: "reviewer.memberName",
              },
              {
                id: "organizationReviewCreateDate",
                name: wordLibrary?.["submission time"] ?? "提交審核時間",
                dataKey: "organizationReviewCreateDate",
                format: (val) =>
                  formatDate(
                    zonedTimeToUtc(new Date(val), "Asia/Taipei"),
                    "PP pp",
                    {
                      locale: zhTW,
                    }
                  ),
              },
              {
                id: "organizationReviewUpdateDate",
                name: wordLibrary?.["review update time"] ?? "審核更新時間",
                dataKey: "organizationReviewUpdateDate",
                format: (val) =>
                  formatDate(
                    zonedTimeToUtc(new Date(val), "Asia/Taipei"),
                    "PP pp",
                    {
                      locale: zhTW,
                    }
                  ),
              },
            ]}
            enableRowCheckbox
            data={tableData}
            onEachRowStateChange={(state) => {
              setEachRowState(state);
            }}
            MuiTablePaginationProps={{
              count: reviews?.source.length ?? 0,
              page,
              rowsPerPage,
              onPageChange: handleChangePage,
              onRowsPerPageChange: handleRowsPerPageChange,
            }}
            isEmpty={!reviews || reviews?.total === 0}
            buttonTools={buttonTools}
          />
          <PermissionValid modulePermissions={["AUDIT"]}>
            {selectedReviews.length === 1 &&
              selectedReviews[0]?.organizationReviewStatusType ===
                OrganizationReviewStatusType.PROCESSING &&
              editable && (
                <Box display="flex" justifyContent="center" gap={1} mt={2}>
                  <Button
                    onClick={() => {
                      setSelectedReviewStatus(
                        OrganizationReviewStatusType.REJECT
                      );
                      openUpdateReviewDialog();
                    }}
                    color="error"
                    variant="contained"
                    fullWidth
                    disableElevation
                    id="update-event-review-reject-button"
                    data-tid="update-event-review-reject-button"
                  >
                    {
                      OrganizationReviewStatusTypeMap[
                        OrganizationReviewStatusType.REJECT
                      ]
                    }
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedReviewStatus(
                        OrganizationReviewStatusType.SUCCESS
                      );
                      openUpdateReviewDialog();
                    }}
                    color="success"
                    variant="contained"
                    fullWidth
                    disableElevation
                    sx={{ color: "white !important" }}
                    id="update-event-review-success-button"
                    data-tid="update-event-review-success-button"
                  >
                    {
                      OrganizationReviewStatusTypeMap[
                        OrganizationReviewStatusType.SUCCESS
                      ]
                    }
                  </Button>
                </Box>
              )}
          </PermissionValid>
        </>
      </EditSection>
    </>
  );
};

export default EventReviewTable;
