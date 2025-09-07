// src/routes/makna-kata/MaknaKataDetail.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabase";

interface Tag {
  tag_id: number;
  nama_tag: string;
}

interface MaknaKataDetail {
  kata: string;
  arti: string;
  gambar?: string | null;
  informasi?: any;
  terakhir_edit: string | null;
  user_id: number;
  author_nama: string;
  bahasa_nama: string;
  tags: Tag[];
}

export default function MaknaKataDetail() {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<MaknaKataDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchEntry = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("makna_kata")
        .select(`
          makna_id,
          arti,
          gambar,
          informasi,
          terakhir_edit,
          user_id,
          user:user_id(nama),
          kamus:kata_id(kata),
          bahasa:bahasa_id(nama_bahasa)
        `)
        .eq("makna_id", id)
        .eq("status", "terbit")
        .single();

      if (error || !data) {
        console.error("Failed to fetch Makna Kata:", error);
        setEntry(null);
        setLoading(false);
        return;
      }

      const { data: tagsData } = await supabase
        .from("makna_kata_tag")
        .select(`tag:tag_id(nama_tag)`)
        .eq("makna_id", data.makna_id);

      const tags: Tag[] =
        tagsData?.map((t: any) => ({
          tag_id: t.tag.tag_id,
          nama_tag: t.tag.nama_tag,
        })) || [];

      setEntry({
        kata: (data.kamus as any)?.kata || "Unknown",
        arti: data.arti,
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

    fetchEntry();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );

  if (!entry)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-red-600 font-medium">Makna Kata tidak ditemukan.</p>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto my-10 p-6 bg-white rounded-2xl shadow-xl">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-2 text-gray-900">{entry.kata}</h1>

      {/* Metadata */}
      <p className="text-sm text-gray-500 mb-4">
        Terakhir edit: {entry.terakhir_edit || "Unknown"} | Bahasa: {entry.bahasa_nama}
      </p>

      {/* Arti */}
      <p className="text-lg text-gray-700 mb-4">{entry.arti}</p>

      {/* Gambar */}
      {entry.gambar && (
        <img
          src={entry.gambar}
          alt={entry.kata}
          className="w-full max-h-96 object-cover rounded-xl mb-6"
        />
      )}

      {/* Informasi content */}
      <div className="prose prose-lg max-w-full mb-6">
        {entry.informasi?.content?.map((block: any, idx: number) => {
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
      {entry.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {entry.tags.map((t) => (
            <span
              key={t.tag_id}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
            >
              {t.nama_tag}
            </span>
          ))}
        </div>
      )}

      {/* Author */}
      <p className="text-xs text-gray-400 mt-4">By {entry.author_nama}</p>
    </div>
  );
}