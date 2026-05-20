import { useState } from 'react';
import { TrendingUp, TrendingDown, Bot, Calculator, PlusCircle, Trash2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  cost: string;
  price: string;
  qty: string;
}

interface Report {
  name: string;
  revenue: number;
  totalCost: number;
  profit: number;
  margin: number;
  advice: string;
  positive: boolean;
}

function analyze(p: Product): Report {
  const cost = parseFloat(p.cost) || 0;
  const price = parseFloat(p.price) || 0;
  const qty = parseFloat(p.qty) || 0;
  const revenue = price * qty;
  const totalCost = cost * qty;
  const profit = revenue - totalCost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  let advice = '';
  let positive = true;

  if (margin > 40) {
    advice = '🚀 Əla nəticə! Tələb çox yüksəkdir. Daha çox stok alın, satışı genişləndirin. Bu məhsulu reklam etmək üçün əla vaxtdır.';
    positive = true;
  } else if (margin > 20) {
    advice = '✅ Yaxşı gəlir. Xərcləri optimallaşdırsanız marja daha da artacaq. Toplu alış ilə maya dəyərini azaldın.';
    positive = true;
  } else if (margin > 5) {
    advice = '⚠️ Gəlir az. Qiymətinizi 10–15% artırmağı düşünün. Hədəf auditoriyasını daha dəqiq seçin ki, düzgün müştərilər qabağınıza çıxsın.';
    positive = false;
  } else if (margin > 0) {
    advice = '⚠️ Çox az qazanc. Mütləq ya qiyməti artırın, ya da alternativ tədarükçü tapın. Reklam xərclərini azaldın.';
    positive = false;
  } else {
    advice = '🔴 Zərər! Dərhal qiymət strategiyasını dəyişin. Düzgün hədəf kütləsinin qabağına çıxın, qiymətinizi azaldın ki satış artıb ümumi gəlir bərpa olunsun. Maya dəyərini aşağı salmaq üçün yeni tədarükçü axtarın.';
    positive = false;
  }

  return { name: p.name || 'Məhsul', revenue, totalCost, profit, margin, advice, positive };
}

let nextId = 2;

export default function Finance() {
  const [products, setProducts] = useState<Product[]>([{ id: 1, name: '', cost: '', price: '', qty: '' }]);
  const [reports, setReports] = useState<Report[]>([]);
  const [calculated, setCalculated] = useState(false);

  const update = (id: number, field: keyof Product, value: string) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));

  const addRow = () => setProducts((prev) => [...prev, { id: nextId++, name: '', cost: '', price: '', qty: '' }]);

  const removeRow = (id: number) => setProducts((prev) => prev.filter((p) => p.id !== id));

  const calculate = () => {
    setReports(products.map(analyze));
    setCalculated(true);
  };

  const totalProfit = reports.reduce((s, r) => s + r.profit, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
          <Calculator className="text-orange-400" size={36} /> Maliyyə Analizi
        </h1>
        <p className="text-gray-400">Məhsullarınızın gəlir–xərc balansını hesabla, AI tövsiyəsini al.</p>
      </div>

      {/* Input table */}
      <div className="bg-black/50 backdrop-blur-md border border-orange-500/20 rounded-2xl p-6 mb-6 overflow-x-auto">
        <div className="min-w-150">
          <div className="grid grid-cols-5 gap-3 mb-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">
            <span>Məhsul adı</span>
            <span>Maya dəyəri (AZN)</span>
            <span>Satış qiyməti (AZN)</span>
            <span>Satış sayı</span>
            <span></span>
          </div>
          {products.map((p) => (
            <div key={p.id} className="grid grid-cols-5 gap-3 mb-3">
              {(['name', 'cost', 'price', 'qty'] as const).map((field) => (
                <input
                  key={field}
                  type={field === 'name' ? 'text' : 'number'}
                  min="0"
                  placeholder={field === 'name' ? 'Məhsul...' : '0'}
                  value={p[field]}
                  onChange={(e) => update(p.id, field, e.target.value)}
                  className="bg-black/40 border border-orange-500/20 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50 w-full"
                />
              ))}
              <button
                onClick={() => removeRow(p.id)}
                disabled={products.length === 1}
                className="flex items-center justify-center text-gray-600 hover:text-red-400 disabled:opacity-30 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-2">
          <button
            onClick={addRow}
            className="flex items-center gap-2 text-orange-400 border border-orange-500/30 hover:bg-orange-500/10 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <PlusCircle size={16} /> Məhsul əlavə et
          </button>
          <button
            onClick={calculate}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-xl text-sm transition-colors"
          >
            <Calculator size={16} /> Hesabla
          </button>
        </div>
      </div>

      {/* Reports */}
      {calculated && (
        <>
          {/* Summary */}
          <div className={`rounded-2xl p-5 border mb-6 flex items-center gap-4 ${totalProfit >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            {totalProfit >= 0 ? <TrendingUp className="text-green-400 shrink-0" size={28} /> : <TrendingDown className="text-red-400 shrink-0" size={28} />}
            <div>
              <p className="text-gray-400 text-sm">Ümumi Xalis Mənfəət</p>
              <p className={`text-2xl font-extrabold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} AZN
              </p>
            </div>
          </div>

          {/* Per-product reports */}
          <div className="flex flex-col gap-4">
            {reports.map((r, i) => (
              <div key={i} className="bg-black/50 backdrop-blur-md border border-orange-500/20 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">{r.name}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm">
                      <span className="text-gray-400">Gəlir: <span className="text-white font-semibold">{r.revenue.toFixed(2)} AZN</span></span>
                      <span className="text-gray-400">Xərc: <span className="text-white font-semibold">{r.totalCost.toFixed(2)} AZN</span></span>
                      <span className="text-gray-400">Mənfəət: <span className={`font-semibold ${r.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{r.profit >= 0 ? '+' : ''}{r.profit.toFixed(2)} AZN</span></span>
                      <span className="text-gray-400">Marja: <span className={`font-semibold ${r.margin > 20 ? 'text-green-400' : r.margin > 0 ? 'text-orange-400' : 'text-red-400'}`}>{r.margin.toFixed(1)}%</span></span>
                    </div>
                  </div>
                </div>

                {/* AI advice */}
                <div className="flex gap-3 items-start bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
                  <Bot size={18} className="text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm">{r.advice}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
