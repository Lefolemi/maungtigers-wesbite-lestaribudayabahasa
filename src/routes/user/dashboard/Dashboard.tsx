import { useEffect, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/utilities/Sidebar";

import GeneralDashboard from "./General";
import KamusDashboard from "./KamusDashboard";
import CeritaDashboard from "./CeritaDashboard";
import MaknaKataDashboard from "./MaknaKataDashboard";

const tabs = [
  { key: "keseluruhan", label: "Keseluruhan", component: <GeneralDashboard /> },
  { key: "kamusdashboard", label: "Kamus", component: <KamusDashboard /> },
  { key: "ceritadashboard", label: "Cerita", component: <CeritaDashboard /> },
  { key: "maknakatadashboard", label: "Makna Kata", component: <MaknaKataDashboard /> },
] as const;

type Tab = (typeof tabs)[number]["key"];

export default function Dashboard(): JSX.Element {
  const { tab } = useParams<{ tab: Tab }>();
  const navigate = useNavigate();

  const activeTab: Tab = tab && tabs.some((t) => t.key === tab) ? (tab as Tab) : "keseluruhan";
  const activeContent = tabs.find((t) => t.key === activeTab)?.component ?? null;

  useEffect(() => {
    if (!tab) {
      navigate("/dashboard/keseluruhan", { replace: true });
    }
  }, [tab, navigate]);

  return (
    <div className="flex min-h-screen">
      <Sidebar basePath="/dashboard" tabs={tabs} activeTab={activeTab} />
      <div className="flex-1 p-4 bg-white">{activeContent}</div>
    </div>
  );
}