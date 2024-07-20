import { m } from "framer-motion";
// @mui
import { alpha } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
// components
import { varHover } from "minimal/components/animate";
import CustomPopover, { usePopover } from "minimal/components/custom-popover";

import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";
import { Member } from "@eGroupAI/typings/apis";
import UserDropDownMenu from "./user-dropdown-menu";

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const popover = usePopover();

  const { data: profile } = useMemberInfo();
  const firstName = profile?.memberName?.split(" ")[0];
  const secondName = profile?.memberName?.split(" ")[1];
  let fLetter: string | undefined;
  let sLetter: string | undefined;
  if (firstName) fLetter = firstName[0] as string;
  if (secondName) sLetter = secondName[0] as string;
  const avatarLetters = fLetter?.concat(sLetter || "");

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          width: 44,
          height: 44,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(popover.open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: (theme) => theme.palette.primary.main,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        >
          {avatarLetters?.toUpperCase()}
        </Avatar>
      </IconButton>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        sx={{
          width: 330,
          p: 0,
          // maxHeight: "calc(100vh - 100px)",
          // overflow: "hidden",
          // overflowY: "auto",
        }}
      >
        <UserDropDownMenu
          onClose={popover.onClose}
          memberInfo={profile as Member}
        />
      </CustomPopover>
    </>
  );
}
