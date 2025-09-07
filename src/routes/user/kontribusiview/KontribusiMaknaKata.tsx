// src/routes/kontribusi/KontribusiMaknaKata.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../../backend/supabase";
import { useUserSession } from "../../../backend/context/UserSessionContext";
import { useNavigate } from "react-router-dom";
import FilterSearchSort from "../../../components/utilities/FilterSearchSort";

interface Tag {
  tag_id: number;
  nama_tag: string;
}

export interface MaknaKata {
  makna_id: number;
  kata_id: number;
  kata?: string; // resolved word
  user_id: number;
  arti: string;
  gambar: string | null;
  status: string;
  terakhir_edit: string | null;
  tanggal_dibuat: string;
  tags: Tag[];
}

export default function KontribusiMaknaKata() {
  const { user } = useUserSession();
  const navigate = useNavigate();

  const [maknas, setMaknas] = useState<MaknaKata[]>([]);
  const [loading, setLoading] = useState(true);

  // Search / Filter / Sort state
  const [searchWord, setSearchWord] = useState("");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "word">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [filteredMaknas, setFilteredMaknas] = useState<MaknaKata[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchMaknas = async () => {
      setLoading(true);

      const { data: maknaData, error } = await supabase
        .from("makna_kata")
        .select(`
          makna_id,
          kata_id,
          arti,
          gambar,
          status,
          terakhir_edit,
          tanggal_dibuat,
          kata:kata_id (kata),
          makna_kata_tag (
            tag_id (tag_id, nama_tag)
          )
        `)
        .eq("user_id", user.user_id)
        .order("tanggal_dibuat", { ascending: false });

      if (error) {
        console.error("Failed to fetch makna kata:", error);
        setLoading(false);
        return;
      }

      const mapped: MaknaKata[] = (maknaData || []).map((m: any) => ({
        makna_id: m.makna_id,
        kata_id: m.kata_id,
        kata: m.kata?.kata,
        user_id: m.user_id,
        arti: m.arti,
        gambar: m.gambar,
        status: m.status,
        terakhir_edit: m.terakhir_edit,
        tanggal_dibuat: m.tanggal_dibuat,
        tags: (m.makna_kata_tag || [])
          .map((t: any) => {
            const tagObj = Array.isArray(t.tag_id) ? t.tag_id[0] : t.tag_id;
            return tagObj ? { tag_id: tagObj.tag_id, nama_tag: tagObj.nama_tag } : null;
          })
          .filter(Boolean) as Tag[],
      }));

      setMaknas(mapped);
      setFilteredMaknas(mapped);
      setLoading(false);
    };

    fetchMaknas();
  }, [user]);

  // Apply search / filter / sort
  useEffect(() => {
    let filtered = [...maknas];

    if (searchWord.trim()) {
      const lower = searchWord.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.arti.toLowerCase().includes(lower) ||
          m.kata?.toLowerCase().includes(lower) ||
          m.tags.some((t) => t.nama_tag.toLowerCase().includes(lower))
      );
    }

    if (filterTags.length > 0) {
      filtered = filtered.filter((m) =>
        filterTags.every((ft) => m.tags.some((t) => t.nama_tag === ft))
      );
    }

    if (filterStatus) {
      filtered = filtered.filter((m) => m.status === filterStatus);
    }

    filtered.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.tanggal_dibuat).getTime();
        const dateB = new Date(b.tanggal_dibuat).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === "asc"
          ? (a.kata || "").localeCompare(b.kata || "")
          : (b.kata || "").localeCompare(a.kata || "");
      }
    });

    setFilteredMaknas(filtered);
  }, [searchWord, maknas, filterTags, filterStatus, sortBy, sortOrder]);

  if (!user) return <p>Silakan login terlebih dahulu.</p>;
  if (loading) return <p>Loading your makna kata...</p>;
  if (maknas.length === 0) return <p>Belum ada makna kata.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Kontribusi Makna Kata Saya</h1>

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
          onClick={() => navigate("/makna-kata/buat")}
          className="px-4 py-2 bg-sekunder text-white rounded hover:bg-sekunder/90"
        >
          Buat Makna Kata Baru
        </button>
      </div>

      <div className="space-y-4">
        {filteredMaknas.length === 0 && <p>No entries match your search/filter.</p>}

        {filteredMaknas.map((m) => (
          <div
            key={m.makna_id}
            className="border p-4 rounded shadow-sm flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div className="flex flex-col md:flex-row md:items-center md:gap-4">
              {m.gambar && (
                <img
                  src={m.gambar}
                  alt={m.arti}
                  className="w-24 h-24 object-cover rounded"
                />
              )}
              <div>
                <h2 className="font-semibold text-lg">{m.kata || "(kata tidak ditemukan)"}</h2>
                <p className="text-sm text-gray-600">Arti: {m.arti}</p>
                <p className="text-sm text-gray-500">
                  Terakhir edit: {m.terakhir_edit || m.tanggal_dibuat}
                </p>
                {m.tags.length > 0 && (
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {m.tags.map((t) => (
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
                  navigate("/makna-kata/preview", { state: { makna: m } })
                }
                className="px-3 py-1 bg-sekunder text-white rounded hover:bg-sekunder/90"
              >
                Lihat
              </button>

              <button
                onClick={() => navigate(`/makna-kata/edit/${m.makna_id}`)}
                className="px-3 py-1 bg-tersier text-white rounded hover:bg-tersier/90"
              >
                Edit
              </button>

              {m.status === "draft" ? (
                <button
                  onClick={async () => {
                    if (!confirm("Hapus makna kata ini secara permanen?")) return;

                    if (m.gambar) {
                      const oldPath = m.gambar.split(
                        "/storage/v1/object/public/aset_makna/"
                      )[1];
                      if (oldPath) await supabase.storage.from("aset_makna").remove([oldPath]);
                    }

                    await supabase.from("makna_kata").delete().eq("makna_id", m.makna_id);

                    setMaknas((prev) => prev.filter((s) => s.makna_id !== m.makna_id));
                    setFilteredMaknas((prev) => prev.filter((s) => s.makna_id !== m.makna_id));
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Hapus
                </button>
              ) : (
                <button
                  disabled
                  className="px-3 py-1 bg-gray-400 text-white rounded cursor-not-allowed"
                  title="Makna kata yang sudah direview/terbit tidak bisa dihapus"
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