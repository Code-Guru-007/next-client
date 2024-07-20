import React, { FC, useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useRouter } from "next/router";

import clsx from "clsx";
import { makeStyles } from "@mui/styles";
import ListRoundedIcon from "@mui/icons-material/ListRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import Fab from "@eGroupAI/material/Fab";
import { Table } from "interfaces/utils";

import FroalaEditorView from "components/FroalaEditorView";
import { useSettingsContext } from "minimal/components/settings";

import { getGlobalLocale } from "components/PrivateLayout/selectors";
import TagDrawer from "components/TagDrawer";
import EditSection from "components/EditSection";
import TagAutocompleteWithAction from "components/TagAutocompleteWithAction";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";

import Iconify from "minimal/components/iconify";
import { useResponsive } from "minimal/hooks/use-responsive";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useOrgArticle from "utils/useOrgArticle";
import TargetHistoryRecordDialog, {
  DIALOG as HISTORY_RECORD_DIALOG,
  RecordTarget,
} from "components/TargetHistoryRecordDialog";
import { TabDataItem } from "components/ResponsiveTabs";

import useTargetComments from "utils/useTargetComments";
import TargetCommentForm from "components/TargetComment/TargetCommentForm";
import TargetCommentList from "components/TargetComment/TargetCommentList";

import ArticleReadsDialog, {
  DIALOG as READS_DIALOG,
} from "./ArticleReadsDialog";

import ArticleContentDrawer from "./ArticleContentDrawer";
import ArticleDetailsToolbar, {
  ArticleDetailsToolbarExposeRef,
} from "./ArticleDetailsToolbar";

const useStyles = makeStyles(() => ({
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "none",
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 999,
  },
  showLoader: {
    display: "flex",
  },
  lightOpacity: {
    background: "rgba(255,255,255,0.6)",
  },
  darkOpacity: {
    background: "rgba(33, 43, 54, 0.6)",
  },
  smsIcon: {
    position: "fixed",
    bottom: 90,
  },
  tagIcon: {
    position: "fixed",
    bottom: 230,
  },
  editSectionContainer: {
    borderRadius: 0,
    boxShadow: "none",
    marginBottom: 0,
    borderBottom: "1px solid #EEEEEE",
    zIndex: 1000,
  },
  articleIcon: {
    position: "fixed",
    bottom: 160,
  },
  right: {
    right: 20,
  },
  left: {
    left: 20,
  },
}));

export interface ArticleInfoProps {
  articleId: string;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
  tabValue?: string;
  tabData?: TabDataItem[];
}

