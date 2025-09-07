// src/routes/artikel/ArtikelDetail.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabase";

interface Artikel {
  judul: string;
  thumbnail?: string | null;
  slug: string;
  konten: any; 
  terakhir_edit: string | null;
  user_id: number;
  author_nama: string;
  tags: { tag_id: number; nama_tag: string }[];
}

export default function ArtikelDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [artikel, setArtikel] = useState<Artikel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchArtikel = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("artikel")
        .select(`
          artikel_id,
          judul,
          thumbnail,
          slug,
          konten,
          terakhir_edit,
          user_id,
          user:user_id(nama)
        `)
        .eq("slug", slug)
        .eq("status", "terbit")
        .single();

      if (error || !data) {
        console.error(error);
        setArtikel(null);
      } else {
        const { data: tagsData } = await supabase
          .from("artikel_tag")
          .select(`tag:tag_id(nama_tag)`)
          .eq("artikel_id", data.artikel_id);

        const tags = tagsData?.map((t: any) => ({
          tag_id: t.tag.tag_id,
          nama_tag: t.tag.nama_tag,
        })) || [];

        setArtikel({
          judul: data.judul,
          thumbnail: data.thumbnail,
          slug: data.slug,
          konten: typeof data.konten === "string" ? JSON.parse(data.konten) : data.konten,
          terakhir_edit: data.terakhir_edit,
          user_id: data.user_id,
          author_nama: (data.user as any)?.nama || "Unknown",
          tags,
        });
      }

      setLoading(false);
    };

    fetchArtikel();
  }, [slug]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );

  if (!artikel)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-red-600 font-medium">Artikel tidak ditemukan.</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-white rounded-2xl shadow-xl">
      {/* Title */}
      <h1 className="text-4xl font-extrabold mb-4 text-gray-900">{artikel.judul}</h1>

      {/* Thumbnail */}
      {artikel.thumbnail && (
        <img
          src={artikel.thumbnail}
          alt={artikel.judul}
          className="w-full max-h-[500px] object-cover rounded-xl mb-6"
        />
      )}

      {/* Metadata */}
      <div className="flex flex-wrap justify-between text-sm text-gray-500 mb-6 gap-2">
        <span>Terakhir edit: {artikel.terakhir_edit || "Unknown"}</span>
        <span>Author: {artikel.author_nama}</span>
      </div>

      {/* Konten */}
      <div className="prose prose-lg max-w-full mb-6">
        {artikel.konten?.content?.map((block: any, idx: number) => {
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
      {artikel.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {artikel.tags.map((t) => (
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