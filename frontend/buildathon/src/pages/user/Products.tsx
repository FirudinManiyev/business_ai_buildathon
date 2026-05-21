import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Sparkles, CheckCircle, X, Tag, ArrowRight, Loader2, Package, Bot } from 'lucide-react';
import { getSalesProducts, getSalesRecommendations, type Product, type SalesResult } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// ── Mock data (backend olmadan da işləyir) ─────────────────────────────────────
const MOCK_PRODUCTS: Product[] = [
  { id: 1,  name: 'MacBook Pro 14"',        category: 'Electronics', description: 'Apple M3 çip, 16GB RAM, 512GB SSD — proqramçılar üçün ideal',    cost_price: 1200, sell_price: 1599, stock: 10 },
  { id: 2,  name: 'iPhone 15 Pro',           category: 'Electronics', description: '6.1" OLED, 256GB, A17 Pro çip, titanium çərçivə',                cost_price: 800,  sell_price: 1099, stock: 15 },
  { id: 3,  name: 'AirPods Pro 2',           category: 'Electronics', description: 'Aktiv səs-küy ləğvi, Spatial Audio, H2 çip',                     cost_price: 150,  sell_price: 249,  stock: 20 },
  { id: 4,  name: 'Mechanical Klaviatura',   category: 'Electronics', description: 'RGB LED işıqlandırma, Cherry MX anahtarları, full-size',          cost_price: 80,   sell_price: 149,  stock: 12 },
  { id: 5,  name: 'USB-C Hub 8-in-1',        category: 'Electronics', description: '4K HDMI, 2× USB 3.0, SD/microSD kart oxuyucu, PD 100W',          cost_price: 35,   sell_price: 69,   stock: 18 },
  { id: 6,  name: 'Python Proqramlaşdırma',  category: 'Books',       description: 'Sıfırdan peşəkara Python — data science, web, avtomatlaşdırma',   cost_price: 15,   sell_price: 35,   stock: 50 },
  { id: 7,  name: 'React.js Kitabı',         category: 'Books',       description: 'Modern web development: hooks, context, Next.js, TypeScript',     cost_price: 18,   sell_price: 42,   stock: 25 },
  { id: 8,  name: 'Maliyyə Analizi Kursu',   category: 'Books',       description: 'Biznes maliyyəsi, P&L, balans hesabatı, investisiya analizi',     cost_price: 20,   sell_price: 49,   stock: 30 },
  { id: 9,  name: 'Ergonomik Ofis Kreslоsu', category: 'Tools',       description: 'Bel dəstəyi, yüksəklik tənzimləmə, 8 saat rahat oturuş',         cost_price: 180,  sell_price: 299,  stock: 8  },
  { id: 10, name: 'Monitor 27" 4K',          category: 'Electronics', description: 'IPS panel, 144Hz, USB-C, HDR400, ofis + oyun üçün',              cost_price: 400,  sell_price: 649,  stock: 6  },
  { id: 11, name: 'Veb Dizayn Kursu',        category: 'Books',       description: 'Figma, CSS, Tailwind, responsive design — 40+ dərs',             cost_price: 22,   sell_price: 55,   stock: 40 },
  { id: 12, name: 'Standing Desk Converter', category: 'Tools',       description: 'Oturaraq-dayanaraq iş: boyun ağrısını azaldır, sağlam həyat',    cost_price: 90,   sell_price: 169,  stock: 14 },
];

const CROSS_SELL_MAP: Record<string, string[]> = {
  Electronics: ['Books', 'Tools'],
  Books:       ['Electronics'],
  Tools:       ['Electronics', 'Books'],
};

