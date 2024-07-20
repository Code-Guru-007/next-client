import { RootState } from "../root";

export const getOrgShareEditList = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.values.orgShareEditList;
export const getOrgFinanceTemplateList = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.values.orgFinanceTemplateList;
export const getUploadFileTargetList = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.values.uploadFileTargetList;
export const getOrgShareEditNeedUpload = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.values.orgShareEditNeedUpload;
export const getOrgShareIsOneTime = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.values.orgShareIsOneTime;
export const getOrgShareUploadDescription = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.values.orgShareUploadDescription;
export const getOrgShareWelcomeMessage = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.values.orgShareWelcomeMessage;
export const getWelcomeUploadFileId = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.values.welcomeUploadFileId;
export const getOrgShareFinishMessage = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.values.orgShareFinishMessage;
export const getFinishUploadFileId = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.values.finishUploadFileId;
export const getOrgShareExpiredDateString = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.values.orgShareExpiredDateString;
export const getOrgShareExpireRelativeDay = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.values.orgShareExpireRelativeDay;
export const getOrgShare = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.states.orgShare;
export const getHasDueDate = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.states.hasDueDate;
export const getHasRelativeTime = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.states.hasRelativeTime;
export const getWelcomeUploadFile = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.states.welcomeUploadFile;
export const getFinishUploadFile = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.states.finishUploadFile;
export const getWelcomeUploadFiles = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.values.welcomeUploadFiles;
export const getFinishUploadFiles = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.values.finishUploadFiles;
export const getIsFileUploading = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.states.isFileUploading.filter(Boolean)
    .length > 0;

export const getOrgShareTemplateTitle = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.values.orgShareTemplateTitle;

export const getOrgShareTemplateTagList = (state: RootState) =>
  state.createUserInfoFilledUrlDialog.values.orgShareTemplateTagList;
