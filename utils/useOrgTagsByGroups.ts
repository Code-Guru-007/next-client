import { useMemo } from "react";
import { OrganizationTagGroup, OrganizationTag } from "interfaces/entities";

const mergeTagGroupName = (
  groupName: string,
  tags?: OrganizationTag[]
): OrganizationTag[] | undefined =>
  tags?.map((el) => {
    const tag = {
      ...el,
      organizationTagGroup: {
        ...el.organizationTagGroup,
        tagGroupName: groupName,
      },
    };
    return {
      ...tag,
      tagName: `${el.tagName}`,
    };
  });

export default function useOrgTagsByGroups(groups?: OrganizationTagGroup[]) {
  const tags = useMemo(() => {
    if (groups?.length === 0) {
      return undefined;
    }
    return groups
      ?.map((el) => mergeTagGroupName(el.tagGroupName, el?.organizationTagList))
      .reduce((a, b) => a?.concat(b || []));
  }, [groups]);

  return tags;
}
