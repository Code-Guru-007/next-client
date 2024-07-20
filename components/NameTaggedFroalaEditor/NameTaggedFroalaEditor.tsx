import { FC, useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import useOrgMembers from "utils/useOrgMembers";

import { Box } from "@mui/material";
import FroalaEditor from "components/FroalaEditor";

import { makeStyles } from "@mui/styles";
import { TextFieldProps } from "@mui/material/TextField";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { SelectionInfo } from "@eGroupAI/material-module/FroalaEditor/utils";
import { OrganizationMember } from "@eGroupAI/typings/apis";

import { ServiceModuleValue } from "interfaces/utils";
import useDebounce from "@eGroupAI/hooks/useDebounce";
import TaggedUserList from "./TaggedUserList";

const useStyles = makeStyles(() => ({
  editSectionContainer: {
    padding: "10px",
    borderRadius: 8,
    boxShadow: "none",
    marginBottom: 0,
    border: "1px solid rgba(145, 158, 171, 0.2)",
    wordBreak: "break-word",
    boxSizing: "border-box",
    "& .show-placeholder .fr-placeholder": {
      marginTop: "0px !important",
    },
  },
}));

type ReplaceInfo = {
  replaceContainer: HTMLElement;
  replaceStartIndex: number;
  replaceEndIndex: number;
  replaceText: string;
};

export type NameTaggedFroalaEditorProps = TextFieldProps & {
  tagDisplayCount?: number;
  handleMentionedMemberList: (loginId: string, userName: string) => void;
  onChangeModel?: (comment: string) => void;
  fileType?: string;
  placeholder?: string;
  height?: number;
  id?: string;
  testId?: string;
};

const NameTaggedFroalaEditor: FC<NameTaggedFroalaEditorProps> = (props) => {
  const {
    height = 100,
    value,
    tagDisplayCount = 5,
    fileType,
    placeholder,
    handleMentionedMemberList,
    onChangeModel,
    id,
    testId,
  } = props;
  const [comment, setComment] = useState<string>(value as string);
  useEffect(() => {
    setComment((value as string) || "");
  }, [value]);

  const organizationId = useSelector(getSelectedOrgId);
  const { data: memberList } = useOrgMembers({ organizationId });

  const [selection, setUserSelection] = useState<SelectionInfo | null>(null);
  const [detectedTagKey, setDetectedTagKey] = useState<boolean>(false);
  const [isOnTaggingName, setIsOnTaggingName] = useState<boolean>(false);
  const [replaceInfo, setReplaceInfo] = useState<ReplaceInfo | undefined>();
  const [isEnterKeyTriggered, setIsEnterKeyTriggered] =
    useState<boolean>(false);
  const [isMouseSelected, setIsMouseSelected] = useState<boolean>(false);
  const [mouseSelectedMember, setMouseSelectedMember] =
    useState<OrganizationMember>();
  const [searchName, setSearchName] = useState<string>("");
  const [userListIndex, setUserListIndex] = useState<number>(0);

  const containerEl = useRef<HTMLDivElement>(null);
  const mirroredEle = useRef<HTMLDivElement>(null);
  const [caretCoordinates, setCaretCoordinates] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  const classes = useStyles();
  const wordLibrary = useSelector(getWordLibrary);
  const debouncedSearchName = useDebounce(searchName, 300);
  const userListMatched = useMemo(() => {
    const regex_string = debouncedSearchName
      ?.toLowerCase()
      .split("")
      .join(".*?");
    const regex = new RegExp(regex_string, "i"); // Case insensitive match

    const result = memberList?.source?.filter((member) =>
      regex.test(member.member.memberName?.toLowerCase())
    );
    return result;
  }, [memberList?.source, debouncedSearchName]);

  const displayCount =
    (userListMatched?.length || 0) > tagDisplayCount
      ? tagDisplayCount
      : userListMatched?.length || 0;

  const handleUserSelection = (selection) => {
    setUserSelection(selection);
  };

  const handleSetSearchName = useCallback((name) => {
    setSearchName(name);
  }, []);

  const handleReplaceTaggedName = useCallback(
    (
      keyTriggered: string,
      replaceInfo: ReplaceInfo,
      userToBeReplaced?: OrganizationMember
    ) => {
      let taggedMember: OrganizationMember | undefined;
      taggedMember = userToBeReplaced;
      if (keyTriggered === "Enter" || typeof userToBeReplaced === "undefined") {
        taggedMember = userListMatched?.[userListIndex] as OrganizationMember;
      }

      if (keyTriggered === "Tab" && replaceInfo && taggedMember) {
        const {
          replaceStartIndex,
          replaceEndIndex,
          replaceText,
          replaceContainer,
        } = replaceInfo;
        const replacement = `@${taggedMember?.member.memberName || ""}\u00A0`;
        const newCaretPosition = replaceStartIndex + replacement.length;

        if (replaceText && replaceContainer.textContent) {
          const beforeReplace = replaceContainer.textContent.substring(
            0,
            replaceStartIndex
          );
          const afterReplace =
            replaceContainer.textContent.substring(replaceEndIndex);
          const replacedContent = beforeReplace + replacement + afterReplace;
          replaceContainer.textContent = replacedContent;

          // Set the cursor position to the newCaretPosition
          const range = document.createRange();
          const sel = window.getSelection();
          try {
            // Assuming replaceContainer is the contentEditable element
            range.setStart(replaceInfo.replaceContainer, newCaretPosition);
            range.collapse(true);
            sel?.removeAllRanges();
            sel?.addRange(range);
            handleMentionedMemberList(
              taggedMember.member.loginId,
              taggedMember.member.memberName
            );
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Could not set the cursor position: ", error);
          }
          setDetectedTagKey(false);
        }
      }
      if (keyTriggered === "Enter" && replaceInfo && taggedMember) {
        const {
          replaceStartIndex,
          replaceEndIndex,
          replaceText,
          replaceContainer,
        } = replaceInfo;
        const replacement = `@${taggedMember?.member.memberName || ""}\u00A0`;
        const newCaretPosition = replaceStartIndex + replacement.length;

        if (replaceText && replaceContainer.textContent) {
          const beforeReplace = replaceContainer.textContent.substring(
            0,
            replaceStartIndex
          );
          const afterReplace =
            replaceContainer.textContent.substring(replaceEndIndex);
          const replacedContent = beforeReplace + replacement + afterReplace;
          replaceContainer.textContent = replacedContent;

          // Set the cursor position to the newCaretPosition
          const range = document.createRange();
          const sel = window.getSelection();
          try {
            // Assuming replaceContainer is the contentEditable element
            range.setStart(replaceInfo.replaceContainer, newCaretPosition);
            range.collapse(true);
            sel?.removeAllRanges();
            sel?.addRange(range);
            handleMentionedMemberList(
              taggedMember.member.loginId,
              taggedMember.member.memberName
            );
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Could not set the cursor position: ", error);
          }
          setIsEnterKeyTriggered(false);
          setDetectedTagKey(false);
        }
      }
      if (keyTriggered === "Mouse_Select" && replaceInfo && taggedMember) {
        const {
          replaceStartIndex,
          replaceEndIndex,
          replaceText,
          replaceContainer,
        } = replaceInfo;
        const replacement = `@${taggedMember?.member.memberName || ""}\u00A0`;
        const newCaretPosition = replaceStartIndex + replacement.length;

        if (replaceText && replaceContainer.textContent) {
          const beforeReplace = replaceContainer.textContent.substring(
            0,
            replaceStartIndex
          );
          const afterReplace =
            replaceContainer.textContent.substring(replaceEndIndex);
          const replacedContent = beforeReplace + replacement + afterReplace;
          replaceContainer.textContent = replacedContent;

          // Set the cursor position to the newCaretPosition
          const range = document.createRange();
          const sel = window.getSelection();
          try {
            // Assuming replaceContainer is the contentEditable element
            range.setStart(replaceInfo.replaceContainer, newCaretPosition);
            range.collapse(true);
            sel?.removeAllRanges();
            sel?.addRange(range);
            handleMentionedMemberList(
              taggedMember.member.loginId,
              taggedMember.member.memberName
            );
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Could not set the cursor position: ", error);
          }
          setDetectedTagKey(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userListIndex, userListMatched]
  );

  const handleKeyDownEvents = useCallback(
    (e) => {
      if (isOnTaggingName) {
        if (e.key === "Tab" && replaceInfo) {
          e.preventDefault();
          setIsOnTaggingName(false);
          handleReplaceTaggedName(
            e.key,
            replaceInfo,
            userListMatched?.[userListIndex] as OrganizationMember
          );
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setIsOnTaggingName(false);
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          setIsOnTaggingName(false);
        }
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          if (e.key === "ArrowUp") setUserListIndex((i) => i - 1);
          if (e.key === "ArrowDown") setUserListIndex((i) => i + 1);
          if (userListIndex >= displayCount) setUserListIndex(0);
          if (userListIndex < 0) setUserListIndex(displayCount - 1);
        }
      }
      return true;
    },
    [
      displayCount,
      handleReplaceTaggedName,
      isOnTaggingName,
      replaceInfo,
      userListIndex,
      userListMatched,
    ]
  );

  const handleDefaultEnterKeyEventWithNameTag = (
    e,
    selection: SelectionInfo | null
  ) => {
    if (e.key === "Enter" && selection) {
      const regex_isOnTagging = new RegExp(/@[^\s]*$/g);
      const caretOffset = selection?.range.endOffset ?? 0;
      const textContent = selection?.range.endContainer.textContent || "";
      const textToLeftOfCaret = textContent.slice(0, caretOffset);
      const matches = textToLeftOfCaret.match(regex_isOnTagging);
      if (!!matches && matches[matches.length - 1]) {
        const lastMatch = matches[matches.length - 1].trim();
        setIsOnTaggingName(false);
        setReplaceInfo({
          replaceContainer: selection?.range.endContainer,
          replaceStartIndex: caretOffset - lastMatch.length,
          replaceEndIndex: caretOffset,
          replaceText: lastMatch,
        });
        setIsEnterKeyTriggered(true);
      }
    }
  };

  useEffect(() => {
    if (isEnterKeyTriggered && replaceInfo) {
      handleReplaceTaggedName(
        "Enter",
        replaceInfo,
        userListMatched?.[userListIndex] as OrganizationMember
      );
    }
  }, [
    handleReplaceTaggedName,
    isEnterKeyTriggered,
    replaceInfo,
    userListIndex,
    userListMatched,
  ]);

  const handleSelectTaggedName = (selectedMember?: OrganizationMember) => {
    if (selectedMember) {
      setMouseSelectedMember(selectedMember);
      setIsMouseSelected(true);
    }
  };

  useEffect(() => {
    if (isMouseSelected && mouseSelectedMember && replaceInfo) {
      handleReplaceTaggedName("Mouse_Select", replaceInfo, mouseSelectedMember);
      setMouseSelectedMember(undefined);
      setIsMouseSelected(false);
      setIsOnTaggingName(false);
    }
  }, [
    mouseSelectedMember,
    isMouseSelected,
    replaceInfo,
    handleReplaceTaggedName,
  ]);

  useEffect(() => {
    const regex_isOnTagging = new RegExp(/@[^\s]*$/g);
    const caretOffset = selection?.range.endOffset ?? 0;
    const textContent = selection?.range.endContainer.textContent || "";
    const textToLeftOfCaret = textContent.slice(0, caretOffset);

    const matches = textToLeftOfCaret.match(regex_isOnTagging);
    setDetectedTagKey(!!matches);
    if (matches && matches[matches.length - 1]) {
      const lastMatch = matches[matches.length - 1].trim();
      setReplaceInfo({
        replaceContainer: selection?.range.endContainer,
        replaceStartIndex: caretOffset - lastMatch.length,
        replaceEndIndex: caretOffset,
        replaceText: lastMatch,
      });
      handleSetSearchName(lastMatch.slice(1));
    } else {
      handleSetSearchName("");
    }
  }, [selection, handleSetSearchName]);

  useEffect(() => {
    setUserListIndex(0);
  }, [searchName.length]);

  useEffect(() => {
    if (detectedTagKey) {
      setIsOnTaggingName(true);
    } else {
      setIsOnTaggingName(false);
    }
  }, [detectedTagKey, searchName]);

  useEffect(() => {
    if (isOnTaggingName) {
      const fr_element = containerEl.current?.querySelector(
        ".fr-element.fr-view"
      );
      const frRect = fr_element?.getBoundingClientRect();
      setCaretCoordinates({
        top: selection?.position.y + selection?.position.h - (frRect?.top || 0),
        left: selection?.position.x - (frRect?.left || 0) || 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnTaggingName]);

  return (
    <Box ref={containerEl} sx={{ position: "relative" }}>
      <div
        ref={mirroredEle}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          height: "100%",
          width: "100%",
          overflow: "hidden",
          color: "transparent",
          visibility: "hidden",
        }}
      />
      <FroalaEditor
        id={id}
        testId={testId}
        filePathType={
          // eslint-disable-next-line no-nested-ternary
          fileType === "ARTICLE"
            ? ServiceModuleValue.ARTICLE
            : fileType === "BULLETIN"
            ? ServiceModuleValue.BULLETIN
            : ServiceModuleValue.EVENT
        }
        className={classes.editSectionContainer}
        model={comment}
        onModelChange={(model) => {
          setComment(model);
          if (onChangeModel) onChangeModel(model);
        }}
        shouldPreventDefaultEnterKeyEvent={isOnTaggingName}
        onKeyDown={handleKeyDownEvents}
        handleDefaultEnterKeyEventWithNameTag={
          handleDefaultEnterKeyEventWithNameTag
        }
        getUserSelection={handleUserSelection}
        onClick={() => setIsOnTaggingName(false)}
        config={{
          toolbarInline: true,
          toolbarVisibleWithoutSelection: false,
          charCounterCount: false,
          placeholderText:
            placeholder ||
            (wordLibrary?.["write down some of your responses"] ??
              "寫下您的一些回應..."),
          quickInsertEnabled: true,
          imageDefaultMargin: 7,
          imageOutputSize: false,
          heightMin: height,
          heightMax: undefined,
        }}
      />
      <TaggedUserList
        isOpen={isOnTaggingName}
        searchName={searchName}
        displayCount={displayCount}
        targetedIndex={userListIndex}
        openPosition={caretCoordinates}
        searchedUserList={userListMatched}
        handleSelectTaggedName={handleSelectTaggedName}
      />
    </Box>
  );
};

export default NameTaggedFroalaEditor;
