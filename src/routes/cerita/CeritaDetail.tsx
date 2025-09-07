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
        informasi:
          typeof data.informasi === "string"
            ? JSON.parse(data.informasi)
            : data.informasi,
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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );

  if (!cerita)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-red-600 font-medium">Cerita tidak ditemukan.</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-white rounded-2xl shadow-xl">
      {/* Title */}
      <h1 className="text-4xl font-extrabold mb-4 text-gray-900">{cerita.judul}</h1>

      {/* Image */}
      {cerita.gambar && (
        <img
          src={cerita.gambar}
          alt={cerita.judul}
          className="w-full max-h-[500px] object-cover rounded-xl mb-6"
        />
      )}

      {/* Metadata */}
      <div className="flex flex-wrap justify-between text-sm text-gray-500 mb-6 gap-2">
        <span>Terakhir edit: {cerita.terakhir_edit || "Unknown"}</span>
        <span>Bahasa: {cerita.bahasa_nama}</span>
        <span>Author: {cerita.author_nama}</span>
      </div>

      {/* Informasi Content */}
      <div className="prose prose-lg max-w-full mb-6">
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
                className="rounded-lg max-w-full"
              />
            );
          }
          return null;
        })}
      </div>

      {/* Tags */}
      {cerita.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {cerita.tags.map((t) => (
            <span
              key={t.tag_id}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
            >
              {t.nama_tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}