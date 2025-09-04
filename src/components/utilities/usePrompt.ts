import { useCallback, useEffect } from "react";
import { useBeforeUnload, useBlocker } from "react-router-dom";

export function usePrompt(message: string, when: boolean = true) {
  // Block internal navigation
  const blocker = useBlocker(when);

  useEffect(() => {
    if (blocker.state === "blocked") {
      const confirmLeave = window.confirm(message);
      if (confirmLeave) {
        blocker.proceed(); // allow
      } else {
        blocker.reset();   // stay
      }
    }
  }, [blocker, message]);

  // Block tab close / refresh
  useBeforeUnload(
    useCallback(
      (event: BeforeUnloadEvent) => {
        if (when) {
          event.preventDefault();
          event.returnValue = message;
        }
      },
      [when, message]
    )
  );
}