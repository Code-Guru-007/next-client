import React, { VFC, useState, memo, useEffect, useRef } from "react";
import { isEqual } from "lodash";

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
import DialogCloseButton from "components/DialogCloseButton";
import { setUsers } from "redux/eventDialog";
import { useAppDispatch } from "redux/configureAppStore";
import { OrganizationUser } from "interfaces/entities";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogConfirmButton from "components/DialogConfirmButton";
import { Box } from "@mui/material";

export const DIALOG = "SelectOrgUsersDialog";

interface Props {
  userList?: OrganizationUser[];
}

const SelectOrgUsersDialog: VFC<Props> = function (props) {
  const { userList } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const [query, setQuery] = useState("");
  const [inputHeight, setInputHeight] = useState<number>(72);
  const [popperHeight, setPopperHeight] = useState<number>(0);
  const [popperOpen, setPopperOpen] = useState<boolean>(false);
  const [userData, setUserData] = useState<OrganizationUser[]>([]);
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUserData(userList || []);
  }, [userList, isOpen]);

  const { data: orgUsers, isValidating } = useOrgUserTableFilterSearch(
    {
      organizationId,
    },
    {
      query,
    }
  );

  useEffect(() => {
    setInputHeight(
      Math.floor(inputRef.current?.getBoundingClientRect().height || 72)
    );
  }, [userData]);

  useEffect(() => {
    if (popperOpen) {
      setPopperHeight(158);
    } else {
      setPopperHeight(0);
    }
  }, [popperOpen]);

  const wordLibrary = useSelector(getWordLibrary);

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        setInputHeight(72);
        setPopperHeight(0);
        closeDialog();
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle
        onClickClose={() => {
          setInputHeight(72);
          setPopperHeight(0);
          closeDialog();
        }}
      >
        {wordLibrary?.["select individual client"] ?? "選取個人客戶"}
      </DialogTitle>
      <DialogContent sx={{ minHeight: `${popperHeight + inputHeight}px` }}>
        <Autocomplete
          multiple
          disableCloseOnSelect
          loading={isValidating}
          options={orgUsers?.source || []}
          onOpen={() => {
            setPopperOpen(true);
          }}
          onClose={() => {
            setPopperOpen(false);
          }}
          renderInput={(params) => (
            <TextField
              variant="outlined"
              ref={inputRef}
              placeholder={
                wordLibrary?.["filter individual client"] ?? "篩選個人客戶"
              }
              {...params}
            />
          )}
          isOptionEqualToValue={(option, value) =>
            option.organizationUserNameZh === value.organizationUserNameZh &&
            option.organizationUserEmail === value.organizationUserEmail &&
            option.organizationUserId === value.organizationUserId
          }
          getOptionLabel={(option) => option.organizationUserNameZh || ""}
          renderOption={(props, option) => (
            <Box component="li" key={option.organizationUserId} {...props}>
              {`${option.organizationUserNameZh || ""} ${
                option.organizationUserEmail
                  ? `(${option.organizationUserEmail})`
                  : ""
              }`}
            </Box>
          )}
          filterOptions={(options, { inputValue }) =>
            options.filter(
              (option) =>
                (option.organizationUserNameZh || "")
                  .toLowerCase()
                  .includes(inputValue.toLowerCase()) ||
                (option.organizationUserEmail || "")
                  .toLowerCase()
                  .includes(inputValue.toLowerCase())
            )
          }
          ListboxProps={{ style: { maxHeight: "150px" } }}
          noOptionsText={wordLibrary?.["no data found"] ?? "找不到資料"}
          value={userData}
          onInputChange={(_, v) => {
            setQuery(v);
          }}
          onChange={(_, v) => setUserData(v)}
          sx={{ py: 2 }}
          id="event-user-input"
          data-tid="event-user-input"
        />
      </DialogContent>
      <DialogActions>
        <DialogCloseButton
          onClick={() => {
            setInputHeight(72);
            setPopperHeight(0);
            closeDialog();
          }}
        />
        <DialogConfirmButton
          onClick={() => {
            dispatch(
              setUsers({
                orgUserList: userData,
                states: {
                  isDirty: true,
                },
              })
            );
            setInputHeight(72);
            setPopperHeight(0);
            closeDialog();
          }}
        >
          {wordLibrary?.confirm ?? "確認"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default memo(SelectOrgUsersDialog, (prev, next) =>
  isEqual(prev.userList, next.userList)
);
