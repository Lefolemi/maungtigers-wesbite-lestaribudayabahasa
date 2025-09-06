// src/routes/cerita/CeritaDetail.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabase";

interface Tag {
  tag_id: number;
  nama_tag: string;
}

interface CeritaDetail {
  judul: string;
  gambar?: string | null;
  informasi?: any;
  terakhir_edit: string | null;
  user_id: string;
  author_nama: string;
  bahasa_nama?: string;
  tags: Tag[];
}

export default function CeritaDetail() {
  const { id } = useParams<{ id: string }>();
  const [cerita, setCerita] = useState<CeritaDetail | null>(null);
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
          gambar,
          informasi,
          terakhir_edit,
          user_id,
          bahasa_id,
          user:user_id(nama),
          bahasa:bahasa_id(nama_bahasa)
        `)
        .eq("cerita_id", id)
        .eq("status", "terbit")
        .single();

      if (error || !data) {
        console.error("Failed to fetch cerita:", error);
        setCerita(null);
        setLoading(false);
        return;
      }

      // Fetch tags separately
      const { data: tagsData } = await supabase
        .from("cerita_tag")
        .select(`tag:tag_id(nama_tag)`)
        .eq("cerita_id", data.cerita_id);

      const tags: Tag[] =
        tagsData?.map((t: any) => ({
          tag_id: t.tag.tag_id,
          nama_tag: t.tag.nama_tag,
        })) || [];

      setCerita({
        judul: data.judul,
        gambar: data.gambar,
        informasi: typeof data.informasi === "string" ? JSON.parse(data.informasi) : data.informasi,
        terakhir_edit: data.terakhir_edit,
        user_id: data.user_id,
        author_nama: (data.user as any)?.nama || "Unknown",
        bahasa_nama: (data.bahasa as any)?.nama_bahasa || "Unknown",
        tags,
      });

      setLoading(false);
    };

    fetchCerita();
  }, [id]);

  if (loading) return <p className="p-8">Loading...</p>;
  if (!cerita) return <p className="p-8 text-red-600">Cerita tidak ditemukan.</p>;

  const parseInformasi = (informasi: any) => {
    if (!informasi?.content) return "";
    return informasi.content
      .filter((b: any) => b.type === "paragraph")
      .map((b: any) => b.content?.map((c: any) => c.text).join("") ?? "")
      .join(" ");
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">{cerita.judul}</h1>

      {cerita.gambar && (
        <img
          src={cerita.gambar}
          alt={cerita.judul}
          className="w-full max-h-96 object-cover rounded"
        />
      )}

      <div className="text-sm text-gray-500">
        <p>Terakhir edit: {cerita.terakhir_edit || "Unknown"} | Bahasa: {cerita.bahasa_nama}</p>
        <p>Author: {cerita.author_nama}</p>
      </div>

      {/* Render informasi manually */}
      <div className="prose space-y-2">
        {cerita.informasi?.content?.map((block: any, idx: number) => {
          if (block.type === "paragraph") {
            const text = block.content?.map((c: any) => c.text).join("") ?? "";
            return <p key={idx}>{text}</p>;
          }
          if (block.type === "image") {
            return (
              <img
                key={idx}
                src={block.attrs?.src}
                alt={block.attrs?.alt ?? ""}
                className="max-w-full rounded"
              />
            );
          }
          return null;
        })}
      </div>

      {/* Render tags */}
      {(cerita.tags ?? []).length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {cerita.tags.map((t) => (
            <span
              key={t.tag_id}
              className="text-xs bg-gray-200 px-2 py-1 rounded"
            >
              {t.nama_tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}