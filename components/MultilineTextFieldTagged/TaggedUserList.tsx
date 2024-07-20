import { FC, useEffect } from "react";

import { useTheme } from "@mui/styles";
import { Box, Divider, ListItem, Stack } from "@mui/material";
import { OrganizationMember } from "@eGroupAI/typings/apis";

export interface TaggedUserListProps {
  isOpen?: boolean;
  searchName?: string;
  displayCount?: number;
  targetedIndex?: number;
  openPosition?: {
    top: number;
    left: number;
  };
  searchedUserList?: OrganizationMember[];
  userKeyEvent?: boolean;
  setUserEnterKeyEvent: React.Dispatch<React.SetStateAction<boolean>>;
  handleUserEvent?: (loginId: string, userName: string) => void;
}

const TaggedUserList: FC<TaggedUserListProps> = (props) => {
  const {
    isOpen = false,
    // searchName = "",
    displayCount = 5,
    targetedIndex = 0,
    openPosition,
    searchedUserList,
    userKeyEvent,
    setUserEnterKeyEvent,
    handleUserEvent,
  } = props;
  const theme = useTheme();

  useEffect(() => {
    if (handleUserEvent && searchedUserList)
      if (userKeyEvent) {
        const selectedUser = searchedUserList[targetedIndex];
        handleUserEvent(
          selectedUser?.member.loginId as string,
          selectedUser?.member.memberName as string
        );
        if (setUserEnterKeyEvent) setUserEnterKeyEvent(false);
      }
  }, [
    handleUserEvent,
    searchedUserList,
    targetedIndex,
    userKeyEvent,
    setUserEnterKeyEvent,
  ]);

  return isOpen ? (
    <Stack
      sx={{
        position: "fixed",
        backgroundColor: theme.palette.background.default,
        border:
          searchedUserList?.length !== 0
            ? `1px solid ${theme.palette.divider}`
            : "none",
        borderRadius: 1,
        zIndex: 10000,
        width: 220,
        top: (openPosition?.top as number) + 14 + 28,
        left: (openPosition?.left as number) + 14,
      }}
    >
      {searchedUserList?.slice(0, displayCount).map((member, index) => (
        <Box key={member.member.loginId}>
          <ListItem
            sx={{
              borderRadius: 1,
              borderColor: `1px solid ${theme.palette.divider}`,
              color:
                index === targetedIndex ? "white" : theme.palette.text.primary,
              backgroundColor:
                index === targetedIndex ? theme.palette.primary.main : "none",
              padding: "4px 8px",
              ":hover": {
                cursor: "pointer",
                color: "white",
                backgroundColor: theme.palette.primary.main,
              },
            }}
            onClick={() => {
              if (handleUserEvent)
                handleUserEvent(
                  member.member.loginId as string,
                  member.member.memberName as string
                );
            }}
          >
            {member.member.memberName}
          </ListItem>
          {index < displayCount - 1 && <Divider />}
        </Box>
      ))}
    </Stack>
  ) : (
    <></>
  );
};

export default TaggedUserList;
