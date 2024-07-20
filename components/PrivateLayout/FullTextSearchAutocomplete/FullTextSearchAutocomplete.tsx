import React, { FC, useState } from "react";

import {
  useTheme,
  useMediaQuery,
  InputAdornment,
  Theme,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { makeStyles } from "@mui/styles";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { SearchTextRecordReturnType } from "utils/useOrgSearchTextRecords";

import SearchIcon from "@mui/icons-material/Search";
import RestoreIcon from "@mui/icons-material/Restore";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/router";
import clsx from "clsx";

import Iconify from "minimal/components/iconify";

type Options = {
  name: string;
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minWidth: 320,
    transition: "width 0.6s",

    [theme.breakpoints.down("md")]: {
      minWidth: 220,
      width: "100%",
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: "auto",
      width: "100%",
    },
  },
  textField: {
    "& .MuiInputBase-root input": {
      padding: "0 !important",
    },
  },
  option: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "11px 25px",
    cursor: "pointer",
    "&:hover": {
      background: "#EEEEEE",
    },
    // "&::-webkit-scrollbar": {
    //   width: "3px",
    //   height: "3px",
    // },
    // "&.MuiAutocomplete-popper ::-webkit-scrollbar-track": {
    //   background: "none",
    // },
    // "&.MuiAutocomplete-popper ::-webkit-scrollbar-thumb": {
    //   backgroundColor: "none",
    //   borderRadius: 3,
    // },
  },
  short: {
    [theme.breakpoints.down("sm")]: {
      width: 40,
      "& .MuiInputBase-root input": {
        pointerEvents: "none",
      },
      ".MuiAutocomplete-root.MuiAutocomplete-hasPopupIcon &.MuiFormControl-root .MuiOutlinedInput-root":
        {
          paddingRight: 0,
        },
    },
  },
  shortAdornment: {
    [theme.breakpoints.down("sm")]: {
      position: "absolute",
    },
  },
}));

export interface FullTextSearchAutocompleteProps {
  isEditorOpen: boolean;
  onClick?: () => void;
}

const FullTextSearchAutocomplete: FC<FullTextSearchAutocompleteProps> =
  function (props) {
    const wordLibrary = useSelector(getWordLibrary);
    const { isEditorOpen, onClick } = props;
    const classes = useStyles();
    const { push } = useRouter();
    const theme = useTheme();
    const isSm = useMediaQuery(theme.breakpoints.down("sm"));
    const [query, setQuery] = useState<string>("");
    const [focused, setFocused] = useState(false);
    const organizationId = useSelector(getSelectedOrgId);
    const [options, setOptions] = useState<Options[]>([]);
    const [type, setType] = useState<SearchTextRecordReturnType>("HISTORY");
    const [searchStr, setSearchStr] = useState({ name: "" }); // String of search input

    const { excute: getOrgSearchTextRecords, isLoading } = useAxiosApiWrapper(
      apis.org.getOrgSearchTextRecords,
      "None"
    );

    const handleInputChange = (_, v) => {
      if (v !== "") {
        setQuery(v);
        setSearchStr({ name: v });
      } else {
        setQuery("");
      }
    };

    const handleChange = (e, value) => {
      if (isEditorOpen) {
        if (onClick) {
          onClick();
        }
        return;
      }
      push(`/me/search?query=${value.name}`);
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (isEditorOpen) {
        if (onClick) {
          onClick();
        }
        return;
      }
      push(`/me/search?query=${query}`);
    };

    const search = wordLibrary?.search ?? "搜尋";
    const handleClose = () => {
      setQuery("");
      setSearchStr({ name: "" });
    };

    return (
      <form
        onSubmit={handleSubmit}
        style={{
          width: "calc(100% - 30px)",
        }}
      >
        <Autocomplete
          freeSolo
          value={searchStr}
          disableClearable
          className={clsx(classes.root)}
          loading={isLoading}
          options={options}
          isOptionEqualToValue={(option, value) => option.name === value.name}
          getOptionLabel={(option) => option.name}
          renderInput={({ InputProps, ...params }) => (
            <TextField
              placeholder={!isSm ? search : undefined}
              className={clsx(classes.textField, !focused && classes.short)}
              onFocus={async () => {
                try {
                  const res = await getOrgSearchTextRecords({
                    query,
                    organizationId,
                  });
                  setType(res.data.searchTextRecordReturnType);
                  setOptions(
                    res.data.searchTextRecordList.map((el) => ({
                      name: el.searchTextRecordQuery,
                    }))
                  );
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
              InputProps={{
                ...InputProps,
                endAdornment:
                  query === "" ? undefined : (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClose}>
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                startAdornment: (
                  <InputAdornment
                    position="start"
                    className={clsx(!focused && classes.shortAdornment)}
                  >
                    <Iconify
                      icon="eva:search-fill"
                      sx={{ color: "text.disabled" }}
                    />
                  </InputAdornment>
                ),
              }}
              {...params}
            />
          )}
          renderOption={(optionProps, option) => (
            <li {...optionProps} className={classes.option}>
              {type === "HISTORY" ? (
                <RestoreIcon color="primary" />
              ) : (
                <SearchIcon color="primary" />
              )}
              {option.name}
            </li>
          )}
          onInputChange={handleInputChange}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </form>
    );
  };

export default FullTextSearchAutocomplete;
