// src/routes/cerita/CeritaPreview.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabase";

interface Tag {
  tag_id: number;
  nama_tag: string;
}

interface CeritaFull {
  cerita_id: number;
  judul: string;
  gambar?: string | null;
  informasi?: any;
  tags?: Tag[];
}

export default function CeritaPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateCerita = (location.state as { cerita?: any })?.cerita;

  const [entry, setEntry] = useState<CeritaFull | null>(stateCerita || null);
  const [loading, setLoading] = useState(!stateCerita);

  useEffect(() => {
    const fetchFullCerita = async () => {
      if (!stateCerita) return;
      setLoading(true);

      // fetch full cerita
      const { data, error } = await supabase
        .from("cerita")
        .select(`
          cerita_id,
          judul,
          gambar,
          informasi
        `)
        .eq("cerita_id", stateCerita.cerita_id)
        .single();

      if (error || !data) {
        console.error("Failed to fetch cerita:", error);
        setEntry(stateCerita); // fallback
        setLoading(false);
        return;
      }

      // fetch tags
      const { data: tagsData } = await supabase
        .from("cerita_tag")
        .select("tag:tag_id(nama_tag)")
        .eq("cerita_id", data.cerita_id);

      const tags: Tag[] =
        tagsData?.map((t: any) => ({
          tag_id: t.tag.tag_id,
          nama_tag: t.tag.nama_tag,
        })) || [];

      setEntry({
        ...data,
        informasi:
          typeof data.informasi === "string" ? JSON.parse(data.informasi) : data.informasi,
        tags,
      });

      setLoading(false);
    };

    fetchFullCerita();
  }, [stateCerita]);

  const parseTipTap = (json: any) => {
    if (!json) return "";
    try {
      const contentJson = typeof json === "string" ? JSON.parse(json) : json;
      return contentJson?.content
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
      console.error("Failed to parse TipTap JSON:", err);
      return "";
    }
  };

  if (loading) return <p className="p-8">Loading...</p>;
  if (!entry) return <p className="p-8 text-red-600">Cerita tidak ditemukan.</p>;

  const informasiHtml = parseTipTap(entry.informasi);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-xl space-y-4">
      <h1 className="text-3xl font-bold">{entry.judul}</h1>

      {entry.gambar && (
        <img
          src={entry.gambar}
          alt={entry.judul}
          className="w-full max-h-96 object-cover rounded"
        />
      )}

      {entry.informasi && (
        <div className="prose" dangerouslySetInnerHTML={{ __html: informasiHtml }} />
      )}

      {entry.tags && entry.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {entry.tags.map((t) => (
            <span
              key={t.tag_id}
              className="text-xs bg-gray-200 px-2 py-1 rounded"
            >
              {t.nama_tag}
            </span>
          ))}
        </div>
      )}

      <div className="text-center mt-6">
        <button
          className="px-4 py-2 bg-sekunder text-white rounded-figma-md hover:bg-sekunder/90"
          onClick={() => navigate(-1)}
        >
          Kembali
        </button>
      </div>
    </div>
  );
}