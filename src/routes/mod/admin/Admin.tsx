// src/routes/admin/Admin.tsx
import { useEffect, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/utilities/Sidebar";
import { useUserSession } from "../../../backend/context/UserSessionContext";
import RoleRoute from "../../../backend/blocked/RoleRoute";
import TakDitemukan from "../../TakDitemukan";

import AdminUsers from "./AdminUser";
import AdminSuspend from "./AdminSuspend"; // <- still here

export default function Admin(): JSX.Element {
  const { user, loading } = useUserSession();
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();

  if (!loading && (!user || user.role !== "admin")) {
    return <TakDitemukan />;
  }

  const tabs = [
    { key: "users", label: "Manage Users", component: <AdminUsers /> },
    { key: "suspend", label: "Suspend Users", component: <AdminSuspend /> },
  ] as const;

  type Tab = (typeof tabs)[number]["key"];
  const activeTab: Tab =
    tab && tabs.some((t) => t.key === tab) ? (tab as Tab) : "users";
  const activeContent =
    tabs.find((t) => t.key === activeTab)?.component ?? null;

  useEffect(() => {
    if (!tab) {
      navigate("/admin-zone/users", { replace: true });
    }
  }, [tab, navigate]);

  return (
    <RoleRoute allowedRoles={["admin"]} notFoundMode>
      <div className="flex min-h-screen">
        <Sidebar basePath="/admin-zone" tabs={tabs} activeTab={activeTab} />
        <div className="flex-1 p-6 bg-white">{activeContent}</div>
      </div>
    </RoleRoute>
  );
}