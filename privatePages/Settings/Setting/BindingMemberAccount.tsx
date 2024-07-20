/* eslint-disable array-callback-return */
import React, { useEffect, useState } from "react";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import { Box, Button, Grid, Typography } from "@eGroupAI/material";
import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import { makeStyles } from "@mui/styles";

import { Member } from "@eGroupAI/typings/apis";
import GoogleIconSVG from "public/google.svg";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { OrganizationSetting } from "interfaces/entities";
// import FacebookIconSVG from "public/facebook.svg";

export interface BindingMemberProps {
  memberInfo: Member;
  handleBind: (thirdParty: string) => void | Promise<void | string>;
  handleUnBind: (thirdParty: string) => void | Promise<void | string>;
  loading?: boolean;
  isBinding?: boolean;
}

const useStyles = makeStyles((theme) => ({
  iconWrapper: {
    display: "flex",
    alignItems: "center",
  },
  iconBox: {
    border: "1px solid #EEEEEE",
    width: "50px",
    height: "50px",
    marginRight: "20px",
    [theme.breakpoints.down("md")]: {
      marginRight: "4px",
    },
  },
  bindingBox: {
    border: "1px solid #EEEEEE",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    boxSizing: "border-box",
    [theme.breakpoints.down("md")]: {
      padding: "4px",
    },
  },
  textField: {
    display: "flex",
    marginRight: 2,
    wordBreak: "break-word",
    "& .MuiTypography-root": {
      fontSize: "15px",
      zIndex: 1,
    },
  },
  textTitle: {
    padding: "8px 0 8px 0",
  },
  editSection: {
    borderRadius: 0,
    paddingTop: 40,
    boxShadow: "none",
    borderTop: "1px solid #EEEEEE",
    [theme.breakpoints.down("md")]: {
      margin: 0,
    },
  },
}));

const BindingMember = function (props: BindingMemberProps) {
  const classes = useStyles();
  const { memberInfo, handleBind, handleUnBind, isBinding = false } = props;
  const [googleStatus, setGoogleStatus] = useState<boolean>(
    !!memberInfo?.memberGoogleId
  );
  const [restrictionMethod, setRestrictionMethod] = useState<string[]>([]);
  const [hasFetchedOrganizationSetting, setHasFetchedOrganizationSetting] =
    useState(false);
  // const [fbStatus] = useState<boolean>(false);
  const selectedOrgId = localStorage.getItem("selectedOrgId");
  const { openDialog: openConfirmDeleteDialog, closeDialog } =
    useReduxDialog(DELETE_DIALOG);
  const { excute: getOrganizationSettings } = useAxiosApiWrapper(
    apis.org.getOrganizationSettings,
    "None"
  );
  const [organizationSettings, setOrganizationSettings] = useState<
    OrganizationSetting[]
  >([]);

  useEffect(() => {
    setGoogleStatus(!!memberInfo?.memberGoogleId);
  }, [memberInfo?.memberGoogleId]);
  useEffect(() => {
    if (selectedOrgId && !hasFetchedOrganizationSetting) {
      getOrganizationSettings({
        organizationId: selectedOrgId,
      }).then((res) => {
        setOrganizationSettings(res.data);
        res.data.forEach((oSetting) => {
          if (
            oSetting.organizationSettingType === "LOGIN_METHOD" &&
            !restrictionMethod.includes(oSetting.organizationSettingValue)
          ) {
            setRestrictionMethod((prevState) => [
              ...prevState,
              oSetting.organizationSettingValue,
            ]);
          }
        });
        setHasFetchedOrganizationSetting(true);
      });
    }
  }, []);
  const handleBindingGoogle = () => {
    if (googleStatus) {
      openConfirmDeleteDialog({
        primary: `確認中斷連結？`,
        onConfirm: () => {
          handleUnBind("google");
          closeDialog();
        },
      });
    } else handleBind("google");
  };

  // const handleBindingFB = () => {
  //   if (fbStatus) {
  //     openConfirmDeleteDialog({
  //       primary: `Do you really want to disconnect your Facebook Account?`,
  //       onConfirm: () => {
  //         handleUnBind("facebook");
  //       },
  //     });
  //   } else handleBind("facebook");
  // };
  let isLoginMethod;
  organizationSettings.map((oSetting) => {
    if (oSetting.organizationSettingType === "LOGIN_METHOD") {
      isLoginMethod = true;
    }
  });
  const isGoogle =
    (restrictionMethod &&
      restrictionMethod.includes("GOOGLE") &&
      memberInfo.hasMemberPassword === 1) ||
    (!isLoginMethod && memberInfo.hasMemberPassword === 1);

  return isGoogle ? (
    <EditSection className={classes.editSection}>
      <EditSectionHeader primary="帳號綁定" />
      <Grid container spacing={5}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" className={classes.textField}>
            <Typography>透過綁定帳號進行第三方登入</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Box
            display="flex"
            alignItems="center"
            className={classes.bindingBox}
          >
            <Box className={classes.iconWrapper}>
              <Box className={classes.iconBox}>
                <GoogleIconSVG />
              </Box>
              <Typography color={googleStatus ? "primary" : "grey"}>
                {googleStatus ? "已綁定" : "未綁定"}
              </Typography>
            </Box>
            <Button
              color={!googleStatus ? "primary" : "error"}
              rounded
              variant="contained"
              onClick={handleBindingGoogle}
              loading={isBinding}
              disabled={isBinding}
            >
              {!googleStatus ? "連結" : "取消綁定"}
            </Button>
          </Box>
          {/* <Box
            display="flex"
            alignItems="center"
            className={classes.bindingBox}
          >
            <Box className={classes.iconWrapper}>
              <Box className={classes.iconBox}>
                <FacebookIconSVG />
              </Box>
              <Typography color={fbStatus ? "primary" : "grey"}>
                {fbStatus ? "connected" : "未綁定"}
              </Typography>
            </Box>
            <Button
              color={!fbStatus ? "primary" : "error"}
              rounded
              variant="contained"
              onClick={() => {
                handleBindingFB();
              }}
              loading={isBinding}
              disabled={isBinding}
            >
              {!fbStatus ? "連結" : "Disconnect"}
            </Button>
          </Box> */}
        </Grid>
      </Grid>
    </EditSection>
  ) : null;
};

export default BindingMember;
