// src/routes/cerita/BuatCerita.tsx
import { useState, useEffect } from "react";
import { useUserSession } from "../../backend/context/UserSessionContext";
import { useUserPerizinan } from "../../backend/context/UserPerizinanContext";
import { usePrompt } from "../../components/utilities/usePrompt";
import CeritaForm from "../../components/cerita/CeritaForm";
import { simpanCerita } from "../../components/cerita/simpanCerita";
import { supabase } from "../../backend/supabase";
import { useCeritaDraftManager } from "../../components/cerita/useCeritaAutosaveManager";

type Bahasa = { bahasa_id: number; nama_bahasa: string };

export default function BuatCerita() {
  const { user } = useUserSession();
  const { permissions } = useUserPerizinan();

  const [bahasaId, setBahasaId] = useState<number | null>(null);
  const [bahasaList, setBahasaList] = useState<Bahasa[]>([]);
  const [judul, setJudul] = useState("");
  const [informasi, setInformasi] = useState<any>(null);
  const [gambar, setGambar] = useState<File | null>(null);
  const [gambarPreview, setGambarPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagsCopy, setTagsCopy] = useState("");
  const [tagInput, setTagInput] = useState("");

  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const draftState = { judul, informasi, gambarPreview, tagsCopy, bahasaId };
  const { clearDraft } = useCeritaDraftManager("draft:cerita", draftState, (draft) => {
    setJudul(draft.judul || "");
    setInformasi(draft.informasi || null);
    setGambarPreview(draft.gambarPreview || null);
    setBahasaId(draft.bahasaId || null);
    if (draft.tagsCopy) {
      try { setTags(JSON.parse(draft.tagsCopy)); } catch { setTags([]); }
    }
  });

  useEffect(() => setTagsCopy(JSON.stringify(tags)), [tags]);

  usePrompt(
    "Cerita belum disimpan sebagai draft. Yakin ingin lanjut?",
    isDirty && !hasSavedDraft
  );

  // Fetch languages for dropdown
  useEffect(() => {
    async function loadLanguages() {
      const { data, error } = await supabase
        .from("bahasa")
        .select("bahasa_id, nama_bahasa")
        .order("bahasa_id");
      if (error) {
        console.error(error);
        return;
      }
      if (data) setBahasaList(data as Bahasa[]);
    }
    loadLanguages();
  }, []);

  const handleGambarChange = (file: File | null) => {
    setGambar(file);
    setIsDirty(true);
    if (!file) {
      setGambarPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setGambarPreview(url);
    const reader = new FileReader();
    reader.onloadend = () => setGambarPreview(reader.result as string);
    reader.readAsDataURL(file);
    return () => URL.revokeObjectURL(url);
  };

  const validateFields = () => {
    if (!bahasaId) { setWarning("⚠️ Pilih bahasa terlebih dahulu."); return false; }
    if (!judul.trim()) { setWarning("⚠️ Judul tidak boleh kosong."); return false; }
    if (!informasi) { setWarning("⚠️ Konten tidak boleh kosong."); return false; }
    setWarning(null);
    return true;
  };

  const save = async (status: "draft" | "direview" | "terbit") => {
    if (!user) return;
    if (!validateFields()) return;

    setSaving(true);
    setWarning("Menyimpan cerita...");

    try {
      await simpanCerita({
        userId: user.user_id,
        bahasaId: bahasaId!,
        judul,
        informasi,
        gambar,
        tags,
        status,
      });

      setWarning(
        status === "draft"
          ? "✅ Draft berhasil disimpan!"
          : status === "direview"
          ? "✅ Cerita diajukan untuk review!"
          : "✅ Cerita diterbitkan!"
      );

      setIsDirty(false);
      setHasSavedDraft(true);
      clearDraft();
    } catch (err: any) {
      console.error(err);
      setWarning("❌ Gagal menyimpan cerita: " + (err.message ?? err));
    } finally {
      setSaving(false);
    }
  };

  const isContributor = permissions["cerita"]?.boleh_buat === true;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Buat Cerita Baru</h1>

      {/* Language dropdown */}
      <select
        className="border p-2 rounded"
        value={bahasaId ?? ""}
        onChange={(e) => setBahasaId(Number(e.target.value))}
      >
        <option value="" disabled>Pilih bahasa</option>
        {bahasaList.map((b) => (
          <option key={b.bahasa_id} value={b.bahasa_id}>
            {b.nama_bahasa}
          </option>
        ))}
      </select>

      <CeritaForm
        title={judul}
        setTitle={setJudul}
        content={informasi}
        onContentChange={(v) => { setInformasi(v); setIsDirty(true); }}
        thumbnailPreview={gambarPreview}
        onThumbnailChange={handleGambarChange}
        tags={tags}
        setTags={setTags}
        tagInput={tagInput}
        setTagInput={setTagInput}
        warning={warning}
      />

      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={() => save("draft")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={!bahasaId}
        >
          Save Draft
        </button>

        <button
          onClick={() => save(isContributor ? "terbit" : "direview")}
          className="px-4 py-2 bg-green-600 text-white rounded"
          disabled={!bahasaId}
        >
          {isContributor ? "Submit" : "Submit for Review"}
        </button>

        {saving && <span className="text-gray-500">Saving...</span>}
      </div>

      {warning && <p className="text-sm text-red-600">{warning}</p>}
    </div>
  );
}
