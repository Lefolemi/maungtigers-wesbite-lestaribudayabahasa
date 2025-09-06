// src/routes/kontribusi/KontribusiCerita.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../../backend/supabase";
import { useUserSession } from "../../../backend/context/UserSessionContext";
import { useNavigate } from "react-router-dom";
import FilterSearchSort from "../../../components/utilities/FilterSearchSort";

interface Tag {
  tag_id: number;
  nama_tag: string;
}

export interface Cerita {
  cerita_id: number;
  user_id: number;
  judul: string;
  status: string;
  gambar: string | null;
  terakhir_edit: string | null;
  tanggal_dibuat: string;
  tags: Tag[];
  informasi?: any;
}

export default function KontribusiCerita() {
  const { user } = useUserSession();
  const navigate = useNavigate();

  const [ceritas, setCeritas] = useState<Cerita[]>([]);
  const [loading, setLoading] = useState(true);

  // Search / Filter / Sort state
  const [searchWord, setSearchWord] = useState("");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "word">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [filteredCeritas, setFilteredCeritas] = useState<Cerita[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchCeritas = async () => {
      setLoading(true);

      const { data: ceritaData, error } = await supabase
        .from("cerita")
        .select(`
          cerita_id,
          judul,
          status,
          gambar,
          terakhir_edit,
          tanggal_dibuat,
          cerita_tag (
            tag_id (tag_id, nama_tag)
          )
        `)
        .eq("user_id", user.user_id)
        .order("tanggal_dibuat", { ascending: false });

      if (error) {
        console.error("Failed to fetch ceritas:", error);
        setLoading(false);
        return;
      }

      const mapped: Cerita[] = (ceritaData || []).map((c: any) => ({
        cerita_id: c.cerita_id,
        user_id: c.user_id,
        judul: c.judul,
        status: c.status,
        gambar: c.gambar,
        terakhir_edit: c.terakhir_edit,
        tanggal_dibuat: c.tanggal_dibuat,
        tags: (c.cerita_tag || [])
          .map((t: any) => {
            const tagObj = Array.isArray(t.tag_id) ? t.tag_id[0] : t.tag_id;
            return tagObj ? { tag_id: tagObj.tag_id, nama_tag: tagObj.nama_tag } : null;
          })
          .filter(Boolean) as Tag[],
      }));

      setCeritas(mapped);
      setFilteredCeritas(mapped);
      setLoading(false);
    };

    fetchCeritas();
  }, [user]);

  // Apply search, filter, sort
  useEffect(() => {
    let filtered = [...ceritas];

    if (searchWord.trim()) {
      const lower = searchWord.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.judul.toLowerCase().includes(lower) ||
          c.tags.some((t) => t.nama_tag.toLowerCase().includes(lower))
      );
    }

    if (filterTags.length > 0) {
      filtered = filtered.filter((c) =>
        filterTags.every((ft) => c.tags.some((t) => t.nama_tag === ft))
      );
    }

    if (filterStatus) {
      filtered = filtered.filter((c) => c.status === filterStatus);
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
  }, [searchWord, ceritas, filterTags, filterStatus, sortBy, sortOrder]);

  if (!user) return <p>Silakan login terlebih dahulu.</p>;
  if (loading) return <p>Loading your stories...</p>;
  if (ceritas.length === 0) return <p>Belum ada cerita.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Kontribusi Cerita Saya</h1>

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

      <div className="my-4">
        <button
          onClick={() => navigate("/cerita/buat")}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Buat Cerita Baru
        </button>
      </div>

      <div className="space-y-4">
        {filteredCeritas.length === 0 && <p>No stories match your search/filter.</p>}

        {filteredCeritas.map((c) => (
          <div
            key={c.cerita_id}
            className="border p-4 rounded shadow-sm flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div className="flex flex-col md:flex-row md:items-center md:gap-4">
              {c.gambar && (
                <img
                  src={c.gambar}
                  alt={c.judul}
                  className="w-24 h-24 object-cover rounded"
                />
              )}
              <div>
                <h2 className="font-semibold text-lg">{c.judul}</h2>
                <p className="text-sm text-gray-600">Status: {c.status}</p>
                <p className="text-sm text-gray-500">
                  Terakhir edit: {c.terakhir_edit || c.tanggal_dibuat}
                </p>
                {c.tags.length > 0 && (
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {c.tags.map((t) => (
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
              <button
                onClick={() =>
                  navigate("/cerita/preview", { state: { cerita: c } })
                }
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Lihat
              </button>

              <button
                onClick={() => navigate(`/cerita/edit/${c.cerita_id}`)}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Edit
              </button>

              {c.status === "draft" ? (
                <button
                  onClick={async () => {
                    if (!confirm("Hapus cerita ini secara permanen?")) return;

                    // delete thumbnail if exists
                    if (c.gambar) {
                      const oldPath = c.gambar.split(
                        "/storage/v1/object/public/aset_cerita/"
                      )[1];
                      if (oldPath) await supabase.storage.from("aset_cerita").remove([oldPath]);
                    }

                    // delete cerita row
                    await supabase.from("cerita").delete().eq("cerita_id", c.cerita_id);

                    // refresh UI
                    setCeritas((prev) => prev.filter((s) => s.cerita_id !== c.cerita_id));
                    setFilteredCeritas((prev) => prev.filter((s) => s.cerita_id !== c.cerita_id));
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Hapus
                </button>
              ) : (
                <button
                  disabled
                  className="px-3 py-1 bg-gray-400 text-white rounded cursor-not-allowed"
                  title="Cerita yang sudah direview/terbit tidak bisa dihapus"
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