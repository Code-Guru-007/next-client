import React, { VFC, useState } from "react";

import { makeStyles } from "@mui/styles";
import { Member } from "@eGroupAI/typings/apis";
import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";

import ButtonBase from "@eGroupAI/material/ButtonBase";
import Menu from "components/Menu";
import Avatar from "@eGroupAI/material/Avatar";
import { KeyboardArrowDown } from "@mui/icons-material";
import UserDropDownMenu from "./UserDropDownMenu";

const useStyles = makeStyles((theme) => ({
  dropdownContainer: {
    maxHeight: "calc(100vh - 50px)",
  },
  userDropdown: {
    padding: 0,
    "& .MuiButtonBase-root": {
      color: "#858796",
      background: "unset",
      fontSize: "13px",
      [theme.breakpoints.down("md")]: {
        paddingLeft: "0",
        paddingRight: "0",
        minWidth: "unset",
        "& .MuiButton-endIcon": {
          marginLeft: "0",
        },
      },
    },
    "& img": {
      width: "2rem",
      height: "2rem",
    },
    zIndex: 10,
  },
  avatar: {
    background: theme.palette.primary.main,
    width: 40,
    height: 40,
    fontSize: theme.typography.pxToRem(14),
  },
  avatarDropDown: {
    width: 14,
    height: 14,
    background: "#3DA5D9",
    borderRadius: 50,
    position: "absolute",
    bottom: 4,
    right: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    "& svg": {
      color: theme.palette.common.white,
      width: "100%",
    },
  },
  arrowIconDownRotate: {
    transform: "rotate(180deg)",
    transition: "transform 0.3s linear",
  },
  arrowIconUpRotate: {
    transform: "rotate(0deg)",
    transition: "transform 0.3s linear",
  },
}));

export interface UserMenuProps {
  closeDropdown: () => void;
}

const UserMenu: VFC<UserMenuProps> = function ({ closeDropdown }) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { data: profile } = useMemberInfo();
  const firstName = profile?.memberName.split(" ")[0];
  const secondName = profile?.memberName.split(" ")[1];
  let fLetter: string | undefined;
  let sLetter: string | undefined;
  if (firstName) fLetter = firstName[0] as string;
  if (secondName) sLetter = secondName[0] as string;
  const avatarLetters = fLetter?.concat(sLetter || "");

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <ButtonBase
        className={classes.userDropdown}
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
          closeDropdown();
        }}
      >
        <Avatar classes={{ root: classes.avatar }}>
          {avatarLetters?.toUpperCase()}
        </Avatar>
        <div className={classes.avatarDropDown}>
          <KeyboardArrowDown
            className={
              anchorEl ? classes.arrowIconDownRotate : classes.arrowIconUpRotate
            }
          />
        </div>
      </ButtonBase>
      <Menu
        className={classes.dropdownContainer}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <UserDropDownMenu memberInfo={profile as Member} />
      </Menu>
    </>
  );
};

export default UserMenu;
