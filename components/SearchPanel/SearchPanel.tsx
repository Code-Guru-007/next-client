import React, { useState, useRef, useEffect, useContext } from "react";
import { makeStyles } from "@mui/styles";

import TextField from "@mui/material/TextField";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";
import DialogConfirmButton from "components/DialogConfirmButton";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import SearchPanelContext from "./SearchPanelContext";

export interface Props {
  isOpen: boolean;
  matches: number | undefined;
  matchCount: number | undefined;
  handleSearch: (text: string, match: boolean) => void;
  nextSearch: (text: string, next: boolean, match: boolean) => void;
  handleReplace: (
    searchText: string,
    replaceText: string,
    match: boolean
  ) => void;
  handleReplaceAll: (
    searchText: string,
    replaceText: string,
    match: boolean
  ) => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "fixed",
    top: "100px",
    right: "40px",
    [theme.breakpoints.down("sm")]: {
      top: "105px",
      right: "25px",
    },
    width: "350px",
    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
    borderRadius: "4px",
    border: `0.5px solid ${theme.palette.grey[200]}`,
    backgroundColor: theme.palette.background.default,
    padding: "10px 15px",
    zIndex: 1200,
    color: theme.palette.grey[500],
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
  },
  replaceBtnContainer: {
    display: "flex",
    width: "60%",
  },
  nextBtnContainer: {
    display: "flex",
    justifyContent: "end",
    width: "40%",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    cursor: "pointer",
  },
  searchTextField: {
    width: "230px",
    color: theme.palette.grey[500],
  },
  replaceTextField: {
    width: "100%",
    marginBottom: "10px",
  },
  icon: {
    width: "20px",
    color: theme.palette.grey[700],
    cursor: "pointer",
  },
  labelText: {
    width: "100%",
    marginTop: "0px",
    marginBottom: "10px",
  },
}));

