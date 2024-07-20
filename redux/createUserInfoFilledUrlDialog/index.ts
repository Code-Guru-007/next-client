/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  OrganizationShareEdit,
  OrganizationShare,
  OrganizationFinanceTemplate,
  UploadFile,
  OrganizationTag,
} from "interfaces/entities";
import { endOfDay, addDays } from "date-fns";

type InitialState = {
  values: {
    orgShareTemplateTitle?: string;
    orgShareTemplateTagList?: OrganizationTag[];
    orgShareEditList: OrganizationShareEdit[];
    orgFinanceTemplateList: OrganizationFinanceTemplate[];
    uploadFileTargetList: {
      uploadFile: {
        uploadFileId: string;
      };
    }[];
    orgShareEditNeedUpload: string;
    orgShareIsOneTime: string;
    orgShareUploadDescription: string;
    orgShareWelcomeMessage: string;
    orgShareFinishMessage: string;
    orgShareExpiredDateString?: string;
    orgShareExpireRelativeDay?: number;
    welcomeUploadFiles: File[];
    finishUploadFiles: File[];
    welcomeUploadFileId: string;
    finishUploadFileId: string;
  };
  states: {
    orgShare?: OrganizationShare;
    hasDueDate: string;
    hasRelativeTime: string;
    isFileUploading: boolean[];
    welcomeUploadFile?: UploadFile;
    finishUploadFile?: UploadFile;
  };
};

const initialState: InitialState = {
  values: {
    orgShareTemplateTitle: "",
    orgShareTemplateTagList: [],
    orgShareEditList: [],
    orgFinanceTemplateList: [],
    uploadFileTargetList: [],
    orgShareEditNeedUpload: "0",
    orgShareIsOneTime: "1",
    orgShareUploadDescription: "",
    orgShareWelcomeMessage: "",
    orgShareFinishMessage: "",
    welcomeUploadFileId: "",
    finishUploadFileId: "",
    welcomeUploadFiles: [],
    finishUploadFiles: [],
    orgShareExpiredDateString: addDays(
      endOfDay(new Date()).setMilliseconds(0),
      1
    ).toISOString(),
    orgShareExpireRelativeDay: undefined,
  },
  states: {
    hasDueDate: "1",
    hasRelativeTime: "0",
    isFileUploading: [],
  },
};

const slice = createSlice({
  name: "createUserInfoFilledUrlDialog",
  initialState,
  reducers: {
    initializeOrgShareValues(state) {
      state.values = initialState.values;
      state.states = initialState.states;
    },
    setOrgShareValues(
      state,
      action: PayloadAction<Pick<InitialState, "values">>
    ) {
      if (action) {
        state.values = action.payload.values;
      }
    },
    setOrgShareTemplateTitle(state, action: PayloadAction<string>) {
      state.values.orgShareTemplateTitle = action.payload;
    },
    setOrgShareTemplateTagList(
      state,
      action: PayloadAction<OrganizationTag[]>
    ) {
      state.values.orgShareTemplateTagList = action.payload;
    },
    setOrgShareEdits(state, action: PayloadAction<OrganizationShareEdit[]>) {
      state.values.orgShareEditList = action.payload;
    },
    setOrgFinanceTemplates(
      state,
      action: PayloadAction<OrganizationFinanceTemplate[]>
    ) {
      state.values.orgFinanceTemplateList = action.payload;
    },
    setUploadFileTargets(
      state,
      action: PayloadAction<
        {
          uploadFile: {
            uploadFileId: string;
          };
        }[]
      >
    ) {
      state.values.uploadFileTargetList = action.payload;
    },
    setOrgShareEditNeedUpload(state, action: PayloadAction<string>) {
      state.values.orgShareEditNeedUpload = action.payload;
    },
    setOrgShareIsOneTime(state, action: PayloadAction<string>) {
      state.values.orgShareIsOneTime = action.payload;
    },
    setOrgShareUploadDescription(state, action: PayloadAction<string>) {
      state.values.orgShareUploadDescription = action.payload;
    },
    setOrgShareWelcomeMessage(state, action: PayloadAction<string>) {
      state.values.orgShareWelcomeMessage = action.payload;
    },
    setWelcomeUploadFileId(state, action: PayloadAction<string>) {
      state.values.welcomeUploadFileId = action.payload;
    },
    setOrgShareFinishMessage(state, action: PayloadAction<string>) {
      state.values.orgShareFinishMessage = action.payload;
    },
    setFinishUploadFileId(state, action: PayloadAction<string>) {
      state.values.finishUploadFileId = action.payload;
    },
    setOrgShareExpiredDateString(
      state,
      action: PayloadAction<string | undefined>
    ) {
      state.values.orgShareExpiredDateString = action.payload;
    },
    setOrgShareExpireRelativeDay(
      state,
      action: PayloadAction<number | undefined>
    ) {
      state.values.orgShareExpireRelativeDay = action.payload;
    },
    setOrgShare(state, action: PayloadAction<OrganizationShare>) {
      state.states.orgShare = action.payload;
    },
    setHasDueDate(state, action: PayloadAction<string>) {
      state.states.hasDueDate = action.payload;
    },
    setHasRelativeTime(state, action: PayloadAction<string>) {
      state.states.hasRelativeTime = action.payload;
    },
    setWelcomeUploadFile(state, action: PayloadAction<UploadFile>) {
      state.states.welcomeUploadFile = action.payload;
    },
    setFinishUploadFile(state, action: PayloadAction<UploadFile>) {
      state.states.finishUploadFile = action.payload;
    },
    setWelcomeUploadFiles(state, action: PayloadAction<File[]>) {
      state.values.welcomeUploadFiles = action.payload;
    },
    setFinishUploadFiles(state, action: PayloadAction<File[]>) {
      state.values.finishUploadFiles = action.payload;
    },
    setIsFileUploading(
      state,
      action: PayloadAction<{
        value: boolean;
        index: number;
      }>
    ) {
      const { value, index } = action.payload;
      state.states.isFileUploading[index] = value;
    },
  },
});

export const {
  initializeOrgShareValues,
  setOrgShareValues,
  setOrgShareTemplateTitle,
  setOrgShareTemplateTagList,
  setOrgShareEdits,
  setOrgFinanceTemplates,
  setUploadFileTargets,
  setOrgShareEditNeedUpload,
  setOrgShareIsOneTime,
  setOrgShareUploadDescription,
  setOrgShareWelcomeMessage,
  setOrgShareFinishMessage,
  setOrgShareExpiredDateString,
  setOrgShareExpireRelativeDay,
  setOrgShare,
  setWelcomeUploadFileId,
  setFinishUploadFileId,
  setHasDueDate,
  setHasRelativeTime,
  setIsFileUploading,
  setWelcomeUploadFile,
  setFinishUploadFile,
  setWelcomeUploadFiles,
  setFinishUploadFiles,
} = slice.actions;
export default slice.reducer;
