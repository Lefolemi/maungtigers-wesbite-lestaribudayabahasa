// src/routes/moderator/ReviewCerita.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../backend/supabase";
import { useUserSession } from "../../../../backend/context/UserSessionContext";

interface Cerita {
  cerita_id: number;
  judul: string;
  status: string;
  tanggal_dibuat: string;
}

export default function ReviewCerita() {
  const { user } = useUserSession();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ceritas, setCeritas] = useState<Cerita[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchCeritas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cerita")
      .select("cerita_id, judul, status, tanggal_dibuat")
      .eq("status", "direview")
      .order("tanggal_dibuat", { ascending: true });

    if (error) {
      console.error(error);
      setCeritas([]);
    } else {
      setCeritas(data as Cerita[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCeritas();
  }, []);

  const handleAction = async (cerita_id: number, action: "terima" | "tolak") => {
    setActionLoading(cerita_id);
    const { error } = await supabase
      .from("cerita")
      .update({ status: action === "terima" ? "terbit" : "ditolak" })
      .eq("cerita_id", cerita_id);

    if (error) {
      console.error(error);
      alert("Gagal melakukan aksi");
    } else {
      setCeritas((prev) => prev.filter((c) => c.cerita_id !== cerita_id));
    }
    setActionLoading(null);
  };

  if (loading) return <p>Loading review...</p>;
  if (ceritas.length === 0)
    return <p className="p-4">Tidak ada cerita yang menunggu review.</p>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">📖 Review Cerita</h1>
      <table className="table-auto w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Judul</th>
            <th className="border px-2 py-1">Tanggal Dibuat</th>
            <th className="border px-2 py-1">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {ceritas.map((cerita) => (
            <tr key={cerita.cerita_id} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{cerita.cerita_id}</td>
              <td className="border px-2 py-1">{cerita.judul}</td>
              <td className="border px-2 py-1">
                {new Date(cerita.tanggal_dibuat).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="border px-2 py-1 flex gap-2">
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                  disabled={actionLoading === cerita.cerita_id}
                  onClick={() => handleAction(cerita.cerita_id, "terima")}
                >
                  Terima
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
                  disabled={actionLoading === cerita.cerita_id}
                  onClick={() => handleAction(cerita.cerita_id, "tolak")}
                >
                  Tolak
                </button>
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                  onClick={() =>
                    navigate(
                      `/moderator-zone/review/lihat/cerita/${cerita.cerita_id}`
                    )
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