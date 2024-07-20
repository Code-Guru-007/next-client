import { OrganizationColumn } from "interfaces/entities";

const getOrgColumnGroupByGroup = (columns?: OrganizationColumn[]) =>
  columns?.reduce(
    (acc, column) => {
      // Determine columnGroupId, default to 'none' if undefined
      const columnGroupId =
        column?.organizationColumnGroup?.columnGroupId || "none";
      // Return new accumulator object with current columnGroupId's group data
      return {
        ...acc,
        [columnGroupId]: [...(acc[columnGroupId] || []), column],
      };
    },
    {
      none: [],
    }
  ) || { none: [] };

export default getOrgColumnGroupByGroup;
