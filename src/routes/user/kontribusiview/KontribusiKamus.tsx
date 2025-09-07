// src/routes/kontribusi/KontribusiKamus.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../backend/supabase";
import { useUserSession } from "../../../backend/context/UserSessionContext";
import DropdownSelect from "../../../components/ui/DropdownSelect";
import { ChevronLeft, ChevronRight } from "lucide-react";

type KamusRow = {
  kata_id: number;
  kata: string;
  arti: string;
  contoh: string;
  status: string;
};

type Bahasa = {
  bahasa_id: number;
  nama_bahasa: string;
};

export default function KontribusiKamus() {
  const { user } = useUserSession();
  const navigate = useNavigate();

  const [bahasaList, setBahasaList] = useState<Bahasa[]>([]);
  const [selectedBahasaId, setSelectedBahasaId] = useState<number | null>(null);
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

  const bahasaOptions = bahasaList.map((b) => ({
    value: b.bahasa_id,
    label: b.nama_bahasa,
  }));

  const handleExportCsv = () => {
    if (filteredRows.length === 0) return;

    const header = ["Kata", "Arti", "Contoh", "Status"];
    const csvRows = [
      header.join(","),
      ...filteredRows.map((r) =>
        [r.kata, r.arti, r.contoh, r.status].map((f) => `"${f?.replace(/"/g, '""')}"`).join(",")
      ),
    ];

    const csvContent = csvRows.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `kontribusi_kamus_${selectedBahasaId || "all"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

  // Load user contributions
  useEffect(() => {
    if (!user || selectedBahasaId === null) return;

    async function loadKamus() {
      setLoading(true);

      const { data, error } = await supabase
        .from("kamus_review")
        .select("review_id, kata, arti, contoh, status")
        .eq("user_id", user?.user_id)
        .eq("bahasa_id", selectedBahasaId)
        .order("tanggal_dibuat", { ascending: false });

      if (error) {
        console.error(error);
        setRows([]);
        setFilteredRows([]);
        setWarning("❌ Gagal load kontribusi");
      } else if (data) {
        const safeRows: KamusRow[] = (data as any[]).map((r) => ({
          kata_id: r.kata_id,
          kata: r.kata,
          arti: r.arti,
          contoh: r.contoh,
          status: r.status,
        }));
        setRows(safeRows);
        setFilteredRows(safeRows);
        setCurrentPage(1);
        setWarning(null);
      }

      setLoading(false);
    }

    loadKamus();
  }, [selectedBahasaId, user]);

  // Search
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

  const handleRowsPerPageChange = (value: number | "all") => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Kontribusi Kamus</h1>

      {/* Dropdown + Rows-per-page + Search + Buttons */}
      <div className="flex flex-col md:flex-row md:items-center gap-2">
        <div className="w-64">
          <DropdownSelect
            options={bahasaOptions}
            value={selectedBahasaId}
            onChange={(val) => setSelectedBahasaId(val)}
            placeholder="Pilih bahasa"
          />

          {/* Rows-per-page selector below dropdown */}
          {selectedBahasaId && rows.length > 0 && (
            <div className="mt-2">
              <label>
                Tampilkan{" "}
                <select
                  className="border px-2 py-1 rounded"
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
          )}
        </div>

        <input
          type="text"
          placeholder="Cari kata, arti, atau contoh..."
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
          className="flex-1 border px-3 py-2 rounded-md"
          disabled={!selectedBahasaId || rows.length === 0}
        />

        {selectedBahasaId && (
          <>
            <button
              className="px-4 py-2 bg-sekunder text-white rounded-figma-md h-10"
              onClick={() => navigate(`/kamus/edit?bahasaId=${selectedBahasaId}`)}
            >
              Edit
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-figma-md h-10"
              onClick={handleExportCsv}
            >
              Export CSV
            </button>
          </>
        )}
      </div>

      {warning && <p className="text-sm text-red-600">{warning}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : selectedBahasaId === null ? (
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
                  <th className="border px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row) => (
                  <tr key={row.kata_id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{row.kata}</td>
                    <td className="border px-4 py-2">{row.arti}</td>
                    <td className="border px-4 py-2">{row.contoh}</td>
                    <td className="border px-4 py-2">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {rowsPerPage !== "all" && totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 mt-4 flex-wrap">
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>

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

              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>

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
  );
}