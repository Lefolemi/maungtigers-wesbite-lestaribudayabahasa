// src/routes/admin/ModeratorPermission.tsx
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../backend/supabase";
import UserSearch, {
  type SortField,
  type SortOrder,
} from "../../../components/mod/UserSearch";

type User = {
  user_id: number;
  nama: string | null;
  username: string;
  role: string;
  tanggal_dibuat: string;
};

// Moderators can only set these roles
const ROLE_OPTIONS = ["pengguna", "kontributor", "penulis"] as const;

export default function ModeratorPermission() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  // 🔎 Search + sort state
  const [searchWord, setSearchWord] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("tanggal_dibuat");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("user")
        .select("user_id, nama, username, role, tanggal_dibuat")
        .order("tanggal_dibuat", { ascending: false });

      if (error) {
        console.error("[ModeratorPermission] Failed to fetch users:", error.message);
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const startEditing = (user: User) => {
    setEditingId(user.user_id);
    setEditForm({ ...user });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const { error } = await supabase
      .from("user")
      .update({
        nama: editForm.nama,
        username: editForm.username,
        role: editForm.role,
      })
      .eq("user_id", editingId);

    if (error) {
      console.error("[ModeratorPermission] Failed to update:", error.message);
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === editingId ? ({ ...u, ...editForm } as User) : u
        )
      );
      cancelEditing();
    }
  };

  // 🔎 Filter + sort applied in-memory
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // filter
    if (searchWord.trim()) {
      const q = searchWord.toLowerCase();
      result = result.filter(
        (u) =>
          u.nama?.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)
      );
    }

    // sort
    result.sort((a, b) => {
      const valA = a[sortBy] ?? "";
      const valB = b[sortBy] ?? "";

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, searchWord, sortBy, sortOrder]);

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Manage User Permissions</h2>

      {/* 🔎 Search + sort controls */}
      <UserSearch
        searchWord={searchWord}
        setSearchWord={setSearchWord}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {filteredUsers.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <table className="w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Nama</th>
              <th className="p-2 border">Username</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Tanggal Dibuat</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => {
              const isEditing = editingId === u.user_id;

              return (
                <tr key={u.user_id} className="text-center hover:bg-gray-50">
                  <td className="p-2 border">{u.user_id}</td>
                  <td className="p-2 border">
                    {isEditing ? (
                      <input
                        value={editForm.nama ?? ""}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, nama: e.target.value }))
                        }
                        className="border p-1 rounded w-full"
                      />
                    ) : (
                      u.nama ?? "-"
                    )}
                  </td>
                  <td className="p-2 border">
                    {isEditing ? (
                      <input
                        value={editForm.username ?? ""}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            username: e.target.value,
                          }))
                        }
                        className="border p-1 rounded w-full"
                      />
                    ) : (
                      u.username
                    )}
                  </td>
                  <td className="p-2 border">
                    {isEditing ? (
                      // Moderators cannot edit other moderators or admins
                      ["admin", "moderator"].includes(u.role) ? (
                        <span className="font-semibold text-red-600">{u.role}</span>
                      ) : (
                        <select
                          value={editForm.role}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, role: e.target.value }))
                          }
                          className="border p-1 rounded w-full"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      )
                    ) : (
                      u.role
                    )}
                  </td>
                  <td className="p-2 border">
                    {new Date(u.tanggal_dibuat).toLocaleDateString("id-ID")}
                  </td>
                  <td className="p-2 border">
                    {isEditing ? (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={saveEdit}
                          className="px-2 py-1 bg-green-500 text-white rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-2 py-1 bg-gray-400 text-white rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(u)}
                        disabled={["admin", "moderator"].includes(u.role)}
                        className={`px-2 py-1 rounded text-white ${
                          ["admin", "moderator"].includes(u.role)
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500"
                        }`}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}