// ── Local mock AI (backend olmadan) ──────────────────────────────────────────
function localRecommend(allProducts: Product[], purchases: string[]): SalesResult {
  const bought = allProducts.filter(p => purchases.includes(p.name));
  const cats   = [...new Set(bought.map(p => p.category))];
  const notBought = allProducts.filter(p => !purchases.includes(p.name));

  const recs = notBought
    .filter(p => cats.includes(p.category))
    .slice(0, 4)
    .map((p, i) => ({
      product_id:   p.id,
      product_name: p.name,
      reason:       `${p.category} kateqoriyasında aldıqlarınızla yaxşı uyğun gəlir`,
      priority:     i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
    }));

  const crossCats = [...new Set(cats.flatMap(c => CROSS_SELL_MAP[c] ?? []))].filter(c => !cats.includes(c));
  const cross = notBought
    .filter(p => crossCats.includes(p.category))
    .slice(0, 3)
    .map(p => ({
      product_id:   p.id,
      product_name: p.name,
      reason:       `${cats.join(', ')} ilə birlikdə çox istifadə olunur`,
    }));

  return {
    recommendations: recs,
    insight: `${purchases.length} məhsul aldınız. Alışlarınıza əsasən ${recs.length} yeni tövsiyə tapıldı.`,
    cross_sell: cross,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  Electronics: 'bg-sky-500/15 text-sky-400',
  Books:       'bg-yellow-500/15 text-yellow-400',
  Tools:       'bg-green-500/15 text-green-400',
  Clothing:    'bg-pink-500/15 text-pink-400',
  Food:        'bg-orange-500/15 text-orange-400',
};
const catColor = (c: string) => CAT_COLORS[c] || 'bg-orange-500/15 text-orange-400';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const cardV     = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.32 } } };

