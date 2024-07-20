import { useCallback, useMemo } from "react";
import { OrganizationColumn, DynamicColumnTarget } from "interfaces/entities";
import {
  DynamicColumnTargetApiPayload,
  UpdateOrgGroupApiPayload,
} from "interfaces/payloads";
import { RemarkValues, Values } from "components/DynamicField";
import { isEqual } from "lodash";

/**
 * Spec:
 * 1. return getUpdatePayload function with targetList and columns
 * 2. getUpdatePayload need parse values for update user information
 * 3. getUpdatePayload value(columnTargetValue) can be empty string
 */
export default function useOrgGroupApiPayload(
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
      defaultValues?: Values | OrganizationColumn[],
      relatedTargetId?: string,
      remarkValues?: RemarkValues,
      targetId?: string
    ) => {
      let payload: Omit<
        UpdateOrgGroupApiPayload,
        "organizationId" | "organizationGroupId"
      > = {};
      const dynamicColumnTargetList: DynamicColumnTargetApiPayload[] = [];

      if (!isEqual(values, defaultValues)) {
        Object.keys(values).forEach((key) => {
          const value = values[key];
          let orgColumn;
          if (columnMap) orgColumn = columnMap[key];
          // To verify if value changed.
          let defaultValue;
          if (defaultValues) {
            if (!orgColumn) defaultValue = defaultValues[key];
            else defaultValue = defaultValues[key]?.columnTargetValue;
            if (
              defaultValue &&
              value &&
              remarkValues &&
              value === defaultValue &&
              defaultValues[key] === remarkValues[orgColumn.columnId]
            )
              return;
          }
          if (typeof value === "undefined" || value === null) {
            // delete undefined static column set
            if (!orgColumn)
              payload = {
                ...payload,
                [key]: value || "",
              };
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
      };
    },
    [targetMap, columnMap]
  );

  return getUpdatePayload;
}
