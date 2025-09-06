// src/routes/makna_kata/EditMaknaKata.tsx
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabase";
import { useUserSession } from "../../backend/context/UserSessionContext";
import { useUserPerizinan } from "../../backend/context/UserPerizinanContext";
import MaknaEditor from "../../components/makna-kata/MaknaEditor";
import type { Word } from "../../components/makna-kata/WordPopup";

export default function EditMaknaKata() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUserSession();
  const { permissions } = useUserPerizinan();
  const navigate = useNavigate();

  const [makna, setMakna] = useState<any | null>(null);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [informasi, setInformasi] = useState<any>(null);
  const [etimologi, setEtimologi] = useState<any>(null);
  const [gambarPreview, setGambarPreview] = useState<string | null>(null);
  const [gambarFile, setGambarFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [oldGambarUrl, setOldGambarUrl] = useState<string | null>(null);

  const canEdit = permissions["makna_kata"]?.boleh_edit === true;

  useEffect(() => {
    if (!id || !user) return;

    const fetchMakna = async () => {
      setLoading(true);
      try {
        const { data: m, error } = await supabase
          .from("makna_kata")
          .select("*, kata_id(kata_id, kata, arti, bahasa_id)")
          .eq("makna_id", id)
          .maybeSingle();

        if (error || !m) {
          setUnauthorized(true);
          return;
        }

        if (m.user_id !== user.user_id) {
          setUnauthorized(true);
          return;
        }

        setMakna(m);
        setSelectedWord(m.kata_id); // Word info
        setInformasi(m.informasi);
        setEtimologi(m.etimologi);
        setGambarPreview(m.gambar || null);
        setOldGambarUrl(m.gambar || null);

        // fetch tags
        const { data: tagRelations, error: tagError } = await supabase
          .from("makna_kata_tag")
          .select("tag_id ( tag_id, nama_tag )")
          .eq("makna_id", m.makna_id);

        if (!tagError && tagRelations) {
          const tagNames = (tagRelations || [])
            .map((t: any) => {
              const tagObj = Array.isArray(t.tag_id) ? t.tag_id[0] : t.tag_id;
              return tagObj?.nama_tag || null;
            })
            .filter(Boolean) as string[];
          setTags(tagNames);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMakna();
  }, [id, user]);

  const handleGambarChange = (file: File | null) => {
    setGambarFile(file);
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

  const saveChanges = async (mode: "draft" | "submit") => {
    if (!selectedWord) return setWarning("Kata tidak valid");
    if (!informasi) return setWarning("Informasi tidak boleh kosong");

    setWarning("Menyimpan...");

    let gambarUrl = oldGambarUrl;

    if (gambarFile) {
      // remove old
      if (oldGambarUrl) {
        const oldPath = oldGambarUrl.split("/storage/v1/object/public/aset_makna_kata/")[1];
        if (oldPath) await supabase.storage.from("aset_makna_kata").remove([oldPath]);
      }

      const fileExt = gambarFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `thumbnail/${makna.makna_id}/${fileName}`;

      const { error } = await supabase.storage
        .from("aset_makna_kata")
        .upload(filePath, gambarFile, { cacheControl: "3600", upsert: true });

      if (error) throw error;

      const { data } = supabase.storage.from("aset_makna_kata").getPublicUrl(filePath);
      gambarUrl = data.publicUrl;
    }

    try {
      await supabase
        .from("makna_kata")
        .update({
          arti: selectedWord.arti,
          informasi,
          etimologi,
          gambar: gambarUrl,
          status:
            mode === "draft"
              ? "draft"
              : canEdit
              ? "terbit"
              : "direview",
          terakhir_edit: new Date().toISOString(),
        })
        .eq("makna_id", makna.makna_id);

      // update tags
      await supabase.from("makna_kata_tag").delete().eq("makna_id", makna.makna_id);
      for (const t of tags) {
        let { data: tagData } = await supabase
          .from("tag")
          .select("*")
          .eq("nama_tag", t)
          .maybeSingle();
        let tag_id = tagData?.tag_id;
        if (!tag_id) {
          const { data: newTag } = await supabase
            .from("tag")
            .insert({ nama_tag: t })
            .select()
            .single();
          tag_id = newTag.tag_id;
        }
        await supabase.from("makna_kata_tag").insert({ makna_id: makna.makna_id, tag_id });
      }

      setWarning("✅ Makna Kata berhasil diperbarui!");
      navigate("/lihat-kontribusi/makna-kata");
    } catch (err: any) {
      setWarning("❌ Gagal menyimpan: " + (err.message ?? err));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (unauthorized) return <Navigate to="/makna-kata" replace />;
  if (!makna) return <p>Makna kata tidak ditemukan</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Edit Makna Kata</h1>
      {warning && (
        <div className="p-3 rounded bg-yellow-100 border border-yellow-400 text-yellow-800">
          {warning}
        </div>
      )}

      <button className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed" disabled>
        {selectedWord ? selectedWord.kata : "Kata tidak ditemukan"}
      </button>

      <h2 className="font-semibold mt-4">Informasi</h2>
      <MaknaEditor content={informasi} onChange={setInformasi} />

      <h2 className="font-semibold mt-4">Etimologi</h2>
      <MaknaEditor content={etimologi} onChange={setEtimologi} />

      <input
        type="file"
        onChange={(e) => handleGambarChange(e.target.files?.[0] || null)}
      />
      {gambarPreview && <img src={gambarPreview} className="w-32 mt-2" />}

      <div>
        <label className="block mb-2 font-medium">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center bg-gray-200 px-3 py-1 rounded-full text-sm"
            >
              {tag}
              <button
                onClick={() => setTags(tags.filter((t) => t !== tag))}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          placeholder="Type a tag and press Enter"
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && tagInput.trim()) {
              e.preventDefault();
              if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
              }
              setTagInput("");
            }
          }}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="mt-4 space-x-2">
        <button
          onClick={() => saveChanges("draft")}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Save Draft
        </button>
        <button
          onClick={() => saveChanges("submit")}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {canEdit ? "Publish" : "Submit for Review"}
        </button>
      </div>
    </div>
  );
}