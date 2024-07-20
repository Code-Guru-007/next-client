import React, { VFC, useState, useEffect } from "react";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import useOrgPartnerFilterSearch from "utils/useOrgPartnerFilterSearch";

import TextField from "@mui/material/TextField";
import Dialog from "@eGroupAI/material/Dialog";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@eGroupAI/material/DialogActions";
import DialogContent from "@eGroupAI/material/DialogContent";
import Autocomplete from "@eGroupAI/material/Autocomplete";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";

import { OrganizationPartner } from "interfaces/entities";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { Box } from "@mui/material";
import { EntityList } from "@eGroupAI/typings/apis";

export const DIALOG = "SelectPartnersDialog";

export interface Props {
  partnerList?: OrganizationPartner[];
  onSubmit?: (v: OrganizationPartner[]) => void;
}

const SelectPartnersDialog: VFC<Props> = function (props) {
  const { onSubmit, partnerList } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const [query, setQuery] = useState("");
  const [values, setValues] = useState<OrganizationPartner[]>(
    partnerList || []
  );

  useEffect(() => {
    setValues(partnerList || []);
  }, [partnerList]);

  const handleClose = () => {
    setValues(partnerList || []);
    closeDialog();
  };

  const [orgPartners, setOrgPartners] =
    useState<EntityList<OrganizationPartner>>();
  const { data: orgPartnersData, isValidating } = useOrgPartnerFilterSearch(
    {
      organizationId,
    },
    {
      query,
    },
    undefined,
    undefined,
    !isOpen || !!orgPartners
  );

  useEffect(() => {
    if (isOpen && orgPartnersData && !orgPartners) {
      setOrgPartners(orgPartnersData);
    }
  }, [isOpen, orgPartnersData, orgPartners]);

  const wordLibrary = useSelector(getWordLibrary);

  let timeout;

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle onClickClose={handleClose}>
        {wordLibrary?.["select organizational client"] ?? "選取單位客戶"}
      </DialogTitle>
      <DialogContent>
        <Autocomplete
          multiple
          disableCloseOnSelect
          loading={isValidating}
          options={orgPartners?.source || []}
          renderInput={(params) => (
            <TextField
              variant="outlined"
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
              value.organization.organizationEmail
          }
          getOptionLabel={(option) => option.organizationPartnerNameZh}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              {`${option.organizationPartnerNameZh} ${
                option.organization.organizationEmail
                  ? `(${option.organization.organizationEmail})`
                  : ""
              }`}
            </Box>
          )}
          noOptionsText={wordLibrary?.["no data found"] ?? "找不到資料"}
          value={values}
          onInputChange={(_, v) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              setQuery(v);
            }, 300);
          }}
          onChange={(_, v) => {
            setValues(v);
          }}
          sx={{ py: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <DialogCloseButton onClick={handleClose} />
        <DialogConfirmButton
          onClick={() => {
            if (onSubmit) {
              onSubmit(values);
            }
          }}
        />
      </DialogActions>
    </Dialog>
  );
};

export default SelectPartnersDialog;
