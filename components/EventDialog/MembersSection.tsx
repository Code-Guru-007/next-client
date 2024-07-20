import React, { FC, useMemo, memo } from "react";
import { isEqual } from "lodash";

import { useAppDispatch } from "redux/configureAppStore";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import Fab from "@eGroupAI/material/Fab";
import Typography from "@eGroupAI/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import MemberList from "components/MemberList";
import { removeMember } from "redux/eventDialog";
import { OrganizationMember } from "@eGroupAI/typings/apis";
import SelectOrgMembersDialog, { DIALOG } from "./SelectOrgMembersDialog";

interface Props {
  memberList?: OrganizationMember[];
}

const MembersSection: FC<Props> = function (props) {
  const { memberList } = props;
  const { openDialog } = useReduxDialog(DIALOG);
  const dispatch = useAppDispatch();
  const wordLibrary = useSelector(getWordLibrary);

  const members = useMemo(
    () =>
      memberList?.map((el) => ({
        ...el,
        onDelete: () => {
          dispatch(
            removeMember({
              loginId: el.member.loginId,
            })
          );
        },
      })),
    [dispatch, memberList]
  );

  return (
    <>
      <SelectOrgMembersDialog memberList={memberList} />
      <div>
        <Typography variant="h4" gutterBottom>
          {wordLibrary?.["organization member"] ?? "單位成員"}
        </Typography>
        <MemberList orgMembers={members} sx={{ mb: 3 }} />
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
          id="add-event-member-button"
          data-tid="add-event-member-button"
        >
          <AddIcon fontSize="small" sx={{ color: "white" }} />
        </Fab>
      </div>
    </>
  );
};

export default memo(MembersSection, (prev, next) =>
  isEqual(prev.memberList, next.memberList)
);
