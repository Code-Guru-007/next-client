import { useCallback, useMemo } from "react";
import { OrganizationColumn, DynamicColumnTarget } from "interfaces/entities";
import {
  DynamicColumnTargetApiPayload,
  UpdateOrgEventApiPayload,
} from "interfaces/payloads";
import { RemarkValues, Values } from "components/DynamicField";
import { isEqual } from "lodash";

export default function useUpdateEventApiPayload(
  targetList?: DynamicColumnTarget[],
  columns?: OrganizationColumn[]
) {
  const targetMap = useMemo(
    () =>
      targetList?.reduce(
        (a, b) => ({
          ...a,
          [b.organizationColumn.columnId]: b,
        }),
        {} as Record<string, DynamicColumnTarget>
      ),
    [targetList]
  );

  const columnMap = useMemo(
    () =>
      columns?.reduce(
        (a, b) => ({
          ...a,
          [b.columnId]: b,
        }),
        {} as Record<string, OrganizationColumn>
      ),
    [columns]
  );

  const getUpdatePayload = useCallback(
    (
      values: Values,
      defaultValues?: Values,
      relatedTargetId?: string,
      remarkValues?: RemarkValues,
      targetId?: string,
      isBatchReset?: boolean
    ) => {
      let payload: Omit<
        UpdateOrgEventApiPayload,
        "organizationId" | "organizationEventId"
      > = {};
      const dynamicColumnTargetList: DynamicColumnTargetApiPayload[] = [];
      const dynamicColumnTargetRemoveList: { columnTargetId: string }[] = [];

      if (!isEqual(values, defaultValues)) {
        Object.keys(values).forEach((key) => {
          const value = values[key];
          let orgColumn;
          if (columnMap) orgColumn = columnMap[key];
          // To verify if value changed.
          let defaultValue;
          if (defaultValues) {
            defaultValue = defaultValues[key];
            if (value === defaultValue) return;
          }
          if (typeof value === "undefined" || value === null) {
            // batch reset Dynamic Info of users --- should be renamed to dynamicColumnRemoveList: {columnId: string}[]
            if (isBatchReset) {
              dynamicColumnTargetRemoveList.push({
                columnTargetId: key,
              });
            }
            // deleted dynamicColumnTargetRemoveList
            if (targetMap && targetMap[key]) {
              const dynamic = targetMap[key];
              if (dynamic) {
                dynamicColumnTargetRemoveList.push({
                  columnTargetId: dynamic.columnTargetId,
                });
              }
            }
            return;
          }
          if (targetMap && targetMap[key]) {
            const dynamic = targetMap[key];
            if (dynamic) {
              // updated dynamic column targets
              dynamicColumnTargetList.push({
                columnTargetId: dynamic.columnTargetId,
                organizationColumn: {
                  columnId: dynamic.organizationColumn.columnId,
                  columnName: dynamic.organizationColumn.columnName,
                  columnType: dynamic.organizationColumn.columnType,
                },
                targetId,
                columnTargetRelatedTargetId: relatedTargetId,
                columnTargetValue: value,
                columnTargetValueRemarkList: remarkValues
                  ? remarkValues[dynamic.organizationColumn.columnId]
                  : [],
              });
            }
          } else if (orgColumn) {
            // new dynamic column targets
            dynamicColumnTargetList.push({
              organizationColumn: {
                columnId: orgColumn.columnId,
                columnName: orgColumn.columnName,
                columnType: orgColumn.columnType,
              },
              targetId,
              columnTargetRelatedTargetId: relatedTargetId,
              columnTargetValue: value,
              columnTargetValueRemarkList: remarkValues
                ? remarkValues[orgColumn.columnId]
                : [],
            });
          } else {
            payload = {
              ...payload,
              [key]: value,
            };
          }
        });
      }
      return {
        ...payload,
        dynamicColumnTargetList,
        dynamicColumnTargetRemoveList,
      };
    },
    [targetMap, columnMap]
  );

  return getUpdatePayload;
}
