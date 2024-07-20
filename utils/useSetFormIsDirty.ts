import { Dispatch, SetStateAction, useEffect } from "react";

export type SetFormIsDirty = Dispatch<SetStateAction<boolean>>;

type Arguments = {
  setFormIsDirty?: SetFormIsDirty;
  isDirty: boolean;
};

export default function useSetFormIsDirty({
  setFormIsDirty,
  isDirty,
}: Arguments) {
  useEffect(() => {
    if (setFormIsDirty) {
      setFormIsDirty(isDirty);
    }
    return () => {
      if (setFormIsDirty) {
        setFormIsDirty(false);
      }
    };
  }, [setFormIsDirty, isDirty]);
}
