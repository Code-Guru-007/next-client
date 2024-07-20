import useCheckOrgOwner from "@eGroupAI/hooks/apis/useCheckOrgOwner";

/**
 * To vaild if current logined member is the selected org owner.
 */
export default function useOrgOwnerValid(shouldBeOrgOwner?: boolean) {
  const { isOrgOwner } = useCheckOrgOwner();

  return Boolean(shouldBeOrgOwner && isOrgOwner);
}
