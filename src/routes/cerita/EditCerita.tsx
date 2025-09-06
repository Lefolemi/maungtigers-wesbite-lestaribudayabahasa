// src/routes/cerita/EditCerita.tsx
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabase";
import { useUserSession } from "../../backend/context/UserSessionContext";
import { useUserPerizinan } from "../../backend/context/UserPerizinanContext";
import CeritaForm from "../../components/cerita/CeritaForm";

type Bahasa = { bahasa_id: number; nama_bahasa: string };

export default function EditCerita() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUserSession();
  const { permissions } = useUserPerizinan();
  const navigate = useNavigate();

  const [cerita, setCerita] = useState<any | null>(null);
  const [bahasaId, setBahasaId] = useState<number | null>(null);
  const [bahasaList, setBahasaList] = useState<Bahasa[]>([]);
  const [judul, setJudul] = useState("");
  const [informasi, setInformasi] = useState<any>(null);
  const [gambar, setGambar] = useState<File | null>(null);
  const [gambarPreview, setGambarPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [oldGambarUrl, setOldGambarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isContributor = permissions["cerita"]?.boleh_buat === true;

  useEffect(() => {
    if (!id || !user) return;

    const fetchCerita = async () => {
      setLoading(true);
      try {
        // fetch cerita
        const { data: c, error } = await supabase
          .from("cerita")
          .select("*")
          .eq("cerita_id", id)
          .maybeSingle();

        if (error || !c) {
          setUnauthorized(true);
          return;
        }
        if (c.user_id !== user.user_id) {
          setUnauthorized(true);
          return;
        }

        setCerita(c);
        setJudul(c.judul);
        setInformasi(c.informasi);
        setGambarPreview(c.gambar || null);
        setOldGambarUrl(c.gambar || null);
        setBahasaId(c.bahasa_id);

        // fetch tags
        const { data: tagRelations } = await supabase
          .from("cerita_tag")
          .select("tag_id(nama_tag)")
          .eq("cerita_id", c.cerita_id);

        if (tagRelations) {
          const tagNames = tagRelations
            .map((tr) => {
              const tagObj = Array.isArray(tr.tag_id) ? tr.tag_id[0] : tr.tag_id;
              return tagObj?.nama_tag;
            })
            .filter(Boolean) as string[];
          setTags(tagNames);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCerita();
  }, [id, user]);

  // fetch bahasa list for dropdown
  useEffect(() => {
    async function loadLanguages() {
      const { data, error } = await supabase
        .from("bahasa")
        .select("bahasa_id, nama_bahasa")
        .order("bahasa_id");
      if (!error && data) {
        setBahasaList(data as Bahasa[]);
      }
    }
    loadLanguages();
  }, []);

  const handleGambarChange = (file: File | null) => {
    setGambar(file);
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
    if (!bahasaId) {
      setWarning("⚠️ Pilih bahasa terlebih dahulu.");
      return false;
    }
    if (!judul.trim()) {
      setWarning("⚠️ Judul tidak boleh kosong.");
      return false;
    }
    if (!informasi) {
      setWarning("⚠️ Konten tidak boleh kosong.");
      return false;
    }
    setWarning(null);
    return true;
  };

  const save = async (status: "draft" | "direview" | "terbit") => {
    if (!cerita || !validateFields()) return;

    setSaving(true);
    setWarning("Menyimpan...");

    let gambarUrl = oldGambarUrl;

    if (gambar) {
      if (oldGambarUrl) {
        const oldPath = oldGambarUrl.split("/storage/v1/object/public/aset_cerita/")[1];
        if (oldPath) await supabase.storage.from("aset_cerita").remove([oldPath]);
      }

      const fileExt = gambar.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `thumbnail/${cerita.cerita_id}/${fileName}`;

      const { error } = await supabase.storage
        .from("aset_cerita")
        .upload(filePath, gambar, { cacheControl: "3600", upsert: true });

      if (error) throw error;

      const { data } = supabase.storage.from("aset_cerita").getPublicUrl(filePath);
      gambarUrl = data.publicUrl;
    }

    try {
      await supabase
        .from("cerita")
        .update({
          bahasa_id: bahasaId,
          judul,
          informasi,
          gambar: gambarUrl,
          status,
          terakhir_edit: new Date().toISOString(),
        })
        .eq("cerita_id", cerita.cerita_id);

      await supabase.from("cerita_tag").delete().eq("cerita_id", cerita.cerita_id);
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
        await supabase.from("cerita_tag").insert({ cerita_id: cerita.cerita_id, tag_id });
      }

      setWarning(
        status === "draft"
          ? "✅ Draft berhasil diperbarui!"
          : status === "direview"
          ? "✅ Cerita diajukan untuk review!"
          : "✅ Cerita berhasil diterbitkan!"
      );
      navigate("/lihat-kontribusi/cerita");
    } catch (err: any) {
      setWarning("❌ Gagal menyimpan: " + (err.message ?? err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (unauthorized) return <Navigate to="/cerita" replace />;
  if (!cerita) return <p>Cerita tidak ditemukan</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Edit Cerita</h1>

      {/* Language dropdown */}
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

      <CeritaForm
        title={judul}
        setTitle={setJudul}
        content={informasi}
        onContentChange={setInformasi}
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
        >
          Save Draft
        </button>
        <button
          onClick={() => save(isContributor ? "terbit" : "direview")}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {isContributor ? "Publish" : "Submit for Review"}
        </button>
        {saving && <span className="text-gray-500">Saving...</span>}
      </div>

      {warning && <p className="text-sm text-red-600">{warning}</p>}
    </div>
  );
}