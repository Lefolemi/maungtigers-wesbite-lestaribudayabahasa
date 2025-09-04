// src/routes/kontribusi/BuatKamus.tsx
import { useState, useEffect } from "react";
import { useUserSession } from "../../backend/context/UserSessionContext";
import { supabase } from "../../backend/supabase";

type KamusRow = {
  kata: string;
  arti: string;
  contoh: string;
};

type Bahasa = {
  bahasa_id: number;
  nama_bahasa: string;
};

export default function BuatKamus() {
  const { user } = useUserSession();

  const [bahasaId, setBahasaId] = useState<number | null>(null);
  const [bahasaList, setBahasaList] = useState<Bahasa[]>([]);
  const [rows, setRows] = useState<KamusRow[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [existingWords, setExistingWords] = useState<Set<string>>(new Set());

  // Fetch languages
  useEffect(() => {
    async function loadLanguages() {
      const { data, error } = await supabase
        .from("bahasa")
        .select("bahasa_id, nama_bahasa")
        .order("bahasa_id");

      if (error) {
        console.error(error);
        setWarning("❌ Gagal load bahasa");
        return;
      }
      if (data) setBahasaList(data as Bahasa[]);
    }
    loadLanguages();
  }, []);

  // Fetch existing user submissions for selected language
  useEffect(() => {
    if (!bahasaId || !user) return;

    async function loadUserKamus() {
      const { data, error } = await supabase
        .from("kamus_review")
        .select("kata")
        .eq("user_id", user?.user_id)
        .eq("bahasa_id", bahasaId);

      if (error) {
        console.error(error);
        setRows([]);
        setExistingWords(new Set());
        return;
      }

      const kataSet = new Set<string>();
      (data as any[]).forEach((r) => kataSet.add(r.kata.toLowerCase()));
      setExistingWords(kataSet);
    }

    loadUserKamus();
  }, [bahasaId, user]);

  // CSV import with per-user uniqueness check and duplicate count warning
const handleCsvChange = (file: File | null) => {
    if (!file) return;
    setCsvFile(file);
    setWarning(null); // reset previous warnings
  
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split(/\r?\n/).filter(Boolean);
      const newRows: KamusRow[] = [];
      let duplicateCount = 0;
  
      lines.forEach((line, index) => {
        const [kata, arti, contoh] = line.split(",");
        if (!kata || !arti || !contoh) return;
  
        const kataLower = kata.trim().toLowerCase();
  
        // skip if already exists for this user or in new rows
        if (existingWords.has(kataLower) || newRows.some((r) => r.kata === kataLower)) {
          duplicateCount++;
          return;
        }
  
        newRows.push({
          kata: kataLower,
          arti: arti.trim().toLowerCase(),
          contoh: contoh.trim().toLowerCase(),
        });
      });
  
      setRows(newRows);
  
      // show warning if any duplicates were skipped
      if (duplicateCount > 0) {
        setWarning(`⚠ ${duplicateCount} kata di CSV sudah ada sebelumnya. Edit kata yang sama melalui Edit Kamus.`);
      }
  
      // reset file input so the same CSV can be uploaded again
      const input = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (input) input.value = '';
    };
    reader.readAsText(file);
  };  

  const handleAddRow = () => setRows([...rows, { kata: "", arti: "", contoh: "" }]);
  const handleRemoveRow = (index: number) => setRows(rows.filter((_, i) => i !== index));
  const handleChangeRow = (index: number, field: keyof KamusRow, value: string) => {
    const newRows = [...rows];
    newRows[index][field] = value.toLowerCase();
    setRows(newRows);
  };

  // Submit with per-user uniqueness check
  const handleSubmit = async () => {
    if (!user) {
      setWarning("User belum login!");
      return;
    }
    if (!bahasaId) {
      setWarning("Pilih bahasa terlebih dahulu!");
      return;
    }
    if (rows.length === 0) {
      setWarning("Tidak ada kata untuk disubmit!");
      return;
    }

    // Ensure no duplicates in table or existing words
    const kataSet = new Set<string>();
    for (const row of rows) {
      if (existingWords.has(row.kata)) {
        setWarning(`Kata "${row.kata}" sudah ada sebelumnya!`);
        return;
      }
      if (kataSet.has(row.kata)) {
        setWarning(`Kata "${row.kata}" duplikat dalam tabel!`);
        return;
      }
      kataSet.add(row.kata);
    }

    setSubmitting(true);
    try {
      const insertRows = rows.map((row) => ({
        user_id: user.user_id,
        bahasa_id: bahasaId,
        kata: row.kata,
        arti: row.arti,
        contoh: row.contoh,
        status: "direview",
        tanggal_dibuat: new Date().toISOString(),
      }));

      const { error } = await supabase.from("kamus_review").insert(insertRows);
      if (error) throw error;

      setWarning("✅ Semua kata berhasil diajukan untuk review!");
      setRows([]);
      setCsvFile(null);

      // update existingWords so user can continue adding new words
      const updatedWords = new Set(existingWords);
      insertRows.forEach((r) => updatedWords.add(r.kata));
      setExistingWords(updatedWords);
    } catch (err: any) {
      console.error(err);
      setWarning("❌ Gagal submit: " + (err.message ?? err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Buat Kamus</h1>

      {/* Language Dropdown */}
        <select
        className="border p-2 rounded"
        value={bahasaId ?? ""}
        onChange={(e) => setBahasaId(Number(e.target.value))}
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

        {/* CSV Upload */}
        <div>
        <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => handleCsvChange(e.target.files?.[0] || null)}
            disabled={!bahasaId} // disabled if no bahasa selected
        />
        <p className="text-sm text-gray-500">CSV harus memiliki kolom: kata, arti, contoh</p>
        </div>

      {/* Table */}
      <table className="table-auto border-collapse border w-full">
        <thead>
          <tr>
            <th className="border px-2 py-1">Kata</th>
            <th className="border px-2 py-1">Arti</th>
            <th className="border px-2 py-1">Contoh</th>
            <th className="border px-2 py-1">#</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">
                <input
                  type="text"
                  value={row.kata}
                  onChange={(e) => handleChangeRow(i, "kata", e.target.value)}
                  className="w-full border rounded px-1 py-0.5"
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  type="text"
                  value={row.arti}
                  onChange={(e) => handleChangeRow(i, "arti", e.target.value)}
                  className="w-full border rounded px-1 py-0.5"
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  type="text"
                  value={row.contoh}
                  onChange={(e) => handleChangeRow(i, "contoh", e.target.value)}
                  className="w-full border rounded px-1 py-0.5"
                />
              </td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleRemoveRow(i)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Table Buttons */}
        <div className="flex gap-2 mt-2">
        <button
            onClick={handleAddRow}
            className="px-3 py-1 bg-gray-200 rounded"
            disabled={!bahasaId} // disabled if no bahasa selected
        >
            Tambah Baris
        </button>
        <button
            onClick={handleSubmit}
            className="px-3 py-1 bg-green-600 text-white rounded"
            disabled={submitting || !bahasaId} // still disabled if submitting
        >
            Submit for Review
        </button>
        </div>

      {warning && <p className="text-sm text-red-600">{warning}</p>}
    </div>
  );
}