import React from "react";

import { Typography } from "@eGroupAI/material";
import LanguageIcon from "@mui/icons-material/Language";
import ButtonBase from "@mui/material/ButtonBase";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import MenuItem from "@eGroupAI/material/MenuItem";
import makeStyles from "@mui/styles/makeStyles";
import { useAppDispatch } from "redux/configureAppStore";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import { Locale, LocaleMap } from "interfaces/utils";
import Iconify from "minimal/components/iconify";
import CustomPopover, { usePopover } from "minimal/components/custom-popover";
import { setLocale } from "./actions";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
    "&. MuiTypography-root": {
      fontSize: 15,
    },
  },
  title: {
    margin: "5px 0 5px 0",
  },
}));

const OrgInfoHeader = function () {
  const dispatch = useAppDispatch();
  const popover = usePopover();
  const locale = useSelector(getGlobalLocale);
  const classes = useStyles();
  const wordLibrary = useSelector(getWordLibrary);

  return (
    <div className={classes.root}>
      <Typography variant="body1" className={classes.title}>
        {wordLibrary?.["organization information"] ?? "單位資訊"}
      </Typography>
      <div>
        <ButtonBase
          onClick={popover.onOpen}
          sx={{
            pl: 1,
            py: 0.5,
            pr: 0.5,
            borderRadius: 1,
            typography: "subtitle2",
            bgcolor: "background.neutral",
          }}
        >
          <LanguageIcon />
          {LocaleMap[locale]}
          <Iconify
            width={16}
            icon={
              popover.open
                ? "eva:arrow-ios-upward-fill"
                : "eva:arrow-ios-downward-fill"
            }
            sx={{ ml: 0.5 }}
          />
        </ButtonBase>
        <CustomPopover
          open={popover.open}
          onClose={popover.onClose}
          sx={{ width: 140 }}
        >
          <MenuItem
            selected={locale === Locale.ZH_TW}
            onClick={() => {
              dispatch(setLocale(Locale.ZH_TW));
              popover.onClose();
            }}
          >
            {LocaleMap[Locale.ZH_TW]}
          </MenuItem>
          <MenuItem
            selected={locale === Locale.EN_US}
            onClick={() => {
              dispatch(setLocale(Locale.EN_US));
              popover.onClose();
            }}
          >
            {LocaleMap[Locale.EN_US]}
          </MenuItem>
        </CustomPopover>
      </div>
    </div>
  );
};

export default OrgInfoHeader;
