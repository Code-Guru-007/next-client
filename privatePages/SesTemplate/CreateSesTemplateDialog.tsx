import React, { FC } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogCloseButton from "components/DialogCloseButton";
import TextField from "@eGroupAI/material/TextField";
import { useSelector } from "react-redux";

import DialogConfirmButton from "components/DialogConfirmButton";
import Form from "components/Form";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { SESFormInput } from "interfaces/form";
import { Controller, useForm } from "react-hook-form";

export const DIALOG = "CreateSesTemplateDialog";
export const FORM = "CreateArticleForm";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface SESDialogProps {
  organizationId: string;
  onSuccessCreate?: (createdSESId: string) => void;
}

const CreateSesTemplateDialog: FC<SESDialogProps> = function (props) {
  const { organizationId, onSuccessCreate } = props;
  const theme = useTheme();
  const classes = useStyles();
  const wordLibrary = useSelector(getWordLibrary);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const { control, handleSubmit, formState } = useForm<SESFormInput>({
    defaultValues: {
      organizationSesTemplateTitle: "",
      organizationSesTemplateContent: "",
    },
  });

  const { excute: createSesTemplate, isLoading } = useAxiosApiWrapper(
    apis.org.createSesTemplate,
    "Create"
  );

  const handleClose = () => {
    closeDialog();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={handleClose}>
        {wordLibrary?.["edit sms template"] ?? "新增電子郵件範本"}
      </DialogTitle>
      <Form
        id={FORM}
        onSubmit={handleSubmit(async (values) => {
          try {
            const resp = await createSesTemplate({
              ...values,
              organizationId,
            });
            handleClose();
            if (onSuccessCreate) {
              onSuccessCreate(resp.data.organizationSesTemplateId);
            }
          } catch (error) {
            apis.tools.createLog({
              function: "createSesTemplate: error",
              browserDescription: window.navigator.userAgent,
              jsonData: {
                data: error,
                deviceInfo: getDeviceInfo(),
              },
              level: "ERROR",
            });
          }
        })}
        loading={isLoading}
      >
        <DialogContent
          sx={{
            paddingTop: "10px",
          }}
        >
          <Controller
            control={control}
            name="organizationSesTemplateTitle"
            render={({ field }) => (
              <TextField
                label={wordLibrary?.["email title"] ?? "電子郵件標題"}
                fullWidth
                {...field}
                id="ses-template-title"
              />
            )}
          />
          <Controller
            control={control}
            name="organizationSesTemplateContent"
            render={({ field }) => (
              <TextField
                label={wordLibrary?.["email content"] ?? "電子郵件內容"}
                fullWidth
                multiline
                minRows={4}
                sx={{ mt: 2 }}
                {...field}
                id="ses-template-content"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <DialogCloseButton onClick={handleClose} />
          <DialogConfirmButton
            loading={isLoading}
            type="submit"
            disabled={!formState.isDirty || isLoading}
          >
            {wordLibrary?.save ?? "儲存"}
          </DialogConfirmButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
};

export default CreateSesTemplateDialog;
