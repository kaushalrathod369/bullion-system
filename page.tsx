"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Loader2, RefreshCw } from "lucide-react";

interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  paymentMode: string;
  narration: string | null;
  createdAt: string;
}

const CATEGORIES = [
  "Rent",
  "Electricity",
  "Gas / Fuel",
  "Staff Salary",
  "Security",
  "Assay / Hallmarking",
  "Transport",
  "Vendor Payment",
  "Maintenance",
  "Other",
];

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [category, setCategory] = useState("Rent");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "Bank">("Cash");
  const [narration, setNarration] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          amount: Number(amount),
          paymentMode,
          narration,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setShowForm(false);
      setAmount("");
      setNarration("");
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return d;
    }
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Expenses</h1>
              <p className="text-xs text-slate-500">Track all business expenses</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} className="p-2 hover:bg-slate-100 rounded-lg">
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium"
            >
              <Plus size={16} /> Add Expense
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border mb-6 flex justify-between items-center">
          <span className="text-slate-500">Total Expenses (shown)</span>
          <span className="text-xl font-bold text-red-600">{formatCurrency(total)}</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-amber-500" size={32} />
          </div>
        ) : expenses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400">
            No expenses yet. Click “Add Expense” to create one.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Date</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Category</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Narration</th>
                  <th className="text-center px-5 py-3 font-medium text-slate-500">Mode</th>
                  <th className="text-right px-5 py-3 font-medium text-slate-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 text-slate-600">{formatDate(e.date || e.createdAt)}</td>
                    <td className="px-5 py-3.5 font-medium">{e.category}</td>
                    <td className="px-5 py-3.5 text-slate-500">{e.narration || "—"}</td>
                    <td className="px-5 py-3.5 text-center">{e.paymentMode}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-red-600">
                      {formatCurrency(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add Expense Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-5">Add Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Mode</label>
                <div className="flex gap-3">
                  {(["Cash", "Bank"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMode(m)}
                      className={`flex-1 py-2.5 rounded-xl border-2 font-medium ${
                        paymentMode === m ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Narration (optional)</label>
                <input
                  type="text"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border"
                  placeholder="e.g. November rent"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
