import React, { FC, useState } from "react";
import { useSelector } from "react-redux";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import { useReduxDialog } from "@eGroupAI/redux-modules";
import Grid from "@eGroupAI/material/Grid";
import Typography from "@eGroupAI/material/Typography";
import TextField from "@eGroupAI/material/TextField";
import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import NewDateRangePicker from "@eGroupAI/material-lab/NewDateRangePicker";
import { toDate, DateVariant } from "@eGroupAI/utils/dateUtils";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import Form from "components/Form";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { BulletinFormInput } from "interfaces/form";

export const DIALOG = "BulletinDialog";
export const FORM = "CreateBulletinForm";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface BulletingDialogProps {
  organizationId: string;
  onSuccessCreate?: (createdBulletinId: string) => void;
}

const BulletinDialog: FC<BulletingDialogProps> = function (props) {
  const { organizationId, onSuccessCreate } = props;
  const classes = useStyles();
  const theme = useTheme();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const [bulletin, setBulletin] = useState<BulletinFormInput>({
    isRelease: 0,
    bulletinTitle: "",
    bulletinStartDate: "",
    bulletinEndDate: "",
  });

  const wordLibrary = useSelector(getWordLibrary);

  const { excute: createBulletin, isLoading } = useAxiosApiWrapper(
    apis.org.createBulletin,
    "Create"
  );

  const handleClose = () => {
    closeDialog();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await createBulletin({
        ...bulletin,
        organizationId,
      });
      handleClose();
      if (onSuccessCreate) onSuccessCreate(resp.data.bulletinId);
    } catch (error) {
      apis.tools.createLog({
        function: "BulletinDialog: handleSubmit",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={handleClose}>新增佈告欄(未發布)</DialogTitle>
      <Form id={FORM} onSubmit={handleSubmit} loading={isLoading}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography
                variant="h5"
                color="textSecondary"
                sx={{ marginLeft: "15px" }}
              >
                {wordLibrary?.["bulletin board name"] ?? "佈告欄名稱"}
              </Typography>
              <TextField
                name="bulletinTitle"
                placeholder={
                  wordLibrary?.["bulletin board name"] ?? "佈告欄名稱"
                }
                fullWidth
                value={bulletin.bulletinTitle}
                onChange={(e) => {
                  setBulletin({
                    ...bulletin,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="h5"
                color="textSecondary"
                sx={{ marginLeft: "15px" }}
              >
                佈告欄有效期間
              </Typography>
              <NewDateRangePicker
                fullWidth
                value={{
                  startDate: toDate(bulletin.bulletinStartDate as DateVariant),
                  endDate: toDate(bulletin.bulletinEndDate as DateVariant),
                }}
                defaultStartDate={
                  toDate(bulletin.bulletinStartDate as DateVariant) as Date
                }
                defaultEndDate={
                  toDate(bulletin.bulletinEndDate as DateVariant) as Date
                }
                onChange={(dateRange) => {
                  if (dateRange) {
                    setBulletin({
                      ...bulletin,
                      bulletinStartDate: dateRange[0]
                        ? dateRange[0].toISOString()
                        : "",
                      bulletinEndDate: dateRange[1]
                        ? dateRange[1].toISOString()
                        : "",
                    });
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <DialogCloseButton onClick={handleClose}>
            {wordLibrary?.cancel ?? "取消"}
          </DialogCloseButton>
          <DialogConfirmButton
            type="submit"
            disabled={bulletin.bulletinTitle === ""}
          >
            {wordLibrary?.save ?? "儲存"}
          </DialogConfirmButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
};

export default BulletinDialog;
