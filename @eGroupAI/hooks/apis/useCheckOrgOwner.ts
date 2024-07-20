import { useSelector } from "react-redux";
import { getSelectedOrg } from "@eGroupAI/redux-modules/memberOrgs";
import { useState } from "react";
import { Member } from "@eGroupAI/typings/apis";
import useMemberInfo from "./useMemberInfo";

type ReturnType =
  | {
      isOrgOwner: boolean;
      orgOwnerLoginId: string;
      loginId: string;
    }
  | Record<string, never>;

export default function useCheckOrgOwner(): ReturnType {
  const [memberInfo, setMemberInfo] = useState<Member>();
  const { data } = useMemberInfo(undefined, undefined, undefined, !!memberInfo);
  if (data) {
    setMemberInfo(data);
  }

  const selectedOrg = useSelector(getSelectedOrg);

  // Check if memberInfo has a loginId and selectedOrg has a creator
  if (!memberInfo?.loginId || !selectedOrg?.creator) {
    return {};
  }

  // Ensure the creator object exists before attempting to read loginId
  const orgOwnerLoginId: string = selectedOrg.creator.loginId;

  return {
    isOrgOwner: memberInfo.loginId === orgOwnerLoginId,
    orgOwnerLoginId,
    loginId: memberInfo.loginId,
  };
}
