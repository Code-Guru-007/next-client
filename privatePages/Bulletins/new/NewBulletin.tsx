/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, {
  FC,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import PrivateLayout from "components/PrivateLayout";
import Main from "@eGroupAI/material-layout/Main";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import LoadingButton from "@mui/lab/LoadingButton";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import { useResponsive } from "minimal/hooks/use-responsive";
import { useBoolean } from "minimal/hooks/use-boolean";
import { useSettingsContext } from "minimal/components/settings";

import DialogContent from "@eGroupAI/material/DialogContent";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import RealTimeFroalaEditor from "components/RealTimeFroalaEditor";
import FroalaEditor from "components/FroalaEditor";
import { useTheme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import Dialog from "@eGroupAI/material/Dialog";
import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";

import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import { SNACKBAR } from "components/App";

import TagAutocomplete from "components/TagAutocomplete";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import SearchPanel from "components/SearchPanel";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useBulletin from "utils/Bulletin/useBulletin";
import useBreadcrumb from "utils/useBreadcrumb";
import { ServiceModuleValue } from "interfaces/utils";
import { OrganizationTag } from "interfaces/entities";
import EditorNavigation from "components/EditorNavigation";
import SearchPanelContext from "components/SearchPanel/SearchPanelContext";
import _FroalaEditor, { ToolbarButtons } from "froala-editor";
import ArticleAndBulletinCustomToolbar from "components/ArticleAndBulletinCustomToolbar/ArticleAndBulletinCustomToolbar";
import { stickyToolbarButtons } from "@eGroupAI/material-module/FroalaEditor/defaultOptions";
import BulletinDetailsPreview from "./BulletinDetailsPreview";

const NewBulletin: FC = function () {
  const { query, push } = useRouter();
  const preview = useBoolean();
  const mdUp = useResponsive("up", "md");
  const settings = useSettingsContext();
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);
  const [expand, setExpand] = useState<boolean>(false);
  const [match, setMatch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [replaceText, setReplaceText] = useState<string>("");

  const locale = useSelector(getGlobalLocale);
  const organizationId = useSelector(getSelectedOrgId);
  const { data: profile } = useMemberInfo();
  const { data: bulletin } = useBulletin(
    {
      organizationId,
      bulletinId: query.bulletinId as string,
    },
    {
      locale,
    }
  );

  useBreadcrumb(
    bulletin
      ? `編輯\u00A0${bulletin?.bulletinTitle ? bulletin?.bulletinTitle : ""}` ||
          ""
      : ""
  );

  const useStyles = makeStyles(() => ({
    dialogPaper: {
      "& .MuiDialog-paper": {
        borderRadius: 16,
      },
    },
  }));
  const theme = useTheme();
  const classes = useStyles();
  const handleConfirm = async (e) => {
    e.preventDefault();
    push(`/me/bulletins`);
  };
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const cancelConform = () => {
    setIsModalVisible(true);
  };

  const closeDialog = () => {
    setIsModalVisible(false);
  };

  const [bulletinTitle, setBulletinTitle] = useState<string>(
    bulletin?.bulletinTitle || ""
  );

  const [bulletinTags, setBulletinTags] = useState<
    OrganizationTag[] | undefined
  >(bulletin?.organizationTagTargetList?.map((el) => el.organizationTag || []));

  const [bulletinContent, setBulletinContent] = useState<string | undefined>(
    bulletin?.bulletinContent || ""
  );

  const [bulletinContentCopy, setBulletinContentCopy] = useState<
    string | undefined
  >(bulletin?.bulletinContent || "");

  const [isPinned, setIsPinned] = useState<boolean>(
    Boolean(bulletin?.isPinned)
  );

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

  const [isRelease, setIsRelease] = useState<number>(bulletin?.isRelease || 0);
  const [editor, setEditor] = useState<Partial<_FroalaEditor> | undefined>(
    undefined
  );
  const [titleError, setTitleError] = useState<boolean>(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tableCleanRegex = useMemo(
    () =>
      /<div class="fr-non-editable [\s\S]*?<\/div>|<button class="fr-non-editable [\s\S]*?<\/button>/gi,
    []
  );

  const { excute: createBulletin, isLoading: isCreating } = useAxiosApiWrapper(
    apis.org.createBulletin,
    "Create"
  );
  const wordLibrary = useSelector(getWordLibrary);

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

  const saveContent = (content: string) => {
    if (matchTextCount) {
      const regex = new RegExp(
        `<span id="highlight_${matchTextCount}" style="background-color: yellow;">${
          searchTextArray[matchTextCount - 1]
        }</span>`,
        "gi"
      );
      const updateBulletinContent = content?.replace(
        regex,
        searchTextArray[matchTextCount - 1] || ""
      );
      return updateBulletinContent;
    }
    return content;
  };

  const handleSearchText = (text: string, match: boolean) => {
    let regexp;
    if (match) {
      regexp = new RegExp(`(?<!<[^>]*)${text}(?<![^>]*<)`, "g");
    } else {
      regexp = new RegExp(`(?<!<[^>]*)${text}(?<![^>]*<)`, "gi");
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
            handleScroll(1);
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
      if (match) {
        regexp = new RegExp(`(?<!<[^>]*)${text}(?<![^>]*<)`, "g");
      } else {
        regexp = new RegExp(`(?<!<[^>]*)${text}(?<![^>]*<)`, "gi");
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
      if (match) {
        regexp = new RegExp(`(?<!<[^>]*)${searchText}(?<![^>]*<)`, "g");
      } else {
        regexp = new RegExp(`(?<!<[^>]*)${searchText}(?<![^>]*<)`, "gi");
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
          const matchesArray = updateContent.match(regexp);
          setTotalMatches(matches?.length);
          if (matches?.length !== undefined) {
            if (matches?.length > 0 && searchText !== "" && matchesArray) {
              setMatchTextCount(1);
              let t = 0;
              const replaceContent = updateContent.replace(regexp, (match) =>
                ++t === 1
                  ? `<span id="highlight_${1}" style="background-color: yellow;">${
                      matchesArray[0]
                    }</span>`
                  : match
              );
              setBulletinContent(replaceContent);
              setTimeout(() => {
                handleScroll(1);
              }, 100);
            } else {
              setMatchTextCount(0);
              setBulletinContent(updateContent);
            }
          }
        }
      }
    }
  };

  const handleReplaceAll = (searchText, replaceText, match) => {
    if (matchTextCount && totalMatches) {
      let regexp;
      if (match) {
        regexp = new RegExp(`(?<!<[^>]*)${searchText}(?<![^>]*<)`, "g");
      } else {
        regexp = new RegExp(`(?<!<[^>]*)${searchText}(?<![^>]*<)`, "gi");
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
    if (document.getElementById(`highlight_${id}`)) {
      window.scrollTo({
        top: 300,
      });
      const wrapperTop =
        document.getElementsByClassName("fr-wrapper")[0]?.scrollTop;
      const selectedTop = document
        .getElementById(`highlight_${id}`)
        ?.getBoundingClientRect().top;
      if (selectedTop !== undefined && wrapperTop !== undefined) {
        document.getElementsByClassName("fr-wrapper")[0]?.scrollTo({
          top: selectedTop + wrapperTop - 295,
          left: 0,
          behavior: "smooth",
        });
      }
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
      if (event.ctrlKey && (event.key === "f" || event.key === "F")) {
        // CTRL + F
        event.preventDefault();
        setIsSearchOpen(true);
        setBulletinContentCopy(bulletinContent);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [bulletinContent]);

  console.log("bulletin", bulletin);

  useEffect(() => {
    if (bulletin) {
      setBulletinTitle(bulletin.bulletinTitle ?? "");
      setBulletinTags(
        bulletin.organizationTagTargetList?.map(
          (el) => el.organizationTag || []
        )
      );
      setBulletinContent(bulletin.bulletinContent ?? "");
      setIsPinned(Boolean(bulletin?.isPinned));
      setIsRelease(bulletin?.isRelease ?? 0);
    }
  }, [bulletin]);

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
  }, [bulletin?.bulletinTitle, bulletinTitle]);

  const { excute: updateBulletin, isLoading: isUpdating } = useAxiosApiWrapper(
    apis.org.updateBulletin,
    "Update"
  );

  const handleUpdateBulletinTitle = (e) => {
    setBulletinTitle(e.target.value);
    if (e.target.value !== "") {
      setTitleError(false);
    }
  };

  const handleUpdateBulletin = async () => {
    if (bulletinTitle === "") {
      setTitleError(true);
      if (titleInputRef.current) {
        titleInputRef.current.focus();
        titleInputRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        openSnackbar({
          message: "必填欄位尚未填寫",
          severity: "error",
          transitionDuration: { exit: 500 },
          autoHideDuration: 2000,
        });
      }
    }
    if (bulletinTitle !== "") {
      setTitleError(false);
      const sanitizedContent = bulletinContent?.replace(tableCleanRegex, "");
      if (!query.bulletinId) {
        try {
          await createBulletin({
            organizationId,
            organizationTagList: bulletinTags?.map((tag) => ({
              tagId: tag.tagId,
            })),
            bulletinTitle,
            bulletinContent: sanitizedContent,
            isRelease,
            isPinned: isPinned ? 1 : 0,
          })
            .then((res) => {
              push(`/me/bulletins/${res.data.bulletinId}`);
            })
            .catch(() => {});
        } catch (error) {
          apis.tools.createLog({
            function: "NewBulletin:handleUpdateBulletin",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: error,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
          });
        }
      } else {
        try {
          await updateBulletin({
            organizationId,
            bulletinId: query.bulletinId as string,
            organizationTagList: bulletinTags?.map((tag) => ({
              tagId: tag.tagId,
            })),
            bulletinTitle,
            bulletinContent: sanitizedContent,
            isRelease,
            isPinned: isPinned ? 1 : 0,
          })
            .then((res) => {
              push(`/me/bulletins/${res.data.bulletinId}`);
            })
            .catch(() => {});
        } catch (error) {
          apis.tools.createLog({
            function: "NewBulletin:handleUpdateBulletin",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: error,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
          });
        }
      }
    }
  };

  const renderDetails = (
    <>
      <Grid item xs={12} md={12}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <TagAutocomplete
              serviceModuleValue={ServiceModuleValue.BULLETIN}
              onChange={(e, value) => {
                setBulletinTags(value);
              }}
              value={bulletinTags}
            />

            <TextField
              name="bulletinTitle"
              label={wordLibrary?.title ?? "標題"}
              value={bulletinTitle}
              onChange={handleUpdateBulletinTitle}
              required
              error={titleError}
              helperText={titleError ? "This is required field" : ""}
              InputProps={{
                inputRef: titleInputRef,
              }}
            />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">
                {wordLibrary?.content ?? "內容"}
              </Typography>
              {bulletin && profile && (
                <div ref={contentRef}>
                  <RealTimeFroalaEditor
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
                      heightMin: undefined,
                      heightMax: undefined,
                      toolbarInline: true,
                      placeholderText:
                        wordLibrary?.["edit bulletin board content"] ??
                        "編輯佈告欄內容",
                      quickInsertEnabled: false,
                      imageOutputSize: false,
                      imageDefaultMargin: 7,
                      listAdvancedTypes: false,
                    }}
                    setEditor={setEditor}
                  />
                </div>
              )}

              {!bulletin && (
                <div ref={contentRef}>
                  <FroalaEditor
                    filePathType={ServiceModuleValue.BULLETIN}
                    model={bulletinContent}
                    onModelChange={(model) => {
                      setBulletinContent(model);
                      if (isSearchOpen) {
                        setBulletinContentCopy(saveContent(model));
                      }
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
                      heightMin: undefined,
                      heightMax: undefined,
                      toolbarInline: true,
                      placeholderText:
                        wordLibrary?.["edit bulletin board content"] ??
                        "編輯佈告欄內容",
                      quickInsertEnabled: false,
                      imageOutputSize: false,
                      imageDefaultMargin: 7,
                      listAdvancedTypes: false,
                    }}
                    setEditor={setEditor}
                  />
                </div>
              )}
            </Stack>
            <ArticleAndBulletinCustomToolbar
              editor={editor}
              isSearchOpen={isSearchOpen}
              saveContent={saveContent}
              setContentCopy={setBulletinContentCopy}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(isPinned)}
                  onChange={(e, checked) => {
                    setIsPinned(checked);
                  }}
                  disabled={isUpdating}
                />
              }
              label={wordLibrary?.["pin to top"] ?? "釘選置頂"}
              sx={{ flexGrow: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(isRelease)}
                  onChange={(_, checked) => {
                    setIsRelease(Number(checked));
                  }}
                />
              }
              label={wordLibrary?.published ?? "已發布"}
              sx={{ flexGrow: 1 }}
            />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      <Grid
        item
        xs={12}
        md={12}
        sx={{ display: "flex" }}
        justifyContent="flex-end"
        alignItems="flex-end"
      >
        <Button
          color="inherit"
          variant="outlined"
          size="large"
          onClick={() => cancelConform()}
        >
          取消
        </Button>
        <Button
          color="inherit"
          variant="outlined"
          size="large"
          sx={{ ml: 2 }}
          onClick={preview.onTrue}
        >
          {wordLibrary?.preview ?? "預覽"}
        </Button>

        <LoadingButton
          variant="contained"
          size="large"
          loading={isUpdating || isCreating}
          sx={{ ml: 2 }}
          onClick={handleUpdateBulletin}
          id="btn-froala-editor-save"
        >
          {!query.bulletinId
            ? `${wordLibrary?.["new announcement"] ?? "新公告"}`
            : `${wordLibrary?.save ?? "儲存"}`}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <PrivateLayout title="佈告欄 | InfoCenter 智能中台">
      <Main>
        <EditorNavigation
          editorRef={contentRef}
          title={bulletinTitle}
          content={bulletinContent}
        />
        <Container maxWidth={settings.themeStretch ? false : "lg"}>
          <Grid container spacing={3}>
            {renderDetails}
            {renderActions}
          </Grid>
          <Dialog
            open={isModalVisible}
            onClose={closeDialog}
            maxWidth="md"
            fullWidth
            className={classes.dialogPaper}
            transitionDuration={{
              enter: theme.transitions.duration.shortest,
              exit: theme.transitions.duration.shortest - 80,
            }}
          >
            <DialogTitle onClickClose={closeDialog}>
              {wordLibrary?.confirm ?? "確認"}
            </DialogTitle>
            <form onSubmit={handleConfirm}>
              <DialogContent sx={{ paddingTop: "10px" }}>
                <Grid item xs={12}>
                  {"您確定要取消新增文章嗎？"}
                </Grid>
              </DialogContent>
              <DialogActions>
                <DialogCloseButton onClick={closeDialog} />
                <DialogConfirmButton type="submit">
                  {wordLibrary?.sure ?? "確定"}
                </DialogConfirmButton>
              </DialogActions>
            </form>
          </Dialog>
          <BulletinDetailsPreview
            title={bulletinTitle || ""}
            content={bulletinContent || ""}
            open={preview.value}
            isSubmitting={isUpdating || isCreating}
            onClose={preview.onFalse}
            onSubmit={handleUpdateBulletin}
          />
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

export default NewBulletin;
