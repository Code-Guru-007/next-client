// @mui
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { Typography } from "@mui/material";
// components
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { Member, ShareModuleList } from "@eGroupAI/typings/apis";
import getShareUserSubModulePermission from "./getShareUserSubModulePermission";

// ----------------------------------------------------------------------

type Props = {
  person: Member;
  module: ShareModuleList;
};

function getDisplayText(wordLibrary, sharedUserPerm) {
  if (sharedUserPerm === "edit") {
    return wordLibrary?.editable ?? "可編輯";
  }
  return wordLibrary?.["view only"] ?? "僅能瀏覽";
}

export default function InviteShareUserItem({ person, module }: Props) {
  const sharedUserPerm = getShareUserSubModulePermission(
    "info",
    module.serviceSubModuleList || []
  );
  const wordLibrary = useSelector(getWordLibrary);

  return (
    <>
      <ListItem
        sx={{
          px: 0,
          py: 1,
        }}
      >
        <Avatar
          alt={person.memberName}
          src={person.memberName}
          sx={{ mr: 2 }}
        />

        <ListItemText
          primary={person.memberName}
          secondary={
            <Tooltip title={person.memberEmail}>
              <span>{person.memberEmail}</span>
            </Tooltip>
          }
          primaryTypographyProps={{
            noWrap: true,
            typography: "subtitle2",
            width: "90%",
          }}
          secondaryTypographyProps={{
            noWrap: true,
            component: "span",
            width: "90%",
          }}
          sx={{ flexGrow: 1 }}
        />

        <Typography variant="subtitle1" sx={{ textWrap: "noWrap" }}>
          <span>{getDisplayText(wordLibrary, sharedUserPerm)}</span>
        </Typography>
      </ListItem>
    </>
  );
}
