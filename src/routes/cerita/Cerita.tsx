// src/routes/cerita/Cerita.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabase";
import { Link } from "react-router-dom";

interface Tag {
  tag_id: number;
  nama_tag: string;
}

interface Cerita {
  cerita_id: number;
  judul: string;
  user_id: string;
  author_nama: string;
  gambar?: string | null;
  informasi?: any;
  terakhir_edit: string | null;
  tanggal_dibuat: string;
  bahasa_nama?: string;
  tags?: Tag[];
}

export default function Cerita() {
  const [ceritas, setCeritas] = useState<Cerita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCeritas = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("cerita")
        .select(`
          cerita_id,
          judul,
          gambar,
          informasi,
          terakhir_edit,
          tanggal_dibuat,
          user_id,
          bahasa_id,
          user:user_id(nama),
          bahasa:bahasa_id(nama_bahasa)
        `)
        .eq("status", "terbit")
        .order("tanggal_dibuat", { ascending: false });

      if (error) {
        console.error("Failed to fetch ceritas:", error);
        setCeritas([]);
      } else {
        const mapped: Cerita[] = [];

        for (const c of data || []) {
          // fetch tags per cerita
          const { data: tagsData } = await supabase
            .from("cerita_tag")
            .select(`tag:tag_id(nama_tag)`)
            .eq("cerita_id", c.cerita_id);

          const tags: Tag[] =
            tagsData?.map((t: any) => ({
              tag_id: t.tag.tag_id,
              nama_tag: t.tag.nama_tag,
            })) || [];

          mapped.push({
            cerita_id: c.cerita_id,
            judul: c.judul,
            gambar: c.gambar,
            informasi: typeof c.informasi === "string" ? JSON.parse(c.informasi) : c.informasi,
            terakhir_edit: c.terakhir_edit,
            tanggal_dibuat: c.tanggal_dibuat,
            user_id: c.user_id,
            author_nama: (c.user as any)?.nama || "Unknown",
            bahasa_nama: (c.bahasa as any)?.nama_bahasa || "Unknown",
            tags,
          });
        }

        setCeritas(mapped);
      }

      setLoading(false);
    };

    fetchCeritas();
  }, []);

  if (loading) return <p className="p-8">Loading...</p>;
  if (ceritas.length === 0) return <p className="p-8">Belum ada cerita terbit.</p>;

  const parseInformasiSnippet = (informasi: any) => {
    if (!informasi?.content) return "";
    return informasi.content
      .filter((b: any) => b.type === "paragraph")
      .map((b: any) => b.content?.map((c: any) => c.text).join("") ?? "")
      .join(" ")
      .slice(0, 150);
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Daftar Cerita</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {ceritas.map((c) => (
          <Link
            key={c.cerita_id}
            to={`/cerita/${c.cerita_id}`}
            className="border rounded p-4 hover:shadow-lg transition-shadow flex flex-col"
          >
            {c.gambar && (
              <img
                src={c.gambar}
                alt={c.judul}
                className="w-full h-40 object-cover rounded mb-3"
              />
            )}
            <p className="text-sm text-gray-500 mb-1">
              Terakhir edit: {c.terakhir_edit || c.tanggal_dibuat} | Bahasa: {c.bahasa_nama}
            </p>
            <h2 className="font-semibold text-lg mb-2">{c.judul}</h2>
            {(c.tags ?? []).length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {(c.tags ?? []).map((t) => (
                  <span
                    key={t.tag_id}
                    className="text-xs bg-gray-200 px-2 py-1 rounded"
                  >
                    {t.nama_tag}
                  </span>
                ))}
              </div>
            )}
            {c.informasi?.content && (
              <p className="text-gray-700 text-sm">
                {parseInformasiSnippet(c.informasi)}
                {c.informasi.content.length > 150 ? "..." : ""}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-auto">By {c.author_nama}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}