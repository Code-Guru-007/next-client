import { useEffect } from "react";

interface CallMethodIfCtrlS {
  (): void;
}

const useCtrlS = (callMethodIfCtrlS: CallMethodIfCtrlS) => {
  useEffect(() => {
    // check if the key is "s" with ctrl key or command key
    const keyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey && event.key === "s") ||
        (event.metaKey && event.key === "s")
      ) {
        event.preventDefault();
        // call our callback method
        callMethodIfCtrlS();
      }
    };

    // listen to keydown events
    document.addEventListener("keydown", keyDown);

    // stop listening on component destroy
    return () => {
      document.removeEventListener("keydown", keyDown);
    };
  }, [callMethodIfCtrlS]);
};

export default useCtrlS;
