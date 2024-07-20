import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import apis from "utils/apis";
import { useRouter } from "next/router";
import useOrgFilterConditionGroups from "@eGroupAI/hooks/apis/useOrgFilterConditionGroups";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { DefaultPayload } from "@eGroupAI/material-module/DataTable/useDataTable";
import { FilterConditionGroup, FilterSearch } from "@eGroupAI/typings/apis";
import { TableFilterCondition } from "@eGroupAI/material-module/DataTable";
import { Item, Value } from "@eGroupAI/material-lab/FilterDropDown";
import moment from "moment-timezone";
import { isValid } from "@eGroupAI/utils/dateUtils";
import { ServiceModuleValue, Table } from "interfaces/utils";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import useStaticColumns from "./useStaticColumns";
import useAxiosApiWrapper from "./useAxiosApiWrapper";
import moduleRouteMapping from "./moduleRouteMapping";

export type FilterValues = {
  [key: number]: Value;
};

interface TableFilterConditionGroup extends FilterConditionGroup {
  filterConditionList: TableFilterCondition[];
}

export const parseFilterValuesToEqualAndRange = (
  submitedPayload: DefaultPayload,
  values: Value,
  filterConditions?: TableFilterCondition[]
) => {
  // remove the unknown payload from the prior Filter Search Object Range, and Equal
  const filterIds = filterConditions?.map(
    (el) => `${el.filterKey}-${el.columnId}-${(el.filterName as string).trim()}`
  );
  const equal: Record<string, unknown> = {
    ...Object.fromEntries(
      Object.entries(submitedPayload.equal || {}).filter(([key]) =>
        filterIds?.includes(key)
      )
    ),
  };
  const range: Record<string, unknown> = {
    ...Object.fromEntries(
      Object.entries(submitedPayload.range || {}).filter(([key]) =>
        filterIds?.includes(key)
      )
    ),
  };

  Object.keys(values).forEach((key) => {
    const el = values[key];
    if (el) {
      const filterType = filterConditions?.find(
        (element) => key === element.filterId
      )?.type;
      if (typeof el[0] === "string") {
        if (isValid(new Date(el[0])) && filterType?.includes("_RANGE")) {
          if (filterType?.includes("DATE_RANGE"))
            range[key] = (el as string[]).map((v) =>
              moment(v).format("YYYY-MM-DD")
            );
          else if (filterType?.includes("TIME_RANGE"))
            range[key] = (el as string[]).map((v) => new Date(v));
        } else {
          equal[key] = el as string[];
        }
      } else if (isValid(new Date(String(el[0])))) {
        if (filterType?.includes("DATE_RANGE"))
          range[key] = (el as string[]).map((v) =>
            moment(v).format("YYYY-MM-DD")
          );
        else range[key] = el as Date[];
      } else if (
        (typeof el[0] === "number" || typeof el[1] === "number") &&
        filterType?.includes("NUMBER_RANGE")
      ) {
        range[key] = el as (number | null)[];
      } else if (el[0] === null && el[1] === null) {
        delete range[key];
      } else if (
        el[0] !== null &&
        typeof el[0] === "object" &&
        (el[0] as Item).value
      ) {
        equal[key] = (el as Item[]).map((item) => item.value);
      } else {
        delete equal[key];
      }
    }
  });

  return {
    equal,
    range,
  };
};

