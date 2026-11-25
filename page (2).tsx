"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  X,
  Calculator,
  Loader2,
} from "lucide-react";

interface UnfixedEntry {
  id: string;
  date: string;
  type: "PURCHASE" | "SALE";
  party: string;
  category: string;
  categoryId: string;
  weight: number;
  paymentMode: string;
  amountPaid?: number;
  amountReceived?: number;
  status: string;
  transactionId: string;
}

export default function UnfixedPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<UnfixedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [fixWeight, setFixWeight] = useState("");
  const [fixRate, setFixRate] = useState("");
  const [fixPaymentMode, setFixPaymentMode] = useState<"Cash" | "Bank">("Cash");
  const [fixNotes, setFixNotes] = useState("");

  async function loadEntries() {
    try {
      const res = await fetch("/api/unfixed");
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  const openEntry = entries.find((e) => e.id === fixingId);

  function openFixModal(entry: UnfixedEntry) {
    setFixingId(entry.id);
    setFixWeight(String(entry.weight));
    setFixRate("");
    setFixPaymentMode((entry.paymentMode as "Cash" | "Bank") || "Cash");
    setFixNotes("");
  }

  function closeFixModal() {
    setFixingId(null);
  }

  function calculateFinalAmount() {
    if (!openEntry) return 0;
    const weight = parseFloat(fixWeight) || 0;
    const rate = parseFloat(fixRate) || 0;
    return weight * rate;
  }

  function calculateMoneyDifference() {
    if (!openEntry) return 0;
    const finalAmount = calculateFinalAmount();
    const original = openEntry.type === "PURCHASE" ? (openEntry.amountPaid || 0) : (openEntry.amountReceived || 0);
    return finalAmount - original;
  }

  function calculateWeightDifference() {
    if (!openEntry) return 0;
    return (parseFloat(fixWeight) || 0) - openEntry.weight;
  }

  async function handleFix() {
    if (!openEntry || !fixRate) {
      alert("Please enter the final Rate");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/unfixed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unfixedEntryId: openEntry.id,
          finalWeight: parseFloat(fixWeight),
          finalRate: parseFloat(fixRate),
          settlePaymentMode: fixPaymentMode,
          notes: fixNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fix");

      alert(
        `Fixed successfully!\n\nFinal Amount: ₹${calculateFinalAmount().toLocaleString("en-IN")}\n` +
        `Money Difference: ₹${calculateMoneyDifference().toLocaleString("en-IN")}`
      );

      closeFixModal();
      await loadEntries();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const formatWeight = (g: number) => (g >= 1000 ? `${(g / 1000).toFixed(3)} kg` : `${g.toFixed(2)} g`);

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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Unfixed Entries</h1>
              <p className="text-xs text-slate-500">Connected to database</p>
            </div>
          </div>
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
            {entries.length} Open
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {entries.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
            <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
            <h2 className="text-xl font-semibold">All Clear!</h2>
            <p className="text-slate-500 mt-2">No open unfixed entries.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Date</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Type</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Party</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Metal</th>
                  <th className="text-right px-5 py-3 font-medium text-slate-500">Weight</th>
                  <th className="text-right px-5 py-3 font-medium text-slate-500">Money</th>
                  <th className="text-center px-5 py-3 font-medium text-slate-500">Mode</th>
                  <th className="text-center px-5 py-3 font-medium text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 text-slate-600">{entry.date}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        entry.type === "PURCHASE" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium">{entry.party}</td>
                    <td className="px-5 py-4">{entry.category}</td>
                    <td className="px-5 py-4 text-right font-medium">{formatWeight(entry.weight)}</td>
                    <td className="px-5 py-4 text-right">
                      {formatCurrency(entry.type === "PURCHASE" ? (entry.amountPaid || 0) : (entry.amountReceived || 0))}
                    </td>
                    <td className="px-5 py-4 text-center">{entry.paymentMode}</td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => openFixModal(entry)}
                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg"
                      >
                        Fix Rate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Fixing Modal */}
      {fixingId && openEntry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Fix Rate</h2>
                <p className="text-xs text-slate-500">{openEntry.type} · {openEntry.party} · {openEntry.category}</p>
              </div>
              <button onClick={closeFixModal} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Original Weight</span>
                  <span className="font-medium">{formatWeight(openEntry.weight)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    {openEntry.type === "PURCHASE" ? "Amount Paid" : "Amount Received"}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(openEntry.type === "PURCHASE" ? (openEntry.amountPaid || 0) : (openEntry.amountReceived || 0))}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Final Weight (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={fixWeight}
                    onChange={(e) => setFixWeight(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border"
                  />
                  {calculateWeightDifference() !== 0 && (
                    <p className={`text-xs mt-1 ${calculateWeightDifference() > 0 ? "text-green-600" : "text-red-600"}`}>
                      Diff: {calculateWeightDifference() > 0 ? "+" : ""}{calculateWeightDifference().toFixed(3)} g
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Final Rate (₹/g) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={fixRate}
                      onChange={(e) => setFixRate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50"
                    />
                    <Calculator size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-5 text-white space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Final Amount</span>
                  <span className="font-semibold text-amber-400">{formatCurrency(calculateFinalAmount())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Money Difference</span>
                  <span className={calculateMoneyDifference() >= 0 ? "text-green-400" : "text-red-400"}>
                    {calculateMoneyDifference() >= 0 ? "+" : ""}{formatCurrency(calculateMoneyDifference())}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Settle Difference In</label>
                <div className="flex gap-3">
                  {(["Cash", "Bank"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setFixPaymentMode(mode)}
                      className={`flex-1 py-2.5 rounded-xl border-2 font-medium ${
                        fixPaymentMode === mode ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex gap-3">
              <button onClick={closeFixModal} className="flex-1 py-2.5 rounded-xl border font-medium">
                Cancel
              </button>
              <button
                onClick={handleFix}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Confirm Fix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
