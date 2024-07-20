import React, { FC, useState } from "react";
import { useSelector } from "react-redux";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import { useReduxDialog } from "@eGroupAI/redux-modules";
import Grid from "@eGroupAI/material/Grid";
import Typography from "@eGroupAI/material/Typography";
import TextField from "@eGroupAI/material/TextField";
import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import Form from "components/Form";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { ArticleFormInput } from "interfaces/form";

export const DIALOG = "CreateArticleDialog";
export const FORM = "CreateArticleForm";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface BulletingDialogProps {
  organizationId: string;
  onSuccessCreate?: (createdBulletinId: string) => void;
}

const CreateArticleDialog: FC<BulletingDialogProps> = function (props) {
  const { organizationId, onSuccessCreate } = props;
  const theme = useTheme();
  const classes = useStyles();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const [article, setArticle] = useState<ArticleFormInput>({
    articleTitle: "",
  });
  const wordLibrary = useSelector(getWordLibrary);

  const { excute: createOrgArticle, isLoading } = useAxiosApiWrapper(
    apis.org.createOrgArticle,
    "Create"
  );

  const handleClose = () => {
    closeDialog();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await createOrgArticle({
        ...article,
        organizationId,
      });
      handleClose();
      if (onSuccessCreate) onSuccessCreate(resp.data.articleId);
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: handleSubmit",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={handleClose}>
        {wordLibrary?.["add article (draft)"] ?? "新增文章(未發布)"}
      </DialogTitle>
      <Form id={FORM} onSubmit={handleSubmit} loading={isLoading}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography
                variant="h5"
                color="textSecondary"
                sx={{ marginLeft: "15px" }}
              >
                {wordLibrary?.["article title name"] ?? "文章標題名稱"}
              </Typography>
              <TextField
                name="articleTitle"
                placeholder={
                  wordLibrary?.["article title name"] ?? "文章標題名稱"
                }
                fullWidth
                value={article.articleTitle}
                onChange={(e) => {
                  setArticle({
                    ...article,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <DialogCloseButton onClick={handleClose}>
            {wordLibrary?.cancel ?? "取消"}
          </DialogCloseButton>
          <DialogConfirmButton
            loading={isLoading}
            type="submit"
            disabled={article.articleTitle === ""}
          >
            {wordLibrary?.save ?? "儲存"}
          </DialogConfirmButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
};

export default CreateArticleDialog;
