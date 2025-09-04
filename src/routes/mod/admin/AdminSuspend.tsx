// src/routes/admin/AdminSuspend.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../../backend/supabase";
import { useUserSession } from "../../../backend/context/UserSessionContext";

type User = {
  user_id: number;
  nama: string | null;
  username: string;
  role: string;
};

type Suspension = {
  suspend_id: number;
  user_id: number;
  disuspend_oleh: number;
  alasan: string;
  mulai_suspend: string;
  lepas_suspend: string | null;
  status: string;
  tanggal_dibuat: string;
};

export default function AdminSuspend() {
  const [activeTab, setActiveTab] = useState<"toSuspend" | "suspended">(
    "toSuspend"
  );

  const [users, setUsers] = useState<User[]>([]);
  const [suspensions, setSuspensions] = useState<Suspension[]>([]);
  const [loading, setLoading] = useState(true);

  // For inline suspension form
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendUntil, setSuspendUntil] = useState("");

  const { user } = useUserSession();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: usersData, error: usersError } = await supabase
        .from("user")
        .select("user_id, nama, username, role")
        .neq("role", "admin");

      if (usersError) console.error("[AdminSuspend] Users fetch failed:", usersError.message);
      else setUsers(usersData || []);

      const { data: suspData, error: suspError } = await supabase
        .from("suspend_user")
        .select("suspend_id, user_id, disuspend_oleh, alasan, mulai_suspend, lepas_suspend, status, tanggal_dibuat")
        .eq("status", "aktif");

      if (suspError) console.error("[AdminSuspend] Suspensions fetch failed:", suspError.message);
      else setSuspensions(suspData || []);

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  const suspensionCountMap: Record<number, number> = {};
  suspensions.forEach((s) => {
    suspensionCountMap[s.user_id] = (suspensionCountMap[s.user_id] || 0) + 1;
  });

  const handleSuspend = async (userId: number) => {
    if (!suspendReason || !suspendUntil) return;

    const { error } = await supabase.from("suspend_user").insert([
      {
        user_id: userId,
        disuspend_oleh: user?.user_id, // TODO: replace with current admin user_id
        alasan: suspendReason,
        mulai_suspend: new Date().toISOString(),
        lepas_suspend: new Date(suspendUntil).toISOString(),
        status: "aktif",
      },
    ]);

    if (error) {
      console.error("[AdminSuspend] Failed to suspend:", error.message);
    } else {
      // Reset form
      setEditingUserId(null);
      setSuspendReason("");
      setSuspendUntil("");
      // Refresh suspensions
      const { data: suspData } = await supabase
        .from("suspend_user")
        .select("*")
        .eq("status", "aktif");
      setSuspensions(suspData || []);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">User Suspension</h2>

      {/* Tab Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${activeTab === "toSuspend" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("toSuspend")}
        >
          Users to Suspend
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "suspended" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("suspended")}
        >
          Currently Suspended
        </button>
      </div>

      {activeTab === "toSuspend" && (
        <table className="w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr className="text-center">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Nama</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Suspension Count</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const count = suspensionCountMap[u.user_id] || 0;
              const isEditing = editingUserId === u.user_id;
              return (
                <>
                  <tr key={u.user_id} className="text-center hover:bg-gray-50">
                    <td className="p-2 border">{u.user_id}</td>
                    <td className="p-2 border">{u.nama ?? "-"}</td>
                    <td className="p-2 border">{u.role}</td>
                    <td className="p-2 border">{count > 0 ? "Pernah disuspend" : "Aman"}</td>
                    <td className="p-2 border">{count > 0 ? count : "Never suspended"}</td>
                    <td className="p-2 border">
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded"
                        onClick={() => setEditingUserId(isEditing ? null : u.user_id)}
                      >
                        Suspend
                      </button>
                    </td>
                  </tr>
                  {isEditing && (
                    <tr className="bg-gray-100">
                      <td colSpan={6} className="p-4 text-left">
                        <div className="flex flex-col gap-2">
                          <label>
                            Reason:
                            <input
                              type="text"
                              value={suspendReason}
                              onChange={(e) => setSuspendReason(e.target.value)}
                              className="border p-1 rounded w-full"
                            />
                          </label>
                          <label>
                            Until (date):
                            <input
                              type="date"
                              value={suspendUntil}
                              onChange={(e) => setSuspendUntil(e.target.value)}
                              className="border p-1 rounded w-full"
                            />
                          </label>
                          <div className="flex gap-2 mt-2">
                            <button
                              className="px-2 py-1 bg-green-500 text-white rounded"
                              onClick={() => handleSuspend(u.user_id)}
                            >
                              Submit
                            </button>
                            <button
                              className="px-2 py-1 bg-gray-400 text-white rounded"
                              onClick={() => setEditingUserId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      )}

      {activeTab === "suspended" && (
        <table className="w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr className="text-center">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Nama</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Mulai</th>
              <th className="p-2 border">Akhir</th>
            </tr>
          </thead>
          <tbody>
            {suspensions.map((s) => {
              const user = users.find((u) => u.user_id === s.user_id);
              if (!user) return null;
              return (
                <tr key={s.suspend_id} className="text-center hover:bg-gray-50">
                  <td className="p-2 border">{user.user_id}</td>
                  <td className="p-2 border">{user.nama ?? "-"}</td>
                  <td className="p-2 border">{s.status}</td>
                  <td className="p-2 border">{new Date(s.mulai_suspend).toLocaleDateString("id-ID")}</td>
                  <td className="p-2 border">{s.lepas_suspend ? new Date(s.lepas_suspend).toLocaleDateString("id-ID") : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}