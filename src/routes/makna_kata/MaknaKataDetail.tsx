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

      // fetch tags
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

  if (loading) return <p className="p-8">Loading...</p>;
  if (!entry) return <p className="p-8 text-red-600">Makna Kata tidak ditemukan.</p>;

  const parseInformasi = (informasi: any) => {
    if (!informasi?.content) return "";
    return informasi.content
      .filter((b: any) => b.type === "paragraph")
      .map((b: any) => b.content?.map((c: any) => c.text).join("") ?? "")
      .join(" ");
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">{entry.kata}</h1>
      <p className="text-sm text-gray-500">
        Terakhir edit: {entry.terakhir_edit || "Unknown"} | Bahasa: {entry.bahasa_nama}
      </p>
      <p className="text-gray-700 text-lg mb-2">{entry.arti}</p>

      {entry.gambar && (
        <img
          src={entry.gambar}
          alt={entry.kata}
          className="w-full max-h-96 object-cover rounded"
        />
      )}

      {/* Render informasi manually */}
      <div className="prose space-y-2">
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
                className="max-w-full rounded"
              />
            );
          }
          return null;
        })}
      </div>

      {/* Render tags */}
      {entry.tags.length > 0 && (
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

      <p className="text-xs text-gray-400 mt-4">By {entry.author_nama}</p>
    </div>
  );
}