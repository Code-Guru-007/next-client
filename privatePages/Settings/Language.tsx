import React, { useState } from "react";
import PrivateLayout from "components/PrivateLayout";
import { Main } from "@eGroupAI/material-layout";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
} from "@eGroupAI/material";
import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";
import useWordLibrary from "@eGroupAI/hooks/useWordLibrary";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import { useSettingsContext } from "minimal/components/settings";
import { useAppDispatch } from "redux/configureAppStore";
import { setLocale as setGlobalLocale } from "components/PrivateLayout/actions";
import { Locale } from "interfaces/utils";

const useStyles = makeStyles((theme) => ({
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "none",
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 999,
  },
  showLoader: {
    display: "flex",
  },
  lightOpacity: {
    background: "rgba(255,255,255,0.6)",
  },
  darkOpacity: {
    background: "rgba(33, 43, 54, 0.6)",
  },
  editSec: {
    borderRadius: 0,
    minHeight: 500,
    boxShadow: "none",
  },
  container: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
  },
  descriptionText: {
    color: theme.palette.grey[500],
  },
  selectLanguage: {
    width: 220,
    height: 40,
    marginLeft: 10,
    padding: 0,
    color: theme.palette.grey[300],
    borderColor: theme.palette.grey[300],
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "& div.MuiSelect-select": {
      zIndex: 1,
    },
  },
}));

const Language = function () {
  const classes = useStyles();
  const settings = useSettingsContext();
  const dispatch = useAppDispatch();

  const { language, setLanguage } = useWordLibrary();
  const { isValidating: isLoading } = useMemberInfo();

  const wordLibrary = useSelector(getWordLibrary);

  const [locale, setLocale] = useState(language);
  const handleChange = (event: SelectChangeEvent) => {
    setLocale(event.target.value);
    setLanguage(event.target.value);

    const localeKeyFound = Object.keys(Locale).find(
      (key) => Locale[key] === event.target.value
    );

    dispatch(setGlobalLocale(Locale?.[`${localeKeyFound || "ZH_TW"}`]));
  };

  return (
    <PrivateLayout title={wordLibrary?.language ?? "語言"}>
      <Main>
        <Container maxWidth={false}>
          <Box
            className={clsx(classes.loader, isLoading && classes.showLoader, {
              [classes.lightOpacity]: settings.themeMode === "light",
              [classes.darkOpacity]: settings.themeMode !== "light",
            })}
          >
            <CircularProgress />
          </Box>
          <EditSection className={classes.editSec}>
            <EditSectionHeader primary={wordLibrary?.language ?? "語言"} />
            <div className={classes.container}>
              <Typography className={classes.descriptionText}>
                {wordLibrary?.[
                  "language Used for buttons,titles,and other text seen by this account"
                ] ?? "此帳號看到的按鈕、標題和其他文字所使用的語言 :"}
              </Typography>
              <Select
                value={locale}
                className={classes.selectLanguage}
                onChange={handleChange}
              >
                <MenuItem value="zh_TW">
                  <Typography>繁體中文(台灣)</Typography>
                </MenuItem>
                <MenuItem value="en_US">
                  <Typography>English(United States)</Typography>
                </MenuItem>
                <MenuItem value="ja_JP">
                  <Typography>日本語(日本)</Typography>
                </MenuItem>
              </Select>
            </div>
          </EditSection>
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default Language;
