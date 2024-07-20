import React, { FC, HTMLAttributes } from "react";

import { makeStyles } from "@mui/styles";

import Tabs, { TabsProps as EgTabsProps } from "@eGroupAI/material/Tabs";
import Tab from "@eGroupAI/material/Tab";
import { LocaleMap, Locale } from "interfaces/utils";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    marginBottom: "1rem",

    "& .MuiButtonBase-root": {
      ...theme.typography.h5,
    },
  },
  divider: {
    position: "absolute",
    borderBottom: `2px solid ${theme.palette.divider}`,
    bottom: 0.5,
    left: 0,
    right: 0,
  },
}));

export interface I18nTabsProps extends HTMLAttributes<HTMLDivElement> {
  TabsProps?: EgTabsProps;
  disabled?: boolean;
}

const I18nTabs: FC<I18nTabsProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { TabsProps, disabled, ...other } = props;
  const classes = useStyles();
  return (
    <div className={classes.root} {...other}>
      <Tabs centered {...TabsProps}>
        <Tab
          label={
            wordLibrary?.[LocaleMap[Locale.ZH_TW]] ?? LocaleMap[Locale.ZH_TW]
          }
          value={Locale.ZH_TW}
          disabled={disabled}
        />
        <Tab
          label={
            wordLibrary?.[LocaleMap[Locale.EN_US]] ?? LocaleMap[Locale.EN_US]
          }
          value={Locale.EN_US}
          disabled={disabled}
        />
      </Tabs>
      <div className={classes.divider} />
    </div>
  );
};

export default I18nTabs;
