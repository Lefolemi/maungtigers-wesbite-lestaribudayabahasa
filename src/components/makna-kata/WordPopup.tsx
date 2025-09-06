// src/components/makna-kata/WordPopup.tsx
import { useEffect, useState } from "react";
import Popup from "../utilities/Popup"; // universal Popup
import { supabase } from "../../backend/supabase";

export type Word = {
  kata_id: number;
  kata: string;
  arti: string;
  bahasa_id: number;   // added
  bahasa: string;
};

type Bahasa = {
  bahasa_id: number;
  nama_bahasa: string;
};

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSelect: (word: Word) => void;
};

export default function WordPopup({ open, setOpen, onSelect }: Props) {
  const [bahasaList, setBahasaList] = useState<Bahasa[]>([]);
  const [selectedBahasaId, setSelectedBahasaId] = useState<number | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // load languages on mount
  useEffect(() => {
    async function loadLanguages() {
      const { data, error } = await supabase
        .from("bahasa")
        .select("bahasa_id, nama_bahasa")
        .order("nama_bahasa");

      if (!error && data) setBahasaList(data as Bahasa[]);
    }
    loadLanguages();
  }, []);

  // load words when a language is selected
  useEffect(() => {
    if (!selectedBahasaId) return;

    async function loadWords() {
      setLoading(true);

      const { data, error } = await supabase
        .from("kamus")
        .select("kata_id, kata, arti, bahasa_id")
        .eq("bahasa_id", selectedBahasaId)
        .order("kata", { ascending: true });

      if (!error && data) {
        const formatted: Word[] = (data as any[]).map((w) => ({
          kata_id: w.kata_id,
          kata: w.kata,
          arti: w.arti,
          bahasa_id: w.bahasa_id, // add this
          bahasa: bahasaList.find((b) => b.bahasa_id === w.bahasa_id)?.nama_bahasa || "",
        }));
        setWords(formatted);
      } else {
        setWords([]);
      }

      setLoading(false);
    }

    loadWords();
  }, [selectedBahasaId, bahasaList]);

  const filteredWords = words.filter(
    (w) =>
      w.kata.toLowerCase().includes(search.toLowerCase()) ||
      w.arti.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popup open={open} onClose={() => setOpen(false)} size="lg">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pilih Kata</h2>

        {/* Language selector */}
        <select
          className="border rounded p-2 w-full"
          value={selectedBahasaId ?? ""}
          onChange={(e) => setSelectedBahasaId(Number(e.target.value))}
        >
          <option value="" disabled>
            Pilih bahasa
          </option>
          {bahasaList.map((b) => (
            <option key={b.bahasa_id} value={b.bahasa_id}>
              {b.nama_bahasa}
            </option>
          ))}
        </select>

        {/* Search bar */}
        {words.length > 0 && (
          <input
            type="text"
            placeholder="Cari kata atau arti..."
            className="border rounded p-2 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}

        {/* Words table */}
        {loading ? (
          <p>Loading kata...</p>
        ) : filteredWords.length === 0 ? (
          <p>Belum ada kata yang cocok.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto border rounded">
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Kata</th>
                  <th className="border px-2 py-1">Arti</th>
                </tr>
              </thead>
              <tbody>
                {filteredWords.map((w) => (
                  <tr
                    key={w.kata_id}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      onSelect(w);
                      setOpen(false);
                    }}
                  >
                    <td className="border px-2 py-1">{w.kata}</td>
                    <td className="border px-2 py-1">{w.arti}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Tutup
          </button>
        </div>
      </div>
    </Popup>
  );
}