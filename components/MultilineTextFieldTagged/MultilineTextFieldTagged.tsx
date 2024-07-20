import { FC, useState, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import useOrgMembers from "utils/useOrgMembers";

import { Box } from "@mui/material";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import TaggedUserList from "./TaggedUserList";

export type MultilineTextFieldTaggedProps = TextFieldProps & {
  tagDisplayCount?: number;
  handleAddUserName: (
    loginId: string,
    searchString: string,
    userName: string
  ) => void;
};

const MultilineTextFieldTagged: FC<MultilineTextFieldTaggedProps> = (props) => {
  const { value, tagDisplayCount = 5, handleAddUserName, ...others } = props;

  const organizationId = useSelector(getSelectedOrgId);
  const { data: memberList } = useOrgMembers({ organizationId });

  const [isTagging, setIsTagging] = useState<boolean>(false);
  const [searchName, setSearchName] = useState<string>("");
  const [userListIndex, setUserListIndex] = useState<number>(0);
  const [enterClicked, setUserEnterKeyEvent] = useState<boolean>(false);

  const textAreaRef = useRef<HTMLInputElement>(null);
  const containerEl = useRef<HTMLDivElement>(null);
  const mirroredEle = useRef<HTMLDivElement>(null);
  const [caretCoordinates, setCaretCoordinates] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  const userListMatched = useMemo(() => {
    const regex_string = searchName
      ?.toLowerCase()
      .split("")
      .reduce((a, b) => `${a}${b}(\\s|\\w+|[\\w-]+|[\\w-]+\\.[\\w-]+)*`, "");
    const regex = new RegExp(regex_string, "g");

    return memberList?.source?.filter((member) =>
      member.member.memberName?.toLowerCase().match(regex)
    );
  }, [memberList?.source, searchName]);

  const handleKeyEvents = (e) => {
    if (isTagging) {
      if (e.key === "Enter" || e.key === "Escape") {
        if (e.key === "Enter") setUserEnterKeyEvent(true);
        e.preventDefault();
        setIsTagging(false);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        setIsTagging(false);
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        if (e.key === "ArrowUp") setUserListIndex((i) => i - 1);
        if (e.key === "ArrowDown") setUserListIndex((i) => i + 1);
        if (userListIndex >= tagDisplayCount) setUserListIndex(0);
        if (userListIndex < 0) setUserListIndex(tagDisplayCount - 1);
      }
    }
  };

  const handleUserEvent = (loginId: string, selectedUserName: string) => {
    handleAddUserName(loginId, searchName, selectedUserName);
  };

  useEffect(() => {
    const regex_isOnTagging = new RegExp(
      /(?<=\s|^)@(\w+|[\w-]+|[\w-]+\.[\w-]+)*(?=[^@|\s]*$)/g
    );
    setIsTagging(!!(value as string).match(regex_isOnTagging));
    const matchedResult = (value as string).match(regex_isOnTagging);
    if (matchedResult && matchedResult[0]) {
      setSearchName(matchedResult[0].slice(1));
      setUserListIndex(0);
    } else {
      setSearchName("");
    }
  }, [value]);

  useEffect(() => {
    setUserListIndex(0);
  }, [searchName.length]);

  useEffect(() => {
    if (isTagging && searchName === "") {
      if (
        textAreaRef.current &&
        containerEl.current &&
        mirroredEle.current &&
        searchName === ""
      ) {
        const cursorPos = textAreaRef.current.selectionStart as number;
        const textBeforeCursor = textAreaRef.current.value.substring(
          0,
          cursorPos
        );
        const textAfterCursor = textAreaRef.current.value.substring(cursorPos);
        const pre = document.createTextNode(textBeforeCursor as string);
        const post = document.createTextNode(textAfterCursor as string);
        const caretEle = document.createElement("span");
        caretEle.innerHTML = "&nbsp;";

        mirroredEle.current.textContent = textAreaRef.current.value;
        mirroredEle.current.classList.add("container__mirror");
        containerEl.current.prepend(mirroredEle.current);

        mirroredEle.current.innerHTML = "";
        mirroredEle.current.append(pre, caretEle, post);

        const rect = caretEle.getBoundingClientRect();
        setCaretCoordinates({ top: rect.top, left: rect.left });
      }
    }
  }, [searchName, isTagging]);

  useEffect(() => {
    const textareaStyles = window.getComputedStyle(
      textAreaRef.current as Element
    );
    [
      "border",
      "boxSizing",
      "fontFamily",
      "fontSize",
      "fontWeight",
      "letterSpacing",
      "lineHeight",
      "padding",
      "textDecoration",
      "textIndent",
      "textTransform",
      "whiteSpace",
      "wordSpacing",
      "wordWrap",
    ].forEach((property) => {
      if (mirroredEle.current)
        mirroredEle.current.style[property] = textareaStyles[property];
    });
    if (mirroredEle.current)
      mirroredEle.current.style.borderColor = "transparent";

    const parseValue = (v) =>
      v.endsWith("px") ? parseInt(v.slice(0, -2), 10) : 0;
    const borderWidth = parseValue(textareaStyles.borderWidth);

    const ro = new ResizeObserver(() => {
      if (textAreaRef.current && mirroredEle.current) {
        mirroredEle.current.style.width = `${
          textAreaRef.current.clientWidth + 2 * borderWidth
        }px`;
        mirroredEle.current.style.height = `${
          textAreaRef.current.clientHeight + 2 * borderWidth
        }px`;
      }
    });
    if (textAreaRef.current) ro.observe(textAreaRef.current);
  }, []);

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
      <TextField
        fullWidth
        multiline
        value={value}
        onKeyDown={handleKeyEvents}
        onClick={() => setIsTagging(false)}
        InputProps={{
          inputProps: {
            ref: textAreaRef,
          },
        }}
        {...others}
      />
      <TaggedUserList
        isOpen={isTagging}
        searchName={searchName}
        displayCount={tagDisplayCount}
        targetedIndex={userListIndex}
        openPosition={caretCoordinates}
        searchedUserList={userListMatched}
        userKeyEvent={enterClicked}
        setUserEnterKeyEvent={setUserEnterKeyEvent}
        handleUserEvent={handleUserEvent}
      />
    </Box>
  );
};

export default MultilineTextFieldTagged;
