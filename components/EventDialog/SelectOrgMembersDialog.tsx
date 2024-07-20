import React, { VFC, useState, memo, useEffect, useRef } from "react";
import { isEqual } from "lodash";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import useOrgMembers from "utils/useOrgMembers";

import TextField from "@mui/material/TextField";
import Dialog from "@eGroupAI/material/Dialog";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@eGroupAI/material/DialogActions";
import DialogContent from "@eGroupAI/material/DialogContent";
import Autocomplete from "@eGroupAI/material/Autocomplete";
import DialogCloseButton from "components/DialogCloseButton";
import { setMembers } from "redux/eventDialog";
import { useAppDispatch } from "redux/configureAppStore";
import { OrganizationMember } from "@eGroupAI/typings/apis";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogConfirmButton from "components/DialogConfirmButton";
import { Box } from "@mui/material";

export const DIALOG = "SelectOrgMembersDialog";

interface Props {
  memberList?: OrganizationMember[];
}

const SelectOrgMembersDialog: VFC<Props> = function (props) {
  const { memberList } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const [query, setQuery] = useState("");
  const [inputHeight, setInputHeight] = useState<number>(72);
  const [popperHeight, setPopperHeight] = useState<number>(0);
  const [popperOpen, setPopperOpen] = useState<boolean>(false);
  const [memberData, setMemberData] = useState<OrganizationMember[]>([]);
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  const [options, setOptions] = useState<OrganizationMember[]>([]);

  const { data: orgMembers, isValidating } = useOrgMembers(
    {
      organizationId,
    },
    {
      query,
    }
  );

  useEffect(() => {
    setMemberData(memberList || []);
  }, [memberList, isOpen]);

  useEffect(() => {
    if (orgMembers?.source) {
      const filteredOptions = orgMembers.source.filter(
        (option) =>
          !memberData.some(
            (member) =>
              member.member.memberName === option.member.memberName &&
              member.member.memberEmail === option.member.memberEmail
          )
      );
      setOptions(filteredOptions);
    }
  }, [memberData, orgMembers]);

  useEffect(() => {
    setInputHeight(
      Math.floor(inputRef.current?.getBoundingClientRect().height || 72)
    );
  }, [memberData]);

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
        {wordLibrary?.["select organization members"] ?? "選取單位成員"}
      </DialogTitle>
      <DialogContent sx={{ minHeight: `${popperHeight + inputHeight}px` }}>
        <Autocomplete
          multiple
          disableCloseOnSelect
          loading={isValidating}
          options={options}
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
                wordLibrary?.["filter organization members"] ?? "篩選單位成員"
              }
              {...params}
            />
          )}
          isOptionEqualToValue={(option, value) =>
            option.member.memberName === value.member.memberName &&
            option.member.memberAccount === value.member.memberAccount
          }
          getOptionLabel={(option) => option.member.memberName}
          renderOption={(props, option) => (
            <Box component="li" key={option.member.memberEmail} {...props}>
              {`${option.member.memberName}  ${
                option.member.memberEmail
                  ? `(${option.member.memberEmail})`
                  : ""
              }`}
            </Box>
          )}
          filterOptions={(options, { inputValue }) =>
            options.filter(
              (option) =>
                option.member.memberName
                  ?.toLowerCase()
                  .includes(inputValue.toLowerCase()) ||
                option.member.memberEmail
                  ?.toLowerCase()
                  .includes(inputValue.toLowerCase())
            )
          }
          ListboxProps={{ style: { maxHeight: "150px" } }}
          noOptionsText={wordLibrary?.["no data found"] ?? "找不到資料"}
          value={memberData}
          onInputChange={(_, v) => {
            setQuery(v);
          }}
          onChange={(_, v) => setMemberData(v)}
          sx={{ py: 2 }}
          id="event-member-input"
          data-tid="event-member-input"
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
              setMembers({
                orgMemberList: memberData,
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

export default memo(SelectOrgMembersDialog, (prev, next) =>
  isEqual(prev.memberList, next.memberList)
);
