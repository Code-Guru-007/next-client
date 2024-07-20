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
import SearchPanel from "components/SearchPanel";
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

import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import { SNACKBAR } from "components/App";

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

import TagAutocomplete from "components/TagAutocomplete";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useOrgArticle from "utils/useOrgArticle";
import useBreadcrumb from "utils/useBreadcrumb";
import { ServiceModuleValue } from "interfaces/utils";
import { OrganizationTag } from "interfaces/entities";
import EditorNavigation from "components/EditorNavigation";
import SearchPanelContext from "components/SearchPanel/SearchPanelContext";
import _FroalaEditor, { ToolbarButtons } from "froala-editor";
import ArticleAndBulletinCustomToolbar from "components/ArticleAndBulletinCustomToolbar/ArticleAndBulletinCustomToolbar";
import { stickyToolbarButtons } from "@eGroupAI/material-module/FroalaEditor/defaultOptions";
import ArticleDetailsPreview from "./ArticleDetailsPreview";

const NewArticle: FC = function () {
  const { query, push } = useRouter();
  const preview = useBoolean();
  const mdUp = useResponsive("up", "md");
  const settings = useSettingsContext();
  const wordLibrary = useSelector(getWordLibrary);
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);
  const [expand, setExpand] = useState<boolean>(false);
  const [match, setMatch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [replaceText, setReplaceText] = useState<string>("");

  const locale = useSelector(getGlobalLocale);
  const organizationId = useSelector(getSelectedOrgId);
  const { data: profile } = useMemberInfo();
  const { data: article } = useOrgArticle(
    {
      organizationId,
      articleId: query.articleId as string,
    },
    {
      locale,
    }
  );

  useBreadcrumb(
    article
      ? `編輯\u00A0${article?.articleTitle ? article?.articleTitle : ""}` || ""
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
    push(`/me/articles`);
  };
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const cancelConform = () => {
    setIsModalVisible(true);
  };

  const closeDialog = () => {
    setIsModalVisible(false);
  };

  const [articleTitle, setArticleTitle] = useState<string>(
    article?.articleTitle || ""
  );

  const [articleTags, setArticleTags] = useState<OrganizationTag[] | undefined>(
    article?.organizationTagTargetList?.map((el) => el.organizationTag || [])
  );

  const [articleContent, setArticleContent] = useState<string | undefined>(
    article?.articleContent || ""
  );

  const [articleContentCopy, setArticleContentCopy] = useState<
    string | undefined
  >(article?.articleContent || "");

  const [isPinned, setIsPinned] = useState<boolean>(Boolean(article?.isPinned));

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

  const [isRelease, setIsRelease] = useState<number>(article?.isRelease ?? 0);
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

  const handleCloseSearchPanel = useCallback(() => {
    setIsSearchOpen(false);
    setTotalMatches(undefined);
    setMatchTextCount(undefined);
    setArticleContent(articleContentCopy);
    setMatch(false);
    setExpand(false);
    setSearchText("");
    setReplaceText("");
  }, [
    articleContentCopy,
    setIsSearchOpen,
    setTotalMatches,
    setMatchTextCount,
    setArticleContent,
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
      const updateArticleContent = content?.replace(
        regex,
        searchTextArray[matchTextCount - 1] || ""
      );
      return updateArticleContent;
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
    const editorContent = articleContentCopy;
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
          setArticleContent(updateContent);
          setTimeout(() => {
            handleScroll(1);
          }, 100);
        } else {
          setMatchTextCount(0);
          setArticleContent(articleContentCopy);
        }
      }
    }
    if (text === "") {
      setTotalMatches(undefined);
      setMatchTextCount(undefined);
      setArticleContent(articleContentCopy);
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
      const editorContent = articleContentCopy;
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
          setArticleContent(updateContent);
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
      const editorContent = articleContentCopy;
      if (editorContent) {
        const matchesArray = editorContent.match(regexp);
        if (matchesArray) {
          let t = 0;
          const updateContent = editorContent.replace(regexp, (match) =>
            ++t === matchTextCount ? replaceText : match
          );
          setArticleContent(updateContent);
          setArticleContentCopy(updateContent);

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
              setArticleContent(replaceContent);
              setTimeout(() => {
                handleScroll(1);
              }, 100);
            } else {
              setMatchTextCount(0);
              setArticleContent(updateContent);
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
      const editorContent = articleContentCopy;
      if (editorContent) {
        const matchesArray = editorContent.match(regexp);
        if (matchesArray) {
          const updateContent = editorContent.replace(regexp, replaceText);
          setArticleContent(updateContent);
          setArticleContentCopy(updateContent);
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
  }, [articleContentCopy]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && (event.key === "f" || event.key === "F")) {
        // CTRL + F
        event.preventDefault();
        setIsSearchOpen(true);
        setArticleContentCopy(articleContent);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [articleContent]);

  useEffect(() => {
    if (article) {
      setArticleTitle(article?.articleTitle ?? "");
      setArticleTags(
        article?.organizationTagTargetList?.map(
          (el) => el.organizationTag || []
        )
      );
      setArticleContent(article?.articleContent ?? "");
      setIsPinned(Boolean(article?.isPinned));
      setIsRelease(article?.isRelease ?? 0);
    }
  }, [article]);

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
  }, [article?.articleTitle, articleTitle]);

  const { excute: createOrgArticle, isLoading: isCreating } =
    useAxiosApiWrapper(apis.org.createOrgArticle, "Create");

  const { excute: updateOrgArticle, isLoading: isUpdating } =
    useAxiosApiWrapper(apis.org.updateOrgArticle, "Update");

  const handleUpdateArticleTitle = (e) => {
    setArticleTitle(e.target.value);
    if (e.target.value !== "") {
      setTitleError(false);
    }
  };

  const handleUpdateArticle = async () => {
    if (articleTitle === "") {
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
    if (articleTitle !== "") {
      setTitleError(false);
      const sanitizedContent = articleContent?.replace(tableCleanRegex, "");
      if (!query.articleId) {
        try {
          await createOrgArticle({
            organizationId,
            organizationTagList: articleTags?.map((tag) => ({
              tagId: tag.tagId,
            })),
            articleTitle,
            articleContent: sanitizedContent,
            isRelease,
            isPinned: isPinned ? 1 : 0,
          })
            .then((res) => {
              push(`/me/articles/${res.data.articleId}`);
            })
            .catch(() => {});
        } catch (error) {
          apis.tools.createLog({
            function: "NewArticle:handleUpdateArticle",
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
          await updateOrgArticle({
            organizationId,
            articleId: query.articleId as string,
            organizationTagList: articleTags?.map((tag) => ({
              tagId: tag.tagId,
            })),
            articleTitle,
            articleContent: sanitizedContent,
            isRelease,
            isPinned: isPinned ? 1 : 0,
          })
            .then((res) => {
              push(`/me/articles/${res.data.articleId}`);
            })
            .catch(() => {});
        } catch (error) {
          apis.tools.createLog({
            function: "NewArticle:handleUpdateArticle",
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
              serviceModuleValue={ServiceModuleValue.ARTICLE}
              onChange={(e, value) => {
                setArticleTags(value);
              }}
              value={articleTags}
            />

            <TextField
              name="articleTitle"
              label={wordLibrary?.title ?? "標題"}
              value={articleTitle}
              onChange={handleUpdateArticleTitle}
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
              {article && profile && (
                <div ref={contentRef}>
                  <RealTimeFroalaEditor
                    filePathType={ServiceModuleValue.ARTICLE}
                    model={articleContent}
                    docId={query.articleId as string}
                    username={profile.memberName}
                    onModelChange={(model) => {
                      setArticleContent(model);
                      if (isSearchOpen) {
                        setArticleContentCopy(saveContent(model));
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
                        wordLibrary?.["edit article content"] ?? "編輯文章內容",
                      quickInsertEnabled: false,
                      imageDefaultMargin: 7,
                      listAdvancedTypes: false,
                    }}
                    setEditor={setEditor}
                  />
                </div>
              )}

              {!article && (
                <div ref={contentRef}>
                  <FroalaEditor
                    filePathType={ServiceModuleValue.ARTICLE}
                    model={articleContent}
                    onModelChange={(model) => {
                      setArticleContent(model);
                      if (isSearchOpen) {
                        setArticleContentCopy(saveContent(model));
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
                        wordLibrary?.["edit article content"] ?? "編輯文章內容",
                      quickInsertEnabled: false,
                      imageDefaultMargin: 7,
                      imageOutputSize: false,
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
              setContentCopy={setArticleContentCopy}
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
                  onChange={(e, checked) => {
                    setIsRelease(Number(checked));
                  }}
                />
              }
              label={
                wordLibrary?.["publish (don't save as draft)"] ??
                "已發布(不儲存為未發布)"
              }
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
          id="btn-froala-editor-save"
          onClick={handleUpdateArticle}
        >
          {!query.articleId
            ? `${wordLibrary?.["add new article"] ?? "新增文章"}`
            : `${wordLibrary?.save ?? "儲存"}`}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <PrivateLayout title="文章討論 | InfoCenter 智能中台">
      <Main>
        <EditorNavigation
          editorRef={contentRef}
          title={articleTitle}
          content={articleContent}
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
          <ArticleDetailsPreview
            title={articleTitle || ""}
            content={articleContent || ""}
            open={preview.value}
            isSubmitting={isUpdating || isCreating}
            onClose={preview.onFalse}
            onSubmit={handleUpdateArticle}
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

export default NewArticle;
