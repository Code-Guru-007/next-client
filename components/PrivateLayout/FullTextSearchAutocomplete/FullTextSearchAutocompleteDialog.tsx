import React, {
  FC,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import clsx from "clsx";
import { useSettingsContext } from "minimal/components/settings";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";

import Typography from "@eGroupAI/material/Typography";

import Dialog from "@eGroupAI/material/Dialog";

import {
  Data,
  SearchTextRecordReturnType,
} from "utils/useOrgSearchTextRecords";
import Scrollbar from "minimal/components/scrollbar";
import {
  Box,
  InputAdornment,
  InputBase,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import useDebounce from "@eGroupAI/hooks/useDebounce";
import Iconify from "minimal/components/iconify";
import { useRouter } from "next/router";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";

export const DIALOG = "FullTextSearchAutoCompleteDialog";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: (theme.shape.borderRadius as number) * 2,
    },
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    borderRadius: (theme.shape.borderRadius as number) * 2,
  },
  showLoader: {
    display: "flex",
  },
  lightOpacity: {
    background: theme.palette.grey[0],
  },
  darkOpacity: {
    background: theme.palette.grey[800],
  },
  searchInput: {
    color: theme.palette.grey[500],
    "&::placeholder": {
      fontWeight: 400,
      lineHeight: "28px",
      fontSize: 18,
    },
  },
  adornment: {
    marginRight: theme.spacing(2),
    color: theme.palette.grey[500],
  },
}));

export interface FullTextSearchAutocompleteDialogProps {
  onClick?: () => void;
}

const FullTextSearchAutocompleteDialog: FC<FullTextSearchAutocompleteDialogProps> =
  function (props) {
    const { onClick } = props;
    const theme = useTheme();
    const classes = useStyles();
    const settings = useSettingsContext();
    const { closeDialog, isOpen } = useReduxDialog(DIALOG);
    const organizationId = useSelector(getSelectedOrgId);
    const { push } = useRouter();
    const [query, setQuery] = useState<string>("");
    const debouncedQuery = useDebounce(query, 500);
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const type: SearchTextRecordReturnType = useMemo(
      () => (debouncedQuery.trim().length ? "AUTOCOMPLETE" : "HISTORY"),
      [debouncedQuery]
    );

    const { excute: getOrgSearchTextRecords, isLoading } = useAxiosApiWrapper(
      apis.org.getOrgSearchTextRecords,
      "None"
    );

    useEffect(() => {
      async function loadSearchHistoryRecords() {
        try {
          const res = await getOrgSearchTextRecords({
            query: debouncedQuery,
            type,
            organizationId,
          });

          const results = ((res.data as Data)?.searchTextRecordList || []).map(
            (searchRecord) => searchRecord.searchTextRecordQuery
          );
          setSearchResults(results);
        } catch (error) {
          setSearchResults([]);
        }
      }

      if (isOpen) {
        loadSearchHistoryRecords();
      }
    }, [isOpen, debouncedQuery, organizationId, getOrgSearchTextRecords, type]);

    const wordLibrary = useSelector(getWordLibrary);

    const handleSearch = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuery(event.target.value);
      },
      []
    );

    const handleResultSelection = (searchText: string) => {
      if (onClick) {
        onClick();
        return;
      }
      push(`/me/search?query=${searchText}`);
      handleClose();
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (query.trim().length) handleResultSelection(query);
    };

    const handleClose = () => {
      setQuery("");
      closeDialog();
    };

    const renderSearchItems = () =>
      searchResults.map((searchResultText) => (
        <ListItemButton
          sx={{
            p: 1,
            pl: 1.5,
            pr: 1.5,
            borderBottomColor: (theme) => theme.palette.divider,
            margin: "8px 0",
            "&:hover": {
              borderRadius: 1,
              borderColor: (theme) => theme.palette.primary.main,
              backgroundColor: (theme) => theme.palette.action.selected,
            },
          }}
          onClick={() => handleResultSelection(searchResultText)}
        >
          <ListItemText
            primaryTypographyProps={{
              typography: "subtitle2",
              sx: { textTransform: "capitalize" },
            }}
            primary={
              <Box
                component="span"
                sx={{
                  color: "text.primary",
                }}
              >
                {searchResultText}
              </Box>
            }
          />

          {type === "HISTORY" && (
            <HistoryRoundedIcon fontSize="medium" color="action" />
          )}
        </ListItemButton>
      ));

    const renderLoading = () => (
      <div
        className={clsx(classes.loader, true && classes.showLoader, {
          [classes.lightOpacity]: settings.themeMode === "light",
          [classes.darkOpacity]: settings.themeMode !== "light",
        })}
      >
        <CircularProgress />
      </div>
    );

    const renderNotFound = () => (
      <Typography variant="body2">
        {wordLibrary?.["no data available"] ?? ""}
      </Typography>
    );

    return (
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        className={classes.dialogPaper}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
        PaperProps={{
          sx: {
            mt: 15,
            overflow: "unset",
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              p: 3,
              pr: 1.5,
              borderBottom: `solid 1px ${theme.palette.divider}`,
            }}
          >
            <InputBase
              fullWidth
              autoFocus
              value={query}
              onChange={handleSearch}
              placeholder="搜尋..."
              startAdornment={
                <InputAdornment
                  position="start"
                  classes={{ root: classes.adornment }}
                >
                  <Iconify icon="eva:search-fill" width={24} />
                </InputAdornment>
              }
              className={classes.searchInput}
              inputProps={{
                sx: { typography: "h6", fontWeight: 500 },
              }}
            />
          </Box>

          <Scrollbar sx={{ height: 300, padding: "8px 24px" }}>
            {!isLoading && searchResults.length === 0 && renderNotFound()}
            {isLoading && renderLoading()}
            {!isLoading && searchResults.length > 0 && renderSearchItems()}
          </Scrollbar>
        </form>
      </Dialog>
    );
  };

export default FullTextSearchAutocompleteDialog;
