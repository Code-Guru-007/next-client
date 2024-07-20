/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  OrganizationTag,
  UploadFile,
  Organization as DefaultOrganization,
} from "interfaces/entities";
import { DynamicColumnTargetApiPayload } from "interfaces/payloads";

export interface Organization extends Omit<DefaultOrganization, "creator"> {
  creator: {
    loginId: string;
    memberCreateDate: string;
    memberUpdateDate: string;
    memberAccount: string;
    memberName: string;
    memberEmail: string;
    memberGoogleId: string;
    googleCalendarRefreshToken: string;
    loginCheck: boolean;
    organizationMemberCheck: boolean;
  };
  organizationId: string;
  organizationCreateDate: string;
  organizationUpdateDate: string;
  organizationName: string;
  organizationCountry: string;
  organizationCity: string;
  organizationArea: string;
  organizationZIPCode: string;
  organizationAddress: string;
  organizationWebsite: string;
  organizationFacebookUrl: string;
  organizationYoutubeUrl: string;
  organizationInvoiceTaxIdNumber: string;
  organizationTelephone: string;
  organizationEmail: string;
  googleDelegatedAccount: string;
}

export type Payload = {
  bulletinId?: string;
  bulletinTitle?: string;
  isRelease?: number;
  bulletinStartDate?: string;
  bulletinEndDate?: string;
  creator?: {
    loginId: string;
    loginCheck: boolean;
    organizationMemberCheck: boolean;
  };
  organization?: Organization;
  organizationTagList?: OrganizationTag[];
};

export type InitialState = {
  values: {
    bulletinId?: string;
    bulletinTitle?: string;
    bulletinContent?: string;
    isRelease?: number;
    bulletinStartDate?: string;
    bulletinEndDate?: string;
    uploadFileList?: UploadFile[];
    organizationTagList?: OrganizationTag[];
    dynamicColumnTargetList?: DynamicColumnTargetApiPayload[];
    creator?: {
      loginId: string;
      loginCheck: boolean;
      organizationMemberCheck: boolean;
    };
    organization?: Organization;
  };
};

export const initialState: InitialState = {
  values: {
    bulletinId: "",
    bulletinTitle: "",
    bulletinContent: "",
    isRelease: 0,
    bulletinStartDate: "",
    bulletinEndDate: "",
  },
};

const slice = createSlice({
  name: "createBulletin",
  initialState,
  reducers: {
    setBulletin(state, action: PayloadAction<Payload>) {
      state.values = action.payload;
    },
  },
});

export const { setBulletin } = slice.actions;
export default slice.reducer;