const ArticleInfo: FC<ArticleInfoProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const POST_PUBLISH_OPTIONS = [
    {
      value: 1,
      label: wordLibrary?.published ?? "已發布",
    },
    {
      value: 0,
      label: wordLibrary?.draft ?? "未發布",
    },
  ];
  const {
    articleId,
    readable = false,
    writable = false,
    deletable = false,
    tabValue,
    tabData,
  } = props;

  const { push } = useRouter();
  const userRedirectUrl = window.localStorage.getItem("userRedirectUrl");
  const smUp = useResponsive("up", "sm");
  const mdUp = useResponsive("up", "md");

  if (userRedirectUrl) {
    window.localStorage.removeItem("userRedirectUrl");
    if (userRedirectUrl !== "/me/articles") push({ pathname: userRedirectUrl });
  }

  const classes = useStyles();
  const locale = useSelector(getGlobalLocale);
  const organizationId = useSelector(getSelectedOrgId);
  const contentRef = useRef<HTMLDivElement>(null);
  const settings = useSettingsContext();
  const rtl = settings.themeDirection === "rtl";
  const { data: comments, mutate: commentsMutate } = useTargetComments({
    organizationId,
    targetTable: Table.ARTICLES,
    targetId: articleId,
  });
  const {
    data: article,
    mutate,
    isValidating,
  } = useOrgArticle(
    {
      organizationId,
      articleId,
    },
    {
      locale,
    }
  );

  const [isOpenContentDrawer, setIsOpenContentDrawer] =
    useState<boolean>(false);
  const [isOpenTagDrawer, setIsOpenTagDrawer] = useState<boolean>(false);
  const articleDetailToolbarRef = useRef<ArticleDetailsToolbarExposeRef>(null);

  const { openDialog: openHistoryDialog } = useReduxDialog(
    `${Table.ARTICLES}-${HISTORY_RECORD_DIALOG}`
  );
  const { openDialog: openReadsDialog } = useReduxDialog(READS_DIALOG);
  const [recordTarget, setRecordTarget] = useState<RecordTarget>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { excute: updateOrgArticle, isLoading } = useAxiosApiWrapper(
    apis.org.updateOrgArticle,
    "Update"
  );

  const handleHistoryClick = (r?: RecordTarget) => {
    if (r) {
      setRecordTarget(r);
      setIsDialogOpen(true);
    }
  };
  useEffect(() => {
    if (isDialogOpen) openHistoryDialog();
  }, [isDialogOpen, openHistoryDialog]);
  const handleUpdateArticlePublish = async (value) => {
    if (article) {
      try {
        await updateOrgArticle({
          organizationId,
          articleId: article?.articleId,
          isRelease: value,
        });
        if (mutate) {
          mutate();
        }
      } catch (error) {
        apis.tools.createLog({
          function: "ArticleInfo: handleUpdateArticlePublish",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
    }
  };

  const handleUpdateArticlePinned = async (value) => {
    if (article) {
      try {
        await updateOrgArticle({
          organizationId,
          articleId: article?.articleId,
          isPinned: value,
        });
        if (mutate) {
          mutate();
        }
      } catch (error) {
        apis.tools.createLog({
          function: "ArticleInfo: handleUpdateArticlePinned",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
    }
  };

  const handleScrollTo = () => {
    const el = document.getElementById("article_comment");
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 64;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleToggleCommentDrawer = () => {
    handleScrollTo();
  };

  const handleToggleContentDrawer = () => {
    setIsOpenContentDrawer(!isOpenContentDrawer);
  };

  const handleOpenTagDrawer = () => {
    setTimeout(() => {
      setIsOpenTagDrawer(true);
    }, 400);
  };
  const handleCloseTagDrawer = () => {
    setIsOpenTagDrawer(false);
  };

  const getWidth = () => {
    if (mdUp) return "745px";
    if (smUp) return "745px";
    return "100%";
  };

  const renderArticle = article && (
    <>
      <ArticleDetailsToolbar
        ref={articleDetailToolbarRef}
        permissions={{ readable, writable, deletable }}
        article={article}
        editLink={`/me/articles/${articleId}/edit`}
        publish={article.isRelease}
        onChangePublish={handleUpdateArticlePublish}
        onChangePinned={handleUpdateArticlePinned}
        openReadsDialog={openReadsDialog}
        handleClickHistory={handleHistoryClick}
        publishOptions={POST_PUBLISH_OPTIONS}
        isLoading={isLoading}
        onTagMutate={mutate}
      />

      <Stack
        sx={{
          mx: "auto",
          mt: { xs: 2, md: 4 },
        }}
      >
        <Grid>
          <Typography
            sx={{
              textAlign: "left",
              fontSize: "40px",
              fontWeight: "bold",
              margin: "auto",
              width: { xs: "100%", sm: "745px" },
              maxWidth: "745px",
              marginBottom: "32px",
              wordWrap: "break-word",
            }}
          >
            {article?.articleTitle}
          </Typography>
        </Grid>
        <Grid
          ref={contentRef}
          className="froala-editor-view-text-indent"
          style={{
            margin: smUp ? "auto" : "none",
            width: getWidth(),
            maxWidth: "745px",
          }}
        >
          <FroalaEditorView model={article?.articleContent} />
        </Grid>

        <Stack direction="row" sx={{ mb: 3, mt: 5 }}>
          <Typography variant="h4" id="article_comment">
            {wordLibrary?.["response section"] ?? "回應區"}
          </Typography>

          <Typography variant="subtitle2" sx={{ color: "text.disabled" }}>
            ({comments?.source.length})
          </Typography>
        </Stack>

        <TargetCommentForm
          organizationId={organizationId}
          targetTable={Table.ARTICLES}
          targetId={articleId}
          commentsMutate={commentsMutate}
        />
        <Divider sx={{ mt: 5, mb: 2 }} />

        <TargetCommentList
          organizationId={organizationId}
          targetTable={Table.ARTICLES}
          comments={comments?.source || []}
          commentsMutate={commentsMutate}
        />
      </Stack>
    </>
  );

  return (
    <>
      <ArticleReadsDialog
        articleId={articleId}
        organizationId={organizationId}
      />
      <Container maxWidth={false}>
        <div
          className={clsx(classes.loader, isValidating && classes.showLoader, {
            [classes.lightOpacity]: settings.themeMode === "light",
            [classes.darkOpacity]: settings.themeMode !== "light",
          })}
        >
          <CircularProgress />
        </div>
        {renderArticle}
      </Container>
      {article && isDialogOpen && (
        <TargetHistoryRecordDialog
          targetTitle={article.articleTitle || ""}
          targetContent={article.articleContent || ""}
          targetIsRelease={article.isRelease || 0}
          targetId={article.articleId}
          recordTarget={recordTarget}
          advancedSearchTable={Table.ARTICLES}
          onUpdate={() => {
            mutate();
          }}
          onHandleClose={() => {
            setIsDialogOpen(false);
          }}
        />
      )}
      <TagDrawer isOpen={isOpenTagDrawer} onClickAway={handleCloseTagDrawer}>
        <EditSection className={classes.editSectionContainer}>
          {article && articleDetailToolbarRef.current && (
            <TagAutocompleteWithAction
              targetId={article.creator.loginId}
              writable={writable}
              deletable={deletable}
              selectedTags={
                article.organizationTagTargetList?.map(
                  (el) => el.organizationTag
                ) || []
              }
              options={articleDetailToolbarRef.current.options || []}
              onAddTag={articleDetailToolbarRef.current.onAddTag}
              onRemoveTag={articleDetailToolbarRef.current.onRemoveTag}
              isToolbar
              isTagCreating={articleDetailToolbarRef.current.isTagCreating}
              isTagDeleting={articleDetailToolbarRef.current.isTagDeleting}
              isLoading={
                articleDetailToolbarRef.current.isTagCreating ||
                articleDetailToolbarRef.current.isTagDeleting ||
                articleDetailToolbarRef.current.isLoadingTagGroup ||
                isValidating
              }
            />
          )}
        </EditSection>
      </TagDrawer>
      <ArticleContentDrawer
        isOpen={isOpenContentDrawer}
        onClickAway={handleToggleContentDrawer}
        contentRef={contentRef}
        tabValue={tabValue}
        tabData={tabData}
      />
      <Fab
        color="primary"
        className={clsx(classes.tagIcon, {
          [classes.left]: rtl,
          [classes.right]: !rtl,
        })}
        onClick={handleOpenTagDrawer}
        id="article-tag-drawer-btn"
        data-tid="article-tag-drawer-btn"
      >
        <Iconify icon={"mdi:tag"} />
      </Fab>
      <Fab
        color="primary"
        onClick={handleToggleCommentDrawer}
        className={clsx(classes.smsIcon, {
          [classes.left]: rtl,
          [classes.right]: !rtl,
        })}
        id="article-comment-drawer-btn"
        data-tid="article-comment-drawer-btn"
      >
        <SmsRoundedIcon />
      </Fab>
      <Fab
        color="primary"
        onClick={handleToggleContentDrawer}
        className={clsx(classes.articleIcon, {
          [classes.left]: rtl,
          [classes.right]: !rtl,
        })}
        id="dialog-toggle-content-drawer-button"
        data-tid="dialog-toggle-content-drawer-button"
      >
        <ListRoundedIcon />
      </Fab>
    </>
  );
};

export default ArticleInfo;
