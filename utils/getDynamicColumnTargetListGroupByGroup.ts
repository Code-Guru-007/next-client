const getDynamicColumnTargetListGroupByGroup = (targetList) =>
  targetList?.reduce(
    (a, b) => ({
      ...a.organizationColumn,
      [b.organizationColumn.organizationColumnGroup?.columnGroupId || "none"]: [
        ...(a[
          b.organizationColumn.organizationColumnGroup?.columnGroupId || "none"
        ] || []),
        b.column,
      ],
    }),
    {
      none: [],
    }
  ) || {};

export default getDynamicColumnTargetListGroupByGroup;
