// src/routes/moderator/ReviewKamus.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../../../backend/supabase";

interface KamusReview {
  review_id: number;
  user_id: string;
  username: string;
  kata: string;
  arti: string;
  contoh: string;
  tanggal_dibuat: string;
  bahasa_id: number;
}

interface Bahasa {
  bahasa_id: number;
  nama_bahasa: string;
}

export default function ReviewKamus() {
  const [loading, setLoading] = useState(true);
  const [kamus, setKamus] = useState<KamusReview[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [bahasaList, setBahasaList] = useState<Bahasa[]>([]);
  const [selectedBahasa, setSelectedBahasa] = useState<number | null>(null);

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartId, setDragStartId] = useState<number | null>(null);

  const fetchBahasa = async () => {
    const { data, error } = await supabase
      .from("bahasa")
      .select("bahasa_id, nama_bahasa")
      .order("nama_bahasa");

    if (error) {
      console.error(error);
      setBahasaList([]);
    } else {
      setBahasaList(data as Bahasa[]);
    }
  };

  const fetchKamus = async (bahasa_id?: number) => {
    setLoading(true);
    let query = supabase
      .from("kamus_review")
      .select(`
        review_id,
        user_id,
        user: user_id (username),
        kata,
        arti,
        contoh,
        tanggal_dibuat,
        bahasa_id
      `)
      .eq("status", "direview")
      .order("tanggal_dibuat", { ascending: true });

    if (bahasa_id) query = query.eq("bahasa_id", bahasa_id);

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setKamus([]);
    } else {
      setKamus(
        (data as any).map((row: any) => ({
          review_id: row.review_id,
          user_id: row.user_id,
          username: row.user?.username ?? "Unknown",
          kata: row.kata,
          arti: row.arti,
          contoh: row.contoh,
          tanggal_dibuat: row.tanggal_dibuat,
          bahasa_id: row.bahasa_id,
        }))
      );
    }
    setLoading(false);
    setSelectedIds([]);
  };

  useEffect(() => {
    fetchBahasa();
    fetchKamus();
  }, []);

  // Drag selection handlers
  const handleMouseDown = (review_id: number) => {
    setIsDragging(true);
    setDragStartId(review_id);
    setSelectedIds([review_id]);
  };

  const handleMouseEnter = (review_id: number) => {
    if (!isDragging || dragStartId === null) return;
    const startIndex = kamus.findIndex((k) => k.review_id === dragStartId);
    const endIndex = kamus.findIndex((k) => k.review_id === review_id);
    const min = Math.min(startIndex, endIndex);
    const max = Math.max(startIndex, endIndex);
    const newSelection = kamus.slice(min, max + 1).map((k) => k.review_id);
    setSelectedIds(newSelection);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleSelect = (review_id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, review_id] : prev.filter((id) => id !== review_id)
    );
  };

  const handleAction = async (action: "terima" | "tolak") => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);

    if (action === "terima") {
      // Insert approved words into kamus table WITHOUT kata_id
      const wordsToInsert = kamus
        .filter((k) => selectedIds.includes(k.review_id))
        .map((k) => ({
          user_id: k.user_id,
          bahasa_id: k.bahasa_id,
          kata: k.kata,
          arti: k.arti,
          contoh: k.contoh,
          tanggal_dibuat: new Date().toISOString(),
        }));

      const { error: insertError } = await supabase
        .from("kamus")
        .insert(wordsToInsert);

      if (insertError) {
        console.error(insertError);
        alert("Gagal memasukkan kata ke kamus");
        setActionLoading(false);
        return;
      }
    }

    // Update status in kamus_review
    const { error } = await supabase
      .from("kamus_review")
      .update({ status: action === "terima" ? "terbit" : "ditolak" })
      .in("review_id", selectedIds);

    if (error) {
      console.error(error);
      alert("Gagal melakukan aksi");
    } else {
      setKamus((prev) =>
        prev.filter((k) => !selectedIds.includes(k.review_id))
      );
      setSelectedIds([]);
    }

    setActionLoading(false);
  };

  if (loading) return <p className="p-4">Loading review...</p>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">📚 Review Kamus</h1>

      {/* Bahasa dropdown */}
      <div className="mb-4">
        <select
          className="border px-2 py-1 rounded"
          value={selectedBahasa ?? ""}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : null;
            setSelectedBahasa(val);
            fetchKamus(val ?? undefined);
          }}
        >
          <option value="">-- Pilih Bahasa --</option>
          {bahasaList.map((b) => (
            <option key={b.bahasa_id} value={b.bahasa_id}>
              {b.nama_bahasa}
            </option>
          ))}
        </select>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-2">
        <button
          className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
          disabled={actionLoading || selectedIds.length === 0}
          onClick={() => handleAction("terima")}
        >
          Terima
        </button>
        <button
          className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
          disabled={actionLoading || selectedIds.length === 0}
          onClick={() => handleAction("tolak")}
        >
          Tolak
        </button>
      </div>

      {kamus.length === 0 ? (
        <p>Tidak ada kata yang menunggu review untuk bahasa ini.</p>
      ) : (
        <table className="table-auto w-full border-collapse border select-none">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">
                <input
                  type="checkbox"
                  checked={selectedIds.length === kamus.length}
                  onChange={(e) =>
                    setSelectedIds(
                      e.target.checked ? kamus.map((k) => k.review_id) : []
                    )
                  }
                />
              </th>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Uploader</th>
              <th className="border px-2 py-1">Kata</th>
              <th className="border px-2 py-1">Arti</th>
              <th className="border px-2 py-1">Contoh</th>
              <th className="border px-2 py-1">Tanggal Dibuat</th>
            </tr>
          </thead>
          <tbody>
            {kamus.map((k) => (
              <tr
                key={k.review_id}
                className={`hover:bg-gray-50 cursor-pointer ${
                  selectedIds.includes(k.review_id) ? "bg-gray-200" : ""
                }`}
                onMouseDown={() => handleMouseDown(k.review_id)}
                onMouseEnter={() => handleMouseEnter(k.review_id)}
              >
                <td className="border px-2 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(k.review_id)}
                    onChange={(e) =>
                      handleSelect(k.review_id, e.target.checked)
                    }
                  />
                </td>
                <td className="border px-2 py-1">{k.review_id}</td>
                <td className="border px-2 py-1">{k.username}</td>
                <td className="border px-2 py-1">{k.kata}</td>
                <td className="border px-2 py-1">{k.arti}</td>
                <td className="border px-2 py-1">{k.contoh}</td>
                <td className="border px-2 py-1">
                  {new Date(k.tanggal_dibuat).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}