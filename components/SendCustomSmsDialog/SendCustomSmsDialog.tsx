import React, { FC, useState, useMemo, useEffect } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import useReduxSteps from "utils/useReduxSteps";

import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmDialog from "@eGroupAI/material-module/ConfirmDialog";
import Grid from "@eGroupAI/material/Grid";
import { useSelector } from "react-redux";
import IconButton from "components/IconButton/StyledIconButton";
import Tooltip from "@eGroupAI/material/Tooltip";
import Box from "@eGroupAI/material/Box";
import Stepper from "@eGroupAI/material/Stepper";
import Step from "@eGroupAI/material/Step";
import StepButton from "@eGroupAI/material/StepButton";
import Dialog from "@eGroupAI/material/Dialog";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogConfirmButton from "components/DialogConfirmButton";
import DialogCloseButton from "components/DialogCloseButton";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TableCell,
} from "@eGroupAI/material";
import { AxiosResponse } from "axios";
import DynamicFieldWithAction from "components/DynamicField/DynamicFieldWithAction";
import { ColumnType } from "@eGroupAI/typings/apis";
import DatePicker from "@eGroupAI/material-lab/DatePicker";
import moment from "moment-timezone";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useResponsive } from "minimal/hooks/use-responsive";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
  datePicker: {
    "&.MuiDatePicker-root": {
      width: "90%",
    },
  },
}));

export type PhoneNumbers = {
  [key: string]: {
    organizationUserPhone?: string;
    organizationUserNameZh?: string;
  };
};

export type CustomSmsInput = {
  organizationSmsSubject: string;
  organizationSmsContent: string;
  organizationSmsSendDate?: string;
  organizationUserList?: object[];
  phoneNumbers: PhoneNumbers;
};

export interface SendSmsDialogProps {
  loading?: boolean;
  onConfirm?: (
    values: CustomSmsInput
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => Promise<AxiosResponse<any, any>[]> | Promise<void> | void;
  open: boolean;
  closeDialog?: () => void;
  phoneNumbers?: PhoneNumbers;
  orgUserId?: string;
  orgUserName?: string;
  isCheckedAllPageRows?: boolean;
  totalChecked?: number;
}

const URL_BASIC_CONTENT_LENGTH = 33;

interface SmsRecipientInformation {
  organizationUserNameZh?: string;
  organizationUserPhone?: string;
  organizationUserId: string;
}

const SendSmsDialog: FC<SendSmsDialogProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const smDown = useResponsive("down", "sm");

  const [radioSelect, setRadioSelect] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [smsCharacterCount, setSmsCharacterCount] = useState(0);
  const steps = [
    `${wordLibrary?.["Fill in the message content"] ?? "填寫簡訊內容"}`,
    `${wordLibrary?.["Confirm shipping number"] ?? "確認寄送號碼"}`,
    `${wordLibrary?.["Select sending time"] ?? "選擇發送時間"}`,
  ];
  const { onConfirm, loading, open, closeDialog, phoneNumbers } = props;
  const [visibleRows, setVisibleRows] = useState<SmsRecipientInformation[]>([]);

  useEffect(() => {
    if (phoneNumbers)
      setVisibleRows(
        Object.keys(phoneNumbers).map((v) => ({
          ...phoneNumbers[v],
          organizationUserId: v,
        }))
      );
  }, [phoneNumbers]);

