import { useNavigate } from "react-router-dom";

type Tab = {
  key: string;
  label: string;
};

type SidebarProps = {
  basePath: string;        // e.g. "/profile"
  tabs: readonly Tab[];            // tab definitions
  activeTab: string;       // current active key
};

export default function Sidebar({ basePath, tabs, activeTab }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <div className="w-48 bg-gray-100 p-4 flex flex-col gap-2">
      {/* Back button */}
      <button
        className="text-left text-blue-600 hover:underline"
        onClick={() => navigate("/")}
      >
        Kembali
      </button>

      {/* Tab buttons */}
      {tabs.map((t) => (
        <button
          key={t.key}
          className={`text-left p-2 rounded hover:bg-gray-200 ${
            activeTab === t.key ? "bg-gray-300 font-bold" : ""
          }`}
          onClick={() => navigate(`${basePath}/${t.key}`)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}