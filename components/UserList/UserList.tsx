import React, { FC, memo } from "react";
import { isEqual } from "lodash";

import { GenderMap } from "interfaces/utils";
import { OrganizationUser } from "interfaces/entities";
import { useSelector } from "react-redux";

import Grid from "@eGroupAI/material/Grid";
import Typography from "@eGroupAI/material/Typography";
import Box, { BoxProps } from "@eGroupAI/material/Box";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import InfoCard from "components/InfoCard";

interface Item extends OrganizationUser {
  onDelete?: () => void;
}
export interface UserListProps extends BoxProps {
  orgUsers?: Item[];
}

const UserList: FC<UserListProps> = function (props) {
  const { orgUsers, ...other } = props;

  const wordLibrary = useSelector(getWordLibrary);
  if (!orgUsers) {
    return <Box {...other} />;
  }

  return (
    <Box {...other}>
      {orgUsers.length ? (
        <Grid container spacing={2}>
          {orgUsers.map((el) => (
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={6}
              key={el.organizationUserId}
            >
              <InfoCard
                src={el.organizationUserFacePath}
                href={`/me/crm/users/${el.organizationUserId}`}
                primary={el.organizationUserNameZh}
                onDelete={el.onDelete}
                items={[
                  {
                    title: `${wordLibrary?.["chinese name"] ?? "中文姓名"}`,
                    content: el.organizationUserNameZh,
                  },
                  {
                    title: `${wordLibrary?.["english name"] ?? "英文姓名"}`,
                    content: el.organizationUserNameEn,
                  },
                  {
                    title: `${wordLibrary?.["id number"] ?? "身份證字號"}`,
                    content: el.organizationUserIdCardNumber,
                  },
                  {
                    title: `${wordLibrary?.email ?? "Email"}`,
                    content: el.organizationUserEmail,
                  },
                  {
                    title: `${wordLibrary?.gender ?? "性別"}`,
                    content: el.organizationUserGender
                      ? GenderMap[el.organizationUserGender]
                      : undefined,
                  },
                  {
                    title: `${wordLibrary?.phone ?? "電話"}`,
                    content: el.organizationUserPhone,
                  },
                  {
                    title: `${wordLibrary?.["postal code"] ?? "郵遞區號"}`,
                    content: el.organizationUserZIPCode,
                  },
                  {
                    title: `${wordLibrary?.["county/city"] ?? "縣市"}`,
                    content: el.organizationUserCity,
                  },
                  {
                    title: `${wordLibrary?.region ?? "地區"}`,
                    content: el.organizationUserArea,
                  },
                  {
                    title: `${wordLibrary?.address ?? "地址"}`,
                    content: el.organizationUserAddress,
                  },
                ]}
                type="user"
                testId={`${el.organizationUserId}`}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1">
          {wordLibrary?.["no data available"] ?? "無資料"}
        </Typography>
      )}
    </Box>
  );
};

export default memo(UserList, (prev, next) =>
  isEqual(prev.orgUsers, next.orgUsers)
);
