import React, { FC } from "react";

import { OrganizationReviewStatusTypeMap } from "interfaces/utils";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import useOrgReview from "utils/useOrgReview";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import Dialog from "@eGroupAI/material/Dialog";
import DialogActions from "@eGroupAI/material/DialogActions";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogConfirmButton from "components/DialogConfirmButton";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export const DIALOG = "ReviewDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface ReviewDialogProps {
  orgReviewId?: string;
}

const ReviewDialog: FC<ReviewDialogProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { orgReviewId } = props;
  const classes = useStyles();
  const theme = useTheme();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const organizationId = useSelector(getSelectedOrgId);
  const { data } = useOrgReview({
    organizationId,
    organizationReviewId: orgReviewId,
  });

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      maxWidth="sm"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={closeDialog}>
        {wordLibrary?.["review content"] ?? "審核內容"}
      </DialogTitle>
      <DialogContent>
        <Stack direction="column" marginBottom={2}>
          <ListItemText
            primary={wordLibrary?.["review title"] ?? "審核標題"}
            secondary={data?.organizationComment.organizationCommentTitle}
            primaryTypographyProps={{
              typography: "body2",
              color: "text.secondary",
              mb: 0.5,
            }}
            secondaryTypographyProps={{
              typography: "subtitle2",
              color: "text.primary",
              component: "span",
            }}
          />
        </Stack>
        <Stack direction="column" marginBottom={2}>
          <ListItemText
            primary={wordLibrary?.["review content"] ?? "審核內容"}
            secondary={data?.organizationComment.organizationCommentContent}
            primaryTypographyProps={{
              typography: "body2",
              color: "text.secondary",
              mb: 0.5,
            }}
            secondaryTypographyProps={{
              typography: "subtitle2",
              color: "text.primary",
              component: "span",
            }}
          />
        </Stack>
        <Stack direction="column" marginBottom={2}>
          <ListItemText
            primary={wordLibrary?.["review status"] ?? "審核狀態"}
            secondary={
              data?.organizationReviewStatusType &&
              OrganizationReviewStatusTypeMap[data.organizationReviewStatusType]
            }
            primaryTypographyProps={{
              typography: "body2",
              color: "text.secondary",
              mb: 0.5,
            }}
            secondaryTypographyProps={{
              typography: "subtitle2",
              color: "text.primary",
              component: "span",
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <DialogConfirmButton onClick={closeDialog} />
      </DialogActions>
    </Dialog>
  );
};

export default ReviewDialog;
