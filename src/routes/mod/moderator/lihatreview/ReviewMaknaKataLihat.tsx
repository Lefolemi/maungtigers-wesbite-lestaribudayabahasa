// src/routes/moderator/ReviewMaknaKataLihat.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../../backend/supabase";

interface Tag {
  tag_id: number;
  nama_tag: string;
}

interface MaknaKata {
  makna_id: number;
  kata_id: number;
  arti: string;
  informasi: any;
  etimologi: any;
  gambar: string | null;
  tags: Tag[];
}

export default function ReviewMaknaKataLihat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [makna, setMakna] = useState<MaknaKata | null>(null);

  const fetchMakna = async () => {
    if (!id) return;
    setLoading(true);

    // 1️⃣ Fetch makna_kata
    const { data: maknaData, error: maknaError } = await supabase
      .from("makna_kata")
      .select("*")
      .eq("makna_id", id)
      .single();

    if (maknaError || !maknaData) {
      console.error(maknaError);
      setMakna(null);
      setLoading(false);
      return;
    }

    // 2️⃣ Fetch tags separately
    const { data: tagRelations, error: tagError } = await supabase
      .from("makna_kata_tag")
      .select("tag_id, tag(nama_tag)")
      .eq("makna_id", id);

    const tags: Tag[] =
      tagRelations?.map((tr: any) => ({
        tag_id: tr.tag_id,
        nama_tag: tr.tag?.nama_tag ?? "Unknown",
      })) || [];

    setMakna({
      makna_id: maknaData.makna_id,
      kata_id: maknaData.kata_id,
      arti: maknaData.arti,
      informasi: maknaData.informasi,
      etimologi: maknaData.etimologi,
      gambar: maknaData.gambar,
      tags,
    });

    setLoading(false);
  };

  useEffect(() => {
    fetchMakna();
  }, [id]);

  const parseTipTap = (json: any) => {
    try {
      const contentJson = typeof json === "string" ? JSON.parse(json) : json;
      return (
        contentJson?.content
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
          .join("") ?? ""
      );
    } catch (err) {
      console.error("Failed to parse TipTap JSON:", err);
      return "";
    }
  };

  if (loading) return <p className="p-4">Loading Makna Kata...</p>;

  if (!makna) {
    return (
      <div className="p-4">
        <p>Tidak ada Makna Kata untuk ditampilkan.</p>
        <button
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate(-1)}
        >
          Kembali
        </button>
      </div>
    );
  }

  const informasiHtml = parseTipTap(makna.informasi);
  const etimologiHtml = parseTipTap(makna.etimologi);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold">{makna.arti}</h1>

      {makna.gambar && (
        <img
          src={makna.gambar}
          alt={makna.arti}
          className="w-full max-h-96 object-cover rounded"
        />
      )}

      <section>
        <h2 className="text-xl font-semibold mt-4">Informasi</h2>
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: informasiHtml }}
        />
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-4">Etimologi</h2>
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: etimologiHtml }}
        />
      </section>

      {makna.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {makna.tags.map((t) => (
            <span
              key={t.tag_id}
              className="text-xs bg-gray-200 px-2 py-1 rounded"
            >
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