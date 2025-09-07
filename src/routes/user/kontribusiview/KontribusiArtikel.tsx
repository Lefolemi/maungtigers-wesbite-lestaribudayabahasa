// src/routes/kontribusi/KontribusiArtikel.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../../backend/supabase";
import { useUserSession } from "../../../backend/context/UserSessionContext";
import { useNavigate } from "react-router-dom";
import FilterSearchSort from "../../../components/utilities/FilterSearchSort";

interface Tag {
  tag_id: number;
  nama_tag: string;
}

export interface Artikel {
  artikel_id: number;
  user_id: number;
  judul: string;
  status: string;
  slug: string;
  thumbnail: string | null;
  terakhir_edit: string | null;
  tanggal_dibuat: string;
  tags: Tag[];
  konten?: string; // optional for preview
}

export default function KontribusiArtikel() {
  const { user } = useUserSession();
  const navigate = useNavigate();

  const [artikels, setArtikels] = useState<Artikel[]>([]);
  const [loading, setLoading] = useState(true);

  // Search / Filter / Sort state
  const [searchWord, setSearchWord] = useState("");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "word">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [filteredArtikels, setFilteredArtikels] = useState<Artikel[]>([]);

  // Fetch articles
  useEffect(() => {
    if (!user) return;

    const fetchArtikels = async () => {
      setLoading(true);

      const { data: artikelData, error: artikelError } = await supabase
        .from("artikel")
        .select(
          `
            artikel_id,
            judul,
            status,
            slug,
            thumbnail,
            terakhir_edit,
            tanggal_dibuat,
            konten,
            artikel_tag (
              tag_id (tag_id, nama_tag)
            )
          `
        )
        .eq("user_id", user.user_id)
        .order("tanggal_dibuat", { ascending: false });

      if (artikelError) {
        console.error("Failed to fetch articles:", artikelError);
        setLoading(false);
        return;
      }

      const mapped: Artikel[] = (artikelData || []).map((a: any) => ({
        artikel_id: a.artikel_id,
        user_id: a.user_id,
        judul: a.judul,
        status: a.status,
        slug: a.slug,
        thumbnail: a.thumbnail,
        terakhir_edit: a.terakhir_edit,
        tanggal_dibuat: a.tanggal_dibuat,
        konten: a.konten,
        tags: (a.artikel_tag || [])
          .map((t: any) => {
            const tagObj = Array.isArray(t.tag_id) ? t.tag_id[0] : t.tag_id;
            return tagObj
              ? { tag_id: tagObj.tag_id, nama_tag: tagObj.nama_tag }
              : null;
          })
          .filter(Boolean) as Tag[],
      }));

      setArtikels(mapped);
      setFilteredArtikels(mapped);
      setLoading(false);
    };

    fetchArtikels();
  }, [user]);

  // Apply search, filter, and sort
  useEffect(() => {
    let filtered = [...artikels];

    if (searchWord.trim()) {
      const lower = searchWord.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.judul.toLowerCase().includes(lower) ||
          a.tags.some((t) => t.nama_tag.toLowerCase().includes(lower))
      );
    }

    if (filterTags.length > 0) {
      filtered = filtered.filter((a) =>
        filterTags.every((ft) => a.tags.some((t) => t.nama_tag === ft))
      );
    }
    if (filterStatus) {
      filtered = filtered.filter((a) => a.status === filterStatus);
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
  }, [searchWord, artikels, filterTags, filterStatus, sortBy, sortOrder]);

  if (!user) return <p>Silakan login terlebih dahulu.</p>;
  if (loading) return <p>Loading your articles...</p>;
  if (artikels.length === 0) return <p>Belum ada artikel.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Kontribusi Artikel Saya</h1>

      {/* Reusable Search / Filter / Sort component */}
      <FilterSearchSort
        searchWord={searchWord}
        setSearchWord={setSearchWord}
        filterTags={filterTags}
        setFilterTags={setFilterTags}
        tagInput={tagInput}
        setTagInput={setTagInput}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {/* "Buat Artikel Baru" button */}
      <div className="my-4">
        <button
          onClick={() => navigate("/artikel/buat")}
          className="px-4 py-2 bg-sekunder text-white rounded hover:bg-sekunder/90"
        >
          Buat Artikel Baru
        </button>
      </div>

      {/* Articles list */}
      <div className="space-y-4">
        {filteredArtikels.length === 0 && (
          <p>No articles match your search/filter.</p>
        )}

        {filteredArtikels.map((a) => (
          <div
            key={a.artikel_id}
            className="border p-4 rounded shadow-sm flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div className="flex flex-col md:flex-row md:items-center md:gap-4">
              {a.thumbnail && (
                <img
                  src={a.thumbnail}
                  alt={a.judul}
                  className="w-24 h-24 object-cover rounded"
                />
              )}
              <div>
                <h2 className="font-semibold text-lg">{a.judul}</h2>
                <p className="text-sm text-gray-600">Status: {a.status}</p>
                <p className="text-sm text-gray-500">
                  Terakhir edit: {a.terakhir_edit || a.tanggal_dibuat}
                </p>
                {a.tags.length > 0 && (
                  <div className="flex gap-2 mt-1 flex-wrap">
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
              </div>
            </div>

            <div className="mt-2 md:mt-0 flex gap-2">
              {/* Preview button */}
              <button
                onClick={() =>
                  navigate("/artikel/preview", { state: { artikel: a } })
                }
                className="px-3 py-1 bg-sekunder text-white rounded hover:bg-sekunder/90"
              >
                Lihat
              </button>

              <button
                onClick={() => navigate(`/artikel/edit/${a.slug}`)}
                className="px-3 py-1 bg-tersier text-white rounded hover:bg-tersier/90"
              >
                Edit
              </button>

              {/* Delete button - only for draft */}
              {a.status === "draft" ? (
                <button
                  onClick={async () => {
                    if (!confirm("Hapus artikel ini secara permanen?")) return;

                    // 🔹 remove thumbnail if exists
                    if (a.thumbnail) {
                      const oldPath = a.thumbnail.split(
                        "/storage/v1/object/public/aset_artikel/"
                      )[1];
                      if (oldPath) {
                        await supabase.storage.from("aset_artikel").remove([oldPath]);
                      }
                    }

                    // 🔹 remove embedded images
                    if (a.konten) {
                      try {
                        const content = typeof a.konten === "string"
                          ? JSON.parse(a.konten)
                          : a.konten;
                        const images: string[] = [];
                        function traverse(node: any) {
                          if (!node) return;
                          if (node.type === "image" && typeof node.attrs?.src === "string") {
                            images.push(node.attrs.src);
                          }
                          if (node.content) node.content.forEach(traverse);
                        }
                        traverse(content);

                        const paths = images
                          .filter((url) => url.includes("/storage/v1/object/public/aset_artikel/"))
                          .map((url) =>
                            url.split("/storage/v1/object/public/aset_artikel/")[1]
                          );

                        if (paths.length > 0) {
                          await supabase.storage.from("aset_artikel").remove(paths);
                        }
                      } catch (err) {
                        console.error("Failed to parse konten for images:", err);
                      }
                    }

                    // 🔹 delete artikel row
                    await supabase.from("artikel").delete().eq("artikel_id", a.artikel_id);

                    // 🔹 refresh UI
                    setArtikels((prev) =>
                      prev.filter((art) => art.artikel_id !== a.artikel_id)
                    );
                    setFilteredArtikels((prev) =>
                      prev.filter((art) => art.artikel_id !== a.artikel_id)
                    );
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Hapus
                </button>
              ) : (
                <button
                  disabled
                  className="px-3 py-1 bg-gray-400 text-white rounded cursor-not-allowed"
                  title="Artikel yang sudah direview/terbit tidak bisa dihapus"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}