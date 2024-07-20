import { useMemo } from "react";
import { Option, OptionType } from "@eGroupAI/material-lab/FilterDropDown";
import { FilterConditionGroup } from "@eGroupAI/typings/apis";

export default function useFilterOptions(
  filterConditionGroups?: FilterConditionGroup[]
) {
  const result = useMemo(
    () =>
      filterConditionGroups?.map((group) => ({
        ...group,
        filterConditionList: group.filterConditionList.map(
          (el) =>
            ({
              filterId: `${el.filterKey}-${
                el.columnId
              }-${el.filterName?.replace(/\s/g, "")}`,
              filterName: el.filterName, // title property ==> filterName
              filterKey: el.filterKey, // name property ==> filterKey
              columnId: el.columnId,
              icon: el.filterIcon,
              type: el.type as OptionType,
              items: el.dataList?.map((data) => ({
                label: data.name,
                value: data.value,
              })),
              disabled: false,
            } as Option)
        ),
      })),
    [filterConditionGroups]
  );

  return result;
}
