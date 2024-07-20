import React, { FC, useState, useEffect } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import apis from "utils/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import {
  ServiceModuleValue,
  OrganizationReviewStatusType,
} from "interfaces/utils";
import { OrganizationEvent } from "interfaces/entities";
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
import MenuItem from "components/MenuItem";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export const DIALOG = "EditDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface EditDialogProps {
  event: OrganizationEvent;
}

const EditDialog: FC<EditDialogProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { event } = props;
  const classes = useStyles();
  const theme = useTheme();
  const eventId = event.organizationEventId;
  const orgReviewId = event.organizationReview?.organizationReviewId;

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
  const [selectedReviewStatus, setSelectedReviewStatus] =
    useState<OrganizationReviewStatusType>(
      OrganizationReviewStatusType.SUCCESS
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
          label={wordLibrary?.["submission target"] ?? "提交審核對象"}
          value={selectedReviewStatus}
          onChange={(e) =>
            setSelectedReviewStatus(
              e.target.value as OrganizationReviewStatusType
            )
          }
          select
          fullWidth
          required
          sx={{ mt: 1 }}
        >
          <MenuItem
            key={OrganizationReviewStatusType.SUCCESS}
            value={OrganizationReviewStatusType.SUCCESS}
          >
            審核成功
          </MenuItem>
          <MenuItem
            key={OrganizationReviewStatusType.REJECT}
            value={OrganizationReviewStatusType.REJECT}
          >
            審核駁回
          </MenuItem>
        </TextField>
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
        />
      </DialogContent>
      <DialogActions>
        <DialogCloseButton onClick={closeDialog} />
        <DialogConfirmButton
          loading={isLoading}
          onClick={async () => {
            if (orgReviewId && selectedReviewStatus) {
              try {
                await updateOrgReview({
                  organizationId,
                  organizationReviewId: orgReviewId,
                  organizationReviewStatusType: selectedReviewStatus,
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
        />
      </DialogActions>
    </Dialog>
  );
};

export default EditDialog;
