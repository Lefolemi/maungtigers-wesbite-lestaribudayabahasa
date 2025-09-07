// src/routes/kontribusi/BuatKamus.tsx
import { useState, useEffect } from "react";
import { useUserSession } from "../../backend/context/UserSessionContext";
import { supabase } from "../../backend/supabase";
import NavbarBarebone from "../../components/ui/NavbarBarebone";
import DropdownSelect from "../../components/ui/DropdownSelect";
import FileUploadButton from "../../components/ui/FileUploadButton";
import DataTable from "../../components/ui/DataTable";
import { Trash2 } from "lucide-react";

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
  const [, setCsvFile] = useState<File | null>(null);
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

  // CSV import
  const handleCsvChange = (file: File | null) => {
    if (!file) return;
    setCsvFile(file);
    setWarning(null);

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split(/\r?\n/).filter(Boolean);
      const newRows: KamusRow[] = [];
      let duplicateCount = 0;

      lines.forEach((line) => {
        const [kata, arti, contoh] = line.split(",");
        if (!kata || !arti || !contoh) return;

        const kataLower = kata.trim().toLowerCase();

        if (
          existingWords.has(kataLower) ||
          newRows.some((r) => r.kata === kataLower)
        ) {
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

      if (duplicateCount > 0) {
        setWarning(
          `⚠ ${duplicateCount} kata di CSV sudah ada sebelumnya. Edit kata yang sama melalui Edit Kamus.`
        );
      }

      const input =
        document.querySelector<HTMLInputElement>('input[type="file"]');
      if (input) input.value = "";
    };
    reader.readAsText(file);
  };

  const handleAddRow = () =>
    setRows([...rows, { kata: "", arti: "", contoh: "" }]);
  const handleRemoveRow = (index: number) =>
    setRows(rows.filter((_, i) => i !== index));
  const handleChangeRow = (
    index: number,
    field: keyof KamusRow,
    value: string
  ) => {
    const newRows = [...rows];
    newRows[index][field] = value.toLowerCase();
    setRows(newRows);
  };

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
    <div className="min-h-screen bg-primer">
      {/* Navbar */}
      <NavbarBarebone title="Buat Kamus" backTo="/" />

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-figma-lg shadow-lg space-y-6 mt-6">
        {/* Language Dropdown + CSV Upload inline */}
        <div className="flex justify-between items-center">
          {/* Language Dropdown */}
          <div className="w-64 relative">
            <DropdownSelect
              value={bahasaId}
              onChange={setBahasaId}
              options={bahasaList.map((b) => ({
                value: b.bahasa_id,
                label: b.nama_bahasa,
              }))}
              placeholder="Pilih bahasa"
            />
          </div>

          {/* CSV Upload */}
          <FileUploadButton
            id="csvUpload"
            label="Import CSV"
            accept=".csv,text/csv"
            disabled={!bahasaId}
            onChange={handleCsvChange}
          />
        </div>

        <p className="text-sm text-gray-500 mt-1">
          CSV harus memiliki kolom: kata, arti, contoh
        </p>

        {/* Table */}
        <DataTable headers={["Kata", "Arti", "Contoh", "Hapus"]}>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-sekunder">
              <td className="px-2 py-1">
                <input
                  type="text"
                  value={row.kata}
                  onChange={(e) => handleChangeRow(i, "kata", e.target.value)}
                  className="w-full border rounded-figma-md px-2 py-1"
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="text"
                  value={row.arti}
                  onChange={(e) => handleChangeRow(i, "arti", e.target.value)}
                  className="w-full border rounded-figma-md px-2 py-1"
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="text"
                  value={row.contoh}
                  onChange={(e) => handleChangeRow(i, "contoh", e.target.value)}
                  className="w-full border rounded-figma-md px-2 py-1"
                />
              </td>
              <td className="px-2 py-1">
                <div className="flex justify-center items-center h-full">
                  <span
                    onClick={() => handleRemoveRow(i)}
                    className="cursor-pointer text-black hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={20} />
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>

        {/* Table Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleAddRow}
            className="px-4 py-2 bg-sekunder text-white rounded-figma-md hover:bg-tersier transition"
            disabled={!bahasaId}
          >
            Tambah Baris
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-tersier text-white rounded-figma-md hover:bg-sekunder transition"
            disabled={submitting || !bahasaId}
          >
            Kirim untuk review
          </button>
        </div>

        {warning && <p className="text-sm text-red-600">{warning}</p>}
      </div>
    </div>
  );
}