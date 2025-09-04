// src/routes/artikel/DebugOwnership.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabase";
import { useUserSession } from "../../backend/context/UserSessionContext";

export default function DebugOwnership() {
  const { user } = useUserSession();
  const [article, setArticle] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const SLUG = "test-artikel-3";

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("artikel")
        .select(`user_id, judul, slug, thumbnail`)
        .eq("slug", SLUG)
        .maybeSingle();

      console.log("[DebugOwnership] raw fetch:", { data, error });
      if (error) setError(String(error));
      setArticle(data ?? null);
      setLoading(false);
    })();
  }, []);

  const isOwner =
    article && user ? String(article.user_id) === String(user.user_id) : null;

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">Debug: Ownership Check</h2>

      <div className="mt-4">
        <strong>Slug checked:</strong> {SLUG}
      </div>

      <div className="mt-3">
        <strong>Current session user (from UserSessionContext):</strong>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {user ? JSON.stringify(user, null, 2) : "No user session (null)"}
        </pre>
      </div>

      <div className="mt-3">
        <strong>Fetched artikel row:</strong>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {article ? JSON.stringify(article, null, 2) : "No article returned"}
        </pre>
      </div>

      <div className="mt-3">
        <strong>Comparison result:</strong>
        <div>
          {article && user ? (
            <>
              <div>article.user_id: {String(article.user_id)}</div>
              <div>session.user_id: {String(user.user_id)}</div>
              <div>
                match: <b>{isOwner ? "YES (owner)" : "NO (not owner)"}</b>
              </div>
            </>
          ) : (
            <div>Comparison pending — ensure both article and session exist.</div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 text-red-600">
          <strong>Fetch error:</strong> {error}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        Check the browser console for the raw Supabase response as well.
      </div>
    </div>
  );
}