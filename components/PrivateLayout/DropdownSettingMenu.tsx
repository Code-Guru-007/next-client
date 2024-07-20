import React, { FC } from "react";
import NextLink from "next/link";
import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import { makeStyles } from "@mui/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import Link from "@eGroupAI/material/Link";
import Grid from "@eGroupAI/material/Grid";
import Typography from "@eGroupAI/material/Typography";
import ListItemText from "@eGroupAI/material/ListItemText";
import Box from "@eGroupAI/material/Box";

import MenuItem from "components/MenuItem";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";

const useStyles = makeStyles((theme) => ({
  dropdownMenu: {
    width: 350,
    padding: "10px 5px",
  },
  listLink: {
    width: "-webkit-fill-available",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
  },
  itemContent: {
    display: "flex",
    whiteSpace: "nowrap",
    alignItems: "center",
  },
  settingIcon: {
    width: 20,
    height: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    "& svg": {
      color: theme.palette.grey[200],
      width: "100%",
      fontSize: 15,
    },
  },
  settingTitleText: {
    fontSize: 15,
    color: theme.palette.grey[200],
    marginLeft: 10,
  },
}));

export interface DropdownSettinMenuProps {
  closeDropdown: () => void;
}

const DropdownSettinMenu: FC<DropdownSettinMenuProps> = function ({
  closeDropdown,
}) {
  const classes = useStyles();
  const organizationId = useSelector(getSelectedOrgId);
  const { excute: makeAllMessageHaveRead } = useAxiosApiWrapper(
    apis.message.makeAllMessageHaveRead,
    "Update"
  );

  return (
    <div className={classes.dropdownMenu}>
      <Grid container>
        <NextLink prefetch href="/me/messages" passHref legacyBehavior>
          <Link
            className={classes.listLink}
            underline="none"
            onClick={closeDropdown}
          >
            <MenuItem
              className={classes.listItem}
              onClick={async () => {
                try {
                  await makeAllMessageHaveRead({
                    organizationId,
                  });
                } catch (error) {
                  // eslint-disable-next-line no-console
                  apis.tools.createLog({
                    function: "DatePicker: handleDelete",
                    browserDescription: window.navigator.userAgent,
                    jsonData: {
                      data: error,
                      deviceInfo: getDeviceInfo(),
                    },
                    level: "ERROR",
                  });
                }
              }}
            >
              <Box className={classes.itemContent}>
                <div className={classes.settingIcon}>
                  <CheckCircleIcon className={classes.settingIcon} />
                </div>
                <ListItemText>
                  <Typography className={classes.settingTitleText}>
                    全部標示為已讀
                  </Typography>
                </ListItemText>
              </Box>
            </MenuItem>
          </Link>
        </NextLink>
        {/* <NextLink prefetch href="/me/messages" passHref>
          <Link
            className={classes.listLink}
            underline="none"
            onClick={closeDropdown}
          >
            <MenuItem className={classes.listItem}>
              <Box className={classes.itemContent}>
                <div className={classes.settingIcon}>
                  <DesktopMacIcon className={classes.settingIcon} />
                </div>
                <ListItemText>
                  <Typography className={classes.settingTitleText}>
                    Notify Setting
                  </Typography>
                </ListItemText>
              </Box>
            </MenuItem>
          </Link>
        </NextLink> */}
        {/* <NextLink prefetch href="/me/messages" passHref>
          <Link
            className={classes.listLink}
            underline="none"
            onClick={closeDropdown}
          >
            <MenuItem className={classes.listItem}>
              <Box className={classes.itemContent}>
                <div className={classes.settingIcon}>
                  <SettingsIcon className={classes.settingIcon} />
                </div>
                <ListItemText>
                  <Typography className={classes.settingTitleText}>
                    Open notify
                  </Typography>
                </ListItemText>
              </Box>
            </MenuItem>
          </Link>
        </NextLink> */}
      </Grid>
    </div>
  );
};

export default DropdownSettinMenu;
