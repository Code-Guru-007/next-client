import React, { useState } from "react";

import { ServiceModuleValue } from "interfaces/utils";
import { useAppDispatch } from "redux/configureAppStore";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import {
  setOrgShareEditNeedUpload,
  setOrgShareIsOneTime,
  setOrgShareUploadDescription,
  setOrgShareWelcomeMessage,
  setOrgShareFinishMessage,
  setOrgShareExpiredDateString,
  setHasDueDate,
} from "redux/createUserInfoFilledUrlDialog";
import {
  getOrgShareEditNeedUpload,
  getOrgShareIsOneTime,
  getOrgShareUploadDescription,
  getOrgShareWelcomeMessage,
  getOrgShareFinishMessage,
  getOrgShareExpiredDateString,
  getHasDueDate,
  getWelcomeUploadFiles,
  getFinishUploadFiles,
  getWelcomeUploadFile,
  getFinishUploadFile,
} from "redux/createUserInfoFilledUrlDialog/selectors";

import FroalaEditor from "components/FroalaEditor";
import { ToolbarButtons } from "froala-editor";

import Typography from "@eGroupAI/material/Typography";
import Grid from "@eGroupAI/material/Grid";

import ImageUploadZone from "./ImageUploadZone";
import ShareEditTextField from "./ShareEditTextField";
import ShareEditRadioGroup from "./ShareEditRadioGroup";
import ShareEditDatePicker from "./ShareEditDatePicker";

const toolbarButtons = [
  "undo",
  "redo",
  "fontFamily",
  "paragraphFormat",
  "fontSize",
  "bold",
  "underline",
  "strikeThrough",
  "insertLink",
];

const SettingStep = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const dispatch = useAppDispatch();
  const orgShareEditNeedUpload = useSelector(getOrgShareEditNeedUpload);
  const orgShareIsOneTime = useSelector(getOrgShareIsOneTime);
  const orgShareUploadDescription = useSelector(getOrgShareUploadDescription);
  const orgShareWelcomeMessage = useSelector(getOrgShareWelcomeMessage);
  const orgShareFinishMessage = useSelector(getOrgShareFinishMessage);
  const orgShareExpiredDateString = useSelector(getOrgShareExpiredDateString);
  const hasDueDate = useSelector(getHasDueDate);
  const welcomeUploadFiles = useSelector(getWelcomeUploadFiles) || [];
  const finishUploadFiles = useSelector(getFinishUploadFiles) || [];
  const welcomeUploadFile = useSelector(getWelcomeUploadFile);
  const finishUploadFile = useSelector(getFinishUploadFile);
  const [isNeedUpload, setIsNeedUpload] = useState<string>(
    orgShareEditNeedUpload
  );
  const [uploadDescription, setUploadDescription] = useState<string>(
    orgShareUploadDescription
  );
  const [isOneTime, setIsOneTime] = useState<string>(orgShareIsOneTime);
  const [isDueDate, setIsDueDate] = useState<string>(hasDueDate);
  const [expiredDate, setExpiredDate] = useState<string | undefined>(
    orgShareExpiredDateString
  );
  const [welcomeMessage, setWelcomeMessage] = useState<string>(
    orgShareWelcomeMessage
  );
  const [finishMessage, setFinishMessage] = useState<string>(
    orgShareFinishMessage
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body2" color="primary">
          {wordLibrary?.["upload file"] ?? "上傳檔案"}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <ShareEditRadioGroup
          label={
            wordLibrary?.["do you need to upload a file"] ?? "是否需要上傳檔案"
          }
          value={isNeedUpload}
          handleChange={(value) => {
            setIsNeedUpload(value);
            dispatch(setOrgShareEditNeedUpload(value));
          }}
        />
      </Grid>
      {isNeedUpload === "1" && (
        <ShareEditTextField
          label={wordLibrary?.["file upload instructions"] ?? "檔案上傳說明"}
          value={uploadDescription}
          handleChange={(value) => setUploadDescription(value)}
          handleBlur={(value) => dispatch(setOrgShareUploadDescription(value))}
        />
      )}
      <Grid item xs={12}>
        <Typography variant="body2" color="primary">
          {wordLibrary?.["edit count/time sensitivity"] ?? "編輯次數/時效性"}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <ShareEditRadioGroup
          label={
            wordLibrary?.["is it only be edited once"] ?? "是否僅能編輯一次"
          }
          value={isOneTime}
          handleChange={(value) => {
            setIsOneTime(value);
            dispatch(setOrgShareIsOneTime(value));
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <ShareEditRadioGroup
          label={
            wordLibrary?.["is the link set to expire"] ?? "是否設定連結失效"
          }
          value={isDueDate}
          handleChange={(value) => {
            setIsDueDate(value);
            dispatch(setHasDueDate(value));
          }}
        />
      </Grid>
      {isDueDate === "1" && (
        <Grid
          item
          xs={12}
          sx={{ "& .MuiTypography-root": { padding: "6px 0px" } }}
        >
          <ShareEditDatePicker
            label={wordLibrary?.["time limit setting"] ?? "時效設定"}
            value={expiredDate || null}
            handleChange={(dateString) => {
              setExpiredDate(dateString);
              dispatch(setOrgShareExpiredDateString(dateString));
            }}
          />
        </Grid>
      )}
      <Grid item xs={12}>
        <Typography variant="body2" color="primary">
          {wordLibrary?.["cover image/ending image setting"] ??
            "封面圖/結束圖設定"}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <ImageUploadZone
          filePathType={ServiceModuleValue.WELCOME_IMAGE}
          label={
            wordLibrary?.[
              "upload welcome cover image (default image will be used if not uploaded)"
            ] ?? "上傳歡迎封面圖(若無上傳會採用預設圖)"
          }
          uploadFiles={
            welcomeUploadFiles.length > 0
              ? welcomeUploadFiles
              : [welcomeUploadFile?.uploadFilePath || ""]
          }
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2" color="primary">
          {wordLibrary?.["file upload instructions"] ?? "檔案上傳說明"}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FroalaEditor
          filePathType={ServiceModuleValue.WELCOME_IMAGE}
          model={welcomeMessage}
          onModelChange={(model) => {
            setWelcomeMessage(model);
            dispatch(setOrgShareWelcomeMessage(model));
          }}
          config={{
            toolbarSticky: true,
            toolbarButtons:
              toolbarButtons as unknown as Partial<ToolbarButtons>,
            heightMin: 300,
            placeholderText:
              wordLibrary?.["file upload instructions"] ?? "檔案上傳說明",
            quickInsertEnabled: true,
            imageOutputSize: false,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <ImageUploadZone
          filePathType={ServiceModuleValue.FINISH_IMAGE}
          label={
            wordLibrary?.[
              "upload completion cover image (default image will be used if not uploaded)"
            ] ?? "上傳完成封面圖(若無上傳會採用預設圖)"
          }
          uploadFiles={
            finishUploadFiles.length > 0
              ? finishUploadFiles
              : [finishUploadFile?.uploadFilePath || ""]
          }
        />
      </Grid>
      <Grid item xs={12}>
        <FroalaEditor
          filePathType={ServiceModuleValue.FINISH_IMAGE}
          model={finishMessage}
          onModelChange={(model) => {
            setFinishMessage(model);
            dispatch(setOrgShareFinishMessage(model));
          }}
          config={{
            toolbarSticky: true,
            toolbarButtons:
              toolbarButtons as unknown as Partial<ToolbarButtons>,
            heightMin: 300,
            quickInsertEnabled: true,
            imageOutputSize: false,
          }}
        />
      </Grid>
    </Grid>
  );
};

export default React.memo(SettingStep);