export default function useDataTableFilterColumns(
  table: Table,
  setPayload: Dispatch<SetStateAction<DefaultPayload>>,
  payload: DefaultPayload,
  setSubmitedPayload: Dispatch<SetStateAction<DefaultPayload>>,
  submitedPayload: DefaultPayload
) {
  const locale = useSelector(getGlobalLocale);
  const organizationId = useSelector(getSelectedOrgId);
  const { pathname } = useRouter();

  const [filterConditionGroups, setFilterConditionGroups] =
    useState<TableFilterConditionGroup[]>();
  const moduleNameByPath = useMemo(() => {
    const modules = Object.keys(moduleRouteMapping);
    let result: ServiceModuleValue | "" = "";
    for (let i = 0; i < modules.length; i += 1) {
      const moduleName = modules[i];
      if (moduleName) {
        const modulePaths = moduleRouteMapping[moduleName];
        if (modulePaths?.includes(pathname)) {
          result = moduleName as ServiceModuleValue;
          break;
        }
      }
    }
    return result;
  }, [pathname]);

  const shouldPassQueryServiceModuleValue =
    table === Table.COLUMNS &&
    (ServiceModuleValue.EVENT === moduleNameByPath ||
      ServiceModuleValue.CRM_USER === moduleNameByPath);

  const { data, isValidating: isFilterConditionGroupsValidating } =
    useOrgFilterConditionGroups(
      {
        organizationId,
        filterType: table,
      },
      {
        locale,
        serviceModuleValue: shouldPassQueryServiceModuleValue
          ? moduleNameByPath
          : undefined,
      },
      undefined,
      !!filterConditionGroups
    );

  const staticColumns = useStaticColumns(table, "isTable");
  const wordLibrary = useSelector(getWordLibrary);
  const columns = useMemo(
    () =>
      staticColumns?.map((el) => ({
        id: `${el.id}`,
        name: `${wordLibrary?.[el.columnName] ?? el.columnName}`,
        sortKey: el.sortKey,
        dataKey: el.sortKey,
        format: el.format,
      })) || [],
    [staticColumns, wordLibrary]
  );
  const { excute: getOrgEventsTargetRelations } = useAxiosApiWrapper(
    apis.org.getOrgEventsTargetRelations,
    "None"
  );

  // init filterConditionGroups
  useEffect(() => {
    if (!filterConditionGroups && data) {
      const groups = data.map((group) => ({
        ...group,
        filterConditionList: group.filterConditionList
          .filter((el) => el.columnId && el.filterName !== undefined)
          .map((el) => ({
            ...el,
            filterId: `${el.filterKey}-${el.columnId}-${(
              el.filterName as string
            ).trim()}`,
          })),
      }));
      setFilterConditionGroups(groups);
    }
  }, [
    data,
    filterConditionGroups,
    getOrgEventsTargetRelations,
    organizationId,
  ]);

  const filterConditions = useMemo(
    () =>
      filterConditionGroups?.reduce(
        (a, b) => [...a, ...b.filterConditionList],
        [] as TableFilterCondition[]
      ),
    [filterConditionGroups]
  );

  const filterSearch: FilterSearch | undefined = useMemo(() => {
    if (filterConditions) {
      return {
        startIndex: payload.startIndex,
        size: payload.size,
        query: payload.query ? payload.query.trim() : undefined,
        equal: submitedPayload.equal
          ? Object.keys(submitedPayload.equal).map((el) => {
              const filter = filterConditions.find((c) => c.filterId === el);
              if (submitedPayload.equal[el][0] === "EGROUP_EMPTY") {
                return {
                  filterKey: filter?.filterKey || "",
                  value: submitedPayload.equal[el],
                  columnId: filter?.columnId || "",
                  targetType: filter?.targetType,
                  noTargetRelationValue: filter?.noTargetRelationValue,
                  singleLayerTagServiceModuleValue:
                    filter?.singleLayerTagServiceModuleValue,
                  multiLayerTagServiceModuleValue:
                    filter?.multiLayerTagServiceModuleValue,
                  reviewServiceModuleValue: filter?.reviewServiceModuleValue,
                  serviceModuleId: filter?.serviceModuleId,
                  loginId: filter?.loginId,
                  type: filter?.type,
                };
              }
              return {
                filterKey: filter?.filterKey || "",
                value: submitedPayload.equal[el],
                columnId: filter?.columnId || "",
                targetType: filter?.targetType,
                singleLayerTagServiceModuleValue:
                  filter?.singleLayerTagServiceModuleValue,
                multiLayerTagServiceModuleValue:
                  filter?.multiLayerTagServiceModuleValue,
                reviewServiceModuleValue: filter?.reviewServiceModuleValue,
                serviceModuleId: filter?.serviceModuleId,
                loginId: filter?.loginId,
                type: filter?.type,
              };
            })
          : undefined,

        range: submitedPayload.range
          ? Object.keys(submitedPayload.range).map((el) => {
              const value = submitedPayload.range[el];
              const filter = filterConditions?.find((c) => c.filterId === el);
              return {
                filterKey: filter?.filterKey || "",
                columnId: filter?.columnId || "",
                type: filter?.type,
                from: value[0],
                to: value[1],
              };
            })
          : undefined,
        sort: payload.sort,
        locale,
      };
    }
    return undefined;
  }, [
    filterConditions,
    payload.startIndex,
    payload.size,
    payload.query,
    payload.sort,
    submitedPayload.equal,
    submitedPayload.range,
    locale,
  ]);

  const handleFilterSubmit = (values: Value) => {
    const result = parseFilterValuesToEqualAndRange(
      submitedPayload,
      values,
      filterConditions
    );
    // setPayload for cache
    setPayload((p) => ({
      ...p,
      equal: result.equal,
      range: result.range,
    }));
    setSubmitedPayload((p) => ({
      ...p,
      equal: result.equal,
      range: result.range,
    }));
  };

  const handleFilterClear = (e, values: Value) => {
    const result = parseFilterValuesToEqualAndRange(
      submitedPayload,
      values,
      filterConditions
    );
    // setPayload for cache
    setPayload((p) => ({
      ...p,
      equal: result.equal,
      range: result.range,
    }));
    setSubmitedPayload((p) => ({
      ...p,
      equal: result.equal,
      range: result.range,
    }));
  };

  return {
    filterConditionGroups,
    isFilterConditionGroupsValidating,
    filterConditions,
    filterSearch,
    columns,
    handleFilterSubmit,
    handleFilterClear,
  };
}
