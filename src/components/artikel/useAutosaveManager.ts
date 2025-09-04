import { useEffect, useRef } from "react";

export function useDraftManager<T>(
  key: string,
  draft: T,
  onRestore: (draft: T) => void
) {
  const hasRestored = useRef(false);

  // 🔹 1. On mount → check if draft exists and maybe restore
  useEffect(() => {
    if (hasRestored.current) return;

    const saved = localStorage.getItem(key);
    console.log(`[DraftManager] Checking localStorage for key="${key}"`, saved);

    if (saved) {
      let parsed: any = saved;

      try {
        parsed = JSON.parse(saved);
      } catch {
        parsed = saved;
      }

      console.log("[DraftManager] Parsed saved draft:", parsed);

      if (parsed && confirm("Continue from last saved draft?")) {
        console.log("[DraftManager] Restoring draft...");
        onRestore(parsed);
      } else {
        console.log("[DraftManager] User declined restore, removing draft");
        localStorage.removeItem(key);
      }
    }
    hasRestored.current = true;
  }, [key, onRestore]);

  // 🔹 2. Save silently on change
  useEffect(() => {
    if (!hasRestored.current) return;
    if (draft === undefined || draft === null) return;

    if (typeof draft === "object" && Object.values(draft).every((v) => !v)) {
      console.log("[DraftManager] Draft empty, skipping save");
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(draft));
      console.log("[DraftManager] Saved draft:", draft);
    } catch {
      localStorage.setItem(key, String(draft));
      console.log("[DraftManager] Saved draft (raw):", draft);
    }
  }, [key, draft]);

  function clearDraft() {
    console.log(`[DraftManager] Clearing draft for key="${key}"`);
    localStorage.removeItem(key);
  }

  return { clearDraft };
}