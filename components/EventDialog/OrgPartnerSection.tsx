import React, { VFC, useMemo, memo } from "react";
import { isEqual } from "lodash";

import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import { removePartner } from "redux/eventDialog";
import { useAppDispatch } from "redux/configureAppStore";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import Typography from "@eGroupAI/material/Typography";
import Fab from "@eGroupAI/material/Fab";
import OrgPartnerList from "components/OrgPartnerList";
import AddIcon from "@mui/icons-material/Add";
import { OrganizationPartner } from "interfaces/entities";
import SelectOrgPartnersDialog, { DIALOG } from "./SelectOrgPartnersDialog";

interface Props {
  partnerList?: OrganizationPartner[];
}

const OrgPartnerSection: VFC<Props> = function (props) {
  const { partnerList } = props;
  const { openDialog } = useReduxDialog(DIALOG);

  const wordLibrary = useSelector(getWordLibrary);

  const dispatch = useAppDispatch();

  const partnerListData = useMemo(
    () =>
      partnerList?.map((el) => ({
        ...el,
        onDelete: () => {
          dispatch(
            removePartner({
              orgPartnerId: el.organizationPartnerId,
            })
          );
        },
      })),
    [dispatch, partnerList]
  );

  return (
    <>
      <SelectOrgPartnersDialog partnerList={partnerList} />
      <div>
        <Typography variant="h4" gutterBottom>
          {wordLibrary?.["organizational client"] ?? "單位客戶"}
        </Typography>
        <OrgPartnerList data={partnerListData} sx={{ mb: 3 }} />
        <Fab
          sx={{
            boxShadow: "none",
            mr: "1rem",
            color: "#fff",
            width: "32px",
            height: "32px",
            minHeight: "32px",
            minWidth: "32px",
          }}
          onClick={openDialog}
          id="add-partner-button"
          data-tid="add-partner-button"
        >
          <AddIcon fontSize="small" sx={{ color: "white" }} />
        </Fab>
      </div>
    </>
  );
};

export default memo(OrgPartnerSection, (prev, next) =>
  isEqual(prev.partnerList, next.partnerList)
);
