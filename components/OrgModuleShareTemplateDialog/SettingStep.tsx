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
  setOrgShareTemplateTitle,
  setOrgShareTemplateTagList,
  setHasRelativeTime,
  setOrgShareExpireRelativeDay,
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
  getOrgShareTemplateTitle,
  getOrgShareTemplateTagList,
  getWelcomeUploadFile,
  getFinishUploadFile,
} from "redux/createUserInfoFilledUrlDialog/selectors";
import { TextField } from "@mui/material";
import {
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@eGroupAI/material";
import { OrganizationTag, ShareTemplateSearch } from "interfaces/entities";
import TagAutocomplete from "components/TagAutocomplete";
import FroalaEditor from "components/FroalaEditor";
import Typography from "@eGroupAI/material/Typography";
import Grid from "@eGroupAI/material/Grid";
import ImageUploadZone from "./ImageUploadZone";

import ShareEditTextField from "./ShareEditTextField";
import ShareEditRadioGroup from "./ShareEditRadioGroup";
import ShareEditDatePicker from "./ShareEditDatePicker";

interface Props {
  serviceModuleValue: ServiceModuleValue;
  shareTemplateToUpdate?: ShareTemplateSearch;
}

const SettingStep = function (props: Props) {
  const { serviceModuleValue, shareTemplateToUpdate } = props;
  const wordLibrary = useSelector(getWordLibrary);
  const dispatch = useAppDispatch();
  const orgShareEditNeedUpload = useSelector(getOrgShareEditNeedUpload);
  const orgShareIsOneTime = useSelector(getOrgShareIsOneTime);
  const orgShareUploadDescription = useSelector(getOrgShareUploadDescription);
  const orgShareWelcomeMessage = useSelector(getOrgShareWelcomeMessage);
  const orgShareFinishMessage = useSelector(getOrgShareFinishMessage);
  const orgShareExpiredDateString = useSelector(getOrgShareExpiredDateString);
  const hasDueDate = useSelector(getHasDueDate);
  const welcomeUploadFiles = useSelector(getWelcomeUploadFiles);
  const finishUploadFiles = useSelector(getFinishUploadFiles);
  const welcomeUploadFile = useSelector(getWelcomeUploadFile);
  const finishUploadFile = useSelector(getFinishUploadFile);
  const orgShareTemplateTitle = useSelector(getOrgShareTemplateTitle);
  const orgShareTemplateTagList = useSelector(getOrgShareTemplateTagList);

  const [isRelativeTime, setIsRelativeTime] = useState<string>(
    shareTemplateToUpdate?.organizationShareTemplateEndDaysInterval ? "1" : "0"
  );

  const [shareTemplateTitle, setShareTemplateTitle] = useState<string>(
    orgShareTemplateTitle || ""
  );
  const [shareTemplateTagList, setShareTemplateTagList] = useState<
    OrganizationTag[]
  >(orgShareTemplateTagList || []);
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
  const [expiredRelativeDays, setExpiredRelativeDays] = useState<number>(
    shareTemplateToUpdate?.organizationShareTemplateEndDaysInterval || 0
  );
  const [welcomeMessage, setWelcomeMessage] = useState<string>(
    orgShareWelcomeMessage
  );
  const [finishMessage, setFinishMessage] = useState<string>(
    orgShareFinishMessage
  );
  const [isVisited, setIsVisited] = useState<boolean>(false);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body2" color="primary">
          {wordLibrary?.["template name"] ?? "範本名稱"} *
        </Typography>
      </Grid>
      <Grid item xs={12} pb={1}>
        <ShareEditTextField
          value={shareTemplateTitle}
          multiline={false}
          handleChange={(value) => setShareTemplateTitle(value)}
          handleBlur={(value) => {
            dispatch(setOrgShareTemplateTitle(value));
            setIsVisited(true);
          }}
        />
      </Grid>
      {shareTemplateTitle === "" && isVisited === true && (
        <Grid item xs={12}>
          <Typography color="error" variant="body2">
            {wordLibrary?.["this field is required"] ?? "此為必填欄位。"}
          </Typography>
        </Grid>
      )}
      <Grid item xs={12}>
        <Typography variant="body2" color="primary">
          {wordLibrary?.["template tags"] ?? "範本標籤"}
        </Typography>
      </Grid>
      <Grid item xs={12} pb={1}>
        <TagAutocomplete
          value={shareTemplateTagList}
          serviceModuleValue={serviceModuleValue}
          onChange={(e, value) => {
            setShareTemplateTagList(value);
          }}
          onBlur={(value) => dispatch(setOrgShareTemplateTagList(value))}
        />
      </Grid>
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
        <Grid item xs={12}>
          <Grid item xs={12}>
            <Typography variant="body2" color="primary">
              Upload Instructions
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <FroalaEditor
              filePathType={ServiceModuleValue.WELCOME_IMAGE}
              model={uploadDescription}
              onModelChange={(model) => {
                setUploadDescription(model);
              }}
              config={{
                toolbarSticky: true,
                heightMin: 300,
                quickInsertEnabled: false,
                imageOutputSize: false,
              }}
              onBlur={() => {
                dispatch(setOrgShareUploadDescription(uploadDescription));
              }}
            />
          </Grid>
        </Grid>
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
          <>
            <FormControl>
              <FormLabel>
                {wordLibrary?.["choose the expiration mode"] ?? "選擇過期模式"}
              </FormLabel>
              <RadioGroup
                row
                value={isRelativeTime}
                onChange={(e) => {
                  setIsRelativeTime(e.target.value);
                  dispatch(setHasRelativeTime(e.target.value));
                }}
              >
                {[
                  {
                    label: wordLibrary?.["Absolute Time"] ?? "絕對時間",
                    value: "0",
                  },
                  {
                    label: wordLibrary?.["Relative Time"] ?? "相對時間",
                    value: "1",
                  },
                ].map((o) => (
                  <FormControlLabel
                    key={o.value}
                    control={<Radio />}
                    value={o.value}
                    label={o.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            {isRelativeTime === "0" ? (
              <ShareEditDatePicker
                label={wordLibrary?.["time limit setting"] ?? "時效設定"}
                value={expiredDate || null}
                handleChange={(dateString) => {
                  setExpiredDate(dateString);
                  dispatch(setOrgShareExpiredDateString(dateString));
                }}
              />
            ) : (
              <Grid item xs={6}>
                <TextField
                  sx={{ marginY: "5px" }}
                  fullWidth
                  name="organizationShareTemplateEndDaysInterval"
                  onChange={(e) => {
                    setExpiredRelativeDays(+e.target.value);
                    dispatch(setOrgShareExpireRelativeDay(+e.target.value));
                  }}
                  value={expiredRelativeDays}
                  type="number"
                  label={wordLibrary?.["day limit setting"] ?? "天數限制設定"}
                  variant="outlined"
                />
              </Grid>
            )}
          </>
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
          歡迎頁描述
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FroalaEditor
          filePathType={ServiceModuleValue.WELCOME_IMAGE}
          model={welcomeMessage}
          onModelChange={(model) => {
            setWelcomeMessage(model);
          }}
          config={{
            toolbarSticky: true,
            heightMin: 300,
            quickInsertEnabled: false,
            imageOutputSize: false,
          }}
          onBlur={() => {
            dispatch(setOrgShareWelcomeMessage(welcomeMessage));
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
        <Typography variant="body2" color="primary">
          結束頁描述
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FroalaEditor
          filePathType={ServiceModuleValue.FINISH_IMAGE}
          model={finishMessage}
          onModelChange={(model) => {
            setFinishMessage(model);
          }}
          config={{
            toolbarSticky: true,
            heightMin: 300,
            quickInsertEnabled: true,
            imageOutputSize: false,
          }}
          onBlur={() => {
            dispatch(setOrgShareFinishMessage(finishMessage));
          }}
        />
      </Grid>
    </Grid>
  );
};

export default React.memo(SettingStep);
