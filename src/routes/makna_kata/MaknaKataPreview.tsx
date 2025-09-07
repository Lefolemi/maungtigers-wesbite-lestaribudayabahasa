// src/routes/makna-kata/MaknaKataPreview.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabase";

interface Tag {
  tag_id: number;
  nama_tag: string;
}

interface MaknaKataFull {
  makna_id: number;
  kata: string;
  arti: string;
  gambar?: string | null;
  informasi?: any;
  etimologi?: any;
  terakhir_edit: string | null;
  user_id: number;
  author_nama: string;
  bahasa_nama: string;
  tags: Tag[];
}

export default function MaknaKataPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateMakna = (location.state as { makna?: any })?.makna;

  const [entry, setEntry] = useState<MaknaKataFull | null>(stateMakna || null);
  const [loading, setLoading] = useState(!stateMakna);

  // If we already got the minimal entry via state, fetch full detail
  useEffect(() => {
    const fetchFullEntry = async () => {
      if (!stateMakna) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("makna_kata")
        .select(`
          makna_id,
          arti,
          gambar,
          informasi,
          etimologi,
          terakhir_edit,
          user_id,
          user:user_id(nama),
          kamus:kata_id(kata),
          bahasa:bahasa_id(nama_bahasa)
        `)
        .eq("makna_id", stateMakna.makna_id)
        .single();

      if (error || !data) {
        console.error("Failed to fetch Makna Kata:", error);
        setEntry(stateMakna); // fallback to minimal
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
        makna_id: data.makna_id,
        kata: (data.kamus as any)?.kata || "Unknown",
        arti: data.arti,
        gambar: data.gambar,
        informasi: typeof data.informasi === "string" ? JSON.parse(data.informasi) : data.informasi,
        etimologi: typeof data.etimologi === "string" ? JSON.parse(data.etimologi) : data.etimologi,
        terakhir_edit: data.terakhir_edit,
        user_id: data.user_id,
        author_nama: (data.user as any)?.nama || "Unknown",
        bahasa_nama: (data.bahasa as any)?.nama_bahasa || "Unknown",
        tags,
      });

      setLoading(false);
    };

    fetchFullEntry();
  }, [stateMakna]);

  const parseTipTap = (json: any) => {
    if (!json) return "";
    const contentJson = typeof json === "string" ? JSON.parse(json) : json;
    if (!contentJson?.content) return "";
    return contentJson.content
      .map((block: any) => {
        if (block.type === "paragraph") {
          const text = block.content?.map((c: any) => c.text).join("") ?? "";
          return `<p>${text}</p>`;
        }
        if (block.type === "image") {
          return `<img src="${block.attrs?.src}" alt="${block.attrs?.alt ?? ""}" class="max-w-full rounded" />`;
        }
        return "";
      })
      .join("");
  };

  if (loading) return <p className="p-8">Loading...</p>;
  if (!entry) return <p className="p-8 text-red-600">Makna Kata tidak ditemukan.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold">{entry.kata}</h1>
      <p className="text-sm text-gray-500 mb-4">
        Terakhir edit: {entry.terakhir_edit || "Unknown"} | Bahasa: {entry.bahasa_nama}
      </p>
      <p className="text-lg text-gray-700 mb-4">{entry.arti}</p>

      {entry.gambar && (
        <img
          src={entry.gambar}
          alt={entry.kata}
          className="w-full max-h-96 object-cover rounded mb-4"
        />
      )}

      {entry.informasi && (
        <section className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Informasi</h2>
          <div className="prose" dangerouslySetInnerHTML={{ __html: parseTipTap(entry.informasi) }} />
        </section>
      )}

      {entry.etimologi && (
        <section className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Etimologi</h2>
          <div className="prose" dangerouslySetInnerHTML={{ __html: parseTipTap(entry.etimologi) }} />
        </section>
      )}

      {entry.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {entry.tags.map((t) => (
            <span key={t.tag_id} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
              {t.nama_tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          className="px-4 py-2 bg-sekunder text-white rounded-figma-md hover:bg-sekunder/90"
          onClick={() => navigate(-1)}
        >
          Kembali
        </button>
      </div>
    </div>
  );
}