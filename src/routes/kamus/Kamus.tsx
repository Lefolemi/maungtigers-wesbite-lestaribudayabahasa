// src/routes/kamus/Kamus.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabase";

interface KamusRow {
  kata_id: number;
  kata: string;
  arti: string;
  contoh: string;
}

interface Bahasa {
  bahasa_id: number;
  nama_bahasa: string;
}

export default function Kamus() {
  const [bahasaList, setBahasaList] = useState<Bahasa[]>([]);
  const [selectedBahasa, setSelectedBahasa] = useState<number | null>(null);
  const [rows, setRows] = useState<KamusRow[]>([]);
  const [loading, setLoading] = useState(false); // default false
  const [warning, setWarning] = useState<string | null>(null);

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
      } else if (data) {
        setBahasaList(data as Bahasa[]);
      }
    }
    loadLanguages();
  }, []);

  // Load Kamus entries per selected language
  useEffect(() => {
    if (!selectedBahasa) {
      setRows([]);
      setLoading(false);
      return;
    }

    async function loadKamus() {
      setLoading(true);
      const { data, error } = await supabase
        .from("kamus")
        .select("kata_id, kata, arti, contoh")
        .eq("bahasa_id", selectedBahasa)
        .order("kata", { ascending: true });

      if (error) {
        console.error(error);
        setRows([]);
        setWarning("❌ Gagal load kamus");
      } else if (data) {
        setRows(data as KamusRow[]);
        setWarning(null);
      }
      setLoading(false);
    }

    loadKamus();
  }, [selectedBahasa]);

  // Export CSV
  const handleExportCsv = () => {
    if (rows.length === 0) return;

    const header = ["Kata", "Arti", "Contoh"];
    const csvRows = [
      header.join(","),
      ...rows.map((r) =>
        [r.kata, r.arti, r.contoh].map((field) => `"${field?.replace(/"/g, '""')}"`).join(",")
      ),
    ];

    const csvContent = csvRows.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `kamus_${selectedBahasa || "all"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">📚 Kamus</h1>

      {/* Language dropdown + Export button */}
      <div className="flex items-center gap-2 mb-4">
        <select
          className="border p-2 rounded"
          value={selectedBahasa ?? ""}
          onChange={(e) =>
            setSelectedBahasa(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">Pilih bahasa</option>
          {bahasaList.map((b) => (
            <option key={b.bahasa_id} value={b.bahasa_id}>
              {b.nama_bahasa}
            </option>
          ))}
        </select>

        {selectedBahasa && (
          <button
            className="px-3 py-1 bg-gray-700 text-white rounded"
            onClick={handleExportCsv}
          >
            Export CSV
          </button>
        )}
      </div>

      {warning && <p className="text-red-600">{warning}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : selectedBahasa === null ? (
        <p>Pilih bahasa terlebih dahulu.</p>
      ) : rows.length === 0 ? (
        <p>Belum ada kata untuk bahasa ini.</p>
      ) : (
        <table className="table-auto border-collapse border w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Kata</th>
              <th className="border px-2 py-1">Arti</th>
              <th className="border px-2 py-1">Contoh</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.kata_id} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{row.kata}</td>
                <td className="border px-2 py-1">{row.arti}</td>
                <td className="border px-2 py-1">{row.contoh}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}