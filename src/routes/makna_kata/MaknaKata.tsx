// src/routes/makna-kata/MaknaKata.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabase";
import { Link } from "react-router-dom";

interface Tag {
  tag_id: number;
  nama_tag: string;
}

interface MaknaKata {
  makna_id: number;
  kata: string;
  arti: string;
  gambar?: string | null;
  informasi?: any;
  terakhir_edit: string | null;
  tanggal_dibuat: string;
  user_id: number;
  author_nama: string;
  bahasa_nama: string;
  tags?: Tag[];
}

export default function MaknaKata() {
  const [entries, setEntries] = useState<MaknaKata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaknaKata = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("makna_kata")
        .select(`
          makna_id,
          kata_id,
          arti,
          gambar,
          informasi,
          terakhir_edit,
          tanggal_dibuat,
          user_id,
          user:user_id(nama),
          kamus:kata_id(kata),
          bahasa:bahasa_id(nama_bahasa)
        `)
        .eq("status", "terbit")
        .order("tanggal_dibuat", { ascending: false });

      if (error) {
        console.error("Failed to fetch Makna Kata:", error);
        setEntries([]);
      } else {
        const mapped: MaknaKata[] = [];

        for (const m of data || []) {
          // fetch tags for this entry
          const { data: tagsData } = await supabase
            .from("makna_kata_tag")
            .select(`tag:tag_id(nama_tag)`)
            .eq("makna_id", m.makna_id);

          const tags: Tag[] =
            tagsData?.map((t: any) => ({
              tag_id: t.tag.tag_id,
              nama_tag: t.tag.nama_tag,
            })) || [];

          mapped.push({
            makna_id: m.makna_id,
            kata: (m.kamus as any)?.kata || "Unknown",
            arti: m.arti,
            gambar: m.gambar,
            informasi: typeof m.informasi === "string" ? JSON.parse(m.informasi) : m.informasi,
            terakhir_edit: m.terakhir_edit,
            tanggal_dibuat: m.tanggal_dibuat,
            user_id: m.user_id,
            author_nama: (m.user as any)?.nama || "Unknown",
            bahasa_nama: (m.bahasa as any)?.nama_bahasa || "Unknown",
            tags,
          });
        }

        setEntries(mapped);
      }

      setLoading(false);
    };

    fetchMaknaKata();
  }, []);

  if (loading) return <p className="p-8">Loading...</p>;
  if (entries.length === 0) return <p className="p-8">Belum ada makna kata terbit.</p>;

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
      <h1 className="text-3xl font-bold mb-6">Daftar Makna Kata</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {entries.map((m) => (
          <Link
            key={m.makna_id}
            to={`/makna-kata/${m.makna_id}`}
            className="border rounded p-4 hover:shadow-lg transition-shadow flex flex-col"
          >
            {m.gambar && (
              <img
                src={m.gambar}
                alt={m.kata}
                className="w-full h-40 object-cover rounded mb-3"
              />
            )}
            <p className="text-sm text-gray-500 mb-1">
              Terakhir edit: {m.terakhir_edit || m.tanggal_dibuat} | Bahasa: {m.bahasa_nama}
            </p>
            <h2 className="font-semibold text-lg mb-2">{m.kata}</h2>
            <p className="text-gray-700 text-sm mb-2">{m.arti}</p>
            {(m.tags ?? []).length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {m.tags!.map((t) => (
                  <span
                    key={t.tag_id}
                    className="text-xs bg-gray-200 px-2 py-1 rounded"
                  >
                    {t.nama_tag}
                  </span>
                ))}
              </div>
            )}
            {m.informasi?.content && (
              <p className="text-gray-700 text-sm">
                {parseInformasiSnippet(m.informasi)}
                {m.informasi.content.length > 150 ? "..." : ""}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-auto">By {m.author_nama}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}