import { useMemo } from "react";
import { Option, OptionType } from "@eGroupAI/material-lab/FilterDropDown";
import { TableFilterConditionGroup } from "./typing";

export default function useFilterConditionGroup(
  filterConditionGroups?: TableFilterConditionGroup[]
) {
  const result = useMemo(
    () =>
      filterConditionGroups?.map((group) => ({
        ...group,
        filterConditionList: group.filterConditionList.map(
          (el) =>
            ({
              filterId: el.filterId,
              filterKey: el.filterKey,
              filterName: el.filterName,
              columnId: el.columnId,
              type: el.type as OptionType,
              icon: el.filterIcon,
              items: el.dataList?.map((data) => ({
                label: data.name,
                value: data.value,
              })),
              disabled: false,
              targetType: el.targetType,
            } as Option)
        ),
      })),
    [filterConditionGroups]
  );

  return result;
}
