import { Dispatch, SetStateAction, useEffect } from "react";

export type SetFormIsBusy = Dispatch<SetStateAction<boolean>>;

type Arguments = {
  setFormIsBusy?: SetFormIsBusy;
  isBusy: boolean;
};

export default function useSetFormIsBusy({ setFormIsBusy, isBusy }: Arguments) {
  useEffect(() => {
    if (setFormIsBusy) {
      setFormIsBusy(isBusy);
    }
    return () => {
      if (setFormIsBusy) {
        setFormIsBusy(false);
      }
    };
  }, [setFormIsBusy, isBusy]);
}
