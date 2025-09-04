// src/routes/artikel/ArtikelDetail.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabase";

interface Artikel {
  judul: string;
  thumbnail?: string | null;
  slug: string;
  konten: any; // Keep as any to handle TipTap JSON
  terakhir_edit: string | null;
  user_id: number;
  author_nama: string;
  tags: { tag_id: number; nama_tag: string }[]; // always an array now
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
        // Fetch tags separately
        const { data: tagsData } = await supabase
          .from("artikel_tag")
          .select(`tag:tag_id(nama_tag)`)
          .eq("artikel_id", data.artikel_id);

        const tags = tagsData?.map((t: any) => ({
          tag_id: t.tag.tag_id,
          nama_tag: t.tag.nama_tag,
        })) || []; // <-- always an array

        setArtikel({
          judul: data.judul,
          thumbnail: data.thumbnail,
          slug: data.slug,
          konten: typeof data.konten === "string" ? JSON.parse(data.konten) : data.konten,
          terakhir_edit: data.terakhir_edit,
          user_id: data.user_id,
          author_nama: (data.user as any)?.nama || "Unknown",
          tags, // set the array
        });
      }

      setLoading(false);
    };

    fetchArtikel();
  }, [slug]);

  if (loading) return <p className="p-8">Loading...</p>;
  if (!artikel) return <p className="p-8 text-red-600">Artikel tidak ditemukan.</p>;

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">{artikel.judul}</h1>
      {artikel.thumbnail && (
        <img
          src={artikel.thumbnail}
          alt={artikel.judul}
          className="w-full max-h-96 object-cover rounded"
        />
      )}
      <div className="text-sm text-gray-500">
        <p>Terakhir edit: {artikel.terakhir_edit || "Unknown"}</p>
        <p>Author: {artikel.author_nama}</p>
      </div>

      {/* Render TipTap content manually */}
      <div className="prose space-y-2">
        {artikel.konten?.content?.map((block: any, index: number) => {
          if (block.type === "paragraph") {
            const text = block.content?.map((c: any) => c.text).join("") ?? "";
            return <p key={index}>{text}</p>;
          }
          if (block.type === "image") {
            return (
              <img
                key={index}
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
    </div>
  );
}