import React, { FC } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import { useReduxDialog } from "@eGroupAI/redux-modules";
import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import Form from "components/Form";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { SMSFormInput } from "interfaces/form";
import { Controller, useForm } from "react-hook-form";
import FormField from "components/FormField";

export const DIALOG = "CreateSmsTemplateDialog";
export const FORM = "CreateArticleForm";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface SMSDialogProps {
  organizationId: string;
  onSuccessCreate?: (createdSMSId: string) => void;
}

const CreateSMSDialog: FC<SMSDialogProps> = function (props) {
  const { organizationId, onSuccessCreate } = props;
  const theme = useTheme();
  const classes = useStyles();
  const wordLibrary = useSelector(getWordLibrary);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const { control, handleSubmit, formState } = useForm<SMSFormInput>({
    defaultValues: {
      organizationSmsTemplateTitle: "",
      organizationSmsTemplateContent: "",
    },
  });

  const { excute: createSmsTemplate, isLoading } = useAxiosApiWrapper(
    apis.org.createSmsTemplate,
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
        {wordLibrary?.["new sms template"] ?? "新的SMS範本"}
      </DialogTitle>
      <Form
        id={FORM}
        onSubmit={handleSubmit(async (values) => {
          try {
            const resp = await createSmsTemplate({
              ...values,
              organizationId,
            });
            handleClose();
            if (onSuccessCreate) {
              onSuccessCreate(resp.data.organizationSmsTemplateId);
            }
          } catch (error) {
            apis.tools.createLog({
              function: "createSmsTemplate: error",
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
        <DialogContent>
          <Controller
            control={control}
            name="organizationSmsTemplateTitle"
            render={({ field: { value, onChange } }) => (
              <FormField
                primary={wordLibrary?.["sms title"] ?? "簡訊標題"}
                TextFieldProps={{
                  onChange,
                  value,
                  placeholder:
                    wordLibrary?.["sms title name"] ?? "簡訊標題名稱",
                  id: "sms-template-title-input",
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="organizationSmsTemplateContent"
            render={({ field: { value, onChange } }) => (
              <FormField
                primary={wordLibrary?.["sms content"] ?? "簡訊內容"}
                TextFieldProps={{
                  onChange,
                  value,
                  placeholder:
                    wordLibrary?.["sms content name"] ?? "簡訊內容名稱",
                  id: "sms-template-content-input",
                }}
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

export default CreateSMSDialog;
