"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calculator,
  Save,
  AlertCircle,
  Loader2,
} from "lucide-react";

type TxType = "FIXED_SALE" | "FIXED_PURCHASE" | "UNFIXED_SALE" | "UNFIXED_PURCHASE";
type PaymentMode = "Cash" | "Bank";

interface Category {
  id: string;
  name: string;
  metalType: string;
  fixedPurity: number | null;
  isFine: boolean;
}

interface Party {
  id: string;
  name: string;
  type: string;
}

interface LineItem {
  id: string;
  categoryId: string;
  categoryName: string;
  isFine: boolean;
  weight: string;
  purity: string;
  pureWeight: number;
  rate: string;
  premiumDiscount: string;
  amount: number;
}

export default function NewTransactionPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [txType, setTxType] = useState<TxType>("FIXED_SALE");
  const [partyId, setPartyId] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([createEmptyItem()]);

  useEffect(() => {
    async function load() {
      try {
        const [catRes, partyRes] = await Promise.all([
          fetch("/api/stock"),
          fetch("/api/parties"),
        ]);
        const cats = await catRes.json();
        const pts = await partyRes.json();

        setCategories(
          (cats || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            metalType: c.metalType,
            fixedPurity: c.fixedPurity,
            isFine: c.isFine,
          }))
        );
        setParties(pts || []);
      } catch (err) {
        console.error(err);
        alert("Failed to load categories/parties. Make sure database is seeded.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function createEmptyItem(): LineItem {
    return {
      id: Math.random().toString(36).slice(2),
      categoryId: "",
      categoryName: "",
      isFine: false,
      weight: "",
      purity: "",
      pureWeight: 0,
      rate: "",
      premiumDiscount: "0",
      amount: 0,
    };
  }

  function calculateItem(item: LineItem): LineItem {
    const weight = parseFloat(item.weight) || 0;
    const rate = parseFloat(item.rate) || 0;
    const prem = parseFloat(item.premiumDiscount) || 0;

    let pureWeight = weight;
    if (item.isFine) {
      const purity = parseFloat(item.purity) || 0;
      pureWeight = weight * (purity / 100);
    }

    const amount = pureWeight * rate + prem;

    return {
      ...item,
      pureWeight: Number(pureWeight.toFixed(3)),
      amount: Number(amount.toFixed(2)),
    };
  }

  function updateItem(id: string, field: keyof LineItem, value: string) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        let updated = { ...item, [field]: value };

        if (field === "categoryId") {
          const cat = categories.find((c) => c.id === value);
          if (cat) {
            updated.categoryName = cat.name;
            updated.isFine = cat.isFine;
            updated.purity = cat.isFine ? "" : String(cat.fixedPurity ?? "");
          }
        }
        return calculateItem(updated);
      })
    );
  }

  function addItem() {
    setItems((prev) => [...prev, createEmptyItem()]);
  }

  function removeItem(id: string) {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);
  const totalWeight = items.reduce((sum, i) => sum + (parseFloat(i.weight) || 0), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!partyId) {
      alert("Please select a Party");
      return;
    }
    if (items.some((i) => !i.categoryId || !i.weight || !i.rate)) {
      alert("Please fill Category, Weight and Rate for all items");
      return;
    }
    if (items.some((i) => i.isFine && !i.purity)) {
      alert("Please enter Purity for Fine Gold / Fine Silver items");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        type: txType,
        partyId,
        paymentMode,
        notes,
        totalAmount,
        items: items.map((i) => ({
          categoryId: i.categoryId,
          weight: parseFloat(i.weight),
          purity: i.isFine ? parseFloat(i.purity) : null,
          pureWeight: i.pureWeight,
          rate: parseFloat(i.rate),
          premiumDiscount: parseFloat(i.premiumDiscount) || 0,
          amount: i.amount,
        })),
      };

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save");
      }

      alert(`Transaction saved successfully!\n\nTotal: ₹${totalAmount.toLocaleString("en-IN")}`);
      router.push("/");
    } catch (err: any) {
      console.error(err);
      alert("Error: " + (err.message || "Could not save transaction"));
    } finally {
      setSaving(false);
    }
  }

  const isUnfixed = txType.includes("UNFIXED");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-amber-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="p-2 hover:bg-slate-100 rounded-lg transition">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">New Transaction</h1>
              <p className="text-xs text-slate-500">Connected to database</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-xl font-medium shadow transition"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Saving..." : "Save Transaction"}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="font-semibold text-slate-800 mb-4">Transaction Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: "FIXED_SALE", label: "Fixed Sale", color: "green" },
                { value: "FIXED_PURCHASE", label: "Fixed Purchase", color: "red" },
                { value: "UNFIXED_SALE", label: "Unfixed Sale", color: "orange" },
                { value: "UNFIXED_PURCHASE", label: "Unfixed Purchase", color: "blue" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTxType(opt.value as TxType)}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    txType === opt.value
                      ? opt.color === "green"
                        ? "border-green-500 bg-green-50"
                        : opt.color === "red"
                        ? "border-red-500 bg-red-50"
                        : opt.color === "orange"
                        ? "border-orange-500 bg-orange-50"
                        : "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className="font-medium text-slate-800">{opt.label}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {opt.value.includes("UNFIXED") ? "Rate pending" : "Rate fixed"}
                  </p>
                </button>
              ))}
            </div>

            {isUnfixed && (
              <div className="mt-4 flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-800">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>
                  This is an <strong>Unfixed</strong> transaction. Metal will move to/from{" "}
                  <strong>Unfixed Stock</strong>. Rate can be fixed later.
                </p>
              </div>
            )}
          </div>

          {/* Party + Payment */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Party</label>
              <select
                value={partyId}
                onChange={(e) => setPartyId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                required
              >
                <option value="">Select Party</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Payment Mode</label>
              <div className="flex gap-3">
                {(["Cash", "Bank"] as PaymentMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`flex-1 py-3 rounded-xl border-2 font-medium transition ${
                      paymentMode === mode
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Items</h2>
              <button type="button" onClick={addItem} className="flex items-center gap-1.5 text-sm text-amber-600 font-medium">
                <Plus size={16} /> Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                      <select
                        value={item.categoryId}
                        onChange={(e) => updateItem(item.id, "categoryId", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
                        required
                      >
                        <option value="">Select</option>
                        <optgroup label="Gold">
                          {categories.filter((c) => c.metalType === "Gold").map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Silver">
                          {categories.filter((c) => c.metalType === "Silver").map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Weight (g)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={item.weight}
                        onChange={(e) => updateItem(item.id, "weight", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Purity %</label>
                      {item.isFine ? (
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            value={item.purity}
                            onChange={(e) => updateItem(item.id, "purity", e.target.value)}
                            placeholder="e.g. 92.50"
                            className="w-full px-3 py-2.5 rounded-lg border border-amber-300 bg-amber-50 text-sm"
                            required
                          />
                          <Calculator size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500" />
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={item.purity ? `${item.purity}%` : "—"}
                          disabled
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-100 text-sm text-slate-500"
                        />
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Pure Weight</label>
                      <input
                        type="text"
                        value={item.isFine && item.pureWeight ? `${item.pureWeight} g` : "—"}
                        disabled
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-100 text-sm font-medium"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Rate (₹/g)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, "rate", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
                        required
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Prem/Disc</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.premiumDiscount}
                        onChange={(e) => updateItem(item.id, "premiumDiscount", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <span className="text-lg font-bold text-slate-800">
                      ₹{item.amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes + Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
              />
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Weight</span>
                  <span>{totalWeight.toFixed(3)} g</span>
                </div>
                <div className="border-t border-slate-700 pt-3">
                  <div className="flex justify-between items-end">
                    <span className="text-slate-300">Total Amount</span>
                    <span className="text-2xl font-bold text-amber-400">
                      ₹{totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => router.push("/")} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-xl font-medium shadow"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? "Saving..." : "Save Transaction"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
