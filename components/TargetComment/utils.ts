import { Member } from "interfaces/entities";
// eslint-disable-next-line import/extensions
import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";
import { useSettingsContext } from "../../minimal/components/settings/context";

export function getMentionedMembersHighlightedMessage(
  message: string,
  mentionedMembers?: Member[]
): string {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: memberInfo } = useMemberInfo();
  // eslint-disable-next-line array-callback-return, consistent-return
  const mentionedMemberList = mentionedMembers?.map((member) => {
    if (memberInfo && memberInfo.loginId === member.loginId) {
      return `${member.memberName}`;
    }
  });
  // eslint-disable-next-line array-callback-return, consistent-return
  const notMentionedMemberList = mentionedMembers?.map((member) => {
    if (memberInfo && memberInfo.loginId !== member.loginId) {
      return `${member.memberName}`;
    }
  });
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const settings = useSettingsContext();
  let highlightedMessage = message;
  let replacement;
  mentionedMemberList?.forEach((mentionedMemberName) => {
    const pattern = new RegExp(`@${mentionedMemberName}`, "g");
    if (settings.themeMode === "dark")
      replacement = `<strong style="background-color: #4b2900; color: #efc465;">@${mentionedMemberName}</strong>`;
    else
      replacement = `<strong style="background-color: #fff8c5; color: black;">@${mentionedMemberName}</strong>`;
    highlightedMessage = highlightedMessage.replace(pattern, replacement);
  });
  notMentionedMemberList?.forEach((mentionedMemberName) => {
    const pattern = new RegExp(`@${mentionedMemberName}`, "g");
    replacement = `<strong>@${mentionedMemberName}</strong>`;
    highlightedMessage = highlightedMessage.replace(pattern, replacement);
  });
  return highlightedMessage;
}
