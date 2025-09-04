// src/components/admin/UserSearch.tsx
import { useState } from "react";

export type SortField = "user_id" | "nama" | "username" | "role" | "tanggal_dibuat";
export type SortOrder = "asc" | "desc";

interface UserSearchProps {
  searchWord: string;
  setSearchWord: (val: string) => void;
  sortBy: SortField;
  setSortBy: (val: SortField) => void;
  sortOrder: SortOrder;
  setSortOrder: (val: SortOrder) => void;
}

export default function UserSearch({
  searchWord,
  setSearchWord,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: UserSearchProps) {
  return (
    <div className="mb-4 p-3 border rounded bg-gray-50 space-y-3">
      {/* Search input */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Search by Nama or Username..."
          className="border px-3 py-2 rounded flex-1 min-w-[200px]"
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
        />
      </div>

      {/* Sorting controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <label className="font-medium">Sort by:</label>
        <select
          className="border px-3 py-1 rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortField)}
        >
          <option value="user_id">ID</option>
          <option value="nama">Nama</option>
          <option value="username">Username</option>
          <option value="role">Role</option>
          <option value="tanggal_dibuat">Tanggal Dibuat</option>
        </select>

        <select
          className="border px-3 py-1 rounded"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>
  );
}