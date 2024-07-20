import React, { VFC, useState, useEffect } from "react";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import useOrgUserTableFilterSearch from "utils/useOrgUserTableFilterSearch";

import TextField from "@mui/material/TextField";
import Dialog from "@eGroupAI/material/Dialog";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@eGroupAI/material/DialogActions";
import DialogContent from "@eGroupAI/material/DialogContent";
import Autocomplete from "@eGroupAI/material/Autocomplete";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import { Box, useTheme } from "@mui/material";
import DoneIcon from "@mui/icons-material/DoneRounded";
import { OrganizationUser } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

export const DIALOG = "SelectUsersDialog";

export interface Props {
  defaultValue?: OrganizationUser[];
  onSubmit?: (values: OrganizationUser[]) => void;
  loading?: boolean;
}

const SelectUsersDialog: VFC<Props> = function (props) {
  const { defaultValue, onSubmit, loading } = props;
  const theme = useTheme();
  const organizationId = useSelector(getSelectedOrgId);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const [query, setQuery] = useState("");
  const [userList, setUserList] = useState<OrganizationUser[]>(
    defaultValue || []
  );
  const wordLibrary = useSelector(getWordLibrary);

  const [orgUsers, setOrgUsers] = useState<EntityList<OrganizationUser>>();
  const { data: orgUsersData, isValidating } = useOrgUserTableFilterSearch(
    {
      organizationId,
    },
    {
      query,
    },
    undefined,
    undefined,
    !isOpen || !!orgUsers
  );

  useEffect(() => {
    if (isOpen && orgUsersData && !orgUsers) {
      setOrgUsers(orgUsersData);
    }
  }, [isOpen, orgUsersData, orgUsers]);

  const confirmDialogHandler = () => {
    if (onSubmit) {
      onSubmit(userList || []);
    }
    closeDialog();
  };

  useEffect(() => {
    setUserList(defaultValue || []);
  }, [defaultValue]);

  let timeout;

  return (
    <Dialog open={isOpen} onClose={closeDialog} fullWidth maxWidth="sm">
      <DialogTitle onClickClose={closeDialog}>選取客戶</DialogTitle>
      <DialogContent>
        <Autocomplete
          multiple
          disableCloseOnSelect
          loading={isValidating}
          defaultValue={defaultValue}
          options={orgUsers?.source || []}
          renderInput={(params) => (
            <TextField
              variant="outlined"
              placeholder={wordLibrary?.filter ?? "篩選"}
              {...params}
            />
          )}
          isOptionEqualToValue={(option, value) =>
            option.organizationUserNameZh === value.organizationUserNameZh &&
            option.organizationUserEmail === value.organizationUserEmail
          }
          getOptionLabel={(option) => option.organizationUserNameZh || ""}
          noOptionsText={wordLibrary?.["no information found"] ?? "查無資料"}
          value={userList}
          onInputChange={(_, v) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              setQuery(v);
            }, 300);
          }}
          onChange={(_, value) => {
            setUserList(value);
          }}
          componentsProps={{
            paper: {
              sx: {
                "& ul.MuiAutocomplete-listbox li.MuiAutocomplete-option.Mui-focused":
                  {
                    backgroundColor: theme.palette.grey[500],
                  },
                "& ul.MuiAutocomplete-listbox li.MuiAutocomplete-option[aria-selected='true']":
                  {
                    backgroundColor: theme.palette.primary.main,
                  },
              },
            },
          }}
          renderOption={(optionProps, option, state) => (
            <li {...optionProps}>
              <Box
                component={DoneIcon}
                sx={{ width: 17, height: 17, mr: "5px", ml: "-2px" }}
                style={{
                  visibility: state.selected ? "visible" : "hidden",
                }}
              />
              <Box
                sx={{
                  flexGrow: 1,
                }}
              >
                {`${option.organizationUserNameZh} ${
                  option.organizationUserEmail
                    ? `(${option.organizationUserEmail})`
                    : ""
                }`}
              </Box>
            </li>
          )}
          sx={{ py: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <DialogCloseButton disabled={loading} onClick={closeDialog} />
        {onSubmit && (
          <DialogConfirmButton
            loading={loading}
            disabled={loading}
            onClick={confirmDialogHandler}
          />
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SelectUsersDialog;
