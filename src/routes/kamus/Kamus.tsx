// src/routes/kamus/Kamus.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabase";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface KamusRow {
  kata_id: number;
  kata: string;
  arti: string;
  contoh: string;
}

interface Bahasa {
  bahasa_id: number;
  nama_bahasa: string;
}

export default function Kamus() {
  const [bahasaList, setBahasaList] = useState<Bahasa[]>([]);
  const [selectedBahasa, setSelectedBahasa] = useState<number | null>(null);
  const [rows, setRows] = useState<KamusRow[]>([]);
  const [filteredRows, setFilteredRows] = useState<KamusRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [searchWord, setSearchWord] = useState("");

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState<number | "all">(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages =
    rowsPerPage === "all" ? 1 : Math.ceil(filteredRows.length / rowsPerPage);

  const displayedRows =
    rowsPerPage === "all"
      ? filteredRows
      : filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Load languages
  useEffect(() => {
    async function loadLanguages() {
      const { data, error } = await supabase
        .from("bahasa")
        .select("bahasa_id, nama_bahasa")
        .order("nama_bahasa");

      if (error) {
        console.error(error);
        setWarning("❌ Gagal load bahasa");
      } else if (data) {
        setBahasaList(data as Bahasa[]);
      }
    }
    loadLanguages();
  }, []);

  // Load Kamus entries per selected language
  useEffect(() => {
    if (!selectedBahasa) {
      setRows([]);
      setFilteredRows([]);
      setLoading(false);
      return;
    }

    async function loadKamus() {
      setLoading(true);
      const { data, error } = await supabase
        .from("kamus")
        .select("kata_id, kata, arti, contoh")
        .eq("bahasa_id", selectedBahasa)
        .order("kata", { ascending: true });

      if (error) {
        console.error(error);
        setRows([]);
        setFilteredRows([]);
        setWarning("❌ Gagal load kamus");
      } else if (data) {
        const rowsData = data as KamusRow[];
        setRows(rowsData);
        setFilteredRows(rowsData);
        setWarning(null);
        setCurrentPage(1);
      }
      setLoading(false);
    }

    loadKamus();
  }, [selectedBahasa]);

  // Search filter
  useEffect(() => {
    if (!searchWord) {
      setFilteredRows(rows);
    } else {
      const lower = searchWord.toLowerCase();
      setFilteredRows(
        rows.filter(
          (r) =>
            r.kata.toLowerCase().includes(lower) ||
            r.arti.toLowerCase().includes(lower) ||
            r.contoh.toLowerCase().includes(lower)
        )
      );
    }
    setCurrentPage(1);
  }, [searchWord, rows]);

  // Export CSV
  const handleExportCsv = () => {
    if (filteredRows.length === 0) return;

    const header = ["Kata", "Arti", "Contoh"];
    const csvRows = [
      header.join(","),
      ...filteredRows.map((r) =>
        [r.kata, r.arti, r.contoh].map((field) => `"${field?.replace(/"/g, '""')}"`).join(",")
      ),
    ];

    const csvContent = csvRows.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `kamus_${selectedBahasa || "all"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRowsPerPageChange = (value: number | "all") => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-80 md:h-60 flex items-center justify-center text-center px-6 overflow-hidden">
      {/* Background image */}
      <div
          className="absolute inset-0"
          style={{
          backgroundImage: `url('/tentang/kamus.jfif')`,
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
          Eksplorasi Kamus
      </h1>
      </div>

      <div className="max-w-6xl mx-auto p-8 bg-white rounded-figma-lg shadow-lg mt-6 space-y-6">
        {/* Language + Search */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <select
            className="border px-3 py-2 rounded-md"
            value={selectedBahasa ?? ""}
            onChange={(e) =>
              setSelectedBahasa(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">Pilih bahasa</option>
            {bahasaList.map((b) => (
              <option key={b.bahasa_id} value={b.bahasa_id}>
                {b.nama_bahasa}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Cari kata, arti, atau contoh..."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            className="flex-1 border px-3 py-2 rounded-md"
            disabled={!selectedBahasa || rows.length === 0}
          />
        </div>

        {/* Export + Rows per page */}
        <div className="flex justify-between items-center">
          <div>
            <label>
              Tampilkan{" "}
              <select
                className="border px-2 py-1 rounded-md"
                value={rowsPerPage}
                onChange={(e) =>
                  handleRowsPerPageChange(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
              >
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="all">Semua</option>
              </select>{" "}
              baris
            </label>
          </div>

          {selectedBahasa && filteredRows.length > 0 && (
            <button
              onClick={handleExportCsv}
              className="px-4 py-2 bg-tersier text-white rounded-md hover:bg-tersier/90 transition"
            >
              Export CSV
            </button>
          )}
        </div>

        {warning && <p className="text-red-600">{warning}</p>}

        {loading ? (
          <p>Loading...</p>
        ) : selectedBahasa === null ? (
          <p>Pilih bahasa terlebih dahulu.</p>
        ) : filteredRows.length === 0 ? (
          <p>Belum ada kata untuk bahasa ini.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse border w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2">Kata</th>
                    <th className="border px-4 py-2">Arti</th>
                    <th className="border px-4 py-2">Contoh</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.map((row) => (
                    <tr key={row.kata_id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{row.kata}</td>
                      <td className="border px-4 py-2">{row.arti}</td>
                      <td className="border px-4 py-2">{row.contoh}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {rowsPerPage !== "all" && totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 mt-4 flex-wrap">
                {/* Prev button */}
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page buttons */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page <= 2 ||
                    page > totalPages - 2 ||
                    Math.abs(page - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded ${
                          page === currentPage
                            ? "bg-sekunder text-white"
                            : "hover:bg-gray-200"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    (page === 3 && currentPage > 4) ||
                    (page === totalPages - 2 && currentPage < totalPages - 3)
                  ) {
                    return <span key={page}>...</span>;
                  } else {
                    return null;
                  }
                })}

                {/* Next button */}
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>

                {/* Optional: direct page input */}
                <div className="flex items-center gap-1 ml-2">
                  <span>Lompat:</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      let val = Number(e.target.value);
                      if (val >= 1 && val <= totalPages) setCurrentPage(val);
                    }}
                    className="w-12 border px-2 py-1 rounded"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}