import { useEffect, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/utilities/Sidebar";
import { useUserPerizinan } from "../../../backend/context/UserPerizinanContext";

import KontribusiKamus from "./KontribusiKamus";
import KontribusiCerita from "./KontribusiCerita";
import KontribusiMaknaKata from "./KontribusiMaknaKata";
import KontribusiArtikel from "./KontribusiArtikel";

export default function KontribusiView(): JSX.Element {
  const { permissions } = useUserPerizinan();
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();

  const canAccessKamus = permissions["kamus"]?.boleh_edit ?? false;
  const canAccessArtikel = permissions["artikel"]?.boleh_edit ?? false;

  // Dynamically build tabs based on permissions
  const tabs = [
    ...(canAccessKamus ? [{ key: "kamus", label: "Kamus", component: <KontribusiKamus /> }] : []),
    { key: "cerita", label: "Cerita", component: <KontribusiCerita /> },
    { key: "makna-kata", label: "Makna Kata", component: <KontribusiMaknaKata /> },
    ...(canAccessArtikel ? [{ key: "artikel", label: "Artikel", component: <KontribusiArtikel /> }] : []),
  ] as const;

  type Tab = (typeof tabs)[number]["key"];
  const activeTab: Tab = tab && tabs.some((t) => t.key === tab) ? (tab as Tab) : tabs[0]?.key ?? "cerita";
  const activeContent = tabs.find((t) => t.key === activeTab)?.component ?? null;

  useEffect(() => {
    if (!tab && tabs.length > 0) {
      navigate(`/lihat-kontribusi/${tabs[0].key}`, { replace: true });
    }
  }, [tab, navigate, tabs]);

  return (
    <div className="flex min-h-screen bg-primer">
      {/* Sidebar */}
      <Sidebar basePath="/lihat-kontribusi" tabs={tabs} activeTab={activeTab} />

      {/* Main content 90% with bigger padding */}
      <div className="bg-white w-9/10 p-8">{activeContent}</div>

      {/* Right 10% just background */}
      <div className="w-1/10"></div>
    </div>
  );
}