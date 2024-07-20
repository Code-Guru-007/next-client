import React, { VFC, useState, memo, useEffect, useRef } from "react";
import { isEqual } from "lodash";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import useOrgPartners from "utils/useOrgPartners";

import TextField from "@mui/material/TextField";
import Dialog from "@eGroupAI/material/Dialog";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@eGroupAI/material/DialogActions";
import DialogContent from "@eGroupAI/material/DialogContent";
import Autocomplete from "@eGroupAI/material/Autocomplete";
import DialogCloseButton from "components/DialogCloseButton";
import { setPartners } from "redux/eventDialog";
import { useAppDispatch } from "redux/configureAppStore";
import { OrganizationPartner } from "interfaces/entities";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogConfirmButton from "components/DialogConfirmButton";
import { Box } from "@mui/material";

export const DIALOG = "SelectOrgPartnersDialog";

interface Props {
  partnerList?: OrganizationPartner[];
}

const SelectOrgPartnersDialog: VFC<Props> = function (props) {
  const { partnerList } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const [query, setQuery] = useState("");
  const [inputHeight, setInputHeight] = useState<number>(72);
  const [popperHeight, setPopperHeight] = useState<number>(0);
  const [popperOpen, setPopperOpen] = useState<boolean>(false);
  const [partnerData, setPartnerData] = useState<OrganizationPartner[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setPartnerData(partnerList || []);
  }, [partnerList, isOpen]);

  const { data: orgPartners, isValidating } = useOrgPartners(
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
  }, [partnerData]);

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
        {wordLibrary?.["select organizational client"] ?? "選取單位客戶"}
      </DialogTitle>
      <DialogContent sx={{ minHeight: `${popperHeight + inputHeight}px` }}>
        <Autocomplete
          multiple
          disableCloseOnSelect
          loading={isValidating}
          options={orgPartners?.source || []}
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
                wordLibrary?.["filter organizational client"] ?? "篩選單位客戶"
              }
              {...params}
            />
          )}
          isOptionEqualToValue={(option, value) =>
            option.organizationPartnerNameZh ===
              value.organizationPartnerNameZh &&
            option.organization.organizationEmail ===
              value.organization.organizationEmail &&
            option.organizationPartnerId === value.organizationPartnerId
          }
          getOptionLabel={(option) => option.organizationPartnerNameZh}
          renderOption={(props, option) => (
            <Box component="li" key={option.organizationPartnerId} {...props}>
              {`${option.organizationPartnerNameZh} ${
                option.organization.organizationEmail
                  ? `(${option.organization.organizationEmail})`
                  : ""
              }`}
            </Box>
          )}
          filterOptions={(options, { inputValue }) =>
            options.filter(
              (option) =>
                option.organizationPartnerNameZh
                  .toLowerCase()
                  .includes(inputValue.toLowerCase()) ||
                option.organization.organizationEmail
                  .toLowerCase()
                  .includes(inputValue.toLowerCase())
            )
          }
          ListboxProps={{ style: { maxHeight: "150px" } }}
          noOptionsText={wordLibrary?.["no data found"] ?? "找不到資料"}
          value={partnerData}
          onInputChange={(_, v) => {
            setQuery(v);
          }}
          onChange={(_, v) => setPartnerData(v)}
          sx={{ py: 2 }}
          id="event-partner-input"
          data-tid="event-partner-input"
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
              setPartners({
                orgPartnerList: partnerData,
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

export default memo(SelectOrgPartnersDialog, (prev, next) =>
  isEqual(prev.partnerList, next.partnerList)
);
