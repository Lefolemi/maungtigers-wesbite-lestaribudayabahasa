// src/routes/kontribusi/KontribusiKamus.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../backend/supabase";
import { useUserSession } from "../../../backend/context/UserSessionContext";

type KamusRow = {
  kata_id: number;
  kata: string;
  arti: string;
  contoh: string;
  status: string;
};

type Bahasa = {
  bahasa_id: number;
  nama_bahasa: string;
};

export default function KontribusiKamus() {
  const { user } = useUserSession();
  const navigate = useNavigate();

  const [bahasaList, setBahasaList] = useState<Bahasa[]>([]);
  const [selectedBahasaId, setSelectedBahasaId] = useState<number | null>(null);
  const [rows, setRows] = useState<KamusRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const handleExportCsv = () => {
    if (rows.length === 0) return;
  
    // CSV header
    const header = ["Kata", "Arti", "Contoh", "Status"];
    const csvRows = [
      header.join(","), // add header as first row
      ...rows.map((r) =>
        [r.kata, r.arti, r.contoh, r.status]
          .map((field) => `"${field.replace(/"/g, '""')}"`) // escape quotes
          .join(",")
      ),
    ];
  
    const csvContent = csvRows.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `kontribusi_kamus_${selectedBahasaId || "all"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Load available languages
  useEffect(() => {
    async function loadLanguages() {
      const { data, error } = await supabase
        .from("bahasa")
        .select("bahasa_id, nama_bahasa")
        .order("nama_bahasa");

      if (error) {
        console.error(error);
        setWarning("❌ Gagal load bahasa");
        return;
      }
      if (data) setBahasaList(data as Bahasa[]);
    }
    loadLanguages();
  }, []);

  // Load user submissions for selected language
useEffect(() => {
    if (!selectedBahasaId || !user) return;
  
    async function loadKamus() {
      setLoading(true);
      const { data, error } = await supabase
        .from("kamus_review")
        .select("review_id, kata, arti, contoh, status")
        .eq("user_id", user?.user_id)
        .eq("bahasa_id", selectedBahasaId)
        .order("tanggal_dibuat", { ascending: false });
  
      if (error) {
        console.error(error);
        setRows([]);
        setWarning("❌ Gagal load kontribusi");
      } else if (data) {
        // Safe casting
        const safeRows: KamusRow[] = (data as any[]).map((r) => ({
          kata_id: r.kata_id,
          kata: r.kata,
          arti: r.arti,
          contoh: r.contoh,
          status: r.status,
        }));
        setRows(safeRows);
        setWarning(null);
      }
      setLoading(false);
    }
  
    loadKamus();
  }, [selectedBahasaId, user]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Kontribusi Kamus</h1>

      {/* Language Dropdown + Edit Button */}
      <div className="flex items-center gap-2">
        <select
          className="border p-2 rounded"
          value={selectedBahasaId ?? ""}
          onChange={(e) => setSelectedBahasaId(Number(e.target.value))}
        >
          <option value="" disabled>
            Pilih bahasa
          </option>
          {bahasaList.map((b) => (
            <option key={b.bahasa_id} value={b.bahasa_id}>
              {b.nama_bahasa}
            </option>
          ))}
        </select>

        {selectedBahasaId && (
            <>
                <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={() =>
                    navigate(`/kamus/edit?bahasaId=${selectedBahasaId}`)
                }
                >
                Edit
                </button>
                <button
                className="px-3 py-1 bg-gray-700 text-white rounded"
                onClick={handleExportCsv}
                >
                Export CSV
                </button>
            </>
            )}
      </div>

      {warning && <p className="text-sm text-red-600">{warning}</p>}

      {/* Table of user submissions */}
      {loading ? (
        <p>Loading...</p>
      ) : rows.length === 0 ? (
        <p>Belum ada kata yang dikontribusikan untuk bahasa ini.</p>
      ) : (
        <table className="table-auto border-collapse border w-full">
          <thead>
            <tr>
              <th className="border px-2 py-1">Kata</th>
              <th className="border px-2 py-1">Arti</th>
              <th className="border px-2 py-1">Contoh</th>
              <th className="border px-2 py-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
                <tr key={`${row.kata_id}-${index}`}>
                <td className="border px-2 py-1">{row.kata}</td>
                <td className="border px-2 py-1">{row.arti}</td>
                <td className="border px-2 py-1">{row.contoh}</td>
                <td className="border px-2 py-1">{row.status}</td>
                </tr>
            ))}
        </tbody>
        </table>
      )}
    </div>
  );
}