import React, { FC, useEffect, useState } from "react";

import { makeStyles } from "@mui/styles";
import { useSelector } from "react-redux";

import { useRouter } from "next/router";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import { Member } from "@eGroupAI/typings/apis";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import { Box, Button, Grid, Typography } from "@eGroupAI/material";

import DeleteAccountDialog, { DIALOG } from "./DeleteAccountDialog";

export interface DeleteAccountProps {
  memberInfo?: Member;
}

const useStyles = makeStyles((theme) => ({
  editSectionContainer: {
    borderRadius: 0,
  },
  editSectionHeader: {
    marginTop: "20px",
    marginBottom: "40px",
  },
  deleteEditSectionHeader: {
    borderTop: `2px solid ${theme.palette.grey[300]}`,
    marginTop: "20px",
    paddingTop: "20px",
    marginBottom: "40px",
  },
  textField: {
    display: "flex",
    marginRight: 2,
    marginBottom: "30px",
    wordBreak: "break-word",
    "& .MuiTypography-root": {
      fontSize: "15px",
      zIndex: 1,
    },
  },
}));

const DeleteAccount: FC<DeleteAccountProps> = (props) => {
  const classes = useStyles();
  const { memberInfo } = props;
  const { openDialog } = useReduxDialog(DIALOG);
  const router = useRouter();
  const wordLibrary = useSelector(getWordLibrary);

  const verifyStatusToDelete = window.localStorage.getItem(
    "verifiedBy3rdPartyLogin"
  );
  const [verified, setVerifiedAccount] = useState<string | null>(
    verifyStatusToDelete
  );

  const handleDownloadMemberInfo = async () => {
    router.replace(`${router.pathname}?tab=SYSTEM_INFO`);
  };

  const handleAccountDelete = () => {
    openDialog();
  };

  useEffect(() => {
    if (verifyStatusToDelete) {
      setVerifiedAccount(verifyStatusToDelete);
      window.localStorage.removeItem("verifyStatusToDelete");
    }
  }, [verifyStatusToDelete]);

  return (
    <>
      <EditSection className={classes.editSectionContainer}>
        <EditSectionHeader
          primary="刪除帳號"
          className={classes.editSectionHeader}
        />
        <Grid container>
          <Grid item xs={12}>
            <Stack direction="column" marginBottom={2}>
              <ListItemText
                primary={wordLibrary?.name ?? "名稱"}
                secondary={memberInfo?.memberName}
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
          </Grid>
          <Grid item xs={12}>
            <Stack direction="column" marginBottom={2}>
              <ListItemText
                primary="電子信箱"
                secondary={memberInfo?.memberEmail}
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
          </Grid>
        </Grid>
        <EditSectionHeader
          primary="刪除資料"
          className={classes.deleteEditSectionHeader}
        />
        <Grid container>
          <Grid item xs={12}>
            <Box
              display="flex"
              alignItems="center"
              className={classes.textField}
            >
              <Typography style={{ marginRight: 5 }}>
                {wordLibrary?.["delete entire data"] ?? "將整筆資料進行刪除"}{" "}
              </Typography>
              <Button
                rounded
                variant="contained"
                color="error"
                onClick={handleAccountDelete}
                sx={{ ml: 3 }}
              >
                {wordLibrary?.delete ?? "刪除"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </EditSection>
      <DeleteAccountDialog
        memberInfo={memberInfo}
        onDownloadMember={handleDownloadMemberInfo}
        verified={verified}
      />
    </>
  );
};

export default DeleteAccount;
