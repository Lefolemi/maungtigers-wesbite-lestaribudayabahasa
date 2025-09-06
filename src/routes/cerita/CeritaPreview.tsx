// src/routes/cerita/CeritaPreview.tsx
import { useLocation, useNavigate } from "react-router-dom";

export default function CeritaPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const cerita = (location.state as { cerita?: any })?.cerita;

  if (!cerita) {
    return (
      <div className="p-4">
        <p>Tidak ada cerita untuk preview.</p>
        <button
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate(-1)}
        >
          Kembali
        </button>
      </div>
    );
  }

  const parseTipTap = (json: any) => {
    try {
      const contentJson = typeof json === "string" ? JSON.parse(json) : json;
      return (
        contentJson?.content
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
          .join("") ?? ""
      );
    } catch (err) {
      console.error("Failed to parse TipTap JSON:", err);
      return "";
    }
  };

  const informasiHtml = parseTipTap(cerita.informasi);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold">{cerita.judul}</h1>
      {cerita.gambar && (
        <img
          src={cerita.gambar}
          alt={cerita.judul}
          className="w-full max-h-96 object-cover rounded"
        />
      )}

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: informasiHtml }}
      />

      {cerita.tags?.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {cerita.tags.map((t: any) => (
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