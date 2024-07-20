import React, { FC, memo } from "react";
import { isEqual } from "lodash";

import { OrganizationMember } from "@eGroupAI/typings/apis";

import Grid, { GridProps } from "@eGroupAI/material/Grid";
import Badge from "@eGroupAI/material/Badge";
import Typography from "@eGroupAI/material/Typography";
import IconButton from "components/IconButton/StyledIconButton";
import Tooltip from "@eGroupAI/material/Tooltip";
import { AvatarProps } from "@eGroupAI/material/Avatar";
import Box, { BoxProps } from "@eGroupAI/material/Box";
import Avatar from "components/Avatar";
import { useTheme } from "@mui/styles";
import Iconify from "minimal/components/iconify/iconify";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

interface Item extends OrganizationMember {
  onDelete?: () => void;
}
export interface MemberListProps extends BoxProps {
  orgMembers?: Item[];
  max?: number;
  color?: AvatarProps["color"];
  spacing?: GridProps["spacing"];
}

const MemberList: FC<MemberListProps> = function (props) {
  const { orgMembers, max, color, spacing = 1, ...other } = props;
  const theme = useTheme();

  const wordLibrary = useSelector(getWordLibrary);

  const renderMembers = (data: Item[]) =>
    data.map((el) => (
      <Grid item key={el.member.loginId}>
        <Tooltip title={el.member.memberName}>
          {el.onDelete ? (
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              badgeContent={
                <IconButton
                  size="small"
                  onClick={el.onDelete}
                  id={`delete-member-btn-${el.member.loginId}`}
                  data-tid={`delete-member-btn-${el.member.loginId}`}
                >
                  <Iconify icon="mingcute:close-line" width={14} />
                </IconButton>
              }
            >
              <Avatar color="default">
                <Typography>
                  {el.member.memberName?.slice(0, 1).toUpperCase()}
                </Typography>
              </Avatar>
            </Badge>
          ) : (
            <Avatar color="default">
              <Typography sx={{ color: theme.palette.common.black }}>
                {el.member.memberName?.slice(0, 1).toUpperCase()}
              </Typography>
            </Avatar>
          )}
        </Tooltip>
      </Grid>
    ));

  if (!orgMembers) {
    return <Box {...other} />;
  }

  if (max) {
    return (
      <Box {...other}>
        {orgMembers.length > 0 ? (
          <Grid container spacing={spacing}>
            {renderMembers(orgMembers.slice(0, max))}
            {orgMembers.length > max && (
              <Grid item>
                <Tooltip title={`其他 ${orgMembers.length - max} 位`}>
                  <Avatar color={color}>+{orgMembers.length - max}</Avatar>
                </Tooltip>
              </Grid>
            )}
          </Grid>
        ) : (
          <Typography variant="body1">
            {wordLibrary?.["no data available"] ?? "無資料"}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box {...other}>
      {orgMembers.length > 0 ? (
        <Grid container spacing={spacing}>
          {renderMembers(orgMembers)}
        </Grid>
      ) : (
        <Typography variant="body1">
          {wordLibrary?.["no data available"] ?? "無資料"}
        </Typography>
      )}
    </Box>
  );
};

export default memo(MemberList, (prev, next) =>
  isEqual(prev.orgMembers, next.orgMembers)
);
