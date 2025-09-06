// src/routes/moderator/ReviewMaknaKata.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../backend/supabase";

interface MaknaKata {
  makna_id: number;
  kata_id: number;
  kata?: string; // from kamus table
  status: string;
  tanggal_dibuat: string;
}

export default function ReviewMaknaKata() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<MaknaKata[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchMaknaKata = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("makna_kata")
      .select(`
        makna_id,
        kata_id,
        status,
        tanggal_dibuat,
        kamus!inner(kata)
      `)
      .eq("status", "direview")
      .order("tanggal_dibuat", { ascending: true });

    if (error) {
      console.error(error);
      setEntries([]);
    } else {
      const mapped = (data || []).map((entry: any) => ({
        makna_id: entry.makna_id,
        kata_id: entry.kata_id,
        kata: entry.kamus?.kata || "Unknown",
        status: entry.status,
        tanggal_dibuat: entry.tanggal_dibuat,
      }));
      setEntries(mapped);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMaknaKata();
  }, []);

  const handleAction = async (makna_id: number, action: "terima" | "tolak") => {
    setActionLoading(makna_id);
    const { error } = await supabase
      .from("makna_kata")
      .update({ status: action === "terima" ? "terbit" : "ditolak" })
      .eq("makna_id", makna_id);

    if (error) {
      console.error(error);
      alert("Gagal melakukan aksi");
    } else {
      setEntries((prev) => prev.filter((e) => e.makna_id !== makna_id));
    }
    setActionLoading(null);
  };

  if (loading) return <p>Loading review...</p>;
  if (entries.length === 0)
    return <p className="p-4">Tidak ada Makna Kata yang menunggu review.</p>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">📖 Review Makna Kata</h1>
      <table className="table-auto w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Kata</th>
            <th className="border px-2 py-1">Tanggal Dibuat</th>
            <th className="border px-2 py-1">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.makna_id} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{entry.makna_id}</td>
              <td className="border px-2 py-1">{entry.kata}</td>
              <td className="border px-2 py-1">
                {new Date(entry.tanggal_dibuat).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="border px-2 py-1 flex gap-2">
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                  disabled={actionLoading === entry.makna_id}
                  onClick={() => handleAction(entry.makna_id, "terima")}
                >
                  Terima
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
                  disabled={actionLoading === entry.makna_id}
                  onClick={() => handleAction(entry.makna_id, "tolak")}
                >
                  Tolak
                </button>
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                  onClick={() =>
                    navigate(`/moderator-zone/review/lihat/makna-kata/${entry.makna_id}`)
                  }
                >
                  Lihat
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}