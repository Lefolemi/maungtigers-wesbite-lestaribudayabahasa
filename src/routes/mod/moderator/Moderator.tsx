// src/routes/admin/ModeratorPage.tsx
import { useEffect, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/utilities/Sidebar";
import { useUserSession } from "../../../backend/context/UserSessionContext";
import RoleRoute from "../../../backend/blocked/RoleRoute";
import TakDitemukan from "../../TakDitemukan";

// Import the actual tab components
import ModeratorReview from "./ModeratorReview";
import ModeratorReport from "./ModeratorReport";
import ModeratorPermission from "./ModeratorPermission";

export default function ModeratorPage(): JSX.Element {
  const { user, loading } = useUserSession();
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();

  // Only allow moderators and admins
  if (!loading && (!user || (user.role !== "moderator" && user.role !== "admin"))) {
    return <TakDitemukan />;
  }

  const tabs = [
    { key: "review", label: "Review", component: <ModeratorReview /> },
    { key: "report", label: "Report", component: <ModeratorReport /> },
    { key: "permission", label: "Permission", component: <ModeratorPermission /> },
  ] as const;

  type Tab = (typeof tabs)[number]["key"];
  const activeTab: Tab =
    tab && tabs.some((t) => t.key === tab) ? (tab as Tab) : "review";
  const activeContent = tabs.find((t) => t.key === activeTab)?.component ?? null;

  useEffect(() => {
    if (!tab) {
      navigate("/moderator-zone/review", { replace: true });
    }
  }, [tab, navigate]);

  return (
    <RoleRoute allowedRoles={["moderator", "admin"]} notFoundMode>
      <div className="flex min-h-screen">
        <Sidebar basePath="/moderator-zone" tabs={tabs} activeTab={activeTab} />
        <div className="flex-1 p-6 bg-white">{activeContent}</div>
      </div>
    </RoleRoute>
  );
}