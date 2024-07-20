import { OrganizationColumn } from "interfaces/entities";

const getRequiredDynamicFieldList = (columns?: OrganizationColumn[]) =>
  columns?.filter((column) => column.isRequired) || [];

export default getRequiredDynamicFieldList;
