"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Landmark, ArrowDownLeft, ArrowUpRight, Loader2, RefreshCw } from "lucide-react";

interface BankEntry {
  id: string;
  date: string;
  type: string;
  amount: number;
  balance: number;
  narration: string | null;
  reference: string | null;
  createdAt: string;
}

export default function BankBookPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/bank");
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return d;
    }
  };

  const currentBalance = entries[0]?.balance ?? 0;
  const totalIn = entries.filter((e) => e.type === "IN").reduce((s, e) => s + e.amount, 0);
  const totalOut = entries.filter((e) => e.type === "OUT").reduce((s, e) => s + e.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Bank Book</h1>
              <p className="text-xs text-slate-500">Live data · RTGS / NEFT</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={load} className="p-2 hover:bg-slate-100 rounded-lg">
              <RefreshCw size={18} />
            </button>
            <div className="text-right">
              <p className="text-xs text-slate-500">Current Balance</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(currentBalance)}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownLeft className="text-green-500" size={18} />
              <span className="text-sm text-slate-500">Total In</span>
            </div>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalIn)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="text-red-500" size={18} />
              <span className="text-sm text-slate-500">Total Out</span>
            </div>
            <p className="text-xl font-bold text-red-600">{formatCurrency(totalOut)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Landmark size={18} />
              <span className="text-sm text-blue-100">Balance</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(currentBalance)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {entries.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No bank entries yet. Create a transaction with Bank payment mode.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Date</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Narration</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Reference</th>
                  <th className="text-center px-5 py-3 font-medium text-slate-500">Type</th>
                  <th className="text-right px-5 py-3 font-medium text-slate-500">Amount</th>
                  <th className="text-right px-5 py-3 font-medium text-slate-500">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                      {formatDate(entry.createdAt || entry.date)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-800">{entry.narration || "—"}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">{entry.reference || "—"}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        entry.type === "IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className={`px-5 py-3.5 text-right font-medium ${
                      entry.type === "IN" ? "text-green-600" : "text-red-600"
                    }`}>
                      {entry.type === "IN" ? "+" : "-"}{formatCurrency(entry.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold">{formatCurrency(entry.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
