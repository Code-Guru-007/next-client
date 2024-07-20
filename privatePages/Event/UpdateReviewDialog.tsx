import React, { FC, useState, useEffect } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import apis from "utils/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import {
  OrganizationReviewStatusType,
  ServiceModuleValue,
} from "interfaces/utils";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import useOrgReview from "utils/useOrgReview";

import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import TextField from "@eGroupAI/material/TextField";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export const DIALOG = "UpdateReviewDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface UpdateReviewDialogProps {
  eventId: string;
  orgReviewId?: string;
  reviewStatus?: OrganizationReviewStatusType;
}

const UpdateReviewDialog: FC<UpdateReviewDialogProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { eventId, orgReviewId, reviewStatus } = props;
  const classes = useStyles();
  const theme = useTheme();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const organizationId = useSelector(getSelectedOrgId);
  const { data } = useOrgReview({
    organizationId,
    organizationReviewId: orgReviewId,
  });
  const { excute: updateOrgReview, isLoading } = useAxiosApiWrapper(
    apis.org.updateOrgReview,
    "Update"
  );
  const [values, setValues] = useState<{
    organizationCommentTitle: string;
    organizationCommentContent: string;
  }>({
    organizationCommentTitle: "",
    organizationCommentContent: "",
  });
  const matchMutate = useSwrMatchMutate();

  useEffect(() => {
    if (data) {
      setValues({
        organizationCommentTitle:
          data.organizationComment.organizationCommentTitle || "",
        organizationCommentContent:
          data.organizationComment.organizationCommentContent || "",
      });
    }
  }, [data]);

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      fullWidth
      maxWidth="sm"
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={closeDialog}>
        {wordLibrary?.review ?? "審核"}
      </DialogTitle>
      <DialogContent>
        <TextField
          label={wordLibrary?.title ?? "標題"}
          fullWidth
          sx={{ mt: 2 }}
          value={values.organizationCommentTitle}
          onChange={(e) => {
            setValues((val) => ({
              ...val,
              organizationCommentTitle: e.target.value,
            }));
          }}
          id="event-review-title-input"
          data-tid="event-review-title-input"
        />
        <TextField
          label={wordLibrary?.content ?? "內容"}
          fullWidth
          sx={{ mt: 2 }}
          value={values.organizationCommentContent}
          multiline
          onChange={(e) => {
            setValues((val) => ({
              ...val,
              organizationCommentContent: e.target.value,
            }));
          }}
          id="event-review-content-input"
          data-tid="event-review-content-input"
        />
      </DialogContent>
      <DialogActions>
        <DialogCloseButton onClick={closeDialog} />
        <DialogConfirmButton
          loading={isLoading}
          onClick={async () => {
            if (orgReviewId && reviewStatus) {
              try {
                await updateOrgReview({
                  organizationId,
                  organizationReviewId: orgReviewId,
                  organizationReviewStatusType: reviewStatus,
                  organizationComment: {
                    organizationCommentTitle: values.organizationCommentTitle,
                    organizationCommentContent:
                      values.organizationCommentContent,
                  },
                  serviceModuleValue: ServiceModuleValue.EVENT,
                });
                closeDialog();
                matchMutate(
                  new RegExp(
                    `^/organizations/${organizationId}/events/${eventId}\\?`,
                    "g"
                  )
                );
                matchMutate(
                  new RegExp(
                    `^/organizations/${organizationId}/reviews\\?`,
                    "g"
                  )
                );
              } catch (error) {
                apis.tools.createLog({
                  function: "updateOrgReview: error",
                  browserDescription: window.navigator.userAgent,
                  jsonData: {
                    data: error,
                    deviceInfo: getDeviceInfo(),
                  },
                  level: "ERROR",
                });
              }
            }
          }}
          disabled={isLoading}
        />
      </DialogActions>
    </Dialog>
  );
};

export default UpdateReviewDialog;
