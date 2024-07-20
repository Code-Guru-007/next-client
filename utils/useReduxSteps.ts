import { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "redux/configureAppStore";
import { RootState } from "redux/root";
import {
  initializeSteps,
  setActiveStep as setReduxActiveStep,
  setFinalStep as setReduxFinalStep,
  StepProps,
} from "redux/steps";
import { getStepStates } from "redux/steps/selectors";

export default function useReduxSteps(
  name: string,
  shouldSetDefault?: boolean
) {
  const dispatch = useAppDispatch();
  const states = useSelector<RootState, StepProps>((state) => ({
    ...getStepStates(state, name),
  }));

  useEffect(() => {
    dispatch(initializeSteps(name));
  }, [dispatch, name]);

  useEffect(() => {
    if (shouldSetDefault) {
      dispatch(
        setReduxActiveStep({
          name,
          activeStep: 0,
        })
      );
    }
  }, [dispatch, name, shouldSetDefault]);

  const setActiveStep = useCallback(
    (step: number) => {
      dispatch(
        setReduxActiveStep({
          name,
          activeStep: step,
        })
      );
    },
    [dispatch, name]
  );
  const setFinalStep = useCallback(
    (step: number) => {
      if (
        typeof states.finalStep === "undefined" ||
        states.finalStep !== step
      ) {
        dispatch(
          setReduxFinalStep({
            name,
            finalStep: step,
          })
        );
      }
    },
    [dispatch, name, states.finalStep]
  );

  return {
    setActiveStep,
    setFinalStep,
    ...states,
  };
}
