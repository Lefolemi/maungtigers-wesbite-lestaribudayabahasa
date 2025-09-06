// src/routes/moderator/ReviewArtikelLihat.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../../backend/supabase";

interface Tag {
  tag_id: number;
  nama_tag: string;
}

interface Artikel {
  artikel_id: number;
  judul: string;
  slug: string;
  konten: any;
  thumbnail: string | null;
  tags: Tag[];
}

export default function ReviewArtikelLihat() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [artikel, setArtikel] = useState<Artikel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchArtikel = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("artikel")
        .select(
          `
          artikel_id,
          judul,
          slug,
          konten,
          thumbnail,
          artikel_tag (
            tag_id (tag_id, nama_tag)
          )
        `
        )
        .eq("slug", slug)
        .single();

      if (error || !data) {
        console.error("Failed to fetch article:", error);
        setArtikel(null);
      } else {
        const mapped: Artikel = {
          artikel_id: data.artikel_id,
          judul: data.judul,
          slug: data.slug,
          konten: data.konten,
          thumbnail: data.thumbnail,
          tags: (data.artikel_tag || [])
            .map((t: any) => {
              const tagObj = Array.isArray(t.tag_id) ? t.tag_id[0] : t.tag_id;
              return tagObj ? { tag_id: tagObj.tag_id, nama_tag: tagObj.nama_tag } : null;
            })
            .filter(Boolean) as Tag[],
        };
        setArtikel(mapped);
      }

      setLoading(false);
    };

    fetchArtikel();
  }, [slug]);

  if (loading) return <p>Loading preview...</p>;

  if (!artikel)
    return (
      <div className="p-4">
        <p>Tidak ada artikel untuk preview.</p>
        <button
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate(-1)}
        >
          Kembali
        </button>
      </div>
    );

  // Map TipTap JSON content to HTML
  let htmlContent = "";
  try {
    const contentJson = typeof artikel.konten === "string" ? JSON.parse(artikel.konten) : artikel.konten;
    htmlContent = contentJson?.content
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
    console.error("Failed to parse artikel.konten:", err);
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold">{artikel.judul}</h1>
      {artikel.thumbnail && (
        <img
          src={artikel.thumbnail}
          alt={artikel.judul}
          className="w-full max-h-96 object-cover rounded"
        />
      )}
      <div className="prose" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      {artikel.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {artikel.tags.map((t) => (
            <span key={t.tag_id} className="text-xs bg-gray-200 px-2 py-1 rounded">
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