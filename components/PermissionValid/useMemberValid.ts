import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";
import { Member } from "@eGroupAI/typings/apis";
import { useState } from "react";

/**
 * To vaild if the member has permission for single item, eg: comments, articles.
 */
export default function useMemberValid(vaildLoginId?: string) {
  const [memberInfo, setMemberInfo] = useState<Member>();
  const { data } = useMemberInfo(undefined, undefined, undefined, !!memberInfo);
  if (data) {
    setMemberInfo(data);
  }

  const hasPermission = memberInfo?.loginId === vaildLoginId;

  return hasPermission;
}
