/* eslint-disable no-param-reassign */
import { OrganizationMember } from "@eGroupAI/typings/apis";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { addDays, endOfDay, startOfDay } from "date-fns";
import {
  OrganizationPartner,
  OrganizationTag,
  OrganizationUser,
  UploadFile,
} from "interfaces/entities";
import { DynamicColumnTargetApiPayload } from "interfaces/payloads";

export type Payload = {
  name:
    | "organizationEventTitle"
    | "organizationEventAddress"
    | "organizationEventStartDate"
    | "organizationEventEndDate"
    | "organizationEventDescription";
  value: string;
};

export type InitialState = {
  values: {
    organizationEventTitle?: string;
    organizationEventAddress?: string;
    organizationEventDescription?: string;
    organizationEventStartDate?: string | null;
    organizationEventEndDate?: string | null;
    uploadFileList?: UploadFile[];
    organizationMemberList?: OrganizationMember[];
    organizationTagList?: OrganizationTag[];
    organizationUserList?: OrganizationUser[];
    organizationPartnerList?: OrganizationPartner[];
    dynamicColumnTargetList?: DynamicColumnTargetApiPayload[];
  };
  states: {
    isDirty: boolean;
  };
};

export type WithStates = {
  states?: InitialState["states"];
};

export const initialState: InitialState = {
  values: {
    organizationEventTitle: "",
    organizationEventAddress: "",
    organizationEventStartDate: startOfDay(new Date()).toISOString(),
    organizationEventEndDate: addDays(
      endOfDay(new Date()).setMilliseconds(0),
      1
    ).toISOString(),
    uploadFileList: [],
    organizationMemberList: [],
    organizationTagList: [],
    organizationUserList: [],
    organizationPartnerList: [],
    dynamicColumnTargetList: [],
  },
  states: {
    isDirty: false,
  },
};

const slice = createSlice({
  name: "eventDialog",
  initialState,
  reducers: {
    setValue(state, action: PayloadAction<Payload & WithStates>) {
      state.values[action.payload.name] = action.payload.value;
      state.states = {
        ...state.states,
        ...action.payload.states,
      };
    },
    setDynamicColumnTargetList(
      state,
      action: PayloadAction<
        {
          dynamicColumnTargetList?: DynamicColumnTargetApiPayload[];
        } & WithStates
      >
    ) {
      state.values.dynamicColumnTargetList =
        action.payload.dynamicColumnTargetList;
      state.states = { ...state.states, ...action.payload.states };
    },
    setFiles(
      state,
      action: PayloadAction<
        {
          uploadFileList: UploadFile[];
        } & WithStates
      >
    ) {
      state.values.uploadFileList = action.payload.uploadFileList;
      state.states = {
        ...state.states,
        ...action.payload.states,
      };
    },
    removeFile(
      state,
      action: PayloadAction<
        {
          uploadFileId: string;
        } & WithStates
      >
    ) {
      state.values.uploadFileList = state.values.uploadFileList?.filter(
        (c) => c.uploadFileId !== action.payload.uploadFileId
      );
      state.states = {
        ...state.states,
        ...action.payload.states,
      };
    },
    setMembers(
      state,
      action: PayloadAction<
        {
          orgMemberList: OrganizationMember[];
        } & WithStates
      >
    ) {
      state.values.organizationMemberList = action.payload.orgMemberList;
      state.states = {
        ...state.states,
        ...action.payload.states,
      };
    },
    removeMember(
      state,
      action: PayloadAction<
        {
          loginId: string;
        } & WithStates
      >
    ) {
      state.values.organizationMemberList =
        state.values.organizationMemberList?.filter(
          (el) => el.member.loginId !== action.payload.loginId
        );
      state.states = {
        ...state.states,
        ...action.payload.states,
      };
    },
    setTags(
      state,
      action: PayloadAction<
        {
          orgTagList: OrganizationTag[];
        } & WithStates
      >
    ) {
      state.values.organizationTagList = action.payload.orgTagList;
      state.states = {
        ...state.states,
        ...action.payload.states,
      };
    },
    setUsers(
      state,
      action: PayloadAction<
        {
          orgUserList: OrganizationUser[];
        } & WithStates
      >
    ) {
      state.values.organizationUserList = action.payload.orgUserList;
      state.states = {
        ...state.states,
        ...action.payload.states,
      };
    },
    removeUser(
      state,
      action: PayloadAction<
        {
          orgUserId: string;
        } & WithStates
      >
    ) {
      state.values.organizationUserList =
        state.values.organizationUserList?.filter(
          (el) => el.organizationUserId !== action.payload.orgUserId
        );
      state.states = {
        ...state.states,
        ...action.payload.states,
      };
    },
    setPartners(
      state,
      action: PayloadAction<
        {
          orgPartnerList: OrganizationPartner[];
        } & WithStates
      >
    ) {
      state.values.organizationPartnerList = action.payload.orgPartnerList;
      state.states = {
        ...state.states,
        ...action.payload.states,
      };
    },
    removePartner(
      state,
      action: PayloadAction<
        {
          orgPartnerId: string;
        } & WithStates
      >
    ) {
      state.values.organizationPartnerList =
        state.values.organizationPartnerList?.filter(
          (el) => el.organizationPartnerId !== action.payload.orgPartnerId
        );
      state.states = {
        ...state.states,
        ...action.payload.states,
      };
    },

    setValues(state, action: PayloadAction<InitialState["values"]>) {
      state.values = action.payload;
    },
    setStates(
      state,
      action: PayloadAction<{
        [key in keyof InitialState["states"]]?: boolean;
      }>
    ) {
      state.states = {
        ...state.states,
        ...action.payload,
      };
    },
  },
});

export const {
  setValue,
  setDynamicColumnTargetList,
  setFiles,
  setMembers,
  setTags,
  setUsers,
  setPartners,
  removeFile,
  removeMember,
  removeUser,
  removePartner,
  setValues,
  setStates,
} = slice.actions;
export default slice.reducer;
