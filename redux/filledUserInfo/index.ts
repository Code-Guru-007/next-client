/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RemarkValues, Values } from "components/DynamicField/types";
import { UploadFile } from "interfaces/entities";
import { OrganizationFinanceType } from "interfaces/utils";

type FinanceColumn = {
  organizationFinanceColumnId?: string;
  organizationFinanceColumnName?: string;
  organizationFinanceType: OrganizationFinanceType;
  organizationFinanceTemplate: {
    organizationFinanceTemplateId?: string;
  };
  organizationFinanceTarget: {
    organizationFinanceTargetAmount: number;
    organizationFinanceTargetInsertDate: string;
    organizationTagList: {
      tagId: string;
    }[];
  };
};

export type FilledUserInfoStates = {
  values: {
    userValues: Values;
    remarkValues: RemarkValues;
    columnTargetValues: RemarkValues;
    agreementFileList: string[];
    userFileList: UploadFile[];
    finances: {
      [organizationFinanceTemplateId: string]: {
        organizationFinanceColumnList: FinanceColumn[];
      };
    };
  };
  ui: {
    start: boolean;
    success: boolean;
  };
};

export const initialState: FilledUserInfoStates = {
  values: {
    userValues: {},
    remarkValues: {},
    columnTargetValues: {},
    agreementFileList: [],
    userFileList: [],
    finances: {},
  },
  ui: {
    start: false,
    success: false,
  },
};

const filledUserInfoSlice = createSlice({
  name: "filledUserInfo",
  initialState,
  reducers: {
    setDefaultValues() {
      return initialState;
    },
    setStart(state, action: PayloadAction<boolean>) {
      state.ui.start = action.payload;
    },
    setSuccess(state, action: PayloadAction<boolean>) {
      state.ui.success = action.payload;
    },
    setAgreementFile(state, action: PayloadAction<string>) {
      const currentIndex = state.values.agreementFileList.findIndex(
        (el) => el === action.payload
      );
      const next = [...state.values.agreementFileList];

      if (currentIndex === -1) {
        next.push(action.payload);
      } else {
        next.splice(currentIndex, 1);
      }
      state.values.agreementFileList = next;
    },
    setAgreementFileList(state, action: PayloadAction<string[]>) {
      state.values.agreementFileList = action.payload;
    },
    setUserFileList(
      state,
      action: PayloadAction<FilledUserInfoStates["values"]["userFileList"]>
    ) {
      state.values.userFileList = action.payload;
    },
    setFinances(
      state,
      action: PayloadAction<FilledUserInfoStates["values"]["finances"]>
    ) {
      state.values.finances = action.payload;
    },
    setUserValues(
      state,
      action: PayloadAction<FilledUserInfoStates["values"]["userValues"]>
    ) {
      state.values.userValues = {
        ...state.values.userValues,
        ...action.payload,
      };
    },
    setUserRemarkValues(
      state,
      action: PayloadAction<FilledUserInfoStates["values"]["remarkValues"]>
    ) {
      state.values.remarkValues = action.payload;
    },
    setUserColumnTargetValues(
      state,
      action: PayloadAction<
        FilledUserInfoStates["values"]["columnTargetValues"]
      >
    ) {
      state.values.columnTargetValues = action.payload;
    },
    setFinanceColumnList(
      state,
      action: PayloadAction<{
        organizationFinanceTemplateId: string;
        columns: FinanceColumn[];
      }>
    ) {
      const { organizationFinanceTemplateId, columns } = action.payload;
      state.values.finances[organizationFinanceTemplateId] = {
        organizationFinanceColumnList: columns,
      };
    },
  },
});

export const {
  setDefaultValues,
  setStart,
  setSuccess,
  setAgreementFile,
  setAgreementFileList,
  setUserValues,
  setUserRemarkValues,
  setUserColumnTargetValues,
  setUserFileList,
  setFinances,
  setFinanceColumnList,
} = filledUserInfoSlice.actions;
export default filledUserInfoSlice.reducer;
