import { useEffect, useState } from "react";
import { supabase } from "../../../backend/supabase";
import { useUserSession } from "../../../backend/context/UserSessionContext";
import DropdownSelect from "../../../components/ui/DropdownSelect";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

interface LineData {
  date: string;
  total: number;
}

interface Bahasa {
  bahasa_id: number;
  nama_bahasa: string;
}

export default function MaknaKataDashboard() {
  const { user } = useUserSession();
  const [loading, setLoading] = useState(true);

  const [bahasaList, setBahasaList] = useState<Bahasa[]>([]);
  const [selectedBahasaId, setSelectedBahasaId] = useState<number | "all">("all");
  const [timeFilter, setTimeFilter] = useState<"7" | "30" | "365" | "all">("all");

  const [total, setTotal] = useState(0);
  const [lineData, setLineData] = useState<LineData[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);

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

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);

      let query = supabase
        .from("makna_kata")
        .select("makna_id, bahasa_id, status, tanggal_dibuat")
        .eq("user_id", user.user_id);

      if (selectedBahasaId !== "all") query = query.eq("bahasa_id", selectedBahasaId);

      if (timeFilter !== "all") {
        const now = new Date();
        let since = new Date();
        if (timeFilter === "7") since.setDate(now.getDate() - 7);
        if (timeFilter === "30") since.setDate(now.getDate() - 30);
        if (timeFilter === "365") since.setFullYear(now.getFullYear() - 1);
        query = query.gte("tanggal_dibuat", since.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const makna = data || [];

      setTotal(makna.length);

      const byDate: Record<string, LineData> = {};
      makna.forEach(item => {
        const d = new Date(item.tanggal_dibuat);
        const key = d.toISOString().split("T")[0];
        if (!byDate[key]) byDate[key] = { date: key, total: 0 };
        byDate[key].total += 1;
      });
      setLineData(Object.values(byDate).sort((a, b) => (a.date > b.date ? 1 : -1)));

      const byStatus: Record<string, number> = {};
      makna.forEach(item => {
        byStatus[item.status] = (byStatus[item.status] || 0) + 1;
      });
      setStatusData(Object.entries(byStatus).map(([status, value]) => ({ name: status, value })));

      setLoading(false);
    };

    fetchData();
  }, [user, selectedBahasaId, timeFilter]);

  if (loading) return <p>Loading dashboard...</p>;

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

  const bahasaOptions = [
    { value: "all", label: "Semua Bahasa" },
    ...bahasaList.map(b => ({ value: b.bahasa_id, label: b.nama_bahasa })),
  ];

  const timeOptions = [
    { value: "7", label: "7 Hari Terakhir" },
    { value: "30", label: "30 Hari Terakhir" },
    { value: "365", label: "1 Tahun Terakhir" },
    { value: "all", label: "Semua Waktu" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Makna Kata</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 w-full md:w-auto">
        <div className="w-48">
          <DropdownSelect
            value={selectedBahasaId}
            onChange={setSelectedBahasaId}
            options={bahasaOptions}
            placeholder="Pilih Bahasa"
          />
        </div>
        <div className="w-48">
          <DropdownSelect
            value={timeFilter}
            onChange={setTimeFilter}
            options={timeOptions}
            placeholder="Pilih Rentang Waktu"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 bg-white rounded-xl shadow">
        <h2 className="text-lg font-semibold">Total Makna Kata</h2>
        <p className="text-2xl">{total}</p>
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Aktivitas Seiring Waktu</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Status Pie */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Status Makna Kata</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}