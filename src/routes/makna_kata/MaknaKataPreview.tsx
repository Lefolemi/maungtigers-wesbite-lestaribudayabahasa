// src/routes/makna_kata/MaknaKataPreview.tsx
import { useLocation, useNavigate } from "react-router-dom";

export default function MaknaKataPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const makna = (location.state as { makna?: any })?.makna;

  if (!makna) {
    return (
      <div className="p-4">
        <p>Tidak ada makna kata untuk preview.</p>
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

  const informasiHtml = parseTipTap(makna.informasi);
  const etimologiHtml = parseTipTap(makna.etimologi);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold">{makna.arti}</h1>
      {makna.gambar && (
        <img
          src={makna.gambar}
          alt={makna.arti}
          className="w-full max-h-96 object-cover rounded"
        />
      )}

      <section>
        <h2 className="text-xl font-semibold mt-4">Informasi</h2>
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: informasiHtml }}
        />
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-4">Etimologi</h2>
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: etimologiHtml }}
        />
      </section>

      {makna.tags?.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {makna.tags.map((t: any) => (
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