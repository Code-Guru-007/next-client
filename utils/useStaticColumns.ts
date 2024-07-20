/* eslint-disable no-underscore-dangle */
import { ReactNode, useMemo } from "react";
import { useSelector } from "react-redux";
import useOrgTableColumns from "@eGroupAI/hooks/apis/useOrgTableColumns";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { GenderMap, Table } from "interfaces/utils";
import {
  format as formatDate,
  differenceInYears,
} from "@eGroupAI/utils/dateUtils";
import { TableColumn } from "@eGroupAI/typings/apis";

export interface StaticColumn extends TableColumn {
  format?: (val: ReactNode) => ReactNode;
}

export default function useStaticColumns(
  table: Table,
  type: "isTable" | "isEdit",
  sharedOrgId?: string
) {
  let organizationId = useSelector(getSelectedOrgId);
  if (sharedOrgId) organizationId = sharedOrgId as string;
  const locale = useSelector(getGlobalLocale);

  const { data } = useOrgTableColumns(
    {
      organizationId,
      table,
    },
    {
      locale,
    }
  );

  const result: StaticColumn[] | undefined = useMemo(
    () =>
      data
        ?.filter((el) => el[type])
        .map((el) => {
          if (el.sortKey === "organizationUserBirth") {
            return {
              ...el,
              format: (val) =>
                val
                  ? `${formatDate(
                      val as string,
                      "yyyy-MM-dd"
                    )} (${differenceInYears(new Date(), val as string)}歲)`
                  : undefined,
            };
          }
          if (el.sortKey === "organizationUserGender") {
            return {
              ...el,
              format: (val) => (val ? GenderMap[val as string] : ""),
            };
          }
          if (el.columnType === "DATE") {
            return {
              ...el,
              format: (val) => formatDate(val as string, "yyyy-MM-dd"),
            };
          }
          if (el.columnType === "DATETIME") {
            return {
              ...el,
              format: (val) => formatDate(val as string, "PP pp"),
            };
          }
          return el;
        }),
    [data, type]
  );

  return result;
}
