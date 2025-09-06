// src/routes/moderator/ModeratorReview.tsx
import { useState } from "react";
import ReviewArtikel from "./ReviewArtikel";
import ReviewCerita from "./ReviewCerita";
import ReviewMaknaKata from "./ReviewMaknaKata";
import ReviewKamus from "./ReviewKamus";

export default function ModeratorReview() {
  const [activeTab, setActiveTab] = useState<"artikel" | "cerita" | "makna_kata" | "kamus">("artikel");

  const tabs: { label: string; value: "artikel" | "cerita" | "makna_kata" | "kamus" }[] = [
    { label: "Artikel", value: "artikel" },
    { label: "Cerita", value: "cerita" },
    { label: "Makna Kata", value: "makna_kata" },
    { label: "Kamus", value: "kamus" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Content Review</h2>

      {/* Sub-tabs */}
      <div className="flex space-x-4 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`pb-2 px-2 ${
              activeTab === tab.value
                ? "border-b-2 border-blue-500 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "artikel" && <ReviewArtikel />}
        {activeTab === "cerita" && <ReviewCerita />}
        {activeTab === "makna_kata" && <ReviewMaknaKata />}
        {activeTab === "kamus" && <ReviewKamus />}
      </div>
    </div>
  );
}