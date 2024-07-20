import { OrganizationColumn, OrganizationShareEdit } from "interfaces/entities";
import { StaticColumn } from "./useStaticColumns";

/**
 * sort orgShareEditList by static and dynamic columns.
 * https://github.com/eGroupAI/infocenter-client/issues/580
 * @param orgShareEditList
 */
export default function sortOrgShareEditListByStaticDynamicColumns(
  orgShareEditList: OrganizationShareEdit[],
  staticColumns: StaticColumn[],
  dynamicColumns: OrganizationColumn[]
): OrganizationShareEdit[] {
  const result: OrganizationShareEdit[] = [];
  staticColumns.forEach((column) => {
    const target = orgShareEditList.find(
      (el) => column.sortKey === el.organizationShareEditKey
    );
    if (target) {
      result.push(target);
    }
  });
  dynamicColumns.forEach((column) => {
    const target = orgShareEditList.find(
      (el) => column.columnId === el.organizationShareEditKey
    );
    if (target) {
      result.push(target);
    }
  });
  return result;
}
