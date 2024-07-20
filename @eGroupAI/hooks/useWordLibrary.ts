import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "redux/configureAppStore";
import { setWordLibrary } from "redux/wordLibrary";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { getNavigatorLanguage } from "@eGroupAI/utils";

import fetchWordLibrary from "./FetchWordLibrary";

function useWordLibrary() {
  const locale2LanguageMap = {
    en_US: "en-US",
    zh_TW: "zh-TW",
    ja_JP: "ja-JP",
  };

  const browserPreferedLanguage = getNavigatorLanguage(); // format: 'en', 'en-US' ...
  const defaultBrowserLanguage =
    Object.values(locale2LanguageMap).find((languageValue) =>
      languageValue.includes(browserPreferedLanguage)
    ) || "en-US";
  const defaultLocale = defaultBrowserLanguage.replace(/-/g, "_");

  let currentLocale = defaultLocale;
  const storageKey = "wordLibrary";
  const cachedLibrary = localStorage.getItem(storageKey);

  if (cachedLibrary) {
    const { language: storedLanguage } = JSON.parse(cachedLibrary);
    currentLocale = storedLanguage || defaultLocale;
  }

  const dispatch = useAppDispatch();
  const wordLibrary = useSelector(getWordLibrary);
  const [language, setLanguage] = useState(currentLocale);

  useEffect(() => {
    fetchWordLibrary(language, wordLibrary)
      .then((library) => {
        dispatch(setWordLibrary(library));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  return { language, wordLibrary, setLanguage };
}

export default useWordLibrary;