const SearchPanel = function (props: Props) {
  const {
    isOpen,
    matches,
    matchCount,
    handleSearch,
    nextSearch,
    handleReplace,
    handleReplaceAll,
  } = props;
  const classes = useStyles(props);
  const inputSearchElement = useRef<HTMLInputElement>(null);
  const inputSearchExpandElement = useRef<HTMLInputElement>(null);
  const {
    match,
    setMatch,
    searchText,
    setSearchText,
    replaceText,
    setReplaceText,
    handleCloseSearchPanel,
    expand,
    setExpand,
  } = useContext(SearchPanelContext);
  const [regular, setRegular] = useState<boolean>(false);
  const wordLibrary = useSelector(getWordLibrary);

  const handleMatch = () => {
    setMatch(!match);
  };

  const handleRegular = () => {
    setRegular(!regular);
  };

  useEffect(() => {
    inputSearchElement.current?.focus();
  }, [isOpen]);

  let timeout;
  return isOpen ? (
    <div className={classes.root} id="kms-search-panel">
      {expand ? (
        <CloseIcon
          fontSize="small"
          className={classes.closeButton}
          onClick={handleCloseSearchPanel}
        />
      ) : (
        <></>
      )}
      {expand ? (
        <div style={{ width: "100%" }}>
          <p className={classes.labelText}>{wordLibrary?.find ?? "尋找"}</p>
          <OutlinedInput
            size="small"
            endAdornment={
              matches !== undefined ? `${matchCount}/${matches}` : ""
            }
            inputRef={inputSearchExpandElement}
            inputProps={{ spellCheck: "false" }}
            defaultValue={searchText}
            className={classes.replaceTextField}
            onChange={(e) => {
              clearTimeout(timeout);
              timeout = setTimeout(() => {
                handleSearch(e.target.value, match);
                setSearchText(e.target.value);
              }, 500);
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter" || e.keyCode === 13) {
                if (inputSearchExpandElement.current?.value) {
                  nextSearch(
                    inputSearchExpandElement.current?.value,
                    true,
                    match
                  );
                }
              }
            }}
          />
          <p className={classes.labelText}>
            {wordLibrary?.["replace with"] ?? "取代為"}
          </p>
          <TextField
            variant="outlined"
            size="small"
            inputProps={{ spellCheck: "false" }}
            className={classes.replaceTextField}
            value={replaceText}
            onChange={(e) => {
              setReplaceText(e.target.value);
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                name="match"
                checked={match}
                onChange={() => {
                  handleMatch();
                  handleSearch(searchText, !match);
                }}
              />
            }
            label={wordLibrary?.["match case"] ?? "區分大小寫"}
            style={{ marginBottom: 5 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                name="regular"
                checked={regular}
                onChange={() => {
                  handleRegular();
                }}
              />
            }
            label={wordLibrary?.["regular expressions"] ?? "規則運算式"}
            style={{ marginBottom: 5 }}
          />
          <div className={classes.buttonContainer}>
            <div className={classes.replaceBtnContainer}>
              <DialogConfirmButton
                style={{ marginRight: 10 }}
                disabled={replaceText === "" || searchText === ""}
                onClick={() => {
                  handleReplace(searchText, replaceText, match);
                }}
              >
                {wordLibrary?.replace ?? "取代"}
              </DialogConfirmButton>
              <DialogConfirmButton
                disabled={replaceText === "" || searchText === ""}
                onClick={() => {
                  handleReplaceAll(searchText, replaceText, match);
                }}
              >
                {wordLibrary?.replace ?? "取代"}
                {wordLibrary?.all ?? "全部"}
              </DialogConfirmButton>
            </div>
            <div className={classes.nextBtnContainer}>
              <IconButton aria-label="back" size="small" disableRipple>
                <ArrowBackIosIcon
                  fontSize="small"
                  onClick={() => {
                    if (inputSearchExpandElement.current?.value) {
                      nextSearch(
                        inputSearchExpandElement.current?.value,
                        false,
                        match
                      );
                    }
                  }}
                />
              </IconButton>
              <IconButton
                aria-label="forward"
                size="small"
                style={{ marginLeft: 10 }}
                disableRipple
              >
                <ArrowForwardIosIcon
                  fontSize="small"
                  onClick={() => {
                    if (inputSearchExpandElement.current?.value) {
                      nextSearch(
                        inputSearchExpandElement.current?.value,
                        true,
                        match
                      );
                    }
                  }}
                />
              </IconButton>
            </div>
          </div>
        </div>
      ) : (
        <>
          <OutlinedInput
            size="small"
            placeholder={
              wordLibrary?.[
                "please enter the content you want to search for"
              ] ?? "請輸入您想搜尋的內容"
            }
            endAdornment={
              matches !== undefined ? `${matchCount}/${matches}` : ""
            }
            inputRef={inputSearchElement}
            inputProps={{ spellCheck: "false" }}
            className={classes.searchTextField}
            onChange={(e) => {
              clearTimeout(timeout);
              timeout = setTimeout(() => {
                handleSearch(e.target.value, false);
                setSearchText(e.target.value);
              }, 500);
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter" || e.keyCode === 13) {
                if (inputSearchElement.current?.value) {
                  nextSearch(inputSearchElement.current?.value, true, false);
                }
              }
            }}
          />
          <ArrowBackIosIcon
            className={classes.icon}
            onClick={() => {
              if (inputSearchElement.current?.value) {
                nextSearch(inputSearchElement.current?.value, false, false);
              }
            }}
          />
          <ArrowForwardIosIcon
            className={classes.icon}
            onClick={() => {
              if (inputSearchElement.current?.value) {
                nextSearch(inputSearchElement.current?.value, true, false);
              }
            }}
          />
          <MoreHorizIcon
            className={classes.icon}
            onClick={() => {
              setExpand(true);
              handleSearch(searchText, match);
            }}
          />
        </>
      )}
    </div>
  ) : (
    <></>
  );
};

export default SearchPanel;
