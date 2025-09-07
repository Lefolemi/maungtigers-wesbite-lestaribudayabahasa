// src/routes/kontribusi/EditKamus.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../backend/supabase";
import { useUserSession } from "../../backend/context/UserSessionContext";

type KamusRow = {
  kata_id: number; // review_id
  kata: string;
  arti: string;
  contoh: string;
};

export default function EditKamus() {
  const { user } = useUserSession();
  const [searchParams] = useSearchParams();
  const bahasaIdParam = searchParams.get("bahasaId");
  const bahasaId = bahasaIdParam ? Number(bahasaIdParam) : null;

  const [rows, setRows] = useState<KamusRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  // Fetch user submissions for this language
  useEffect(() => {
    if (!bahasaId || !user) return;

    async function loadKamus() {
      setLoading(true);
      const { data, error } = await supabase
        .from("kamus_review")
        .select("review_id, kata, arti, contoh")
        .eq("user_id", user?.user_id)
        .eq("bahasa_id", bahasaId)
        .order("tanggal_dibuat", { ascending: false });

      if (error) {
        console.error(error);
        setRows([]);
        setWarning("❌ Gagal load kontribusi");
      } else if (data) {
        const safeRows: KamusRow[] = (data as any[]).map((r) => ({
          kata_id: r.review_id,
          kata: r.kata,
          arti: r.arti,
          contoh: r.contoh,
        }));
        setRows(safeRows);
        setWarning(null);
      }
      setLoading(false);
    }

    loadKamus();
  }, [bahasaId, user]);

  const handleChangeRow = (index: number, field: keyof KamusRow, value: string) => {
    const newRows = [...rows];
    (newRows[index] as any)[field] = value; // ✅ fix TypeScript never error
    setRows(newRows);
  };

  const handleSubmit = async () => {
    if (!user || !bahasaId) {
      setWarning("User atau bahasa tidak valid!");
      return;
    }
    if (rows.length === 0) {
      setWarning("Tidak ada kata untuk disubmit!");
      return;
    }

    setSubmitting(true);
    try {
      // Upsert each row with status "direview" and include user_id & bahasa_id
      const updates = rows.map((r) => ({
        review_id: r.kata_id,
        kata: r.kata,
        arti: r.arti,
        contoh: r.contoh,
        status: "direview",
        tanggal_dibuat: new Date().toISOString(),
        user_id: user.user_id, // ✅ crucial fix
        bahasa_id: bahasaId,   // ✅ also include bahasa_id
      }));

      const { error } = await supabase.from("kamus_review").upsert(updates, {
        onConflict: "review_id",
      });

      if (error) throw error;

      setWarning("✅ Semua kata berhasil diajukan ulang untuk review!");
    } catch (err: any) {
      console.error(err);
      setWarning("❌ Gagal submit: " + (err.message ?? err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="bg-white shadow-md rounded-md p-6 md:p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Edit Kontribusi Kamus</h1>

        {loading ? (
          <p>Loading...</p>
        ) : rows.length === 0 ? (
          <p>Belum ada kata yang dikontribusikan untuk bahasa ini.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse border w-full">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Kata</th>
                    <th className="border px-2 py-1">Arti</th>
                    <th className="border px-2 py-1">Contoh</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.kata_id}>
                      <td className="border px-2 py-1">
                        <input
                          type="text"
                          value={row.kata}
                          onChange={(e) => handleChangeRow(index, "kata", e.target.value)}
                          className="w-full border rounded px-1 py-0.5"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          type="text"
                          value={row.arti}
                          onChange={(e) => handleChangeRow(index, "arti", e.target.value)}
                          className="w-full border rounded px-1 py-0.5"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          type="text"
                          value={row.contoh}
                          onChange={(e) => handleChangeRow(index, "contoh", e.target.value)}
                          className="w-full border rounded px-1 py-0.5"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              className="px-4 py-2 bg-sekunder text-white rounded-figma-md mt-4 hover:bg-green-700 disabled:opacity-50"
              onClick={handleSubmit}
              disabled={submitting}
            >
              Submit for Review
            </button>

            {warning && <p className="text-sm text-red-600 mt-2">{warning}</p>}
          </>
        )}
      </div>
    </div>
  );
}