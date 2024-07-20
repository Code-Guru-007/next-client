import React, { FC } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useOrgFeedback from "utils/useOrgFeedback";

import Dialog from "@eGroupAI/material/Dialog";
import Typography from "@eGroupAI/material/Typography";
import Box from "@eGroupAI/material/Box";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import DialogFullPageCloseButton from "components/DialogFullPageCloseButton";
import DialogFullPageHeader from "components/DialogFullPageHeader";
import Message from "components/Message";

export const DIALOG = "FeedbackDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
  messageContent: {
    wordWrap: "break-word",
    overflowWrap: "break-word",
  },
}));

export interface FeedbackDialogProps {
  organizationFeedbackId?: string;
}

const FeedbackDialog: FC<FeedbackDialogProps> = function (props) {
  const { organizationFeedbackId } = props;
  const classes = useStyles();
  const theme = useTheme();
  const locale = useSelector(getGlobalLocale);
  const organizationId = useSelector(getSelectedOrgId);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const { data } = useOrgFeedback(
    {
      organizationId,
      organizationFeedbackId,
    },
    {
      locale,
    }
  );

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
      <DialogFullPageContainer>
        <DialogFullPageHeader>
          {/* Add centered H3 title here */}
          <Box width="100%" display="flex" justifyContent="center">
            <Typography variant="h3" component="h3" gutterBottom>
              聯絡我們
            </Typography>
          </Box>
          <Box flexGrow={1} />
          <div>
            <DialogFullPageCloseButton onClick={closeDialog} />
          </div>
        </DialogFullPageHeader>
        <Box sx={{ mb: 3 }}>
          {data?.organizationFeedbackCountry && (
            <Typography variant="h5" gutterBottom>
              國家 : {data.organizationFeedbackCountry}
            </Typography>
          )}
          {data?.organizationFeedbackCompanyName && (
            <Typography variant="h5" gutterBottom>
              公司名稱 : {data.organizationFeedbackCompanyName}
            </Typography>
          )}
          <Typography variant="h5" gutterBottom>
            姓名 : {data?.organizationFeedbackPersonName ?? ""}
          </Typography>
          <Typography variant="h5" gutterBottom>
            聯絡電話 : {data?.organizationFeedbackPersonPhone ?? ""}
          </Typography>
          <Typography variant="h5" gutterBottom>
            Email : {data?.organizationFeedbackPersonEmail ?? ""}
          </Typography>
          <Typography variant="h5" gutterBottom>
            內容 :
          </Typography>
        </Box>
        <div className={classes.messageContent}>
          {data?.organizationFeedbackContent && (
            <Message
              primary={data.organizationFeedbackTitle}
              content={data.organizationFeedbackContent}
            />
          )}
        </div>
      </DialogFullPageContainer>
    </Dialog>
  );
};

export default FeedbackDialog;
