import React, { FC } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import { makeStyles } from "@mui/styles";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";

import Typography from "@eGroupAI/material/Typography";
import Button from "@eGroupAI/material/Button";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { format } from "@eGroupAI/utils/dateUtils";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import useOrgArticle from "utils/useOrgArticle";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";

const useStyles = makeStyles(() => ({
  editSection: {
    borderRadius: 0,
    boxShadow: "none",
    padding: "20px",
  },
  editSectionHeader: {
    marginBottom: "30px",
  },
  deleteLabe: {
    marginRight: "10px",
  },
}));

export interface ArticleSettingProps {
  articleId: string;
  organizationId: string;
  orgUser;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}
const ArticleSetting: FC<ArticleSettingProps> = ({
  articleId,
  organizationId,
  // readable = false,
  // writable = false,
  orgUser,
  deletable = false,
}) => {
  const classes = useStyles();
  const router = useRouter();
  const wordLibrary = useSelector(getWordLibrary);
  const locale = useSelector(getGlobalLocale);
  const { data: article } = useOrgArticle(
    {
      organizationId,
      articleId,
    },
    {
      locale,
    }
  );
  const { excute: deleteOrgArticle, isLoading: isDeleting } =
    useAxiosApiWrapper(apis.org.deleteOrgArticle, "Delete");
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
    setDialogStates: setConfirmDeleteDialogStates,
  } = useReduxDialog(DELETE_DIALOG);
  return (
    <>
      <EditSection className={classes.editSection}>
        <EditSectionHeader
          primary="文章設定"
          className={classes.editSectionHeader}
        />
        <Stack direction="column" marginBottom={2}>
          <ListItemText
            primary={wordLibrary?.["creation time"] ?? "建立時間"}
            secondary={
              article &&
              article.articleCreateDate &&
              format(
                zonedTimeToUtc(
                  new Date(article?.articleCreateDate),
                  "Asia/Taipei"
                ),
                "PP pp",
                { locale: zhCN }
              )
            }
            primaryTypographyProps={{
              typography: "body2",
              color: "text.secondary",
              mb: 0.5,
            }}
            secondaryTypographyProps={{
              typography: "subtitle2",
              color: "text.primary",
              component: "span",
            }}
          />
        </Stack>
        <Stack direction="column" marginBottom={2}>
          <ListItemText
            primary={wordLibrary?.["update time"] ?? "更新時間"}
            secondary={
              article &&
              article.articleCreateDate &&
              format(
                zonedTimeToUtc(
                  new Date(article?.articleCreateDate),
                  "Asia/Taipei"
                ),
                "PP pp",
                { locale: zhCN }
              )
            }
            primaryTypographyProps={{
              typography: "body2",
              color: "text.secondary",
              mb: 0.5,
            }}
            secondaryTypographyProps={{
              typography: "subtitle2",
              color: "text.primary",
              component: "span",
            }}
          />
        </Stack>
        {orgUser && (
          <Stack direction="column" marginBottom={2}>
            <ListItemText
              primary="建立者"
              secondary={orgUser?.creator?.memberName}
              primaryTypographyProps={{
                typography: "body2",
                color: "text.secondary",
                mb: 0.5,
              }}
              secondaryTypographyProps={{
                typography: "subtitle2",
                color: "text.primary",
                component: "span",
              }}
            />
          </Stack>
        )}
        {orgUser && (
          <Stack direction="column" marginBottom={2}>
            <ListItemText
              primary="更新者"
              secondary={orgUser?.updater?.memberName}
              primaryTypographyProps={{
                typography: "body2",
                color: "text.secondary",
                mb: 0.5,
              }}
              secondaryTypographyProps={{
                typography: "subtitle2",
                color: "text.primary",
                component: "span",
              }}
            />
          </Stack>
        )}
      </EditSection>
      {deletable && (
        <EditSection className={classes.editSection}>
          <EditSectionHeader
            primary={wordLibrary?.delete ?? "刪除"}
            className={classes.editSectionHeader}
          />
          <Stack direction="row" marginBottom={2} alignItems="center">
            <Typography
              color="textSecondary"
              variant="button"
              className={classes.deleteLabe}
            >
              {wordLibrary?.["delete entire data"] ?? "將整筆資料進行刪除"}
            </Typography>
            <Button
              variant="contained"
              rounded
              size="small"
              color="error"
              id="article-delete-button"
              data-tid="article-delete-button"
              loading={isDeleting}
              onClick={() => {
                if (article) {
                  openConfirmDeleteDialog({
                    primary:
                      wordLibrary?.[
                        "Please enter the title to delete Article"
                      ] ?? `確定要刪除文章 '${article.articleTitle}' 嗎？`,
                    deletableName: article.articleTitle,
                    onConfirm: async () => {
                      if (organizationId) {
                        try {
                          setConfirmDeleteDialogStates({
                            isDeleting: true,
                          });
                          await deleteOrgArticle({
                            organizationId,
                            articleId: article.articleId,
                          });
                          closeConfirmDeleteDialog();
                          router.replace("/me/articles");
                        } catch (error) {
                          apis.tools.createLog({
                            function: "deleteOrgArticle: error",
                            browserDescription: window.navigator.userAgent,
                            jsonData: {
                              data: error,
                              deviceInfo: getDeviceInfo(),
                            },
                            level: "ERROR",
                          });
                        }
                      }
                    },
                  });
                }
              }}
            >
              {wordLibrary?.delete ?? "刪除"}
            </Button>
          </Stack>
        </EditSection>
      )}
    </>
  );
};

export default ArticleSetting;
