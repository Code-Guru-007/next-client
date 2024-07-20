import { useCallback, useMemo } from "react";
import { OrganizationColumn, DynamicColumnTarget } from "interfaces/entities";
import {
  DynamicColumnTargetApiPayload,
  UpdateUploadFileApiPayload,
} from "interfaces/payloads";
import { Values } from "components/DynamicField";

/**
 * Spec:
 * 1. return getUpdatePayload function with targetList and columns
 * 2. getUpdatePayload need parse values for update user information
 * 3. getUpdatePayload value(columnTargetValue) can be empty string
 */
export default function useUpdateUploadFileApiPayload(
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
    (values: Values, defaultValues?: Values, targetId?: string) => {
      let payload: Omit<
        UpdateUploadFileApiPayload,
        "organizationId" | "uploadFileId"
      > = {};
      const dynamicColumnTargetList: DynamicColumnTargetApiPayload[] = [];
      if (columnMap) {
        Object.keys(values).forEach((key) => {
          const value = values[key];
          const orgColumn = columnMap[key];
          if (typeof value === "undefined" || value === null) return;
          // To verify if value changed.
          if (defaultValues) {
            const defaultValue = defaultValues[key];
            if (value === defaultValue) return;
          }

          if (targetMap && targetMap[key]) {
            const dynamic = targetMap[key];
            if (dynamic) {
              dynamicColumnTargetList.push({
                columnTargetId: dynamic.columnTargetId,
                organizationColumn: {
                  columnId: dynamic.organizationColumn.columnId,
                  columnName: dynamic.organizationColumn.columnName,
                  columnType: dynamic.organizationColumn.columnType,
                },
                targetId,
                columnTargetValue: value,
              });
            }
          } else if (orgColumn) {
            dynamicColumnTargetList.push({
              organizationColumn: {
                columnId: orgColumn.columnId,
                columnName: orgColumn.columnName,
                columnType: orgColumn.columnType,
              },
              targetId,
              columnTargetValue: value,
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
