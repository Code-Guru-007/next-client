import { useCallback, useMemo } from "react";

import {
  OrganizationColumn,
  DynamicColumnTarget,
  OrganizationShareEdit,
} from "interfaces/entities";
import {
  DynamicColumnTargetApiPayload,
  UpdateOrgUserApiPayload,
} from "interfaces/payloads";
import { RemarkValues, Values } from "components/DynamicField";
import { isEqual } from "lodash";

/**
 * Spec:
 * 1. return getUpdatePayload function with targetList and columns
 * 2. getUpdatePayload need parse values for update user information
 * 3. getUpdatePayload value(columnTargetValue) can be empty string
 */
export default function useUpdateUserApiPayload(
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
      targetId?: string,
      isBatchReset?: boolean,
      organizationShareEditList?: OrganizationShareEdit[],
      isUserFilledPage?: boolean,
      columnTargetValueList?: RemarkValues,
      multiSelectMode?: string
    ) => {
      let payload: Omit<
        UpdateOrgUserApiPayload,
        "organizationId" | "organizationUserId"
      > = {};
      const dynamicColumnTargetList: DynamicColumnTargetApiPayload[] = [];
      const dynamicColumnTargetRemoveList: { columnTargetId: string }[] = [];
      let shouldProceedValues = false;
      if (isUserFilledPage)
        shouldProceedValues =
          !!organizationShareEditList &&
          !!(
            !isEqual(values, defaultValues) ||
            (values && defaultValues && remarkValues)
          );
      else
        shouldProceedValues = !!(
          !isEqual(values, defaultValues) ||
          (values && defaultValues && remarkValues)
        );
      if (shouldProceedValues) {
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
              orgColumn &&
              defaultValue &&
              value &&
              remarkValues &&
              value === defaultValue &&
              defaultValues[key] === remarkValues[orgColumn.columnId]
            )
              return;
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
            if (organizationShareEditList) {
              if (
                dynamic &&
                organizationShareEditList?.findIndex(
                  (el) =>
                    el.organizationShareEditKey ===
                    dynamic?.organizationColumn.columnId
                ) > -1
              ) {
                // updated dynamic column targets
                dynamicColumnTargetList.push({
                  columnTargetId: dynamic.columnTargetId,
                  multiSelectMode,
                  organizationColumn: {
                    columnId: dynamic.organizationColumn.columnId,
                    columnName: dynamic.organizationColumn.columnName,
                    columnType: dynamic.organizationColumn.columnType,
                  },
                  targetId,
                  columnTargetRelatedTargetId: relatedTargetId,
                  columnTargetValue: value,
                  columnTargetValueList:
                    columnTargetValueList?.[
                      dynamic.organizationColumn.columnId
                    ] || [],
                  columnTargetValueRemarkList: remarkValues
                    ? remarkValues[dynamic.organizationColumn.columnId]
                    : [],
                });
              }
            } else if (dynamic) {
              dynamicColumnTargetList.push({
                columnTargetId: dynamic.columnTargetId,
                multiSelectMode,
                organizationColumn: {
                  columnId: dynamic.organizationColumn.columnId,
                  columnName: dynamic.organizationColumn.columnName,
                  columnType: dynamic.organizationColumn.columnType,
                },
                targetId,
                columnTargetRelatedTargetId: relatedTargetId,
                columnTargetValue: value,
                columnTargetValueList:
                  columnTargetValueList?.[
                    dynamic.organizationColumn.columnId
                  ] || [],
                columnTargetValueRemarkList: remarkValues
                  ? remarkValues[dynamic.organizationColumn.columnId]
                  : [],
              });
            }
          } else if (orgColumn) {
            // new dynamic column targets
            dynamicColumnTargetList.push({
              multiSelectMode,
              organizationColumn: {
                columnId: orgColumn.columnId,
                columnName: orgColumn.columnName,
                columnType: orgColumn.columnType,
              },
              targetId,
              columnTargetRelatedTargetId: relatedTargetId,
              columnTargetValue: value,
              columnTargetValueList:
                columnTargetValueList?.[orgColumn.columnId] || [],
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
