import React, { useState, useEffect } from "react";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import useOrgMemberTableFilterSearch from "utils/useOrgMemberTableFilterSearch";

import TextField from "@mui/material/TextField";
import Dialog from "@eGroupAI/material/Dialog";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@eGroupAI/material/DialogActions";
import DialogContent from "@eGroupAI/material/DialogContent";
import Autocomplete from "@eGroupAI/material/Autocomplete";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import { Box, useTheme } from "@mui/material";
import DoneIcon from "@mui/icons-material/DoneRounded";
import { EntityList, OrganizationMember } from "@eGroupAI/typings/apis";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export const DIALOG = "SelectMembersDialog";

export interface Props {
  defaultValue?: OrganizationMember[];
  onSubmit?: (values: OrganizationMember[]) => void;
  loading?: boolean;
}

const SelectMembersDialog = function (props: Props) {
  const { defaultValue, onSubmit, loading } = props;
  const theme = useTheme();
  const organizationId = useSelector(getSelectedOrgId);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const [query, setQuery] = useState("");
  const [memberList, setMemberList] = useState<OrganizationMember[]>(
    defaultValue || []
  );
  const wordLibrary = useSelector(getWordLibrary);

  const [orgMembers, setOrgMembers] =
    useState<EntityList<OrganizationMember>>();
  const { data: orgMembersData, isValidating } = useOrgMemberTableFilterSearch(
    {
      organizationId,
    },
    {
      query,
    },
    undefined,
    undefined,
    !isOpen || !!orgMembers
  );

  useEffect(() => {
    if (isOpen && orgMembersData && !orgMembers) {
      setOrgMembers(orgMembersData);
    }
  }, [isOpen, orgMembersData, orgMembers]);

  useEffect(() => {
    setMemberList(defaultValue || []);
  }, [defaultValue]);

  const confirmDialogHandler = () => {
    if (onSubmit) onSubmit(memberList);
    closeDialog();
  };

  let timeout;

  return (
    <Dialog open={isOpen} onClose={closeDialog} fullWidth maxWidth="sm">
      <DialogTitle onClickClose={closeDialog}>選取單位成員</DialogTitle>
      <DialogContent>
        <Autocomplete
          multiple
          disableCloseOnSelect
          loading={isValidating}
          options={orgMembers?.source || []}
          renderInput={(params) => (
            <TextField
              variant="outlined"
              placeholder={wordLibrary?.filter ?? "篩選"}
              {...params}
            />
          )}
          isOptionEqualToValue={(option, value) =>
            option.member.memberName === value.member.memberName &&
            option.member.memberEmail === value.member.memberEmail
          }
          getOptionLabel={(option) => option.member.memberName || ""}
          noOptionsText={wordLibrary?.["no information found"] ?? "查無資料"}
          value={memberList}
          onInputChange={(_, v) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              setQuery(v);
            }, 300);
          }}
          onChange={(e, value) => {
            setMemberList(value);
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
                    backgroundColor: theme.palette.grey[500],
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
                {`${option.member.memberName} ${
                  option.member.memberEmail
                    ? `(${option.member.memberEmail})`
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

export default SelectMembersDialog;
