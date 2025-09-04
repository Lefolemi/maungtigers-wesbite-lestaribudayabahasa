// src/routes/artikel/EditArtikel.tsx
import { useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabase";
import { useUserSession } from "../../backend/context/UserSessionContext";
import ArtikelForm from "../../components/artikel/ArtikelForm";
import { updateGambar } from "../../components/artikel/updateGambar";

// 🔹 Utility: detect image nodes in TipTap JSON
function extractImages(content: any): string[] {
  if (!content) return [];
  const images: string[] = [];
  function traverse(node: any) {
    if (!node) return;
    if (node.type === "image" && typeof node.attrs?.src === "string") {
      images.push(node.attrs.src);
    }
    if (node.content) node.content.forEach(traverse);
  }
  traverse(content);
  return images;
}

// 🔹 Utility: replace old src with new URL in content JSON
function replaceImageSrc(content: any, map: Record<string, string>): any {
  function traverse(node: any): any {
    if (!node) return node;
    const newNode = { ...node };
    if (newNode.type === "image" && map[newNode.attrs?.src]) {
      newNode.attrs = { ...newNode.attrs, src: map[newNode.attrs.src] };
    }
    if (newNode.content) newNode.content = newNode.content.map(traverse);
    return newNode;
  }
  return traverse(content);
}

export default function EditArtikel() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useUserSession();

  const [article, setArticle] = useState<any | null>(null);
  const [title, setTitle] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [content, setContent] = useState<any>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const [oldThumbnailUrl, setOldThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !user) return;

    const fetchArtikel = async () => {
      setLoading(true);

      const { data: artikel, error: artikelError } = await supabase
        .from("artikel")
        .select("artikel_id, user_id, judul, konten, slug, thumbnail, status")
        .eq("slug", slug)
        .maybeSingle();

      if (artikelError || !artikel) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      if (artikel.user_id !== user.user_id) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      setArticle(artikel);
      setTitle(artikel.judul);
      setContent(artikel.konten);
      setThumbnailPreview(artikel.thumbnail || null);
      setOldThumbnailUrl(artikel.thumbnail || null);

      const { data: tagRelations } = await supabase
        .from("artikel_tag")
        .select("tag_id(nama_tag)")
        .eq("artikel_id", artikel.artikel_id);

      if (tagRelations) {
        const tagNames = tagRelations
          .map((tr) => {
            const tagObj = Array.isArray(tr.tag_id) ? tr.tag_id[0] : tr.tag_id;
            return tagObj?.nama_tag;
          })
          .filter(Boolean) as string[];
        setTags(tagNames);
      }

      setLoading(false);
    };

    fetchArtikel();
  }, [slug, user]);

  const handleThumbnailChange = (file: File | null) => {
    setThumbnailFile(file);
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
  };

  const saveChanges = async (mode: "draft" | "review" | "resubmit") => {
    if (!title.trim()) return setWarning("Title cannot be empty");
    if (!content) return setWarning("Content cannot be empty");
  
    setWarning("Uploading images...");
    let thumbnailUrl = oldThumbnailUrl;
  
    // 🔹 Thumbnail handling (same as before)
    if (thumbnailFile) {
      if (oldThumbnailUrl) {
        const oldPath = oldThumbnailUrl.split(
          "/storage/v1/object/public/aset_artikel/"
        )[1];
        if (oldPath) {
          await supabase.storage.from("aset_artikel").remove([oldPath]);
        }
      }
  
      const { url } = await updateGambar(
        thumbnailFile,
        "thumbnail",
        article.artikel_id
      );
      thumbnailUrl = url;
    }
  
    // 🔹 Upload new embedded images
    const images = extractImages(content);
    const map: Record<string, string> = {};
  
    for (const img of images) {
      if (img.startsWith("data:") || img.startsWith("blob:")) {
        const res = await fetch(img);
        const blob = await res.blob();
        const file = new File([blob], `image-${Date.now()}.png`, { type: blob.type });
  
        const { url } = await updateGambar(file, "gambar_konten", article.artikel_id);
        map[img] = url;
      }
    }
  
    // ✅ Replace blobs with Supabase URLs
    const updatedContent = replaceImageSrc(content, map);
  
    // 🔹 Delete unused old images
    const oldImages = extractImages(article.konten); // images from DB before update
    const newImages = extractImages(updatedContent); // images after user edits
  
    const removed = oldImages.filter(
      (oldImg) =>
        oldImg.startsWith("http") && // only consider Supabase URLs
        !newImages.includes(oldImg)
    );
  
    for (const url of removed) {
      const oldPath = url.split("/storage/v1/object/public/aset_artikel/")[1];
      if (oldPath) {
        await supabase.storage.from("aset_artikel").remove([oldPath]);
      }
    }
  
    try {
      await supabase
        .from("artikel")
        .update({
          judul: title,
          konten: updatedContent,
          thumbnail: thumbnailUrl,
          status:
            mode === "draft"
              ? "draft"
              : mode === "review"
              ? "direview"
              : "direview",
        })
        .eq("artikel_id", article.artikel_id);
  
      // 🔹 tag handling (same as before)...
  
      setWarning("✅ Article updated successfully!");
      setOldThumbnailUrl(thumbnailUrl);
      setContent(updatedContent);
      setArticle({ ...article, konten: updatedContent }); // 👈 keep "old" in sync
    } catch (err: any) {
      setWarning("❌ Failed to update article: " + (err.message ?? err));
    }
  };

  if (loading) return <p>Loading article...</p>;
  if (unauthorized) return <Navigate to="/artikel" replace />;
  if (!article) return <p>No article found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Article</h1>
      {warning && (
        <div className="p-3 rounded bg-yellow-100 border border-yellow-400 text-yellow-800 mb-4">
          {warning}
        </div>
      )}
      <ArtikelForm
        title={title}
        setTitle={setTitle}
        slug={article.slug}
        thumbnailPreview={thumbnailPreview}
        onThumbnailChange={handleThumbnailChange}
        tags={tags}
        setTags={setTags}
        tagInput={tagInput}
        setTagInput={setTagInput}
        content={content}
        onContentChange={setContent}
      />
      <div className="mt-4 space-x-2">
        {article.status === "draft" && (
          <>
            <button
              onClick={() => saveChanges("draft")}
              className="px-4 py-2 bg-gray-600 text-white rounded"
            >
              Save Draft
            </button>
            <button
              onClick={() => saveChanges("review")}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Submit for Review
            </button>
          </>
        )}
        {(article.status === "direview" || article.status === "terbit") && (
          <button
            onClick={() => saveChanges("resubmit")}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Resubmit for Review
          </button>
        )}
      </div>
    </div>
  );
}