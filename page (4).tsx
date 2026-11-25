"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, TrendingUp, TrendingDown, Wallet, Loader2 } from "lucide-react";

type Period = "daily" | "weekly" | "monthly";

interface Stats {
  buying: { amount: number; weight: number; cash: number; bank: number };
  selling: { amount: number; weight: number; cash: number; bank: number };
  grossProfit: number;
  expenses: number;
  netProfit: number;
  topItems: { name: string; weight: number; amount: number }[];
  startDate?: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("daily");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/stats?period=${period}`);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [period]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

  const formatWeight = (g: number) => {
    if (!g) return "0 g";
    return g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${g.toFixed(1)} g`;
  };

  const periodLabel = {
    daily: "Today",
    weekly: "This Week",
    monthly: "This Month",
  }[period];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="p-2 hover:bg-slate-100 rounded-lg transition">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Reports</h1>
              <p className="text-xs text-slate-500">Live data from database</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200 w-fit mb-8">
          {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                period === p ? "bg-amber-500 text-white shadow" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        <p className="text-sm text-slate-500 mb-6">{periodLabel}</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-amber-500" size={32} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 shadow-sm border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="text-red-500" size={18} />
                  <span className="text-sm text-slate-500">Buying</span>
                </div>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(stats?.buying.amount || 0)}</p>
                <p className="text-xs text-slate-400 mt-1">{formatWeight(stats?.buying.weight || 0)}</p>
                <div className="mt-3 flex gap-3 text-xs">
                  <span className="text-green-600">Cash: {formatCurrency(stats?.buying.cash || 0)}</span>
                  <span className="text-blue-600">Bank: {formatCurrency(stats?.buying.bank || 0)}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-green-500" size={18} />
                  <span className="text-sm text-slate-500">Selling</span>
                </div>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(stats?.selling.amount || 0)}</p>
                <p className="text-xs text-slate-400 mt-1">{formatWeight(stats?.selling.weight || 0)}</p>
                <div className="mt-3 flex gap-3 text-xs">
                  <span className="text-green-600">Cash: {formatCurrency(stats?.selling.cash || 0)}</span>
                  <span className="text-blue-600">Bank: {formatCurrency(stats?.selling.bank || 0)}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="text-amber-500" size={18} />
                  <span className="text-sm text-slate-500">Gross Profit</span>
                </div>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(stats?.grossProfit || 0)}</p>
                <p className="text-xs text-slate-400 mt-1">Cash + Bank transactions</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={18} />
                  <span className="text-sm text-amber-100">Net Profit</span>
                </div>
                <p className="text-xl font-bold">{formatCurrency(stats?.netProfit || 0)}</p>
                <p className="text-xs text-amber-100 mt-1">
                  After expenses ({formatCurrency(stats?.expenses || 0)})
                </p>
              </div>
            </div>

            {/* Top Items */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="font-semibold text-slate-800 mb-4">Top Selling Items</h3>
              {(stats?.topItems || []).length === 0 ? (
                <p className="text-sm text-slate-400">No sales in this period yet.</p>
              ) : (
                <div className="space-y-3">
                  {stats!.topItems.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-medium text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-500">{formatWeight(item.weight)} sold</p>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-800">{formatCurrency(item.amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
