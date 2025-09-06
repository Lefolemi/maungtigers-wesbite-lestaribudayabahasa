// src/routes/moderator/ReviewCeritaLihat.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../../backend/supabase";

interface Tag {
  tag_id: number;
  nama_tag: string;
}

interface Cerita {
  cerita_id: number;
  judul: string;
  informasi: any;
  gambar: string | null;
  tags: Tag[];
}

export default function ReviewCeritaLihat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cerita, setCerita] = useState<Cerita | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchCerita = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("cerita")
        .select(`
          cerita_id,
          judul,
          informasi,
          gambar,
          cerita_tag (
            tag_id (tag_id, nama_tag)
          )
        `)
        .eq("cerita_id", Number(id))
        .single();

      if (error || !data) {
        console.error(error);
        setCerita(null);
      } else {
        // Map tags safely
        const tags: Tag[] = (data.cerita_tag || [])
          .map((t: any) => {
            const tagObj = Array.isArray(t.tag_id) ? t.tag_id[0] : t.tag_id;
            return tagObj ? { tag_id: tagObj.tag_id, nama_tag: tagObj.nama_tag } : null;
          })
          .filter(Boolean) as Tag[];

        setCerita({
          cerita_id: data.cerita_id,
          judul: data.judul,
          informasi: data.informasi,
          gambar: data.gambar,
          tags,
        });
      }
      setLoading(false);
    };

    fetchCerita();
  }, [id]);

  if (loading) return <p className="p-4">Loading cerita...</p>;
  if (!cerita)
    return (
      <div className="p-4">
        <p>Cerita tidak ditemukan.</p>
        <button
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate(-1)}
        >
          Kembali
        </button>
      </div>
    );

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

      {(cerita.tags ?? []).length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {(cerita.tags ?? []).map((t) => (
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