  useEffect(() => {
    if (open) {
      setValues({
        organizationSmsSubject: "",
        organizationSmsContent: "",
        organizationSmsSendDate: moment().clone().toISOString(),
        phoneNumbers: phoneNumbers as PhoneNumbers,
      });
      setRadioSelect(0);
      setPage(0);
      setRowsPerPage(10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const classes = useStyles();
  const theme = useTheme();

  const { isOpen: isConfirmOpen, handleClose } = useIsOpen(false);
  const [values, setValues] = useState<CustomSmsInput>({
    organizationSmsSubject: "",
    organizationSmsContent: "",
    phoneNumbers: phoneNumbers as PhoneNumbers,
    organizationSmsSendDate: moment().clone().toISOString(),
  });

  const maxActiveStep = steps.length - 1;
  const { setActiveStep, activeStep = 0 } = useReduxSteps(
    "SendSmsDialogSteps",
    !open
  );
  const contentLength = useMemo(() => {
    const length = values.organizationSmsContent?.length ?? 0;
    return length + URL_BASIC_CONTENT_LENGTH;
  }, [values]);
  const [availableFinalButton, setAvailableFinalButton] = useState(false);

  const availableNextButton = useMemo(
    () =>
      Boolean(values.organizationSmsContent) &&
      Boolean(values.organizationSmsSubject),
    [values]
  );

  useEffect(() => {
    // if all organizationUserPhone in values.phoneNumbers object is empty, disable next button
    const validNumberKeys = visibleRows.filter(
      (key) =>
        key.organizationUserPhone === "" ||
        key.organizationUserPhone === " " ||
        key.organizationUserPhone === undefined
    );
    setAvailableFinalButton(validNumberKeys.length > 0);
  }, [visibleRows]);

  useEffect(() => {
    if (phoneNumbers) {
      setValues((v) => ({
        ...v,
        phoneNumbers,
      }));
    }
  }, [phoneNumbers]);

  const handleStep = (step: number) => () => {
    if (
      (step === 1 && !availableNextButton) ||
      (step === 2 && availableFinalButton)
    )
      return;
    setActiveStep(step);
  };

  const handleNext = () => {
    if (activeStep < maxActiveStep) {
      setActiveStep(activeStep + 1);
    } else if (onConfirm) {
      const selectedUsers = visibleRows.map((el) => ({
        organizationUserId: el?.organizationUserId,
        organizationUserPhone: el?.organizationUserPhone || "",
      }));
      if (radioSelect)
        onConfirm({
          organizationSmsContent: values.organizationSmsContent,
          organizationSmsSubject: values.organizationSmsSubject,
          phoneNumbers: values.phoneNumbers,
          organizationSmsSendDate: values.organizationSmsSendDate,
          organizationUserList: selectedUsers,
        });
      else
        onConfirm({
          organizationSmsContent: values.organizationSmsContent,
          organizationSmsSubject: values.organizationSmsSubject,
          organizationSmsSendDate: values.organizationSmsSendDate,
          phoneNumbers: values.phoneNumbers,
          organizationUserList: selectedUsers,
        });
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) =>
    setPage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  function countCharacters(str: string): number {
    return [...str].reduce((count, char) => {
      if (char !== undefined) {
        return (
          count +
          (char.codePointAt(0) && (char.codePointAt(0) || 0) > 255 ? 2 : 1)
        );
      }
      return count;
    }, 0);
  }

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
        primary={wordLibrary?.["send text message"] ?? "發送簡訊"}
        message={`您的簡訊內容長度為 ${contentLength}，每位客戶將收到 ${Math.ceil(
          contentLength / 63
        )} 封簡訊`}
        onConfirm={() => {
          const validNumberKeys = Object.keys(values.phoneNumbers).filter(
            (key) => values.phoneNumbers[key]?.organizationUserPhone !== ""
          );
          const filteredNumbers = validNumberKeys.reduce<PhoneNumbers>(
            (a, b) => ({ ...a, [b]: values.phoneNumbers[b] as PhoneNumbers }),
            {}
          );
          const filteredValues: CustomSmsInput = {
            ...values,
            phoneNumbers: filteredNumbers,
          };
          setValues(filteredValues);
          handleClose();
          if (onConfirm) {
            const promise = onConfirm(filteredValues);
            if (promise) {
              promise
                .then(() => {
                  setValues({
                    organizationSmsSubject: "",
                    organizationSmsContent: "",
                    phoneNumbers: phoneNumbers as PhoneNumbers,
                  });
                  if (closeDialog) closeDialog();
                })
                .catch(() => {});
            }
          }
        }}
      />
      <Dialog
        scroll="body"
        open={open}
        onClose={closeDialog}
        maxWidth="lg"
        fullWidth
        className={classes.dialogPaper}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
      >
        <DialogTitle onClickClose={closeDialog}>
          {wordLibrary?.["send text message"] ?? "發送簡訊"}
        </DialogTitle>
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
            <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
              <Box sx={{ width: "80%" }}>
                <TextField
                  label={wordLibrary?.["text message subject"] ?? "簡訊主旨"}
                  fullWidth
                  placeholder={
                    wordLibrary?.["Please enter SMS subject"] ??
                    "請輸入簡訊主題"
                  }
                  sx={{ mb: 3 }}
                  inputProps={{ style: { padding: "16.5px 14px" } }}
                  required
                  onChange={(e) => {
                    setValues((v) => ({
                      ...v,
                      organizationSmsSubject: e.target.value,
                    }));
                  }}
                  value={values.organizationSmsSubject}
                />
                <Box sx={{ position: "relative" }}>
                  <TextField
                    label={wordLibrary?.["sms content"] ?? "簡訊內容"}
                    placeholder={
                      wordLibrary?.["Please enter SMS content"] ??
                      "請輸入簡訊內容"
                    }
                    rows={5}
                    fullWidth
                    required
                    multiline
                    onChange={(e) => {
                      setValues((v) => ({
                        ...v,
                        organizationSmsContent: e.target.value,
                      }));
                      setSmsCharacterCount(countCharacters(e.target.value));
                    }}
                    value={values.organizationSmsContent}
                  />
                  <Typography
                    sx={{
                      position: "absolute",
                      right: "15px",
                      bottom: "1px",
                      color: "gray",
                    }}
                  >
                    {wordLibrary?.entered ?? ["已輸入"]}
                    {smsCharacterCount}
                    {wordLibrary?.characters ?? "個字元"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
          {activeStep === 1 && (
            <Grid
              container
              sx={{ mt: 3, display: "flex", justifyContent: "center" }}
            >
              <TableContainer sx={{ width: "80%" }}>
                <Table aria-labelledby="tableTitle">
                  <TableHead>
                    <TableRow
                      style={{ whiteSpace: "nowrap", textAlign: "left" }}
                    >
                      <TableCell sx={{ width: "30%" }}>
                        {wordLibrary?.["Chinese Name"] ?? "中文姓名"}
                      </TableCell>
                      <TableCell sx={{ width: "50%", pl: "22px" }}>
                        {wordLibrary?.["Contact Number"] ?? "聯絡電話"}
                      </TableCell>
                      <TableCell sx={{ width: "20%" }} />
                    </TableRow>
                  </TableHead>
                  {Object.keys(values.phoneNumbers).length ? (
                    <TableBody>
                      {(rowsPerPage > 0
                        ? visibleRows.slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                        : visibleRows
                      ).map((el, index) => (
                        <TableRow sx={{ textAlign: "left" }}>
                          <TableCell sx={{ width: "30%" }}>
                            {el?.organizationUserNameZh}
                          </TableCell>
                          <TableCell sx={{ width: "50%" }}>
                            <DynamicFieldWithAction
                              isEditableShow
                              width="270px"
                              showHistoryIcon={false}
                              value={el?.organizationUserPhone || ""}
                              name="organizationUserPhone"
                              columnType={ColumnType.TEXT}
                              handleChange={(name, value) => {
                                const organizationUserPhone =
                                  value?.value as string;
                                setVisibleRows((prevRows) => {
                                  const updatedRows = [...prevRows];
                                  updatedRows[
                                    page > 0
                                      ? page * rowsPerPage + index
                                      : index
                                  ] = {
                                    organizationUserPhone,
                                    organizationUserNameZh:
                                      el?.organizationUserNameZh,
                                    organizationUserId: el.organizationUserId,
                                  };
                                  return updatedRows;
                                });
                              }}
                              readable
                              writable
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: "right", width: "20%" }}>
                            <Tooltip title={wordLibrary?.delete ?? "刪除"}>
                              <IconButton
                                sx={{ mt: 1 }}
                                onClick={() => {
                                  setValues((v) => {
                                    const nextPhoneNumbers = v.phoneNumbers;
                                    delete nextPhoneNumbers[
                                      el.organizationUserId
                                    ];
                                    return {
                                      ...v,
                                      phoneNumbers: nextPhoneNumbers,
                                    };
                                  });
                                  setVisibleRows((pre) =>
                                    pre.filter(
                                      (v) =>
                                        v.organizationUserId !==
                                        el.organizationUserId
                                    )
                                  );
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  ) : (
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: "center" }}>
                          no data found
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  )}
                </Table>
                {Object.keys(values.phoneNumbers).length ? (
                  <TablePagination
                    style={{
                      overflow: "visible",
                      width: smDown ? "432px" : "auto",
                    }}
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={Object.keys(values.phoneNumbers).length || 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    showFirstButton
                    showLastButton
                    labelRowsPerPage="每頁筆數"
                  />
                ) : (
                  <div>{""}</div>
                )}
              </TableContainer>
            </Grid>
          )}
          {activeStep === 2 && (
            <FormControl sx={{ mt: 3, ml: "10%" }}>
              <RadioGroup
                value={radioSelect}
                onChange={(e) => {
                  setRadioSelect(+e.target.value);
                  if (+e.target.value === 0) {
                    setValues((v) => ({
                      ...v,
                      organizationSmsSendDate: moment().clone().toISOString(),
                    }));
                  } else
                    setValues((v) => ({
                      ...v,
                      organizationSmsSendDate: moment()
                        .add(11, "minutes")
                        .toISOString(),
                    }));
                }}
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue={0}
                name="radio-buttons-group"
              >
                <FormControlLabel
                  value={0}
                  control={<Radio />}
                  label={wordLibrary?.["Send Immediately"] ?? "立即發送"}
                  sx={{ width: "fit-content" }}
                />
                <FormControlLabel
                  value={1}
                  control={<Radio />}
                  label={wordLibrary?.["Schedule Sending"] ?? "預約發送"}
                  sx={{ width: "fit-content" }}
                />

                {radioSelect ? (
                  <>
                    <DatePicker
                      value={new Date(values.organizationSmsSendDate || "")}
                      className={classes.datePicker}
                      onChange={(e) => {
                        setValues((v) => ({
                          ...v,
                          organizationSmsSendDate: moment(e).toISOString(),
                        }));
                      }}
                      isTime
                      label={
                        wordLibrary?.[
                          "Schedule SendingSet the exact time you want the text message to be sent in advance, and the system will automatically send it at the time you specify."
                        ] ??
                        "預約您希望簡訊傳送的時間,系統將在指定的時間自動發送。"
                      }
                      sx={{ ml: 3 }}
                      labelPadding="medium"
                      minDate={moment().add(-1, "d").toString()}
                    />
                    <Typography color="red" sx={{ fontSize: "13px", ml: 3 }}>
                      {moment(values.organizationSmsSendDate).isSameOrAfter(
                        moment().clone().add(10, "minutes")
                      )
                        ? ""
                        : wordLibrary?.[
                            "Please select at least 10 minutes greater than the current system time"
                          ] ?? "請選擇比系統時間晚至少10分鐘的時間"}
                    </Typography>
                  </>
                ) : (
                  ""
                )}
              </RadioGroup>
            </FormControl>
          )}
        </DialogFullPageContainer>
        <DialogActions>
          <DialogCloseButton onClick={closeDialog} rounded />
          <Box flexGrow={1} />
          {activeStep !== 0 && !loading && (
            <DialogConfirmButton
              onClick={handlePrev}
              rounded
              id="prev-step-button"
              data-tid="prev-step-button"
            >
              {wordLibrary?.["previous step"] ?? "上一步"}
            </DialogConfirmButton>
          )}
          {activeStep === maxActiveStep ? (
            <DialogConfirmButton
              loading={loading}
              onClick={handleNext}
              rounded
              color="primary"
              disabled={
                availableFinalButton ||
                loading ||
                (!moment(values.organizationSmsSendDate).isSameOrAfter(
                  moment().clone().add(10, "minutes")
                ) &&
                  radioSelect === 1)
              }
              id="send-text-button"
              data-tid="send-text-button"
            >
              {wordLibrary?.send ?? "發送"}
            </DialogConfirmButton>
          ) : (
            <DialogConfirmButton
              loading={loading}
              onClick={handleNext}
              rounded
              disabled={
                activeStep === 0 ? !availableNextButton : availableFinalButton
              }
              id="next-step-button"
              data-tid="next-step-button"
            >
              {wordLibrary?.["next step"] ?? "下一步"}
            </DialogConfirmButton>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SendSmsDialog;
