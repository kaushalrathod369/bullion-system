"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Landmark,
  Package,
  AlertCircle,
  PlusCircle,
  Calendar,
  Loader2,
  RefreshCw,
} from "lucide-react";

type Period = "daily" | "weekly" | "monthly";

interface Stats {
  buying: { amount: number; weight: number; cash: number; bank: number };
  selling: { amount: number; weight: number; cash: number; bank: number };
  grossProfit: number;
  expenses: number;
  netProfit: number;
  cashBalance: number;
  bankBalance: number;
  unfixedGold: number;
  unfixedSilver: number;
  topItems: { name: string; weight: number; amount: number }[];
  stockOverview: { name: string; metalType: string; weight: number }[];
}

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("daily");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadStats(p: Period = period) {
    setLoading(true);
    try {
      const res = await fetch(`/api/stats?period=${p}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats(period);
  }, [period]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n || 0);

  const formatWeight = (n: number) => {
    if (!n) return "0 g";
    if (n >= 1000) return `${(n / 1000).toFixed(2)} kg`;
    return `${n.toFixed(2)} g`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow">
              G
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Bullion Manager</h1>
              <p className="text-xs text-slate-500">Gold & Silver System · Live</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 text-sm">
              <a href="/inventory" className="text-slate-600 hover:text-amber-600 font-medium transition">Inventory</a>
              <a href="/unfixed" className="text-slate-600 hover:text-amber-600 font-medium transition">Unfixed</a>
              <a href="/cash" className="text-slate-600 hover:text-amber-600 font-medium transition">Cash</a>
              <a href="/bank" className="text-slate-600 hover:text-amber-600 font-medium transition">Bank</a>
              <a href="/reports" className="text-slate-600 hover:text-amber-600 font-medium transition">Reports</a>
              <a href="/expenses" className="text-slate-600 hover:text-amber-600 font-medium transition">Expenses</a>
              <a href="/transactions/new" className="text-slate-600 hover:text-amber-600 font-medium transition">New Txn</a>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Cash Balance</p>
              <p className="font-semibold text-green-600">
                {stats ? formatCurrency(stats.cashBalance) : "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Bank Balance</p>
              <p className="font-semibold text-blue-600">
                {stats ? formatCurrency(stats.bankBalance) : "—"}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-medium text-slate-700">
              O
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Period Selector */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200">
            {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  period === p
                    ? "bg-amber-500 text-white shadow"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => loadStats()}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <a
              href="/transactions/new"
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium shadow transition"
            >
              <PlusCircle size={18} />
              New Transaction
            </a>
          </div>
        </div>

        {loading && !stats ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-amber-500" size={36} />
          </div>
        ) : (
          <>
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-500">Buying</span>
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <TrendingDown className="text-red-500" size={20} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {formatCurrency(stats?.buying.amount || 0)}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {formatWeight(stats?.buying.weight || 0)}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-500">Selling</span>
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <TrendingUp className="text-green-500" size={20} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {formatCurrency(stats?.selling.amount || 0)}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {formatWeight(stats?.selling.weight || 0)}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-500">Gross Profit</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Wallet className="text-amber-500" size={20} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-amber-600">
                  {formatCurrency(stats?.grossProfit || 0)}
                </p>
                <p className="text-sm text-slate-500 mt-1">Cash + Bank</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 shadow-sm text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-amber-100">Net Profit</span>
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Landmark className="text-white" size={20} />
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats?.netProfit || 0)}
                </p>
                <p className="text-sm text-amber-100 mt-1">
                  After Expenses ({formatCurrency(stats?.expenses || 0)})
                </p>
              </div>
            </div>

            {/* Secondary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="text-orange-500" size={20} />
                  <h3 className="font-semibold text-slate-800">Unfixed Position</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Gold (Unfixed)</span>
                    <span className="font-semibold text-amber-600">
                      {formatWeight(stats?.unfixedGold || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Silver (Unfixed)</span>
                    <span className="font-semibold text-slate-600">
                      {formatWeight(stats?.unfixedSilver || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="text-slate-600" size={20} />
                  <h3 className="font-semibold text-slate-800">Stock Overview</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {(stats?.stockOverview || []).map((item) => (
                    <div key={item.name} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500">{item.name}</p>
                      <p className={`font-semibold ${item.metalType === "Gold" ? "text-amber-600" : "text-slate-700"}`}>
                        {formatWeight(item.weight)}
                      </p>
                    </div>
                  ))}
                  {(!stats?.stockOverview || stats.stockOverview.length === 0) && (
                    <p className="text-sm text-slate-400 col-span-3">No stock data yet. Create transactions first.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent note */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Calendar size={18} />
                  System Status
                </h3>
              </div>
              <p className="text-sm text-slate-600">
                Dashboard is now connected to live database. Numbers update when you create or fix transactions.
                Use the period tabs (Daily / Weekly / Monthly) to change the range.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
