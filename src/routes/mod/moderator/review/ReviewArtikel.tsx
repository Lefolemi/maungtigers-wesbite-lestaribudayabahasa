// src/routes/moderator/ReviewArtikel.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../backend/supabase";
import { useUserSession } from "../../../../backend/context/UserSessionContext";

interface Artikel {
  artikel_id: number;
  judul: string;
  status: string;
  tanggal_dibuat: string;
  slug: string;
}

export default function ReviewArtikel() {
  const { user } = useUserSession();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [artikels, setArtikels] = useState<Artikel[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null); // track which ID is being processed

  const fetchArtikels = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("artikel")
      .select("artikel_id, judul, slug, status, tanggal_dibuat")
      .eq("status", "direview")
      .order("tanggal_dibuat", { ascending: true });

    if (error) {
      console.error(error);
      setArtikels([]);
    } else {
      setArtikels(data as Artikel[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArtikels();
  }, []);

  const handleAction = async (artikel_id: number, action: "terima" | "tolak") => {
    setActionLoading(artikel_id);
    const { error } = await supabase
      .from("artikel")
      .update({ status: action === "terima" ? "terbit" : "ditolak" })
      .eq("artikel_id", artikel_id);

    if (error) {
      console.error(error);
      alert("Gagal melakukan aksi");
    } else {
      // Remove the approved/rejected artikel from the list
      setArtikels((prev) => prev.filter((a) => a.artikel_id !== artikel_id));
    }
    setActionLoading(null);
  };

  if (loading) return <p>Loading review...</p>;

  if (artikels.length === 0)
    return <p className="p-4">Tidak ada artikel yang menunggu review.</p>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">📝 Review Artikel</h1>
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
          {artikels.map((artikel) => (
            <tr key={artikel.artikel_id} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{artikel.artikel_id}</td>
              <td className="border px-2 py-1">{artikel.judul}</td>
              <td className="border px-2 py-1">
                {new Date(artikel.tanggal_dibuat).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="border px-2 py-1 flex gap-2">
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                  disabled={actionLoading === artikel.artikel_id}
                  onClick={() => handleAction(artikel.artikel_id, "terima")}
                >
                  Terima
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
                  disabled={actionLoading === artikel.artikel_id}
                  onClick={() => handleAction(artikel.artikel_id, "tolak")}
                >
                  Tolak
                </button>
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                  onClick={() =>
                    navigate(`/moderator-zone/review/lihat/artikel/${artikel.slug}`)
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
