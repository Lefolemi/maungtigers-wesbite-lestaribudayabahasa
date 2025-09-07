// src/routes/artikel/BuatArtikel.tsx
import { useState, useEffect } from "react";
import { useDraftManager } from "../../components/artikel/useAutosaveManager";
import { simpanArtikel } from "../../components/artikel/simpanArtikel";
import { usePrompt } from "../../components/utilities/usePrompt";
import { useUserSession } from "../../backend/context/UserSessionContext";
import NavbarBarebone from "../../components/ui/NavbarBarebone";
import ArtikelForm from "../../components/artikel/ArtikelForm";
import TipTapEditor from "../../components/ui/TipTapEditor";

// 🔹 Utility: generate slug from title
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function BuatArtikel() {
  const { user } = useUserSession();

  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [content, setContent] = useState<any>(null);
  const [slug, setSlug] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagsCopy, setTagsCopy] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [artikelId, setArtikelId] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  // Keep tagsCopy updated for autosave
  useEffect(() => setTagsCopy(JSON.stringify(tags)), [tags]);

  const draftState = { title, content, thumbnailBase64: thumbnailPreview, tagsCopy };
  const { clearDraft } = useDraftManager("draft:artikel", draftState, () => {});

  usePrompt(
    "Artikel belum disimpan sebagai draft. Yakin ingin lanjut? (Sementara akan disimpan secara otomatis dalam browser)",
    isDirty && !hasSavedDraft
  );

  // Load last saved draft if available
  useEffect(() => {
    const saved = localStorage.getItem("draft:artikel");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (confirm("Lanjutkan dari draft terakhir?")) {
        setTitle(parsed.title || "");
        setContent(parsed.content || null);
        if (parsed.thumbnailBase64) setThumbnailPreview(parsed.thumbnailBase64);
        if (parsed.tagsCopy) {
          try {
            setTags(JSON.parse(parsed.tagsCopy));
          } catch {
            setTags([]);
          }
        }
      } else clearDraft();
    }
  }, []);

  function handleThumbnailChange(file: File | null) {
    setThumbnail(file);
    setIsDirty(true);
    if (!file) {
      setThumbnailPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setThumbnailPreview(url);
    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result as string);
    reader.readAsDataURL(file);
    return () => URL.revokeObjectURL(url);
  }

  function handleContentChange(newContent: any) {
    setContent(newContent);
    setSaving(true);
    setIsDirty(true);
    setTimeout(() => setSaving(false), 500);
  }

  function validateFields(): boolean {
    if (!title.trim()) {
      setWarning("⚠️ Judul tidak boleh kosong.");
      return false;
    }
    if (!content) {
      setWarning("⚠️ Konten tidak boleh kosong.");
      return false;
    }
    setWarning(null);
    return true;
  }

  async function saveArtikel(status: "draft" | "direview") {
    if (!validateFields()) return;

    setSaving(true);
    setWarning("Uploading images...");
    const generatedSlug = slugify(title);
    setSlug(generatedSlug);

    try {
      const savedArtikelId = await simpanArtikel({
        artikelId,
        userId: user?.user_id,
        title,
        content,
        thumbnail,
        slug: generatedSlug,
        tags,
        status,
      });

      setArtikelId(savedArtikelId);
      setWarning(
        status === "draft"
          ? "✅ Draft berhasil disimpan!"
          : "✅ Artikel berhasil diajukan untuk review!"
      );
      setIsDirty(false);
      setHasSavedDraft(true);
      clearDraft();
    } catch (err: any) {
      console.error(err);
      setWarning("❌ Gagal menyimpan artikel: " + (err.message ?? err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-primer">
      <NavbarBarebone title="Buat Artikel" backTo="/" />

      <div className="max-w-4xl mx-auto p-6 bg-white rounded-figma-lg shadow-lg mt-6 space-y-6">
        <ArtikelForm
          title={title}
          setTitle={setTitle}
          slug={slug}
          thumbnailPreview={thumbnailPreview}
          onThumbnailChange={handleThumbnailChange}
          tags={tags}
          setTags={setTags}
          tagInput={tagInput}
          setTagInput={setTagInput}
          warning={warning}
        >
          <TipTapEditor
            content={content}
            onChange={handleContentChange}
            showImageButton={true}
          />
        </ArtikelForm>

        <div className="flex items-center gap-4 mt-4">
          <span className="text-sm text-gray-500">
            {saving
              ? "Saving..."
              : hasSavedDraft
              ? "Draft saved in DB"
              : "All changes saved (locally)"}
          </span>
          <button
            onClick={() => saveArtikel("draft")}
            className="px-4 py-2 bg-sekunder text-white rounded-figma-md hover:bg-tersier transition"
          >
            Save Draft
          </button>
          <button
            onClick={() => saveArtikel("direview")}
            className="px-4 py-2 bg-tersier text-white rounded-figma-md hover:bg-sekunder transition"
          >
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}