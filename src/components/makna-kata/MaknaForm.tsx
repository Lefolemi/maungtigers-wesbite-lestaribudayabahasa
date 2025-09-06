// src/components/makna-kata/MaknaForm.tsx
import { useState } from "react";

interface MaknaFormProps {
  selectedWord: string | null;
  arti: string;
  setArti: (v: string) => void;
  informasi: string;
  setInformasi: (v: string) => void;
  etimologi?: string;
  setEtimologi?: (v: string) => void;
  gambarPreview?: string | null;
  onGambarChange?: (file: File | null) => void;
  warning?: string | null;
}

export default function MaknaForm({
  selectedWord,
  arti,
  setArti,
  informasi,
  setInformasi,
  etimologi,
  setEtimologi,
  gambarPreview,
  onGambarChange,
  warning,
}: MaknaFormProps) {
  return (
    <div className="p-6 space-y-4 border rounded bg-white shadow-sm">
      {warning && (
        <div className="p-3 rounded bg-yellow-100 border border-yellow-400 text-yellow-800">
          {warning}
        </div>
      )}

      <div>
        <label className="block mb-1 font-medium">Kata Terpilih</label>
        <input
          type="text"
          value={selectedWord || ""}
          readOnly
          className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Arti</label>
        <input
          type="text"
          value={arti}
          onChange={(e) => setArti(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Informasi</label>
        <textarea
          value={informasi}
          onChange={(e) => setInformasi(e.target.value)}
          rows={5}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {setEtimologi && (
        <div>
          <label className="block mb-1 font-medium">Etimologi (JSON)</label>
          <textarea
            value={etimologi || ""}
            onChange={(e) => setEtimologi(e.target.value)}
            rows={5}
            className="w-full border rounded px-3 py-2 font-mono text-sm"
            placeholder='Ex: {"asal":"Sansekerta","makna":"..."}'
          />
        </div>
      )}

      {onGambarChange && (
        <div>
          <label className="block mb-1 font-medium">Gambar</label>
          <input type="file" accept="image/*" onChange={(e) => onGambarChange(e.target.files?.[0] || null)} />
          {gambarPreview && (
            <img
              src={gambarPreview}
              alt="Preview"
              className="mt-2 w-48 h-32 object-cover rounded border"
            />
          )}
        </div>
      )}
    </div>
  );
}