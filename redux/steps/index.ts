/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type StepProps = {
  activeStep?: number;
  finalStep?: number;
};

export type StepsStates = {
  [name: string]: StepProps;
};

const initialState: StepsStates = {};

const stepsSlice = createSlice({
  name: "steps",
  initialState,
  reducers: {
    initializeSteps(state, action: PayloadAction<string>) {
      if (!state[action.payload]) {
        state[action.payload] = {
          activeStep: 0,
        };
      }
    },
    setActiveStep(
      state,
      action: PayloadAction<{
        name: string;
        activeStep: number;
      }>
    ) {
      const { name, activeStep } = action.payload;
      state[name] = {
        ...state[name],
        activeStep,
      };
    },
    setFinalStep(
      state,
      action: PayloadAction<{
        name: string;
        finalStep: number;
      }>
    ) {
      const { name, finalStep } = action.payload;
      state[name] = {
        ...state[name],
        finalStep,
      };
    },
  },
});

export const { initializeSteps, setActiveStep, setFinalStep } =
  stepsSlice.actions;
export default stepsSlice.reducer;
