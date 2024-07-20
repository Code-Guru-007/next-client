import { RemarkValue } from "components/DynamicField";
import { DynamicValueType, NextColumnValues } from "interfaces/form";

export type DynamicFieldWithActionHandleChangeType = (
  name: string,
  value?: DynamicValueType,
  remarkValues?: RemarkValue[],
  nextColumnValue?: NextColumnValues,
  nextColumnRemarkValues?: { [nextColumnId: string]: RemarkValue[] },
  columnTargetValueList?: RemarkValue[],
  nextColumnTargetValueList?: { [nextColumnId: string]: RemarkValue[] }
) => void | Promise<void | string>;
