// src/routes/artikel/Artikel.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabase";
import { Link } from "react-router-dom";
import FilterSearchSort from "../../components/utilities/FilterSearchSort";

interface Tag {
  tag_id: number;
  nama_tag: string;
}

export interface Artikel {
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

  // Search/filter/sort state
  const [searchWord, setSearchWord] = useState("");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "word">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [filteredArtikels, setFilteredArtikels] = useState<Artikel[]>([]);

  // Fetch articles
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
        setLoading(false);
        return;
      }

      const mapped: Artikel[] = [];
      for (const a of data || []) {
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
      setFilteredArtikels(mapped);
      setLoading(false);
    };

    fetchArtikels();
  }, []);

  // Apply search/filter/sort
  useEffect(() => {
    let filtered = [...artikels];

    if (searchWord.trim()) {
      const lower = searchWord.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.judul.toLowerCase().includes(lower) ||
          a.tags?.some((t) => t.nama_tag.toLowerCase().includes(lower))
      );
    }

    if (filterTags.length > 0) {
      filtered = filtered.filter((a) =>
        filterTags.every((ft) => a.tags?.some((t) => t.nama_tag === ft))
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

    setFilteredArtikels(filtered);
  }, [searchWord, artikels, filterTags, sortBy, sortOrder]);

  if (loading) return <p className="p-8">Loading...</p>;
  if (artikels.length === 0) return <p className="p-8">Belum ada artikel terbit.</p>;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-80 md:h-60 flex items-center justify-center text-center px-6 overflow-hidden">
        {/* Background image */}
        <div
            className="absolute inset-0"
            style={{
            backgroundImage: `url('/tentang/mencatat.jpg')`,
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
            Eksplorasi Artikel
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
          filterStatus="" // ignored in public view
          setFilterStatus={() => {}} // no-op
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          showStatusFilter={false} // <--- hide status dropdown
        />

        {/* Article cards */}
        <div className="space-y-6">
          {filteredArtikels.map((a) => (
            <Link
              key={a.artikel_id}
              to={`/artikel/${a.slug}`}
              className="flex flex-col md:flex-row bg-white border border-black rounded-lg shadow hover:shadow-lg transition overflow-hidden"
            >
              {a.thumbnail && (
                <img
                  src={a.thumbnail}
                  alt={a.judul}
                  className="w-full md:w-72 h-72 object-cover flex-shrink-0"
                />
              )}
              <div className="p-6 flex flex-col justify-between flex-grow">
                {/* Title */}
                <h2 className="font-bold text-2xl mb-3">{a.judul}</h2>

                {/* Tags */}
                {a.tags && a.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {a.tags.map((t) => (
                      <span
                        key={t.tag_id}
                        className="text-xs bg-gray-200 px-2 py-1 rounded"
                      >
                        {t.nama_tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Summary */}
                {a.konten?.content && (
                  <p className="text-gray-700 mb-3 flex-grow">
                    {a.konten.content
                      .filter((b: any) => b.type === "paragraph")
                      .map((b: any) => b.content?.map((c: any) => c.text).join("") ?? "")
                      .join(" ")
                      .slice(0, 200)}
                    {a.konten.content.length > 200 ? "..." : ""}
                  </p>
                )}

                {/* Author */}
                <p className="text-sm text-gray-500">By {a.author_nama}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}