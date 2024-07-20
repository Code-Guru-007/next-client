import React, { FC, useState, useMemo, useEffect, useRef } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import useReduxSteps from "utils/useReduxSteps";

import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmDialog from "@eGroupAI/material-module/ConfirmDialog";
import TextField from "@eGroupAI/material/TextField";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import Typography from "@eGroupAI/material/Typography";
import IconButton from "components/IconButton/StyledIconButton";
import Tooltip from "@eGroupAI/material/Tooltip";
import Grid from "@eGroupAI/material/Grid";
import Box from "@eGroupAI/material/Box";
import Stepper from "@eGroupAI/material/Stepper";
import Step from "@eGroupAI/material/Step";
import StepButton from "@eGroupAI/material/StepButton";
import Dialog from "@eGroupAI/material/Dialog";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import FroalaEditor from "components/FroalaEditor";
import DialogConfirmButton from "components/DialogConfirmButton";
import DialogCloseButton from "components/DialogCloseButton";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import { Button } from "@eGroupAI/material";
import { uniqueId } from "lodash";
import { AxiosResponse } from "axios";
import { ServiceModuleValue } from "interfaces/utils";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";

const steps = ["填寫Email", "確認寄送Email"];

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export type Emails = {
  [key: string]: {
    organizationUserEmail?: string;
    organizationUserNameZh?: string;
  };
};

export type CustomSesInput = {
  organizationSesSubject: string;
  organizationSesContent: string;
  emails: Emails;
};

