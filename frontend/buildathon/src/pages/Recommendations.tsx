import { useState, useEffect } from 'react';
import { Sparkles, ShoppingCart, Loader2, AlertCircle, Tag } from 'lucide-react';
import {
  getSalesProducts,
  getSalesRecommendations,
  type Product,
  type SalesResult,
} from '../services/api';

const GOALS = [
  { value: 'bulk_order', label: 'Toplu sifariş' },
  { value: 'repeat_purchase', label: 'Təkrar alış' },
  { value: 'career_growth', label: 'Karyera inkişafı' },
];

export default function Recommendations() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('repeat_purchase');
  const [interests, setInterests] = useState<string[]>([]);
  const [purchased, setPurchased] = useState<string[]>([]);
  const [result, setResult] = useState<SalesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getSalesProducts().then(setProducts).catch(() => setError('Məhsullar yüklənmədi'));
  }, []);

  const toggleArr = (arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const categories = [...new Set(products.map((p) => p.category.toLowerCase()))];

  const submit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await getSalesRecommendations({
        name: name.trim(),
        goal,
        interests,
        purchase_history: purchased,
      });
      setResult(data);
    } catch {
      setError('Backend ilə əlaqə qurulamadı. Backend-in işlədiyini yoxlayın.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
          <Sparkles className="text-orange-400" size={36} /> AI Tövsiyələri
        </h1>
        <p className="text-gray-400">Müştəri profilini daxil edin, AI ən uyğun məhsulları tövsiyə etsin.</p>
      </div>

      {/* Form */}
      <div className="bg-black/50 backdrop-blur-md border border-orange-500/20 rounded-2xl p-6 mb-8 flex flex-col gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Ad / Şirkət adı</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Məs: Sara Məmmədova"
              className="w-full bg-black/40 border border-orange-500/20 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Məqsəd</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-black/40 border border-orange-500/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50"
            >
              {GOALS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">Maraqlar (kateqoriya)</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => toggleArr(interests, setInterests, cat)}
                className={`px-3 py-1.5 rounded-xl border text-sm transition-colors ${interests.includes(cat) ? 'bg-orange-500 border-orange-500 text-white' : 'border-orange-500/30 text-gray-400 hover:border-orange-500/50 hover:text-orange-300'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">Əvvəlki alışlar</label>
          <div className="flex flex-wrap gap-2">
            {products.map((p) => (
              <button key={p.id} onClick={() => toggleArr(purchased, setPurchased, p.name)}
                className={`px-3 py-1.5 rounded-xl border text-sm transition-colors ${purchased.includes(p.name) ? 'bg-orange-500 border-orange-500 text-white' : 'border-orange-500/30 text-gray-400 hover:border-orange-500/50 hover:text-orange-300'}`}>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <button onClick={submit} disabled={loading || !name.trim()}
          className="self-start flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {loading ? 'Analiz edilir...' : 'Tövsiyə Al'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-300 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="flex flex-col gap-6">
          {/* Insight */}
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 text-gray-300 text-sm italic">
            💡 {result.insight}
          </div>

          {/* Recommendations */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Tövsiyə olunan məhsullar</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {result.recommendations.map((r, i) => (
                <div key={i} className="bg-black/50 backdrop-blur-md border border-orange-500/20 rounded-2xl p-5 flex flex-col gap-3 hover:border-orange-500/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <ShoppingCart size={20} className="text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{r.product_name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border mt-1 inline-block ${r.priority === 'high' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>
                      {r.priority === 'high' ? 'Yüksək prioritet' : 'Orta prioritet'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs flex-1">{r.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-sell */}
          {result.cross_sell?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Tag size={20} className="text-orange-400" /> Əlavə tövsiyələr
              </h2>
              <div className="flex flex-wrap gap-3">
                {result.cross_sell.map((c, i) => (
                  <div key={i} className="bg-black/40 border border-orange-500/15 rounded-xl px-4 py-3 flex flex-col gap-1 max-w-xs">
                    <span className="text-white text-sm font-semibold">{c.product_name}</span>
                    <span className="text-gray-400 text-xs">{c.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
