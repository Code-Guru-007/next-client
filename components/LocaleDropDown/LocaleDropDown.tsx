import React, { FC, useState } from "react";

import LanguageIcon from "@mui/icons-material/Language";
import Button from "@mui/material/Button";
import MenuItem from "@eGroupAI/material/MenuItem";
import Iconify from "minimal/components/iconify";
import CustomPopover, { usePopover } from "minimal/components/custom-popover";

export interface LocaleDropDownProps {
  defaultLocale?: string;
  onChange?: (locale: string) => void;
  editable?: boolean;
  id?: string;
  tId?: string;
}

const LocaleDropDown: FC<LocaleDropDownProps> = function (props) {
  const { defaultLocale = "zh_TW", onChange, editable } = props;

  const popover = usePopover();
  const [locale, setLocale] = useState<string>(defaultLocale);

  const handleSetLocale = (loca) => {
    setLocale(loca);
    if (onChange) onChange(loca);
  };

  return (
    <>
      <Button
        onClick={popover.onOpen}
        disabled={!editable}
        sx={{
          pl: 1,
          pr: 0.5,
          borderRadius: 1,
          typography: "subtitle2",
          bgcolor: "background.neutral",
        }}
        id="locale-select"
        data-tid="locale-select"
      >
        <LanguageIcon sx={{ mr: 0.5 }} />
        {locale === "zh_TW" && "繁體中文"}
        {locale === "en_US" && "English"}
        <Iconify
          width={16}
          icon={
            popover.open
              ? "eva:arrow-ios-upward-fill"
              : "eva:arrow-ios-downward-fill"
          }
          sx={{ ml: 0.5 }}
        />
      </Button>
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        sx={{ width: 140 }}
      >
        <MenuItem
          selected={locale === "zh_TW"}
          onClick={() => {
            handleSetLocale("zh_TW");
            popover.onClose();
          }}
          id="locale-item-zhTW"
        >
          繁體中文
        </MenuItem>
        <MenuItem
          selected={locale === "en_US"}
          onClick={() => {
            handleSetLocale("en_US");
            popover.onClose();
          }}
          id="locale-item-enUS"
        >
          English
        </MenuItem>
      </CustomPopover>
    </>
  );
};

export default LocaleDropDown;
