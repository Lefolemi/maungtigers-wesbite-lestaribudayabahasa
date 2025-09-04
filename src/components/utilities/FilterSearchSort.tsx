import { useState, useEffect } from "react";

export interface Tag {
  tag_id?: number;
  nama_tag: string;
}

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
}: FilterSearchSortProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <div className="mb-4">
      {/* Search + Advanced Filter toggle */}
      <div className="flex gap-2 mb-2 flex-wrap">
        <input
          type="text"
          placeholder="Search by word..."
          className="border px-3 py-1 rounded flex-1 min-w-[200px]"
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
        />
        <button
          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
        >
          Advanced Filter
        </button>
      </div>

      {/* Sort By */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <label className="font-medium">Sort by:</label>
        <select
          className="border px-3 py-1 rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "date" | "word")}
        >
          <option value="date">Date</option>
          <option value="word">Word</option>
        </select>

        <select
          className="border px-3 py-1 rounded"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {/* Inline Advanced Filter */}
      {isAdvancedOpen && (
        <div className="border p-4 rounded mb-4 bg-gray-50">
          {/* Tags input */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {filterTags.map((tag) => (
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
              placeholder="Type a tag and press Enter"
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tagInput.trim()) {
                  e.preventDefault();
                  if (!filterTags.includes(tagInput.trim()))
                    setFilterTags([...filterTags, tagInput.trim()]);
                  setTagInput("");
                }
              }}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Status select */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Status</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">-- Select status --</option>
              <option value="draft">Draft</option>
              <option value="direview">Direview</option>
              <option value="terbit">Terbit</option>
              <option value="arsip">Arsip</option>
            </select>
          </div>

          {/* Clear & Close buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => {
                setFilterTags([]);
                setTagInput("");
                setFilterStatus("");
              }}
            >
              Clear
            </button>
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={() => setIsAdvancedOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}