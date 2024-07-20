import React, { FC, useState } from "react";

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
import { OrganizationEvent } from "interfaces/entities";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import useOrgRoles from "@eGroupAI/hooks/apis/useOrgRoles";
import TextField from "@mui/material/TextField";

import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import MenuItem from "components/MenuItem";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export const DIALOG = "CreateReviewDialog";
export const FORM = "CreateReviewFORM";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface CreateReviewDialogProps {
  event: OrganizationEvent;
}

const CreateReviewDialog: FC<CreateReviewDialogProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { event } = props;
  const classes = useStyles();
  const theme = useTheme();
  const targetId = event.organizationEventId;
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const organizationId = useSelector(getSelectedOrgId);
  const { data } = useOrgRoles(
    {
      organizationId,
    },
    {
      serviceModuleValue: ServiceModuleValue.EVENT,
      apiOperation: "AUDIT",
    }
  );
  const { excute: createOrgReview, isLoading } = useAxiosApiWrapper(
    apis.org.createOrgReview,
    "Create"
  );
  const [selectedOrgRoleId, setSelectedOrgRoleId] = useState("");
  const matchMutate = useSwrMatchMutate();

  return (
    <>
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
          {wordLibrary?.["submit for review"] ?? "提交審核"}
        </DialogTitle>
        <DialogContent>
          <form
            id={FORM}
            onSubmit={async (e) => {
              e.preventDefault();
              if (targetId) {
                try {
                  await createOrgReview({
                    organizationId,
                    targetId,
                    organizationReviewStatusType:
                      OrganizationReviewStatusType.PROCESSING,
                    organizationRole: {
                      organizationRoleId: selectedOrgRoleId,
                    },
                    serviceModuleValue: ServiceModuleValue.EVENT,
                  });
                  closeDialog();
                  matchMutate(
                    new RegExp(
                      `^/organizations/${organizationId}/events/${targetId}\\?`,
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
                    function: "createOrgReview: error",
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
          >
            <TextField
              label={wordLibrary?.["submission target"] ?? "提交審核對象"}
              value={selectedOrgRoleId}
              onChange={(e) => setSelectedOrgRoleId(e.target.value)}
              select
              fullWidth
              required
              sx={{ mt: 1 }}
              id="event-review-target-input"
              data-tid="event-review-target-input"
            >
              {data?.source.map((el) => (
                <MenuItem
                  key={el.organizationRoleId}
                  value={el.organizationRoleId}
                >
                  {el.organizationRoleNameZh}
                </MenuItem>
              ))}
            </TextField>
          </form>
        </DialogContent>
        <DialogActions>
          <DialogCloseButton onClick={closeDialog} />
          <DialogConfirmButton
            loading={isLoading}
            type="submit"
            form={FORM}
            disabled={isLoading}
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateReviewDialog;
