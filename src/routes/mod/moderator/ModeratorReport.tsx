// src/routes/admin/ModeratorReport.tsx
import { useState } from "react";

export default function ModeratorReport() {
  const [activeTab, setActiveTab] = useState<"artikel" | "cerita" | "makna_kata" | "kamus">("artikel");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Reported Content</h2>

      {/* Sub-tabs */}
      <div className="flex space-x-4 border-b mb-6">
        {["artikel", "cerita", "makna_kata", "kamus"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`pb-2 px-2 ${
              activeTab === tab
                ? "border-b-2 border-blue-500 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Placeholder content */}
      <div>
        {activeTab === "artikel" && (
          <p className="text-gray-600">Reported Artikel will show here...</p>
        )}
        {activeTab === "cerita" && (
          <p className="text-gray-600">Reported Cerita will show here...</p>
        )}
        {activeTab === "makna_kata" && (
          <p className="text-gray-600">Reported Makna Kata will show here...</p>
        )}
        {activeTab === "kamus" && (
          <p className="text-gray-600">Reported Kamus entries will show here...</p>
        )}
      </div>
    </div>
  );
}