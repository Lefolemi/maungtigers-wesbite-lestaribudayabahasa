import { useEffect, useState } from "react";
import { supabase } from "../../../backend/supabase";
import { useUserSession } from "../../../backend/context/UserSessionContext";
import DropdownSelect from "../../../components/ui/DropdownSelect";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

type ContributionType = "cerita" | "makna" | "kamus";

interface LineData {
  date: string;
  cerita: number;
  makna: number;
  kamus: number;
}

interface LanguageBreakdown {
  bahasa: string;
  total: number;
}

export default function GeneralDashboard() {
  const { user } = useUserSession();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ cerita: 0, makna: 0, kamus: 0 });
  const [lineData, setLineData] = useState<LineData[]>([]);
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);
  const [langData, setLangData] = useState<LanguageBreakdown[]>([]);
  const [filter, setFilter] = useState<"7d" | "30d" | "1y" | "all">("30d");

  const filterOptions = [
    { value: "7d", label: "7 Hari Terakhir" },
    { value: "30d", label: "30 Hari Terakhir" },
    { value: "1y", label: "1 Tahun Terakhir" },
    { value: "all", label: "Semua Waktu" },
  ];

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);

      const [ceritaRes, maknaRes, kamusRes] = await Promise.all([
        supabase.from("cerita").select("cerita_id, bahasa_id, tanggal_dibuat").eq("user_id", user.user_id),
        supabase.from("makna_kata").select("makna_id, bahasa_id, tanggal_dibuat").eq("user_id", user.user_id),
        supabase.from("kamus_review").select("review_id, bahasa_id, tanggal_dibuat").eq("user_id", user.user_id),
      ]);

      const cerita = ceritaRes.data || [];
      const makna = maknaRes.data || [];
      const kamus = kamusRes.data || [];

      setSummary({
        cerita: cerita.length,
        makna: makna.length,
        kamus: kamus.length,
      });

      const now = new Date();
      const getLimitDate = () => {
        if (filter === "7d") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (filter === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (filter === "1y") return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return null;
      };
      const limitDate = getLimitDate();

      const filterByDate = (arr: any[]) =>
        limitDate ? arr.filter(item => new Date(item.tanggal_dibuat) >= limitDate) : arr;

      const ceritaF = filterByDate(cerita);
      const maknaF = filterByDate(makna);
      const kamusF = filterByDate(kamus);

      const all: { date: string; type: ContributionType }[] = [
        ...ceritaF.map(c => ({ date: c.tanggal_dibuat, type: "cerita" as const })),
        ...maknaF.map(m => ({ date: m.tanggal_dibuat, type: "makna" as const })),
        ...kamusF.map(k => ({ date: k.tanggal_dibuat, type: "kamus" as const })),
      ];

      const byDate: Record<string, LineData> = {};
      all.forEach(item => {
        const d = new Date(item.date);
        const key = d.toISOString().split("T")[0];
        if (!byDate[key]) byDate[key] = { date: key, cerita: 0, makna: 0, kamus: 0 };
        byDate[key][item.type] += 1;
      });

      setLineData(Object.values(byDate).sort((a, b) => (a.date > b.date ? 1 : -1)));

      setPieData([
        { name: "Cerita", value: ceritaF.length },
        { name: "Makna Kata", value: maknaF.length },
        { name: "Kamus", value: kamusF.length },
      ]);

      const langCount: Record<number, number> = {};
      [...cerita, ...makna, ...kamus].forEach(item => {
        langCount[item.bahasa_id] = (langCount[item.bahasa_id] || 0) + 1;
      });

      if (Object.keys(langCount).length > 0) {
        const { data: bahasaList } = await supabase
          .from("bahasa")
          .select("bahasa_id, nama_bahasa")
          .in("bahasa_id", Object.keys(langCount).map(Number));

        const langArr: LanguageBreakdown[] =
          bahasaList?.map(b => ({
            bahasa: b.nama_bahasa,
            total: langCount[b.bahasa_id] || 0,
          })) || [];

        setLangData(langArr);
      }

      setLoading(false);
    };

    fetchData();
  }, [user, filter]);

  if (loading) return <p>Loading dashboard...</p>;

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">📊 Dashboard Keseluruhan</h1>

      {/* Filter Dropdown */}
      <div className="mb-4 w-48">
        <DropdownSelect
          value={filter}
          onChange={setFilter}
          options={filterOptions}
          placeholder="Pilih rentang waktu"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold">Cerita</h2>
          <p className="text-2xl">{summary.cerita}</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold">Makna Kata</h2>
          <p className="text-2xl">{summary.makna}</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold">Kamus</h2>
          <p className="text-2xl">{summary.kamus}</p>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Perkembangan Kontribusi (Timeline)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip labelFormatter={(d) => `Tanggal: ${d}`} />
            <Legend />
            <Line type="monotone" dataKey="cerita" stroke="#8884d8" />
            <Line type="monotone" dataKey="makna" stroke="#82ca9d" />
            <Line type="monotone" dataKey="kamus" stroke="#ffc658" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Distribusi Kontribusi</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart: Contributions per Language */}
      {langData.length > 0 && (
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Kontribusi per Bahasa</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={langData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bahasa" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}