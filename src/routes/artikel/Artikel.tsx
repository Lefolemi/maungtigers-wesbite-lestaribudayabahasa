// src/routes/artikel/Artikel.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabase";
import { Link } from "react-router-dom";

interface Tag {
  tag_id: number;
  nama_tag: string;
}

interface Artikel {
  artikel_id: number;
  judul: string;
  slug: string;
  terakhir_edit: string | null;
  tanggal_dibuat: string;
  user_id: number;
  author_nama: string;
  thumbnail?: string | null;
  konten?: any;
  tags?: Tag[];
}

export default function Artikel() {
  const [artikels, setArtikels] = useState<Artikel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtikels = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("artikel")
        .select(`
          artikel_id,
          judul,
          slug,
          thumbnail,
          konten,
          terakhir_edit,
          tanggal_dibuat,
          user_id,
          user:user_id(nama)
        `)
        .eq("status", "terbit")
        .order("tanggal_dibuat", { ascending: false });

      if (error) {
        console.error("Failed to fetch articles:", error);
      } else {
        const mapped: Artikel[] = [];
        for (const a of data || []) {
          // fetch tags per article
          const { data: tagsData } = await supabase
            .from("artikel_tag")
            .select(`tag:tag_id(nama_tag)`)
            .eq("artikel_id", a.artikel_id);

          const tags: Tag[] =
            tagsData?.map((t: any) => ({
              tag_id: t.tag.tag_id,
              nama_tag: t.tag.nama_tag,
            })) || [];

          mapped.push({
            artikel_id: a.artikel_id,
            judul: a.judul,
            slug: a.slug,
            thumbnail: a.thumbnail,
            konten: typeof a.konten === "string" ? JSON.parse(a.konten) : a.konten,
            terakhir_edit: a.terakhir_edit,
            tanggal_dibuat: a.tanggal_dibuat,
            user_id: a.user_id,
            author_nama: (a.user as any)?.nama || "Unknown",
            tags,
          });
        }

        setArtikels(mapped);
      }

      setLoading(false);
    };

    fetchArtikels();
  }, []);

  if (loading) return <p className="p-8">Loading...</p>;
  if (artikels.length === 0) return <p className="p-8">Belum ada artikel terbit.</p>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Daftar Artikel</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {artikels.map((a) => (
          <Link
            key={a.artikel_id}
            to={`/artikel/${a.slug}`}
            className="border rounded p-4 hover:shadow-lg transition-shadow flex flex-col"
          >
            {a.thumbnail && (
              <img
                src={a.thumbnail}
                alt={a.judul}
                className="w-full h-40 object-cover rounded mb-3"
              />
            )}
            <p className="text-sm text-gray-500 mb-1">
              Terakhir edit: {a.terakhir_edit || a.tanggal_dibuat}
            </p>
            <h2 className="font-semibold text-lg mb-2">{a.judul}</h2>
            {(a.tags ?? []).length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {a.tags!.map((t) => (
                  <span
                    key={t.tag_id}
                    className="text-xs bg-gray-200 px-2 py-1 rounded"
                  >
                    {t.nama_tag}
                  </span>
                ))}
              </div>
            )}
            {a.konten?.content && (
              <p className="text-gray-700 text-sm">
                {a.konten.content
                  .filter((b: any) => b.type === "paragraph")
                  .map((b: any) => b.content?.map((c: any) => c.text).join("") ?? "")
                  .join(" ")
                  .slice(0, 100)}
                {a.konten.content.length > 100 ? "..." : ""}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-auto">By {a.author_nama}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
