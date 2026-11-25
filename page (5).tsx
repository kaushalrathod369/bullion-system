"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  AlertTriangle,
  Scale,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface StockItem {
  id: string;
  name: string;
  metalType: string;
  fixedPurity: number | null;
  isFine: boolean;
  mainWeight: number;
  unfixedWeight: number;
  avgCost: number;
}

export default function InventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadStock() {
    setLoading(true);
    try {
      const res = await fetch("/api/stock");
      const data = await res.json();

      const mapped: StockItem[] = (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        metalType: c.metalType,
        fixedPurity: c.fixedPurity,
        isFine: c.isFine,
        mainWeight: c.mainStock?.physicalWeight ?? 0,
        unfixedWeight: c.unfixedStock?.physicalWeight ?? 0,
        avgCost: c.mainStock?.averageCost ?? 0,
      }));

      setItems(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStock();
  }, []);

  const formatWeight = (g: number) => {
    if (g >= 1000) return `${(g / 1000).toFixed(3)} kg`;
    return `${g.toFixed(2)} g`;
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const totalMainGold = items.filter((s) => s.metalType === "Gold").reduce((s, i) => s + i.mainWeight, 0);
  const totalMainSilver = items.filter((s) => s.metalType === "Silver").reduce((s, i) => s + i.mainWeight, 0);
  const totalUnfixedGold = items.filter((s) => s.metalType === "Gold").reduce((s, i) => s + i.unfixedWeight, 0);
  const totalUnfixedSilver = items.filter((s) => s.metalType === "Silver").reduce((s, i) => s + i.unfixedWeight, 0);

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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="p-2 hover:bg-slate-100 rounded-lg transition">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Inventory</h1>
              <p className="text-xs text-slate-500">Live data from database</p>
            </div>
          </div>
          <button
            onClick={loadStock}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Main Gold</p>
            <p className="text-xl font-bold text-amber-600">{formatWeight(totalMainGold)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Main Silver</p>
            <p className="text-xl font-bold text-slate-700">{formatWeight(totalMainSilver)}</p>
          </div>
          <div className="bg-orange-50 rounded-2xl p-5 shadow-sm border border-orange-100">
            <p className="text-xs text-orange-600 mb-1">Unfixed Gold</p>
            <p className="text-xl font-bold text-orange-700">{formatWeight(totalUnfixedGold)}</p>
          </div>
          <div className="bg-orange-50 rounded-2xl p-5 shadow-sm border border-orange-100">
            <p className="text-xs text-orange-600 mb-1">Unfixed Silver</p>
            <p className="text-xl font-bold text-orange-700">{formatWeight(totalUnfixedSilver)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MAIN STOCK */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
              <Package className="text-slate-600" size={20} />
              <h2 className="font-semibold text-slate-800">Main Stock</h2>
              <span className="ml-auto text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">Fixed / Normal</span>
            </div>
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="px-6 py-4 hover:bg-slate-50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Purity: {item.isFine ? "Variable" : `${item.fixedPurity}%`}
                        {item.avgCost > 0 && ` · Avg Cost: ${formatCurrency(item.avgCost)}/g`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${item.metalType === "Gold" ? "text-amber-600" : "text-slate-700"}`}>
                        {formatWeight(item.mainWeight)}
                      </p>
                      {item.avgCost > 0 && (
                        <p className="text-xs text-slate-400">
                          ≈ {formatCurrency(item.mainWeight * item.avgCost)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UNFIXED STOCK */}
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-orange-100 flex items-center gap-2 bg-orange-50">
              <AlertTriangle className="text-orange-600" size={20} />
              <h2 className="font-semibold text-slate-800">Unfixed Stock</h2>
              <span className="ml-auto text-xs bg-orange-200 text-orange-700 px-2 py-1 rounded-full">Rate Pending</span>
            </div>
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="px-6 py-4 hover:bg-orange-50/50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Waiting for rate fixing</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${item.unfixedWeight > 0 ? "text-orange-600" : "text-slate-300"}`}>
                        {item.unfixedWeight > 0 ? formatWeight(item.unfixedWeight) : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-orange-50 border-t border-orange-100">
              <button
                onClick={() => router.push("/unfixed")}
                className="w-full py-2.5 text-sm font-medium text-orange-700 hover:bg-orange-100 rounded-xl transition"
              >
                View Unfixed Entries →
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 p-4 bg-slate-100 rounded-xl text-sm text-slate-600">
          <Scale size={18} className="mt-0.5 shrink-0" />
          <p>
            <strong>Note:</strong> This data is live from the database. Stock updates automatically when you create transactions or fix unfixed entries.
          </p>
        </div>
      </main>
    </div>
  );
}
