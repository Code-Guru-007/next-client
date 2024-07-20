import React, { VFC, useMemo, memo } from "react";
import { isEqual } from "lodash";

import { useAppDispatch } from "redux/configureAppStore";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import { removeUser } from "redux/eventDialog";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import Typography from "@eGroupAI/material/Typography";
import Fab from "@eGroupAI/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import UserList from "components/UserList";
import { OrganizationUser } from "interfaces/entities";
import SelectOrgUsersDialog, { DIALOG } from "./SelectOrgUsersDialog";

interface Props {
  userList?: OrganizationUser[];
}

const UsersSection: VFC<Props> = function (props) {
  const { userList } = props;
  const dispatch = useAppDispatch();
  const { openDialog } = useReduxDialog(DIALOG);

  const userListData = useMemo(
    () =>
      userList?.map((el) => ({
        ...el,
        onDelete: () => {
          dispatch(
            removeUser({
              orgUserId: el.organizationUserId,
            })
          );
        },
      })),
    [dispatch, userList]
  );

  const wordLibrary = useSelector(getWordLibrary);

  return (
    <>
      <SelectOrgUsersDialog userList={userList} />
      <div>
        <Typography variant="h4" gutterBottom>
          {wordLibrary?.["individual client"] ?? "個人客戶"}
        </Typography>
        <UserList orgUsers={userListData} sx={{ mb: 3 }} />
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
          id="add-user-button"
          data-tid="add-user-button"
          onClick={openDialog}
        >
          <AddIcon fontSize="small" sx={{ color: "white" }} />
        </Fab>
      </div>
    </>
  );
};

export default memo(UsersSection, (prev, next) =>
  isEqual(prev.userList, next.userList)
);
