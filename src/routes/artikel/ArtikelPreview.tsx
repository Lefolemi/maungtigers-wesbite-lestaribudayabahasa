// src/routes/artikel/ArtikelPreview.tsx
import { useLocation, useNavigate } from "react-router-dom";
import type { Artikel } from "../user/kontribusiview//KontribusiArtikel";

export default function ArtikelPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const artikel = (location.state as { artikel?: Artikel })?.artikel;

  if (!artikel) {
    return (
      <div className="p-4">
        <p>Tidak ada artikel untuk preview.</p>
        <button
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate(-1)}
        >
          Kembali
        </button>
      </div>
    );
  }

  // Map TipTap JSON content to HTML
    let htmlContent = "";
    try {
    const contentJson = typeof artikel.konten === "string" ? JSON.parse(artikel.konten) : artikel.konten;
    htmlContent = contentJson?.content
        ?.map((block: any) => {
        if (block.type === "paragraph") {
            const text = block.content?.map((c: any) => c.text).join("") ?? "";
            return `<p>${text}</p>`;
        }
        if (block.type === "image") {
            return `<img src="${block.attrs?.src}" alt="${block.attrs?.alt ?? ""}" class="max-w-full rounded" />`;
        }
        return "";
        })
        .join("") ?? "";
    } catch (err) {
    console.error("Failed to parse artikel.konten:", err);
    }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold">{artikel.judul}</h1>
      {artikel.thumbnail && (
        <img
          src={artikel.thumbnail}
          alt={artikel.judul}
          className="w-full max-h-96 object-cover rounded"
        />
      )}
      <div className="prose" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      {artikel.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {artikel.tags.map((t) => (
            <span
              key={t.tag_id}
              className="text-xs bg-gray-200 px-2 py-1 rounded"
            >
              {t.nama_tag}
            </span>
          ))}
        </div>
      )}
      <button
        className="mt-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => navigate(-1)}
      >
        Kembali
      </button>
    </div>
  );
}