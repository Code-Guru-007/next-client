import React, {
  FC,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import PrivateLayout from "components/PrivateLayout";
import Main from "@eGroupAI/material-layout/Main";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";
import Fab from "@eGroupAI/material/Fab";

import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";

import RealTimeFroalaEditor from "components/RealTimeFroalaEditor";
import { useTheme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";

import { getGlobalLocale } from "components/PrivateLayout/selectors";
import SearchPanel from "components/SearchPanel";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useBulletin from "utils/Bulletin/useBulletin";
import useBreadcrumb from "utils/useBreadcrumb";
import useCtrlS from "utils/useCtrlS";
import { ServiceModuleValue, Table } from "interfaces/utils";
import { OrganizationTag } from "interfaces/entities";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";
import Iconify from "minimal/components/iconify";

import clsx from "clsx";
import { bgBlur } from "minimal/theme/css";
import { useResponsive } from "minimal/hooks/use-responsive";
import moment from "moment-timezone";
import { setArticleBulletinLastUpdateTime } from "redux/articleBulletinLastUpdateTime";
import { useSettingsContext } from "minimal/components/settings";
import TagDrawer from "components/TagDrawer";
import EditSection from "components/EditSection";
import TagAutocompleteWithAction from "components/TagAutocompleteWithAction";
import useOrgTagGroups from "utils/useOrgTagGroups";
import useOrgTagsByGroups from "utils/useOrgTagsByGroups";
import useUserPermission from "@eGroupAI/hooks/apis/useUserPermission";
import EditorNavigation from "components/EditorNavigation";
import {
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import BreadcrumbsLink from "minimal/components/custom-breadcrumbs/link-item";
import FroalaEditor, { ToolbarButtons } from "froala-editor";
import ArticleAndBulletinCustomToolbar from "components/ArticleAndBulletinCustomToolbar/ArticleAndBulletinCustomToolbar";
import { stickyToolbarButtons } from "@eGroupAI/material-module/FroalaEditor/defaultOptions";
import SearchPanelContext from "components/SearchPanel/SearchPanelContext";

const useStyles = makeStyles((theme) => ({
  titleEditorAvatar: {
    minHeight: "75px",
    marginBottom: "10px",
    "& .codox-container": {
      display: "none",
    },
    "& .fr-element.fr-view": {
      "& p": {
        fontSize: "40px !important",
        fontWeight: "700",
        lineHeight: "1.5 !important",
        margin: "0px",
      },
    },
    "& .fr-placeholder": {
      fontSize: "40px !important",
      fontWeight: "700",
      lineHeight: "1.5 !important",
      margin: "0px !important",
    },
    "& .fr-wrapper .fr-placeholder": {
      fontSize: "40px !important",
      fontWeight: "700",
      lineHeight: "1.5 !important",
      color: "#b9b7b1",
      margin: "0px !important",
    },
    "& .show-placeholder .fr-element": {
      fontSize: "2em !important",
    },
  },
  realtimeFroalaEditorParentContainer: {
    "&": {
      padding: "0px 0px 96px",
    },
    "& .codox-container": {
      position: "fixed",
      top: "30px",
      right: "95px",
      zIndex: theme.zIndex.appBar + 2,
    },
    "& .fr-wrapper .fr-placeholder": {
      color: "#b9b7b1",
      marginTop: "0px !important",
    },
    "& tr:first-child": {
      backgroundColor: "#efefef",
      color: "#000",
    },
  },
  updateText: {
    position: "fixed",
    right: "15px",
    bottom: "15px",
    fontSize: "14px",
    color: "#716b61",
    zIndex: theme.zIndex.appBar + 1,
    backgroundColor: "#fff",
    padding: "4px 8px",
    borderRadius: "4px",
    border: "0px solid #716b61",
  },
  right: {
    right: 20,
  },
  left: {
    left: 20,
  },
  tagIcon: {
    position: "fixed",
    bottom: 140,
    zIndex: theme.zIndex.appBar,
  },
  editSectionContainer: {
    borderRadius: 0,
    boxShadow: "none",
    marginBottom: 0,
    borderBottom: "1px solid #EEEEEE",
    zIndex: 1000,
  },
}));

const BulletinEdit: FC = function () {
  const theme = useTheme();
  const classes = useStyles();
  const { query, push } = useRouter();
  const smUp = useResponsive("up", "sm");
  const mdUp = useResponsive("up", "md");
  const locale = useSelector(getGlobalLocale);
  const organizationId = useSelector(getSelectedOrgId);
  const settings = useSettingsContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const rtl = settings.themeDirection === "rtl";
  const [expand, setExpand] = useState<boolean>(false);
  const [match, setMatch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [replaceText, setReplaceText] = useState<string>("");
  const [showFirstLine, setShowFirstLine] = useState(false);
  const [showSecondLine, setShowSecondLine] = useState(false);

  const { data: profile } = useMemberInfo();
  const { data: bulletin, mutate } = useBulletin(
    {
      organizationId,
      bulletinId: query.bulletinId as string,
    },
    {
      locale,
    }
  );
  const { excute: createOrgTargetTags } = useAxiosApiWrapper(
    apis.org.createOrgTargetTags,
    "Create"
  );

  const { excute: deleteOrgTargetTag } = useAxiosApiWrapper(
    apis.org.deleteOrgTargetTag,
    "Delete"
  );

  const { data } = useOrgTagGroups(
    {
      organizationId,
    },
    {
      locale,
      serviceModuleValue: ServiceModuleValue.BULLETIN,
    }
  );
  const { data: permissions } = useUserPermission({
    organizationId,
    serviceModuleValue: "BULLETIN",
    targetId: query.bulletinId as string,
  });

  const tags = useOrgTagsByGroups(data?.source);
  useBreadcrumb(
    bulletin
      ? `編輯\u00A0${bulletin?.bulletinTitle ? bulletin?.bulletinTitle : ""}` ||
          ""
      : ""
  );

  const [bulletinTitle, setBulletinTitle] = useState<string>(
    bulletin?.bulletinTitle || ""
  );

  const wordLibrary = useSelector(getWordLibrary);

  const [styledBulletinTitle, setStyledBulletinTitle] = useState<string>(
    bulletin?.bulletinTitle &&
      bulletin?.bulletinTitle !== (wordLibrary?.untitled ?? "未命名")
      ? `<p>${bulletin?.bulletinTitle}</p>`
      : `<p></p>`
  );

  useEffect(() => {
    if (bulletin?.bulletinTitle) {
      setBulletinTitle(bulletin.bulletinTitle);
      setStyledBulletinTitle(
        bulletin?.bulletinTitle &&
          bulletin?.bulletinTitle !== (wordLibrary?.untitled ?? "未命名")
          ? `<p>${bulletin?.bulletinTitle}</p>`
          : `<p></p>`
      );
    }
  }, [bulletin?.bulletinTitle, wordLibrary]);

  useEffect(() => {
    if (bulletin?.bulletinContent) setBulletinContent(bulletin.bulletinContent);
  }, [bulletin?.bulletinContent]);

  const [bulletinTags, setBulletinTags] = useState<
    OrganizationTag[] | undefined
  >(bulletin?.organizationTagTargetList?.map((el) => el.organizationTag));

  const [bulletinContent, setBulletinContent] = useState<string | undefined>(
    bulletin?.bulletinContent || ""
  );

  const [bulletinContentCopy, setBulletinContentCopy] = useState<
    string | undefined
  >(bulletin?.bulletinContent || "");

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchMatch, setSearchMatch] = useState<boolean>(false);
  const [searchTextArray, setSearchTextArray] = useState<string[]>([]);
  const [totalMatches, setTotalMatches] = useState<number | undefined>(
    undefined
  );
  const [matchTextCount, setMatchTextCount] = useState<number | undefined>(
    undefined
  );

  const [shouldUpdateTitle, setShouldUpdateTitle] = useState<boolean>(false);
  const [isUpdateTime, setIsUpdateTime] = useState<boolean>(false);
  const [shouldUpdateContent, setShouldUpdateContent] =
    useState<boolean>(false);
  const [isOpenTagDrawer, setIsOpenTagDrawer] = useState<boolean>(false);
  const [editor, setEditor] = useState<Partial<FroalaEditor> | undefined>(
    undefined
  );
  const timeoutShouldUpdateTitle = useRef<NodeJS.Timeout>();
  const timeoutShouldUpdateContent = useRef<NodeJS.Timeout>();
  const timeoutToUpdateTitle = useRef<NodeJS.Timeout>();
  const timeoutToUpdateContent = useRef<NodeJS.Timeout>();
  const [lastUpdateTime, setLastUpdateTime] = useState({
    formattedDate: "",
    originalDate: "",
  });
  const translatedTitle = wordLibrary?.["佈告欄"] ?? "佈告欄";
  const dispatch = useDispatch();
  const tableCleanRegex = useMemo(
    () =>
      /<div class="fr-non-editable [\s\S]*?<\/div>|<button class="fr-non-editable [\s\S]*?<\/button>/gi,
    []
  );

  const updateElapsedTime = useCallback(
    (updateDate?: string) => {
      const inputDate = moment(updateDate);
      const secondsDifference = moment().diff(inputDate, "seconds");
      const minutesDifference = moment().diff(inputDate, "minutes");
      const hoursDifference = moment().diff(inputDate, "hours");
      const daysDifference = moment().diff(inputDate, "days");
      let formattedOutput: string;
      const save = wordLibrary?.saved ?? "已儲存";
      if (secondsDifference <= 0)
        formattedOutput = `1 ${wordLibrary?.["second ago"] ?? "秒前"}${save}`;
      else if (secondsDifference < 60)
        formattedOutput = `${secondsDifference} ${
          wordLibrary?.["seconds ago"] ?? "秒前"
        }${save}`;
      else if (minutesDifference === 1)
        formattedOutput = `${minutesDifference} ${
          wordLibrary?.["minute ago"] ?? "分鐘前"
        }${save}`;
      else if (minutesDifference < 60)
        formattedOutput = `${minutesDifference} ${
          wordLibrary?.["minutes ago"] ?? "分鐘前"
        }${save}`;
      else if (hoursDifference === 1)
        formattedOutput = `${hoursDifference} ${
          wordLibrary?.["hour ago"] ?? "小時前"
        }${save}`;
      else if (hoursDifference < 24)
        formattedOutput = `${hoursDifference} ${
          wordLibrary?.["hours ago"] ?? "小時前"
        }${save}`;
      else if (daysDifference === 1)
        formattedOutput = `${daysDifference} ${
          wordLibrary?.["day ago"] ?? "天前"
        }${save}`;
      else
        formattedOutput = `${daysDifference} ${
          wordLibrary?.["days ago"] ?? "天前"
        }${save}`;

      setLastUpdateTime({
        formattedDate: formattedOutput,
        originalDate: updateDate || "",
      });
    },
    [wordLibrary]
  );

  useEffect(() => {
    dispatch(
      setArticleBulletinLastUpdateTime(lastUpdateTime.originalDate || "")
    );
    updateElapsedTime(lastUpdateTime.originalDate);

    return () => {
      dispatch(setArticleBulletinLastUpdateTime(""));
    };
  }, [dispatch, lastUpdateTime.originalDate, updateElapsedTime, isUpdateTime]);

  useEffect(() => {
    dispatch(
      setArticleBulletinLastUpdateTime(
        bulletin?.bulletinUpdateDate || bulletin?.bulletinCreateDate || ""
      )
    );
    updateElapsedTime(
      bulletin?.bulletinUpdateDate || bulletin?.bulletinCreateDate
    );
    return () => {
      dispatch(setArticleBulletinLastUpdateTime(""));
    };
  }, [
    bulletin?.bulletinCreateDate,
    bulletin?.bulletinUpdateDate,
    dispatch,
    updateElapsedTime,
  ]);

  useEffect(() => {
    setBulletinTags(
      bulletin?.organizationTagTargetList?.map((el) => el.organizationTag)
    );
  }, [bulletin]);

  const getPermissionSubModule = (value, permission) => {
    if (!permissions) return false;
    return !!permissions.filter((p) => p.serviceSubModuleValue === value)[0]
      ?.permissionMap[permission];
  };

  const handleOpenTagDrawer = () => {
    setTimeout(() => {
      setIsOpenTagDrawer(true);
    }, 400);
  };

  const handleCloseTagDrawer = () => {
    setIsOpenTagDrawer(false);
  };

  const handleTagAdded = async (payload) => {
    const { organizationTagList } = payload;
    createOrgTargetTags({
      organizationId,
      targetId: bulletin?.bulletinId || "",
      organizationTagList: [...organizationTagList],
    })
      .then(() => {
        mutate();
      })
      .catch(() => {});
  };

  const handleTagDeleted = async (payload) => {
    const { organizationId, tagId } = payload;
    return deleteOrgTargetTag({
      organizationId,
      tagId,
      targetId: bulletin?.bulletinId || "",
    }).then(() => {
      mutate();
    });
  };

  const handleCloseSearchPanel = useCallback(() => {
    setIsSearchOpen(false);
    setTotalMatches(undefined);
    setMatchTextCount(undefined);
    setBulletinContent(bulletinContentCopy);
    setMatch(false);
    setExpand(false);
    setSearchText("");
    setReplaceText("");
  }, [
    bulletinContentCopy,
    setIsSearchOpen,
    setTotalMatches,
    setMatchTextCount,
    setBulletinContent,
    setMatch,
    setExpand,
    setSearchText,
    setReplaceText,
  ]);

  const searchPanelContextValue = useMemo(
    () => ({
      handleCloseSearchPanel,
      match,
      setMatch,
      searchText,
      setSearchText,
      replaceText,
      setReplaceText,
      expand,
      setExpand,
    }),
    [
      handleCloseSearchPanel,
      match,
      setMatch,
      searchText,
      setSearchText,
      replaceText,
      setReplaceText,
      expand,
      setExpand,
    ]
  );

  const saveContent = useCallback(
    (content: string) => {
      if (matchTextCount) {
        const text = searchTextArray[matchTextCount - 1];
        let inputText = "";
        if (text)
          for (let i = 0; i < text.length; i++) inputText += `[${text[i]}]`;
        const regex = new RegExp(
          `<span id="highlight_${matchTextCount}" style="background-color: yellow;">${inputText}</span>`,
          "gi"
        );
        const updateBulletinContent = content?.replace(
          regex,
          searchTextArray[matchTextCount - 1] || ""
        );
        return updateBulletinContent;
      }
      return content;
    },
    [matchTextCount, searchTextArray]
  );

  const handleSearchText = (text: string, match: boolean) => {
    let inputText = "";
    for (let i = 0; i < text.length; i++) inputText += `[${text[i]}]`;
    let regexp;
    if (match) {
      regexp = new RegExp(`(?<!<[^>]*)${inputText}(?<![^>]*<)`, "g");
    } else {
      regexp = new RegExp(`(?<!<[^>]*)${inputText}(?<![^>]*<)`, "gi");
    }
    setSearchValue(text);
    setSearchMatch(match);
    const editorContent = bulletinContentCopy;
    if (editorContent) {
      const matches = [...editorContent.matchAll(regexp)];
      const matchesArray = editorContent.match(regexp);
      setTotalMatches(matches?.length);
      if (matches?.length !== undefined) {
        if (matches?.length > 0 && text !== "" && matchesArray) {
          setSearchTextArray([...matchesArray]);
          let matchCount = 1;
          if (matchTextCount && matchTextCount !== 1) {
            matchCount = matchTextCount;
            if (text !== searchValue) {
              setMatchTextCount(1);
              matchCount = 1;
            }
            if (matchTextCount > matches?.length) {
              setMatchTextCount(matches?.length);
              matchCount = matches?.length;
            }
          } else {
            setMatchTextCount(1);
          }
          let t = 0;
          const updateContent = editorContent.replace(regexp, (match) =>
            ++t === matchCount
              ? `<span id="highlight_${matchCount}" style="background-color: yellow;">${
                  matchesArray[matchCount - 1]
                }</span>`
              : match
          );
          setBulletinContent(updateContent);
          setTimeout(() => {
            handleScroll(matchCount);
          }, 100);
        } else {
          setMatchTextCount(0);
          setBulletinContent(bulletinContentCopy);
        }
      }
    }
    if (text === "") {
      setTotalMatches(undefined);
      setMatchTextCount(undefined);
      setBulletinContent(bulletinContentCopy);
    }
  };

  const handleNextSearchText = (text, next, match) => {
    if (matchTextCount && totalMatches) {
      let matchCount = 1;
      if (next) {
        matchCount = matchTextCount + 1;
        if (matchCount > totalMatches) {
          matchCount = 1;
        }
      } else {
        matchCount = matchTextCount - 1;
        if (matchCount === 0) {
          matchCount = totalMatches;
        }
      }
      setMatchTextCount(matchCount);
      let regexp;
      let inputText = "";
      for (let i = 0; i < text.length; i++) inputText += `[${text[i]}]`;
      if (match) {
        regexp = new RegExp(`(?<!<[^>]*)${inputText}(?<![^>]*<)`, "g");
      } else {
        regexp = new RegExp(`(?<!<[^>]*)${inputText}(?<![^>]*<)`, "gi");
      }
      const editorContent = bulletinContentCopy;
      if (editorContent) {
        const matchesArray = editorContent.match(regexp);
        if (matchesArray) {
          let t = 0;
          const updateContent = editorContent.replace(regexp, (match) =>
            ++t === matchCount
              ? `<span id="highlight_${matchCount}" style="background-color: yellow;">${
                  matchesArray[matchCount - 1]
                }</span>`
              : match
          );
          setBulletinContent(updateContent);
          setTimeout(() => {
            handleScroll(matchCount);
          }, 100);
        }
      }
    }
  };

  const handleReplace = (searchText, replaceText, match) => {
    if (matchTextCount && totalMatches) {
      let regexp;
      let inputText = "";
      for (let i = 0; i < searchText.length; i++)
        inputText += `[${searchText[i]}]`;
      if (match) {
        regexp = new RegExp(`(?<!<[^>]*)${inputText}(?<![^>]*<)`, "g");
      } else {
        regexp = new RegExp(`(?<!<[^>]*)${inputText}(?<![^>]*<)`, "gi");
      }
      const editorContent = bulletinContentCopy;
      if (editorContent) {
        const matchesArray = editorContent.match(regexp);
        if (matchesArray) {
          let t = 0;
          const updateContent = editorContent.replace(regexp, (match) =>
            ++t === matchTextCount ? replaceText : match
          );
          setBulletinContent(updateContent);
          setBulletinContentCopy(updateContent);

          const matches = [...updateContent.matchAll(regexp)];
          setTotalMatches(matches?.length);
        }
      }
    }
  };

  const handleReplaceAll = (searchText, replaceText, match) => {
    if (matchTextCount && totalMatches) {
      let inputText = "";
      for (let i = 0; i < searchText.length; i++)
        inputText += `[${searchText[i]}]`;
      let regexp;
      if (match) {
        regexp = new RegExp(`(?<!<[^>]*)${inputText}(?<![^>]*<)`, "g");
      } else {
        regexp = new RegExp(`(?<!<[^>]*)${inputText}(?<![^>]*<)`, "gi");
      }
      const editorContent = bulletinContentCopy;
      if (editorContent) {
        const matchesArray = editorContent.match(regexp);
        if (matchesArray) {
          const updateContent = editorContent.replace(regexp, replaceText);
          setBulletinContent(updateContent);
          setBulletinContentCopy(updateContent);
          setTotalMatches(0);
          setMatchTextCount(0);
        }
      }
    }
  };

  const handleScroll = (id) => {
    const scrollTop = window.scrollY;
    const el = document.getElementById(`highlight_${id}`);

    let topOffset = 76; // default header height
    const header = document.querySelector("header");
    // Get the height of the header
    if (header) topOffset = header.offsetHeight;
    if (scrollTop !== undefined && el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + scrollTop - topOffset,
        left: 0,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (isSearchOpen && searchValue) {
      handleSearchText(searchValue, searchMatch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulletinContentCopy]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        (event.key === "f" || event.key === "F")
      ) {
        // CTRL + F
        event.preventDefault();
        setIsSearchOpen(true);
        setBulletinContentCopy(bulletinContent);
      }
    };

    const handleMouseDown = (event) => {
      const searchPanel = document.getElementById("kms-search-panel");
      const clickedElement = event.target as HTMLElement;
      const isMoreButton =
        clickedElement.tagName.toLowerCase() === "svg" &&
        clickedElement.getAttribute("data-testid") === "MoreHorizIcon";
      if (
        searchPanel &&
        !searchPanel.contains(clickedElement) &&
        !isMoreButton
      ) {
        handleCloseSearchPanel();
        setBulletinContent(saveContent(bulletinContent || ""));
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [
    bulletinContent,
    saveContent,
    setBulletinContent,
    handleCloseSearchPanel,
  ]);

  const { excute: updateBulletin, isLoading: isUpdating } = useAxiosApiWrapper(
    apis.org.updateBulletin,
    "None"
  );

  const { excute: createTargetHistoryRecord } = useAxiosApiWrapper(
    apis.org.createTargetHistoryRecord,
    "None"
  );

  const handleBeforeUnloadRealTimeEditor = async () => {
    const finalBulletinTitle =
      bulletinTitle
        .trim()
        .split(/<p>|<\/p>|<br\s*\/?>/)
        .join("") || "取個名字";
    const sanitizedContent = bulletinContent?.replace(tableCleanRegex, "");
    updateBulletin({
      organizationId,
      bulletinId: query.bulletinId as string,
      bulletinTitle: finalBulletinTitle,
      bulletinContent: sanitizedContent,
    })
      .then(async () => {
        updateElapsedTime(moment().toISOString());
        await createTargetHistoryRecord({
          organizationId,
          advancedSearchTable: Table.BULLETIN,
          targetId: (query.bulletinId as string) || "",
        });
        push({
          pathname: `/me/bulletins/${query.bulletinId}`,
        });
      })
      .catch(() => {});
  };

  const handleUpdateBulletinTitle = useCallback(
    async (bulletinTitle: string) => {
      try {
        await updateBulletin({
          organizationId,
          bulletinId: query.bulletinId as string,
          bulletinTitle:
            bulletinTitle
              .trim()
              .split(/<p>|<\/p>|<br\s*\/?>/)
              .join("") || "取個名字",
        })
          .then(() => {
            updateElapsedTime(moment().toISOString());
          })
          .catch(() => {});
      } catch (error) {
        apis.tools.createLog({
          function: "BulletinInfo:handleUpdateBulletinTitle",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
    },
    [organizationId, query.bulletinId, updateBulletin, updateElapsedTime]
  );

  useEffect(() => {
    const toolbarEls = document.querySelectorAll(
      ".fr-toolbar.fr-inline"
    ) as unknown as HTMLElement;
    if (toolbarEls && toolbarEls[0]) {
      toolbarEls[1].classList.add("dark-theme");
      toolbarEls[0].style.visibility = "hidden";
    }
    const tableToolbar = Array.from(
      document.getElementsByClassName("fr-popup") as unknown as HTMLElement[]
    ).find((tableToolbar) =>
      tableToolbar.querySelector('[data-cmd="tableCellBackground"]')
    );
    if (tableToolbar) {
      tableToolbar.classList.add("dark-theme");
    }
    clearTimeout(timeoutToUpdateTitle.current);
    if (bulletinTitle !== bulletin?.bulletinTitle && shouldUpdateTitle) {
      timeoutToUpdateTitle.current = setTimeout(() => {
        handleUpdateBulletinTitle(bulletinTitle);
        setShouldUpdateTitle(false);
      }, 500);
    }
  }, [
    shouldUpdateTitle,
    bulletin?.bulletinTitle,
    handleUpdateBulletinTitle,
    bulletinTitle,
  ]);

  const handleUpdateBulletinContent = useCallback(
    async (bulletinContent) => {
      try {
        const sanitizedContent = bulletinContent?.replace(tableCleanRegex, "");
        await updateBulletin({
          organizationId,
          bulletinId: query.bulletinId as string,
          bulletinContent: sanitizedContent,
        })
          .then(() => {
            updateElapsedTime(moment().toISOString());
          })
          .catch(() => {});
      } catch (error) {
        apis.tools.createLog({
          function: "BulletinInfo:handleUpdateBulletinContent",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
    },
    [
      organizationId,
      query.bulletinId,
      updateBulletin,
      updateElapsedTime,
      tableCleanRegex,
    ]
  );

  const handleSaveAndReturn = async () => {
    const finalBulletinTitle =
      bulletinTitle.trim() || (wordLibrary?.untitled ?? "未命名");
    const sanitizedContent = bulletinContent?.replace(tableCleanRegex, "");
    updateBulletin({
      organizationId,
      bulletinId: query.bulletinId as string,
      bulletinTitle: finalBulletinTitle,
      bulletinContent: sanitizedContent,
    })
      .then(async () => {
        await createTargetHistoryRecord({
          organizationId,
          advancedSearchTable: Table.BULLETIN,
          targetId: (query.bulletinId as string) || "",
        });
        push({
          pathname: `/me/bulletins/${query.bulletinId}`,
        });
      })
      .catch(() => {});
  };

  const handleSave = async () => {
    const finalBulletinTitle =
      bulletinTitle.trim() || (wordLibrary?.untitled ?? "未命名");
    const sanitizedContent = bulletinContent?.replace(tableCleanRegex, "");
    await updateBulletin({
      organizationId,
      bulletinId: query.bulletinId as string,
      bulletinTitle: finalBulletinTitle,
      bulletinContent: sanitizedContent,
    });
  };

  const handleShowMessage = () => {
    setShowFirstLine(true);
    setShowSecondLine(false);

    const timer = setTimeout(() => {
      setShowFirstLine(false);
      setShowSecondLine(true);
    }, 5000);
    return () => clearTimeout(timer);
  };

  useCtrlS(() => {
    handleSave();
    handleShowMessage();
  });

  useEffect(() => {
    const toolbarEls = document.querySelectorAll(
      ".fr-toolbar.fr-inline"
    ) as unknown as HTMLElement;
    if (toolbarEls && toolbarEls[1]) {
      toolbarEls[1].style.visibility = "visible";
    }
    clearTimeout(timeoutToUpdateContent.current);
    if (bulletinContent !== bulletin?.bulletinContent && shouldUpdateContent) {
      timeoutToUpdateContent.current = setTimeout(() => {
        handleUpdateBulletinContent(bulletinContent);
        setShouldUpdateContent(false);
      }, 500);
    }
  }, [
    shouldUpdateContent,
    bulletin?.bulletinContent,
    bulletinContent,
    handleUpdateBulletinContent,
  ]);

  const handleBreadcrumbsClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    push("/me/bulletins");
  };

  const renderDetails = (
    <>
      <Grid item xs={12} md={12}>
        <Stack spacing={3} sx={{ p: 3, position: "relative" }}>
          <Stack
            direction="row"
            width="100%"
            sx={{
              position: "fixed",
              padding: "18px 0px 18px 0px",
              top: 0,
              zIndex: theme.zIndex.appBar + 1,
              ...bgBlur({
                color: theme.palette.background.default,
              }),
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Tooltip title={wordLibrary?.["save and return"] ?? "儲存並返回"}>
                <IconButton onClick={handleSaveAndReturn} disabled={isUpdating}>
                  {isUpdating ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Iconify icon="icon-park:left" width={24} />
                  )}
                </IconButton>
              </Tooltip>
              <BreadcrumbsLink
                link={{ href: "/me/bulletins", name: translatedTitle }}
                disabled={false}
                onClick={handleBreadcrumbsClick}
              />
              <Typography variant="body2">{"/"}</Typography>
              <BreadcrumbsLink
                link={{
                  href: `/me/bulletins/${query.bulletinId as string}`,
                  name:
                    bulletinTitle || (wordLibrary?.["取個名字"] ?? "取個名字"),
                }}
                boldText
                disabled={false}
                onClick={handleSaveAndReturn}
              />
            </Stack>
          </Stack>
          <Stack
            sx={{ p: 1 }}
            style={{
              margin: smUp ? "auto" : "none",
              // eslint-disable-next-line no-nested-ternary
              width: mdUp ? "761px" : smUp ? "716px" : "100%",
              maxWidth: "761px",
            }}
          >
            {bulletin && profile && (
              <>
                <div className="bullet-article-title">
                  <RealTimeFroalaEditor
                    id="bulletin-title-editor"
                    data-tid="bulletin-title-editor"
                    itemID="bulletin-title"
                    filePathType={ServiceModuleValue.BULLETIN}
                    model={styledBulletinTitle}
                    docId={`${query.bulletinId as string}-title`}
                    username={profile.memberName}
                    onModelChange={(model) => {
                      setStyledBulletinTitle(model);
                      const tempDiv = document.createElement("div");
                      tempDiv.innerHTML = model;
                      const plainText = tempDiv.innerText;
                      // if starts from empty string extractedText or plainText
                      setBulletinTitle(plainText.trimEnd());
                    }}
                    config={{
                      toolbarInline: true,
                      heightMax: undefined,
                      quickInsertButtons: undefined,
                      quickInsertEnabled: undefined,
                      placeholderText:
                        wordLibrary && wordLibrary["edit bulletin title"]
                          ? wordLibrary["edit bulletin title"]
                          : "取個名字",
                      imageDefaultMargin: 7,
                      imageOutputSize: true,
                      shortcutsEnabled: ["undo", "redo", "copy", "paste"],
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        const contentEditor = document.querySelector(
                          '[itemId="bulletin-content"] .fr-element.fr-view'
                        ) as any; // Cast contentEditor to any
                        if (contentEditor) {
                          contentEditor.focus();
                        }
                        e.preventDefault();
                      }
                    }}
                    onKeyUp={() => {
                      clearTimeout(timeoutShouldUpdateTitle.current);
                      timeoutShouldUpdateTitle.current = setTimeout(() => {
                        setShouldUpdateTitle(true);
                      }, 500);
                    }}
                    onKeyDown={(e) => {
                      if (
                        (e.ctrlKey || e.metaKey) &&
                        ["b", "u", "i"].includes(e.key.toLowerCase())
                      ) {
                        e.preventDefault();
                      }
                    }}
                    className={clsx(classes.titleEditorAvatar)}
                  />
                </div>
                <div ref={contentRef} style={{ padding: "0px 0px 304px" }}>
                  <RealTimeFroalaEditor
                    id="bulletin-content-editor"
                    data-tid="bulletin-content-editor"
                    itemID="bulletin-content"
                    filePathType={ServiceModuleValue.BULLETIN}
                    model={bulletinContent}
                    docId={query.bulletinId as string}
                    username={profile.memberName}
                    onModelChange={(model) => {
                      setBulletinContent(model);
                      if (isSearchOpen) {
                        setBulletinContentCopy(saveContent(model));
                      }
                    }}
                    triggerSaveContentManually={() => {
                      setShouldUpdateContent(true);
                    }}
                    config={{
                      toolbarButtons:
                        stickyToolbarButtons as unknown as Partial<ToolbarButtons>,
                      toolbarButtonsMD:
                        stickyToolbarButtons as unknown as Partial<ToolbarButtons>,
                      toolbarButtonsSM:
                        stickyToolbarButtons as unknown as Partial<ToolbarButtons>,
                      toolbarButtonsXS:
                        stickyToolbarButtons as unknown as Partial<ToolbarButtons>,
                      imageEditButtons: [
                        "imageAlignLeft",
                        "imageAlignCenter",
                        "imageAlignRight",
                        "|",
                        "imageReplaceNew",
                      ],
                      tableEditButtons: [
                        "tableCellBackground",
                        "tableRemoveCell",
                      ],
                      videoEditButtons: [],
                      linkEditButtons: [],
                      toolbarInline: true,
                      heightMin: undefined,
                      heightMax: undefined,
                      placeholderText: wordLibrary
                        ? wordLibrary["edit bulletin content"]
                        : "開始揮灑您的創意",
                      quickInsertEnabled: false,
                      imageOutputSize: false,
                      imageDefaultMargin: 7,
                      listAdvancedTypes: false,
                    }}
                    onKeyUp={() => {
                      clearTimeout(timeoutShouldUpdateContent.current);
                      timeoutShouldUpdateContent.current = setTimeout(() => {
                        setShouldUpdateContent(true);
                      }, 500);
                    }}
                    onClick={() => {
                      setIsUpdateTime((pre) => !pre);
                    }}
                    onKeyDown={(e) => {
                      const isAppleDevice = /Mac|iPod|iPhone|iPad/i.test(
                        navigator.userAgent
                      );
                      const check = isAppleDevice
                        ? e.metaKey && e.altKey
                        : e.ctrlKey && e.altKey;
                      if (check) {
                        switch (e.code) {
                          case "Digit1":
                            e.preventDefault();
                            editor?.paragraphFormat?.apply("h1");
                            break;
                          case "Digit2":
                            e.preventDefault();
                            editor?.paragraphFormat?.apply("h2");
                            break;
                          case "Digit3":
                            e.preventDefault();
                            editor?.paragraphFormat?.apply("p");
                            break;
                          default:
                            break;
                        }
                      }
                    }}
                    className={clsx(
                      classes.realtimeFroalaEditorParentContainer
                    )}
                    onBeforeUnload={handleBeforeUnloadRealTimeEditor}
                    setEditor={setEditor}
                  />
                </div>
              </>
            )}
          </Stack>
        </Stack>
      </Grid>
      <ArticleAndBulletinCustomToolbar
        editor={editor}
        isSearchOpen={isSearchOpen}
        saveContent={saveContent}
        setContentCopy={setBulletinContentCopy}
      />
      <div>
        {showFirstLine && (
          <div className={classes.updateText}>
            {wordLibrary?.[
              "don't worry InfoCenter will automatically save all your changes"
            ] ?? "別擔心！InfoCenter 會自動儲存您的所有變更。"}
          </div>
        )}
        {showSecondLine && (
          <div className={classes.updateText}>
            {lastUpdateTime.formattedDate}
          </div>
        )}
      </div>
      <TagDrawer isOpen={isOpenTagDrawer} onClickAway={handleCloseTagDrawer}>
        <EditSection className={classes.editSectionContainer}>
          {bulletin && (
            <TagAutocompleteWithAction
              targetId={bulletin.creator.loginId}
              writable={getPermissionSubModule("BULLETIN_INFO", "WRITE")}
              deletable={getPermissionSubModule("BULLETIN_INFO", "DELETE")}
              selectedTags={bulletinTags || []}
              options={tags || []}
              onAddTag={handleTagAdded}
              onRemoveTag={handleTagDeleted}
              isToolbar
            />
          )}
        </EditSection>
      </TagDrawer>
      <Fab
        color="primary"
        className={clsx(classes.tagIcon, {
          [classes.left]: rtl,
          [classes.right]: !rtl,
        })}
        onClick={handleOpenTagDrawer}
      >
        <Iconify icon={"mdi:tag"} />
      </Fab>
    </>
  );

  const layoutBulletinTitle =
    bulletinTitle
      .trim()
      .split(/<p>|<\/p>|<br\s*\/?>/)
      .join("") || "取個名字";

  return (
    <PrivateLayout
      title={`${layoutBulletinTitle} | 文章討論 | InfoCenter 智能中台`}
      hideHeader
      hideBreadcrumbs
      paddingAdditional={44}
    >
      <Main>
        {mdUp && (
          <EditorNavigation
            editorRef={contentRef}
            title={bulletinTitle}
            content={bulletinContent}
          />
        )}
        <Container maxWidth={false}>
          <Grid container spacing={0}>
            {renderDetails}
          </Grid>
        </Container>
      </Main>
      <SearchPanelContext.Provider value={searchPanelContextValue}>
        <SearchPanel
          isOpen={isSearchOpen}
          matches={totalMatches}
          matchCount={matchTextCount}
          handleSearch={handleSearchText}
          nextSearch={handleNextSearchText}
          handleReplace={handleReplace}
          handleReplaceAll={handleReplaceAll}
        />
      </SearchPanelContext.Provider>
    </PrivateLayout>
  );
};

export default BulletinEdit;
