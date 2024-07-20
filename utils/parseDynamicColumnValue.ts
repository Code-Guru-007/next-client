import { ColumnType } from "@eGroupAI/typings/apis";
import { format } from "@eGroupAI/utils/dateUtils";

export default function parseDynamicColumnValue(
  type: ColumnType,
  val?: string | number
) {
  switch (type) {
    case ColumnType.DATE:
      return format(val, "yyyy-MM-dd");
    case ColumnType.DATETIME:
      return format(val, "yyyy-MM-dd | HH:mm");
    default:
      return val;
  }
}
