import {
  OrganizationColumn,
  OrganizationShareEdit,
  OrganizationShareTemplateEdit,
} from "interfaces/entities";
import { StaticColumn } from "./useStaticColumns";

/**
 * sort orgShareEditList by static and dynamic columns.
 * https://github.com/eGroupAI/infocenter-client/issues/580
 * @param orgShareEditList
 */
export default function sortOrgShareTemplateEditListByStaticDynamicColumns(
  orgShareEditList: OrganizationShareEdit[],
  staticColumns: StaticColumn[],
  dynamicColumns: OrganizationColumn[]
): OrganizationShareTemplateEdit[] {
  const result: OrganizationShareTemplateEdit[] = [];
  staticColumns.forEach((column) => {
    const target = orgShareEditList.find(
      (el) => column.sortKey === el.organizationShareEditKey
    );
    if (target) {
      result.push({
        organizationShareTemplateEditKey: target.organizationShareEditKey,
        organizationShareTemplateEditType: target.organizationShareEditType,
        organizationShareTemplateEditIsRequired:
          target.organizationShareEditIsRequired,
        isDynamicColumn: target.isDynamicColumn,
        isAutoFill: target.isAutoFill,
      });
    }
  });
  dynamicColumns.forEach((column) => {
    const target = orgShareEditList.find(
      (el) => column.columnId === el.organizationShareEditKey
    );
    if (target) {
      result.push({
        organizationShareTemplateEditKey: target.organizationShareEditKey,
        organizationShareTemplateEditType: target.organizationShareEditType,
        organizationShareTemplateEditIsRequired:
          target.organizationShareEditIsRequired,
        isDynamicColumn: target.isDynamicColumn,
      });
    }
  });
  return result;
}
