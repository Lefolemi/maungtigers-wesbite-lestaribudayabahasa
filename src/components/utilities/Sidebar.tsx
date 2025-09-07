import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

type Tab = {
  key: string;
  label: string;
};

type SidebarProps = {
  basePath: string;        // e.g. "/profile"
  tabs: readonly Tab[];    // tab definitions
  activeTab: string;       // current active key
};

export default function Sidebar({ basePath, tabs, activeTab }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <div className="w-48 bg-sekunder p-4 flex flex-col gap-2">
      {/* Back button */}
      <button
        className="flex items-center gap-2 text-left p-2 rounded hover:bg-tersier/80 text-white transition"
        onClick={() => navigate("/")}
      >
        <ChevronLeft size={16} />
        Kembali
      </button>

      {/* Tab buttons */}
      {tabs.map((t) => (
        <button
          key={t.key}
          className={`text-left p-2 rounded hover:bg-tersier/80 text-white flex items-center transition ${
            activeTab === t.key ? "bg-tersier font-bold" : ""
          }`}
          onClick={() => navigate(`${basePath}/${t.key}`)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