// ─────────────────────────────────────────────────────────────────────────────
export default function Products() {
  const { user, addPurchase, removePurchase } = useAuth();
  const [products, setProducts]   = useState<Product[]>(MOCK_PRODUCTS);
  const [loading, setLoading]     = useState(true);
  const [aiResult, setAiResult]   = useState<SalesResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErr, setAiErr]         = useState('');
  const [fromBackend, setFromBackend] = useState(false);

  useEffect(() => {
    getSalesProducts()
      .then(data => { setProducts(data); setFromBackend(true); })
      .catch(() => { /* mock data istifadə olunur */ })
      .finally(() => setLoading(false));
  }, []);

  const purchased   = user?.purchases ?? [];
  const hasPurchases = purchased.length > 0;

  function toggleBuy(product: Product) {
    if (purchased.includes(product.name)) {
      removePurchase(product.name);
      setAiResult(null);
    } else {
      addPurchase(product.name);
      setAiResult(null);
    }
  }

  async function getAiRecs() {
    if (!hasPurchases) return;
    setAiLoading(true);
    setAiErr('');
    setAiResult(null);
    const cats = products.filter(p => purchased.includes(p.name)).map(p => p.category).filter((v, i, a) => a.indexOf(v) === i);

    try {
      const res = await getSalesRecommendations({
        name: user!.name,
        goal: 'Yeni məhsullar kəşf et',
        interests: cats,
        purchase_history: purchased,
      });
      setAiResult(res);
    } catch {
      // Backend yoxdursa local mock AI
      setAiResult(localRecommend(products, purchased));
      setAiErr('');
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Package size={28} className="text-orange-400" /> Məhsul Kataloqu
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Məhsul alın — AI avtomatik fərdi tövsiyə verəcək
            {fromBackend && <span className="ml-2 text-xs text-green-500">● Backend</span>}
          </p>
        </div>
        {hasPurchases && (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 text-orange-300 text-sm font-medium px-4 py-2 rounded-xl">
              <ShoppingCart size={16} /> {purchased.length} məhsul alındı
            </span>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              disabled={aiLoading}
              onClick={getAiRecs}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-orange-500/20"
            >
              {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              AI Tövsiyə Al
            </motion.button>
          </div>
        )}
      </div>

      {/* AI Prompt banner — first purchase */}
      <AnimatePresence>
        {hasPurchases && !aiResult && !aiLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-orange-500/8 border border-orange-500/25 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Bot size={22} className="text-orange-400 shrink-0" />
                <p className="text-gray-300 text-sm">
                  <span className="text-orange-300 font-semibold">{purchased.length} məhsul</span> aldınız —
                  AI alışlarınıza əsasən fərdi tövsiyələr hazırlaya bilər.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={getAiRecs}
                className="shrink-0 flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                <Sparkles size={13} /> Tövsiyə Al
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-orange-400" />
        </div>
      )}

      {aiErr && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-3 text-sm mb-5">{aiErr}</div>
      )}

      {/* Products grid */}
      {!loading && (
        <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {products.map(p => {
            const bought = purchased.includes(p.name);
            return (
              <motion.div
                key={p.id} variants={cardV} whileHover={{ y: -5 }}
                className={`relative bg-black/50 backdrop-blur-md border rounded-2xl p-5 flex flex-col gap-3 transition-all ${
                  bought ? 'border-orange-500/55 shadow-lg shadow-orange-500/10' : 'border-orange-500/15 hover:border-orange-500/40'
                }`}
              >
                {bought && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/30"
                  >
                    <CheckCircle size={15} className="text-white" />
                  </motion.span>
                )}
                <span className={`self-start text-xs px-2.5 py-1 rounded-full font-medium ${catColor(p.category)}`}>
                  {p.category}
                </span>
                <h3 className="text-white font-bold text-base pr-8">{p.name}</h3>
                <p className="text-gray-500 text-xs flex-1 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1 text-orange-400 font-extrabold text-sm">
                    <Tag size={13} /> {p.sell_price.toFixed(2)} ₼
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => toggleBuy(p)}
                    className={`text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${
                      bought
                        ? 'bg-orange-500/20 text-orange-300 hover:bg-red-500/15 hover:text-red-400'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {bought ? '✓ Alındı' : 'Satın Al'}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* AI Results */}
      <AnimatePresence>
        {(aiLoading || aiResult) && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-black/55 border border-orange-500/25 rounded-2xl p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-xl flex items-center gap-2">
                <Sparkles size={20} className="text-orange-400" /> AI Tövsiyələri
              </h2>
              {!aiLoading && (
                <button onClick={() => setAiResult(null)} className="text-gray-500 hover:text-gray-300 transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>

            {aiLoading && (
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Loader2 size={18} className="animate-spin text-orange-400" />
                AI alışlarınızı analiz edir...
              </div>
            )}

            {aiResult && (
              <>
                {aiResult.insight && (
                  <p className="text-gray-400 text-sm italic border-l-2 border-orange-500/40 pl-4">{aiResult.insight}</p>
                )}

                {aiResult.recommendations?.length > 0 && (
                  <div>
                    <h3 className="text-gray-400 font-semibold text-xs mb-3 uppercase tracking-widest">Sizə Uyğun Məhsullar</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {aiResult.recommendations.map(r => (
                        <div key={r.product_id} className="bg-orange-500/8 border border-orange-500/20 rounded-xl p-4 hover:border-orange-500/35 transition-colors">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-white font-semibold text-sm">{r.product_name}</span>
                            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                              r.priority === 'high'   ? 'bg-green-500/20 text-green-400' :
                              r.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>{r.priority}</span>
                          </div>
                          <p className="text-gray-500 text-xs">{r.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiResult.cross_sell?.length > 0 && (
                  <div>
                    <h3 className="text-gray-400 font-semibold text-xs mb-3 uppercase tracking-widest">Cross-sell Fürsətlər</h3>
                    <div className="flex flex-col gap-2">
                      {aiResult.cross_sell.map(c => (
                        <div key={c.product_id} className="flex items-start gap-2 text-sm">
                          <ArrowRight size={14} className="text-orange-400 mt-0.5 shrink-0" />
                          <span className="text-white font-medium">{c.product_name}</span>
                          <span className="text-gray-500 text-xs mt-0.5">— {c.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
