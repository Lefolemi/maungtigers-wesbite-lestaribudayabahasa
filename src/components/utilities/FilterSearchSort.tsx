import { useState } from "react";
import DropdownSelect from "../ui/DropdownSelect"; // adjust path if needed

export interface FilterSearchSortProps {
  searchWord: string;
  setSearchWord: (val: string) => void;
  filterTags: string[];
  setFilterTags: (tags: string[]) => void;
  tagInput: string;
  setTagInput: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  sortBy: "date" | "word";
  setSortBy: (val: "date" | "word") => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (val: "asc" | "desc") => void;
  showStatusFilter?: boolean; // new toggle
}

export default function FilterSearchSort({
  searchWord,
  setSearchWord,
  filterTags,
  setFilterTags,
  tagInput,
  setTagInput,
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  showStatusFilter = true, // default true
}: FilterSearchSortProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const sortByOptions = [
    { value: "date", label: "Waktu" },
    { value: "word", label: "Kata" },
  ];

  const sortOrderOptions = [
    { value: "desc", label: "Akhir" },
    { value: "asc", label: "Awal" },
  ];

  const statusOptions = [
    { value: "", label: "-- Pilih status --" },
    { value: "draft", label: "Draft" },
    { value: "direview", label: "Direview" },
    { value: "terbit", label: "Terbit" },
    { value: "arsip", label: "Arsip" },
  ];

  return (
    <div className="mb-4">
      {/* Search + Filter toggle */}
      <div className="flex gap-2 mb-2 flex-wrap">
        <input
          type="text"
          placeholder="Search by word..."
          className="border px-3 py-1 rounded-figma-md flex-1 min-w-[200px]"
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
        />
        <button
          className="px-3 py-1 bg-sekunder text-white rounded-figma-md hover:bg-sekunder/90"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          Filter
        </button>
      </div>

      {/* Sort by with DropdownSelect */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex gap-0 w-max">
          <button className="px-3 py-1 border border-black rounded-l-figma-md bg-white cursor-default">
            Urutkan
          </button>
          <DropdownSelect
            value={sortBy}
            onChange={setSortBy}
            options={sortByOptions}
            placeholder="Pilih..."
            roundedLeft={false}
            roundedRight={true}
            border={false}
            className="!bg-sekunder w-36"
          />
        </div>

        <div className="flex gap-0 w-max">
          <button className="px-3 py-1 border border-black rounded-l-figma-md bg-white cursor-default">
            Dari
          </button>
          <DropdownSelect
            value={sortOrder}
            onChange={setSortOrder}
            options={sortOrderOptions}
            placeholder="Pilih..."
            roundedLeft={false}
            roundedRight={true}
            border={false}
            className="!bg-sekunder w-36"
          />
        </div>
      </div>

      {/* Inline Filter */}
      {isFilterOpen && (
        <div className="border p-4 rounded-l-figma-md mb-4 bg-sekunder/10">
          {/* Tags input */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-black">Pilih tag</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {filterTags.map((tag: string) => (
                <span
                  key={tag}
                  className="flex items-center bg-gray-200 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() =>
                      setFilterTags(filterTags.filter((t) => t !== tag))
                    }
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              placeholder="Ketik tag dan tekan enter"
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tagInput.trim()) {
                  e.preventDefault();
                  if (!filterTags.includes(tagInput.trim()))
                    setFilterTags([...filterTags, tagInput.trim()]);
                  setTagInput("");
                }
              }}
              className="w-full border rounded-figma-md px-3 py-2"
            />
          </div>

          {/* Status select using DropdownSelect (toggleable) */}
          {showStatusFilter && (
            <div className="mb-4">
              <label className="block mb-2 font-medium text-black">Status</label>
              <DropdownSelect
                value={filterStatus}
                onChange={setFilterStatus}
                options={statusOptions}
                placeholder="Pilih status..."
                className="!bg-sekunder w-full"
              />
            </div>
          )}

          {/* Clear & Close buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-4 py-2 bg-gray-500 rounded-figma-md text-white hover:bg-gray-500/90"
              onClick={() => {
                setFilterTags([]);
                setTagInput("");
                setFilterStatus("");
              }}
            >
              Bersihkan
            </button>
            <button
              className="px-4 py-2 bg-sekunder text-white rounded-figma-md hover:bg-sekunder/90"
              onClick={() => setIsFilterOpen(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}