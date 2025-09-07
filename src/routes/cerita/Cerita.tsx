// src/routes/cerita/Cerita.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabase";
import { Link } from "react-router-dom";
import FilterSearchSort from "../../components/utilities/FilterSearchSort";

interface Tag {
  tag_id: number;
  nama_tag: string;
}

export interface Cerita {
  cerita_id: number;
  judul: string;
  user_id: number;
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

  // Search/filter/sort state
  const [searchWord, setSearchWord] = useState("");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "word">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [filteredCeritas, setFilteredCeritas] = useState<Cerita[]>([]);

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
        setFilteredCeritas(mapped);
      }

      setLoading(false);
    };

    fetchCeritas();
  }, []);

  useEffect(() => {
    let filtered = [...ceritas];

    if (searchWord.trim()) {
      const lower = searchWord.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.judul.toLowerCase().includes(lower) ||
          c.tags?.some((t) => t.nama_tag.toLowerCase().includes(lower))
      );
    }

    if (filterTags.length > 0) {
      filtered = filtered.filter((c) =>
        filterTags.every((ft) => c.tags?.some((t) => t.nama_tag === ft))
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.tanggal_dibuat).getTime();
        const dateB = new Date(b.tanggal_dibuat).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === "asc"
          ? a.judul.localeCompare(b.judul)
          : b.judul.localeCompare(a.judul);
      }
    });

    setFilteredCeritas(filtered);
  }, [searchWord, ceritas, filterTags, sortBy, sortOrder]);

  if (loading) return <p className="p-8">Loading...</p>;
  if (ceritas.length === 0) return <p className="p-8">Belum ada cerita terbit.</p>;

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
      <div className="relative h-80 md:h-60 flex items-center justify-center text-center px-6 overflow-hidden">
      {/* Background image */}
      <div
          className="absolute inset-0"
          style={{
          backgroundImage: `url('/tentang/cerita.jfif')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transform: "scale(1.2)",
          }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-primer/70"></div> {/* overlay with 70% opacity */}

      {/* Hero Text */}
      <h1 className="relative text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg z-10">
          Eksplorasi Cerita
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

        {/* Cerita cards */}
        <div className="space-y-6">
          {filteredCeritas.map((c) => (
            <Link
              key={c.cerita_id}
              to={`/cerita/${c.cerita_id}`}
              className="flex flex-col md:flex-row bg-white border border-black rounded-lg shadow hover:shadow-lg transition overflow-hidden"
            >
              {c.gambar && (
                <img
                  src={c.gambar}
                  alt={c.judul}
                  className="w-full md:w-72 h-72 object-cover flex-shrink-0"
                />
              )}
              <div className="p-6 flex flex-col justify-between flex-grow">
                <h2 className="font-bold text-2xl mb-3">{c.judul}</h2>

                {(c.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
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
                  <p className="text-gray-700 mb-3 flex-grow">
                    {parseInformasiSnippet(c.informasi)}
                    {c.informasi.content.length > 200 ? "..." : ""}
                  </p>
                )}

                <p className="text-sm text-gray-500">By {c.author_nama}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}