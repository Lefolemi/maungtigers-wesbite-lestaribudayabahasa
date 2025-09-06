// src/components/cerita/useCeritaDraftManager.ts
import { useEffect, useRef } from "react";

export function useCeritaDraftManager<T>(
  key: string,
  draft: T,
  onRestore: (draft: T) => void
) {
  const hasRestored = useRef(false);

  // 🔹 1. On mount → check if draft exists and maybe restore
  useEffect(() => {
    if (hasRestored.current) return;

    const saved = localStorage.getItem(key);
    console.log(`[CeritaDraftManager] Checking localStorage for key="${key}"`, saved);

    if (saved) {
      let parsed: any = saved;

      try {
        parsed = JSON.parse(saved);
      } catch {
        parsed = saved;
      }

      console.log("[CeritaDraftManager] Parsed saved draft:", parsed);

      if (parsed && confirm("Lanjutkan dari draft terakhir?")) {
        console.log("[CeritaDraftManager] Restoring draft...");
        onRestore(parsed);
      } else {
        console.log("[CeritaDraftManager] User declined restore, removing draft");
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
      console.log("[CeritaDraftManager] Draft empty, skipping save");
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(draft));
      console.log("[CeritaDraftManager] Saved draft:", draft);
    } catch {
      localStorage.setItem(key, String(draft));
      console.log("[CeritaDraftManager] Saved draft (raw):", draft);
    }
  }, [key, draft]);

  function clearDraft() {
    console.log(`[CeritaDraftManager] Clearing draft for key="${key}"`);
    localStorage.removeItem(key);
  }

  return { clearDraft };
}