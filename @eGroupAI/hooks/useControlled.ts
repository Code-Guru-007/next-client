import {
  useRef,
  useState,
  useCallback,
  SetStateAction,
  useEffect,
} from "react";

type NonUndefinedable<T> = T extends undefined ? never : T;

export type UseControlledArgs<Value> = {
  controlled: Value;
  default: NonUndefinedable<Value>;
  useForcedUnControlled?: boolean;
};

export default function useControlled<Value = unknown>({
  controlled: controlledProp,
  default: defaultProp,
  useForcedUnControlled,
}: UseControlledArgs<Value>): [
  NonUndefinedable<Value>,
  (newValue: SetStateAction<NonUndefinedable<Value>>) => void
] {
  const { current: isControlled } = useRef(controlledProp !== undefined);
  const [valueState, setValue] = useState(defaultProp);

  let value: unknown;
  if (useForcedUnControlled) {
    value = valueState;
  } else if (isControlled) {
    value = controlledProp;
  } else {
    value = valueState;
  }
  const setValueIfUncontrolled = useCallback(
    (newValue: SetStateAction<NonUndefinedable<Value>>) => {
      if (useForcedUnControlled || !isControlled) {
        setValue(newValue);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (
      useForcedUnControlled !== undefined &&
      useForcedUnControlled === false &&
      isControlled &&
      controlledProp
    ) {
      setValue(controlledProp as SetStateAction<NonUndefinedable<Value>>);
    }
  }, [isControlled, useForcedUnControlled, controlledProp]);

  return [value as NonUndefinedable<Value>, setValueIfUncontrolled];
}