export interface SendSesDialogProps {
  loading?: boolean;
  onConfirm?: (
    values: CustomSesInput
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => Promise<AxiosResponse<any, any>[]> | Promise<void> | void;
  open: boolean;
  closeDialog?: () => void;
  emails?: Emails;
  organizationId?: string;
  orgUserId?: string;
  orgUserName?: string;
  isCheckedAllPageRows?: boolean;
  totalChecked?: number;
}

const URL_BASIC_CONTENT_LENGTH = 33;

const SendSesDialog: FC<SendSesDialogProps> = function (props) {
  const {
    onConfirm,
    loading,
    open,
    closeDialog,
    emails,
    orgUserId,
    orgUserName,
    isCheckedAllPageRows,
    totalChecked,
  } = props;

  const classes = useStyles();
  const theme = useTheme();
  const inputEl = useRef<HTMLInputElement>(null);
  const { isOpen: isConfirmOpen, handleClose, handleOpen } = useIsOpen(false);
  const [values, setValues] = useState<CustomSesInput>({
    organizationSesSubject: "",
    organizationSesContent: "",
    emails: emails as Emails,
  });
  const wordLibrary = useSelector(getWordLibrary);
  const [isEmptyEmail, setIsEmptyEmail] = useState(true);

  const { excute: sendCustomSesTest, isLoading: isTestEmail } =
    useAxiosApiWrapper(apis.org.sendCustomSesTest);

  const maxActiveStep = steps.length - 1;
  const { setActiveStep, activeStep = 0 } = useReduxSteps(
    "SendSesDialogSteps",
    !open
  );
  const contentLength = useMemo(() => {
    const length = values.organizationSesContent?.length ?? 0;
    return length + URL_BASIC_CONTENT_LENGTH;
  }, [values]);

  const availableNextButton = useMemo(
    () =>
      Boolean(values.organizationSesContent) &&
      Boolean(values.organizationSesSubject),
    [values]
  );

  const organizationId = useSelector(getSelectedOrgId);

  const handleConfirm = () => {
    const validNumberKeys = Object.keys(values.emails).filter(
      (key) => values.emails[key]?.organizationUserEmail !== ""
    );
    const filteredNumbers = validNumberKeys.reduce<Emails>(
      (a, b) => ({ ...a, [b]: values.emails[b] as Emails }),
      {}
    );
    const filteredValues: CustomSesInput = {
      ...values,
      emails: filteredNumbers,
    };
    setValues(filteredValues);
    handleClose();
    if (onConfirm) {
      const promise = onConfirm(filteredValues);
      if (promise) {
        promise
          .then(() => {
            setValues({
              organizationSesSubject: "",
              organizationSesContent: "",
              emails: emails as Emails,
            });
            if (closeDialog) closeDialog();
          })
          .catch(() => {});
      }
    }
  };

  useEffect(() => {
    if (emails) {
      setValues((v) => ({
        ...v,
        emails,
      }));
    }
  }, [emails]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const froalaElement = document.querySelector(".fr-element.fr-view");
      if (froalaElement) {
        froalaElement.setAttribute("id", "send-email-content-editor");
      }
    });
    observer.observe(document, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  const handleStep = (step: number) => () => {
    if (step === 1 && !availableNextButton) return;
    setActiveStep(step);
  };

  const handleNext = () => {
    if (activeStep < maxActiveStep) {
      setActiveStep(activeStep + 1);
    } else {
      handleOpen();
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleAddEmail = () => {
    const newKey = uniqueId(`${orgUserId}-`);
    const newEmail = {
      [newKey]: {
        organizationUserEmail: "",
        organizationUserNameZh: orgUserName,
      },
    };
    setValues((val) => ({
      ...val,
      emails: {
        ...val.emails,
        ...newEmail,
      },
    }));
  };

  const handleTestEmail = async () => {
    if (activeStep === 0 && values) {
      await sendCustomSesTest({
        organizationId,
        organizationSesSubject: values.organizationSesSubject,
        organizationSesContent: values.organizationSesContent,
      })
        .then(() => {})
        .catch(() => {
          setValues({
            organizationSesSubject: "",
            organizationSesContent: "",
            emails: emails as Emails,
          });
        });
    }
  };
  return (
    <>
      <ConfirmDialog
        open={isConfirmOpen}
        onClose={handleClose}
        onCancel={handleClose}
        MuiConfirmButtonProps={{
          color: "primary",
          variant: "contained",
        }}
        primary={wordLibrary?.["send email"] ?? "發送Email"}
        message={`您的Email內容長度為 ${contentLength} ，請確認內容後送出`}
        onConfirm={handleConfirm}
      />
      <Dialog
        scroll="body"
        open={open}
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
        className={classes.dialogPaper}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
        disableEnforceFocus
      >
        <DialogTitle onClickClose={closeDialog}>發送Email</DialogTitle>
        <DialogFullPageContainer>
          <Stepper nonLinear activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepButton color="inherit" onClick={handleStep(index)}>
                  {label}
                </StepButton>
              </Step>
            ))}
          </Stepper>
          {activeStep === 0 && (
            <>
              <TextField
                label="Email主旨"
                fullWidth
                margin="normal"
                required
                helperText="描述這封Email的用途"
                onChange={(e) => {
                  setValues((v) => ({
                    ...v,
                    organizationSesSubject: e.target.value,
                  }));
                }}
                value={values.organizationSesSubject}
                id="send-email-subject-input"
              />
              <FroalaEditor
                filePathType={ServiceModuleValue.SES}
                model={values.organizationSesContent}
                onModelChange={(model) => {
                  setValues((v) => ({
                    ...v,
                    organizationSesContent: model,
                  }));
                }}
                config={{
                  toolbarSticky: true,
                  heightMin: 300,
                  placeholderText: "Email內容",
                }}
              />
            </>
          )}
          {activeStep === 1 && (
            <Grid container>
              {isCheckedAllPageRows ? (
                <Grid item xs={12}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height={120}
                  >
                    <Typography
                      variant="h4"
                      color="primary"
                      sx={{ mt: "40px" }}
                    >
                      已選取{totalChecked}個
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                Object.keys(values.emails).map((el) => {
                  const { organizationUserEmail, organizationUserNameZh } =
                    values.emails[el] || {};
                  return (
                    <Grid item xs={12} key={el}>
                      <Box display="flex" alignItems="center">
                        <TextField
                          id="confirm-email-input"
                          label={`${organizationUserNameZh}-Email`}
                          ref={inputEl}
                          fullWidth
                          margin="normal"
                          required
                          value={organizationUserEmail}
                          onChange={(e) => {
                            if (e.target.value === "") setIsEmptyEmail(true);
                            else setIsEmptyEmail(false);
                            setValues((v) => ({
                              ...v,
                              emails: {
                                ...v.emails,
                                [el]: {
                                  organizationUserNameZh,
                                  organizationUserEmail: e.target.value,
                                },
                              },
                            }));
                          }}
                        />
                        <div>
                          <Tooltip title={wordLibrary?.delete ?? "刪除"}>
                            <IconButton
                              sx={{ mt: 1 }}
                              onClick={() => {
                                setValues((v) => {
                                  const nextEmails = v.emails;
                                  delete nextEmails[el];
                                  return {
                                    ...v,
                                    emails: nextEmails,
                                  };
                                });
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </Box>
                    </Grid>
                  );
                })
              )}
              {orgUserId && (
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Box display="flex" alignItems="center">
                    <Button
                      rounded
                      variant="outlined"
                      size="large"
                      fullWidth
                      color="white"
                      onClick={handleAddEmail}
                      sx={{
                        height: "55px",
                        width: inputEl.current?.clientWidth,
                      }}
                    >
                      <span>{wordLibrary?.add ?? "新增"}</span>
                    </Button>
                    <IconButton sx={{ mt: 1, visibility: "hidden" }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogFullPageContainer>
        <DialogActions>
          <DialogCloseButton onClick={closeDialog} rounded />
          <Box flexGrow={1} />
          <DialogConfirmButton
            loading={isTestEmail}
            disabled={!availableNextButton || loading}
            onClick={activeStep === 0 ? handleTestEmail : handlePrev}
            id={
              activeStep === 0
                ? "send-email-test-button"
                : "dialog-prev-step-button"
            }
            rounded
          >
            {(() => {
              let output = "";
              if (activeStep === 0) {
                output = wordLibrary?.["test email"] ?? "寄信測試";
              } else {
                output = wordLibrary?.["previous step"] ?? "上一步";
              }
              return output;
            })()}
          </DialogConfirmButton>
          <DialogConfirmButton
            loading={loading}
            onClick={handleNext}
            rounded
            disabled={
              activeStep === 0 ? !availableNextButton || loading : isEmptyEmail
            }
            id={
              activeStep === maxActiveStep
                ? "send-email-button"
                : "dialog-next-step-button"
            }
          >
            {(() => {
              let output = "";
              if (activeStep === maxActiveStep) {
                output = wordLibrary?.["send email"] ?? "發送Email";
              } else {
                output = wordLibrary?.["next step"] ?? "下一步";
              }
              return output;
            })()}
          </DialogConfirmButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SendSesDialog;
