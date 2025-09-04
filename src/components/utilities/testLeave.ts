import { useBlocker } from "react-router-dom";

export function useWarnOnLeave() {
    useBlocker(() => {
    return window.confirm("You have unsaved changes. Do you really want to leave?");
  });
}