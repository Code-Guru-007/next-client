import React, { useState } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import apis from "utils/apis";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useMemberOrgs from "@eGroupAI/hooks/apis/useMemberOrgs";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { Organization } from "@eGroupAI/typings/apis";
import { useRouter } from "next/router";

import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import List from "@eGroupAI/material/List";
import ListItemButton from "@eGroupAI/material/ListItemButton";
import ListItemAvatar from "@eGroupAI/material/ListItemAvatar";
import ListItemText from "@eGroupAI/material/ListItemText";
import Avatar from "@eGroupAI/material/Avatar";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogConfirmButton from "components/DialogConfirmButton";
import { getGlobalLocale } from "components/PrivateLayout/selectors";

export const DIALOG = "SelectSharedOrganizationDialog";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
  list: {
    width: "100%",
    maxWidth: 490,
    backgroundColor: theme.palette.common.white,
    borderRadius: "5px",
    [theme.breakpoints.down("md")]: {
      maxWidth: 322,
    },
    padding: 0,
  },
  listItem: {
    padding: "17px 22px",
    borderRadius: "5px",
    "&:hover": {
      backgroundColor: theme.palette.grey[600],
    },
    [theme.breakpoints.down("md")]: {
      padding: "11px 14px",
    },
  },
  listAvatar: {
    width: "54px",
    height: "54px",
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: "24px",
    lineHeight: "36px",
    alignItems: "center",
    textAlign: "center",
    color: theme.palette.common.white,
    backgroundColor: theme.palette.grey[300],
    marginRight: "20px",
    [theme.breakpoints.down("md")]: {
      width: "34px",
      height: "34px",
      fontSize: "15px",
      lineHeight: "22px",
      marginRight: "13px",
    },
  },
  listItemText: {
    color: theme.palette.grey[300],
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: "20px",
    lineHeight: "30px",
    marginRight: "20px",
    [theme.breakpoints.down("md")]: {
      fontWeight: 400,
      fontSize: "12px",
      lineHeight: "18px",
    },
  },
}));

const SelectSharedOrganizationDialog = (props) => {
  const { organizationVerifyTokenId, onSave } = props;
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const locale = useSelector(getGlobalLocale);
  const { data: orgs } = useMemberOrgs(undefined, { locale });
  const classes = useStyles();
  const theme = useTheme();
  const [selectedOrg, setSelectedOrg] = useState<Organization>();
  const wordLibrary = useSelector(getWordLibrary);
  const { excute: createOrgTargetShare, isLoading } = useAxiosApiWrapper(
    apis.org.createOrgTargetShare,
    "Create"
  );
  const organizationId = useSelector(getSelectedOrgId);
  const router = useRouter();

  const handleSave = () => {
    createOrgTargetShare({
      organizationId,
      organizationVerifyTokenId,
      sharerOrganizationId: selectedOrg?.organizationId,
    })
      .then(() => {
        if (onSave) onSave();
      })
      .catch((err) => {
        apis.tools.createLog({
          function: "DatePicker: handleSaveDynamicInfo",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: err,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      })
      .finally(() => {
        closeDialog();
        router.replace("/me/crm/users?tab=share");
      });
  };

  const handleClose = () => {
    if (!isLoading) {
      closeDialog();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={handleClose}>請選擇要被分享的單位</DialogTitle>
      <DialogContent sx={{ padding: 4, paddingTop: 0 }}>
        <List className={classes.list}>
          {orgs?.source.map((org) => (
            <ListItemButton
              className={classes.listItem}
              key={org.organizationId}
              onClick={() => {
                setSelectedOrg(org);
              }}
              selected={org.organizationId === selectedOrg?.organizationId}
            >
              <ListItemAvatar>
                <Avatar className={classes.listAvatar}>
                  {org.organizationName?.substring(0, 1).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={org.organizationName}
                className={classes.listItemText}
              />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <DialogConfirmButton onClick={handleSave} loading={isLoading}>
          {wordLibrary?.save ?? "儲存"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default SelectSharedOrganizationDialog;
