import { EntityList, MemberInformationCopy } from "@eGroupAI/typings/apis";
import makeGetHook from "./makeGetHook";
import { fetcher } from "./fetchers";

export type PathParams = {
  memberInformationCopyId?: string;
};

const useMemberInformationCopies = makeGetHook<
  EntityList<MemberInformationCopy>
>("/member/information-copies", fetcher);

export default useMemberInformationCopies;
