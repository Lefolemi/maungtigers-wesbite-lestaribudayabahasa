// src/routes/makna/BuatMakna.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserSession } from "../../backend/context/UserSessionContext";
import { useUserPerizinan } from "../../backend/context/UserPerizinanContext";
import WordPopup, { type Word } from "../../components/makna-kata/WordPopup";
import { usePrompt } from "../../components/utilities/usePrompt";
import { useMaknaAutosaveManager } from "../../components/makna-kata/useMaknaAutosaveManager";
import { simpanMaknaKata } from "../../components/makna-kata/simpanMaknaKata";
import MaknaEditor from "../../components/makna-kata/MaknaEditor";

export default function BuatMakna() {
  const navigate = useNavigate();
  const { user } = useUserSession();
  const { permissions } = useUserPerizinan();

  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [maknaId, setMaknaId] = useState<number | null>(null); // for editing existing makna
  const [informasi, setInformasi] = useState<any>(null);
  const [etimologi, setEtimologi] = useState<any>(null);
  const [gambar, setGambar] = useState<File | null>(null);
  const [gambarPreview, setGambarPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  const draftState = { selectedWord, informasi, etimologi, gambarPreview, tags };
  const { clearDraft } = useMaknaAutosaveManager("draft:makna_kata", draftState, (draft) => {
    setSelectedWord(draft.selectedWord || null);
    setInformasi(draft.informasi || null);
    setEtimologi(draft.etimologi || null);
    setGambarPreview(draft.gambarPreview || null);
    setTags(draft.tags || []);
  });

  usePrompt("Makna kata belum disimpan sebagai draft. Yakin ingin lanjut?", isDirty && !hasSavedDraft);

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
    if (!selectedWord) { setWarning("⚠️ Pilih kata"); return false; }
    if (!informasi) { setWarning("⚠️ Informasi tidak boleh kosong"); return false; }
    setWarning(null);
    return true;
  };

  const saveMakna = async (status: "draft" | "direview" | "terbit") => {
    if (!user || !validateFields() || !selectedWord) return;

    setSaving(true);
    setWarning("Menyimpan...");

    try {
      const savedMaknaId = await simpanMaknaKata({
        maknaId,
        userId: user.user_id,
        kataId: selectedWord.kata_id,
        bahasaId: selectedWord.bahasa_id,
        arti: selectedWord.arti,
        informasi,
        etimologi,
        gambar,
        status,
        tags,
      });

      if (!maknaId) setMaknaId(savedMaknaId);

      setWarning(
        status === "draft" ? "✅ Draft berhasil disimpan!" :
        status === "direview" ? "✅ Makna kata diajukan untuk review!" :
        "✅ Makna kata diterbitkan!"
      );

      // redirect after successful save
      navigate("/lihat-kontribusi/makna-kata");

      // clear form if publishing
      if (status === "terbit") {
        setSelectedWord(null);
        setMaknaId(null);
        setInformasi(null);
        setEtimologi(null);
        setGambar(null);
        setGambarPreview(null);
        setTags([]);
        setTagInput("");
      }

      setIsDirty(false);
      setHasSavedDraft(true);
      clearDraft();
    } catch (err: any) {
      console.error(err);
      setWarning("❌ Gagal menyimpan: " + (err.message ?? err));
    } finally {
      setSaving(false);
    }
  };

  const canCreate = permissions["makna_kata"]?.boleh_buat === true;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Buat Makna Kata</h1>

      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setPopupOpen(true)}>
        {selectedWord ? selectedWord.kata : "Pilih Kata"}
      </button>

      <MaknaEditor content={informasi} onChange={(v) => { setInformasi(v); setIsDirty(true); }} />
      <MaknaEditor content={etimologi} onChange={(v) => { setEtimologi(v); setIsDirty(true); }} />

      <input type="file" onChange={e => handleGambarChange(e.target.files?.[0] || null)} />
      {gambarPreview && <img src={gambarPreview} className="w-32 mt-2" />}

      <div>
        <label className="block mb-2 font-medium">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <span key={tag} className="flex items-center bg-gray-200 px-3 py-1 rounded-full text-sm">
              {tag}
              <button onClick={() => setTags(tags.filter(t => t !== tag))} className="ml-2 text-red-500 hover:text-red-700">×</button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          placeholder="Type a tag and press Enter"
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && tagInput.trim()) {
              e.preventDefault();
              if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
              setTagInput("");
              setIsDirty(true);
            }
          }}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="flex gap-4 mt-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => saveMakna("draft")} disabled={!canCreate}>Save Draft</button>
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => saveMakna(canCreate ? "terbit" : "direview")}>
          {canCreate ? "Submit" : "Submit for Review"}
        </button>
        {saving && <span className="text-gray-500">Saving...</span>}
      </div>

      {warning && <p className="text-sm text-red-600">{warning}</p>}

      <WordPopup open={popupOpen} setOpen={setPopupOpen} onSelect={(w: any) => { setSelectedWord(w); setPopupOpen(false); setIsDirty(true); }} />
    </div>
  );
}