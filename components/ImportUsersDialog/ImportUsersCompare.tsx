import React, { useMemo } from "react";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useAppDispatch } from "redux/configureAppStore";
import { useSelector } from "react-redux";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import useStaticColumns from "utils/useStaticColumns";

import { Table } from "interfaces/utils";
import { DynamicColumnTarget } from "interfaces/entities";

import Typography from "@eGroupAI/material/Typography";
import Grid from "@eGroupAI/material/Grid";
import { Box } from "@mui/material";
import {
  getDuplicateUsers,
  getIndex,
  getSelectedSimilarUser,
} from "redux/importUsersDialog/selectors";
import { setSelectedSimilarUser } from "redux/importUsersDialog";
import CompareCard from "./CompareCard";
// import mockData from "./test-data.json";

const ImportUsersCompare = function () {
  const dispatch = useAppDispatch();
  const organizationId = useSelector(getSelectedOrgId);
  const index = useSelector(getIndex) || 0;
  const duplicateUsers = useSelector(getDuplicateUsers);
  const selectedSimilarUser = useSelector(getSelectedSimilarUser);

  // const organizationId = "4aba77788ae94eca8d6ff330506af944";
  // const index = 0;
  // const duplicateUsers = mockData;

  const { data: orgColumns } = useOrgDynamicColumns(
    {
      organizationId,
    },
    {
      columnTable: "ORGANIZATION_USER",
    }
  );
  const user = duplicateUsers[index];

  const staticColumns = useStaticColumns(Table.USERS, "isEdit");

  const dynamicTargetMap: Record<string, DynamicColumnTarget> | undefined =
    useMemo(
      () =>
        user?.dynamicColumnTargetList?.reduce(
          (a, b) => ({
            ...a,
            [b.organizationColumn.columnId]: b,
          }),
          {}
        ),
      [user]
    );

  const comparableStaticFields: {
    [key: string]: { similarUserIds: string[] };
  } = useMemo(() => {
    let result: { [key: string]: { similarUserIds: string[] } } = {};

    staticColumns?.forEach((el) => {
      const key = el.sortKey || null;
      const val = user && el.sortKey ? user[el.sortKey] : undefined;

      const matchedSimilarUserIds: string[] = [];

      if (key) {
        user?.similarOrganizationUserList?.forEach((similarUser) => {
          if (similarUser[key] !== val) {
            matchedSimilarUserIds.push(similarUser.organizationUserId);
          }
        });
        if (matchedSimilarUserIds.length > 0)
          result = {
            ...result,
            [key]: { similarUserIds: matchedSimilarUserIds },
          };
      }
    });

    return result;
  }, [staticColumns, user]);

  const comparableDynamicFields: {
    [key: string]: { similarUserIds: string[] };
  } = useMemo(() => {
    let result: { [key: string]: { similarUserIds: string[] } } = {};

    orgColumns?.source?.forEach((col) => {
      const key = col.columnId;
      const val = dynamicTargetMap
        ? dynamicTargetMap[col.columnId]?.columnTargetValue
        : undefined;

      const matchedSimilarUserIds: string[] = [];

      if (key) {
        user?.similarOrganizationUserList?.forEach((similarUser) => {
          if (
            similarUser.dynamicColumnTargetList?.find(
              (ct) => ct.organizationColumn.columnId === key
            )?.columnTargetValue !== val
          )
            matchedSimilarUserIds.push(similarUser.organizationUserId);
        });
        if (matchedSimilarUserIds.length > 0)
          result = {
            ...result,
            [key]: { similarUserIds: matchedSimilarUserIds },
          };
      }
    });

    return result;
  }, [dynamicTargetMap, orgColumns?.source, user?.similarOrganizationUserList]);

  const comparedFields = {
    ...comparableStaticFields,
    ...comparableDynamicFields,
  };

  return (
    <Box sx={{ px: { lg: 5, xs: 2 } }}>
      <Typography variant="h4" align="center" gutterBottom>
        {index + 1} of {duplicateUsers.length}
      </Typography>
      <Grid container spacing={{ lg: 5, md: 2, xs: 2 }}>
        {user && (
          <Grid item xs={12} lg={6} md={6}>
            <CompareCard
              title="匯入資料"
              staticColumns={staticColumns}
              dynamicColumns={orgColumns?.source}
              data={user}
              comparedFields={comparedFields}
              selectedSimilarUser={selectedSimilarUser}
              showOnlyRelevantCompares
            />
          </Grid>
        )}
        <Grid item xs={12} lg={6} md={6}>
          <Grid container spacing={{ lg: 5, md: 2, xs: 2 }}>
            {user?.similarOrganizationUserList?.map((el, i) => {
              const checked =
                selectedSimilarUser?.organizationUserId ===
                el.organizationUserId;
              return (
                <Grid item xs={12} key={el.organizationUserId}>
                  <CompareCard
                    title={`相似第 ${i + 1} 筆資料`}
                    staticColumns={staticColumns}
                    dynamicColumns={orgColumns?.source}
                    data={el}
                    CheckboxProps={{
                      onChange: () => {
                        if (!checked) {
                          dispatch(setSelectedSimilarUser(el));
                        } else {
                          dispatch(setSelectedSimilarUser());
                        }
                      },
                      checked,
                    }}
                    comparedFields={comparedFields}
                    selectedSimilarUser={selectedSimilarUser}
                    showOnlyRelevantCompares
                  />
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ImportUsersCompare;
