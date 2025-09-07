// src/routes/makna-kata/MaknaKata.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabase";
import { Link } from "react-router-dom";
import FilterSearchSort from "../../components/utilities/FilterSearchSort";

interface Tag {
  tag_id: number;
  nama_tag: string;
}

export interface MaknaKata {
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

  // Search/filter/sort state
  const [searchWord, setSearchWord] = useState("");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "word">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [filteredEntries, setFilteredEntries] = useState<MaknaKata[]>([]);

  useEffect(() => {
    const fetchMaknaKata = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("makna_kata")
        .select(`
          makna_id,
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
        setFilteredEntries(mapped);
      }

      setLoading(false);
    };

    fetchMaknaKata();
  }, []);

  useEffect(() => {
    let filtered = [...entries];

    if (searchWord.trim()) {
      const lower = searchWord.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.kata.toLowerCase().includes(lower) ||
          e.arti.toLowerCase().includes(lower) ||
          e.tags?.some((t) => t.nama_tag.toLowerCase().includes(lower))
      );
    }

    if (filterTags.length > 0) {
      filtered = filtered.filter((e) =>
        filterTags.every((ft) => e.tags?.some((t) => t.nama_tag === ft))
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.tanggal_dibuat).getTime();
        const dateB = new Date(b.tanggal_dibuat).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === "asc"
          ? a.kata.localeCompare(b.kata)
          : b.kata.localeCompare(a.kata);
      }
    });

    setFilteredEntries(filtered);
  }, [searchWord, entries, filterTags, sortBy, sortOrder]);

  if (loading) return <p className="p-8">Loading...</p>;
  if (entries.length === 0) return <p className="p-8">Belum ada makna kata terbit.</p>;

  const parseInformasiSnippet = (informasi: any) => {
    if (!informasi?.content) return "";
    return informasi.content
      .filter((b: any) => b.type === "paragraph")
      .map((b: any) => b.content?.map((c: any) => c.text).join("") ?? "")
      .join(" ")
      .slice(0, 200);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-40 bg-primer flex items-center justify-center text-center px-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
          Eksplorasi Makna Kata
        </h1>
      </div>

      <div className="p-8 space-y-6">
        {/* Search / Filter / Sort */}
        <FilterSearchSort
          searchWord={searchWord}
          setSearchWord={setSearchWord}
          filterTags={filterTags}
          setFilterTags={setFilterTags}
          tagInput={tagInput}
          setTagInput={setTagInput}
          filterStatus=""
          setFilterStatus={() => {}}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          showStatusFilter={false}
        />

        {/* MaknaKata cards */}
        <div className="space-y-6">
          {filteredEntries.map((m) => (
            <Link
              key={m.makna_id}
              to={`/makna-kata/${m.makna_id}`}
              className="flex flex-col md:flex-row bg-white border border-black rounded-lg shadow hover:shadow-lg transition overflow-hidden"
            >
              {m.gambar && (
                <img
                  src={m.gambar}
                  alt={m.kata}
                  className="w-full md:w-72 h-72 object-cover flex-shrink-0"
                />
              )}
              <div className="p-6 flex flex-col justify-between flex-grow">
                <h2 className="font-bold text-2xl mb-3">{m.kata}</h2>
                <p className="text-gray-700 mb-3">{m.arti}</p>

                {(m.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(m.tags ?? []).map((t) => (
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
                  <p className="text-gray-700 mb-3 flex-grow">
                    {parseInformasiSnippet(m.informasi)}
                    {m.informasi.content.length > 200 ? "..." : ""}
                  </p>
                )}

                <p className="text-sm text-gray-500">By {m.author_nama}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}