import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Sparkles, CheckCircle, X, Tag, ArrowRight,
  Loader2, Package, Bot, Search, Trash2, SlidersHorizontal,
} from 'lucide-react';
import { getSalesProducts, getSalesRecommendations, type Product, type SalesResult } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_PRODUCTS: Product[] = [
  // Electronics
  { id: 1,  name: 'MacBook Pro 14"',          category: 'Electronics', description: 'Apple M3 çip, 16GB RAM, 512GB SSD — proqramçılar üçün ideal',       cost_price: 1200, sell_price: 1599, stock: 10 },
  { id: 2,  name: 'iPhone 15 Pro',             category: 'Electronics', description: '6.1" OLED, 256GB, A17 Pro çip, titanium çərçivə',                   cost_price: 800,  sell_price: 1099, stock: 15 },
  { id: 3,  name: 'AirPods Pro 2',             category: 'Electronics', description: 'Aktiv səs-küy ləğvi, Spatial Audio, H2 çip',                        cost_price: 150,  sell_price: 249,  stock: 20 },
  { id: 4,  name: 'Mechanical Klaviatura',     category: 'Electronics', description: 'RGB LED işıqlandırma, Cherry MX anahtarları, full-size',             cost_price: 80,   sell_price: 149,  stock: 12 },
  { id: 5,  name: 'USB-C Hub 8-in-1',          category: 'Electronics', description: '4K HDMI, 2× USB 3.0, SD/microSD kart oxuyucu, PD 100W',             cost_price: 35,   sell_price: 69,   stock: 18 },
  { id: 6,  name: 'Monitor 27" 4K',            category: 'Electronics', description: 'IPS panel, 144Hz, USB-C, HDR400, ofis + oyun üçün',                 cost_price: 400,  sell_price: 649,  stock: 6  },
  { id: 7,  name: 'iPad Pro M4',               category: 'Electronics', description: '12.9" OLED, Apple Pencil Pro dəstəyi, 256GB, 5G',                   cost_price: 900,  sell_price: 1299, stock: 8  },
  { id: 8,  name: 'Sony WH-1000XM5',           category: 'Electronics', description: 'Premium ANC qulaqlıq, 30 saat batareya, multipoint bağlantı',       cost_price: 200,  sell_price: 349,  stock: 14 },
  { id: 9,  name: 'Dell XPS 15',               category: 'Electronics', description: 'i9-13900H, RTX 4070, 32GB RAM, 1TB SSD — premium iş noutbuku',      cost_price: 1800, sell_price: 2299, stock: 5  },
  { id: 10, name: 'Webcam 4K Pro',             category: 'Electronics', description: '4K/60fps, autofokus, HDR, geniş bucaq — online görüşlər üçün',      cost_price: 90,   sell_price: 159,  stock: 22 },
  { id: 11, name: 'Smartwatch Series 9',       category: 'Electronics', description: 'Sağlamlıq monitorinqi, GPS, 18 saat batareya, su keçirməz',         cost_price: 250,  sell_price: 399,  stock: 11 },
  { id: 12, name: 'Portable SSD 2TB',          category: 'Electronics', description: 'USB 3.2 Gen2, 2000 MB/s sürət, şok davamlı, cib ölçüsü',           cost_price: 110,  sell_price: 189,  stock: 30 },
  // Books / Courses
  { id: 13, name: 'Python Proqramlaşdırma',    category: 'Books', description: 'Sıfırdan peşəkara Python — data science, web, avtomatlaşdırma',           cost_price: 15,   sell_price: 35,   stock: 50 },
  { id: 14, name: 'React.js Kitabı',           category: 'Books', description: 'Modern web development: hooks, context, Next.js, TypeScript',              cost_price: 18,   sell_price: 42,   stock: 25 },
  { id: 15, name: 'Maliyyə Analizi Kursu',     category: 'Books', description: 'Biznes maliyyəsi, P&L, balans hesabatı, investisiya analizi',             cost_price: 20,   sell_price: 49,   stock: 30 },
  { id: 16, name: 'Veb Dizayn Kursu',          category: 'Books', description: 'Figma, CSS, Tailwind, responsive design — 40+ dərs',                     cost_price: 22,   sell_price: 55,   stock: 40 },
  { id: 17, name: 'Machine Learning A-Z',      category: 'Books', description: 'Supervised, unsupervised, NLP, CV — praktik layihələrlə',                 cost_price: 25,   sell_price: 69,   stock: 35 },
  { id: 18, name: 'SQL Mastery Kursu',         category: 'Books', description: 'PostgreSQL, MySQL, query optimallaşdırma, 50+ praktik tapşırıq',         cost_price: 18,   sell_price: 45,   stock: 28 },
  { id: 19, name: 'Docker & Kubernetes',       category: 'Books', description: 'Konteynerləşdirmə, orkestrləşdirmə, CI/CD pipeline qurma',               cost_price: 22,   sell_price: 59,   stock: 20 },
  { id: 20, name: 'Node.js Backend Kursu',     category: 'Books', description: 'REST API, JWT auth, MongoDB, Express.js, deployment',                     cost_price: 20,   sell_price: 52,   stock: 22 },
  { id: 21, name: 'Kibertəhlükəsizlik',        category: 'Books', description: 'Ethical hacking, penetration testing, network security — 60+ dərs',      cost_price: 28,   sell_price: 79,   stock: 18 },
  { id: 22, name: 'TypeScript Dərindən',       category: 'Books', description: 'Generics, utility types, decorators, real-world patterns',               cost_price: 19,   sell_price: 48,   stock: 33 },
  // Tools / Office
  { id: 23, name: 'Ergonomik Ofis Kreslоsu',   category: 'Tools', description: 'Bel dəstəyi, yüksəklik tənzimləmə, 8 saat rahat oturuş',                cost_price: 180,  sell_price: 299,  stock: 8  },
  { id: 24, name: 'Standing Desk Converter',   category: 'Tools', description: 'Oturaraq-dayanaraq iş: boyun ağrısını azaldır, sağlam həyat',           cost_price: 90,   sell_price: 169,  stock: 14 },
  { id: 25, name: 'Dual Monitor Stand',        category: 'Tools', description: '2 monitor üçün qol, 360° fırlanma, masa yerini azaldır',                 cost_price: 60,   sell_price: 119,  stock: 16 },
  { id: 26, name: 'LED Masa Lampası',          category: 'Tools', description: 'USB şarj portu, 5 parlaqlıq, göz qoruyucu, USB-C güc',                   cost_price: 25,   sell_price: 55,   stock: 25 },
  { id: 27, name: 'Wireless Mouse + Pad',      category: 'Tools', description: 'Simsiz ergonomik siçan + böyük masaüstü pad, 12 ay batareya',            cost_price: 30,   sell_price: 65,   stock: 20 },
  { id: 28, name: 'Noise Cancelling Headset',  category: 'Tools', description: 'Ofis üçün boom mikrofon, USB-A/C, 270° fırlanan qulaq yastığı',          cost_price: 70,   sell_price: 129,  stock: 17 },
  { id: 29, name: 'Premium Noutbuk Çantası',   category: 'Tools', description: '15.6" uyğun, su keçirməz, USB şarj portu, çox cibli',                   cost_price: 40,   sell_price: 89,   stock: 30 },
  { id: 30, name: 'Printer Lazer A4',          category: 'Tools', description: 'Wi-Fi, dupleks, 30 s/dəq, mobil çap — ofis + ev üçün',                  cost_price: 160,  sell_price: 249,  stock: 9  },
];

const CROSS_SELL_MAP: Record<string, string[]> = {
  Electronics: ['Books', 'Tools'],
  Books:       ['Electronics'],
  Tools:       ['Electronics', 'Books'],
};

// ── Local mock AI ─────────────────────────────────────────────────────────────
function localRecommend(allProducts: Product[], purchases: string[]): SalesResult {
  const bought    = allProducts.filter(p => purchases.includes(p.name));
  const cats      = [...new Set(bought.map(p => p.category))];
  const notBought = allProducts.filter(p => !purchases.includes(p.name));
  const recs = notBought.filter(p => cats.includes(p.category)).slice(0, 4).map((p, i) => ({
    product_id: p.id, product_name: p.name,
    reason: `${p.category} kateqoriyasında aldıqlarınızla yaxşı uyğun gəlir`,
    priority: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
  }));
  const crossCats = [...new Set(cats.flatMap(c => CROSS_SELL_MAP[c] ?? []))].filter(c => !cats.includes(c));
  const cross = notBought.filter(p => crossCats.includes(p.category)).slice(0, 3).map(p => ({
    product_id: p.id, product_name: p.name,
    reason: `${cats.join(', ')} ilə birlikdə çox istifadə olunur`,
  }));
  return {
    recommendations: recs,
    insight: `${purchases.length} məhsul aldınız. Alışlarınıza əsasən ${recs.length} yeni tövsiyə tapıldı.`,
    cross_sell: cross,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  Electronics: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  Books:       'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  Tools:       'bg-green-500/15 text-green-400 border-green-500/20',
};
const catColor = (c: string) => CAT_COLORS[c] ?? 'bg-orange-500/15 text-orange-400 border-orange-500/20';

const SORT_OPTIONS = [
  { value: 'default', label: 'Standart' },
  { value: 'price_asc', label: 'Qiymət ↑' },
  { value: 'price_desc', label: 'Qiymət ↓' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const cardV     = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.28 } } };

// ─────────────────────────────────────────────────────────────────────────────
export default function Products() {
  const { user, addPurchase, removePurchase } = useAuth();
  const [products]                    = useState<Product[]>(MOCK_PRODUCTS);
  const [loading, setLoading]         = useState(true);
  const [aiResult, setAiResult]       = useState<SalesResult | null>(null);
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiErr, setAiErr]             = useState('');
  const [fromBackend, setFromBackend] = useState(false);

  // Filter / sort state
  const [search, setSearch]     = useState('');
  const [activeCat, setActiveCat] = useState('Hamısı');
  const [sort, setSort]         = useState('default');
  const [cartOpen, setCartOpen] = useState(true);

  const aiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSalesProducts()
      .then(() => setFromBackend(true))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const purchased    = user?.purchases ?? [];
  const hasPurchases = purchased.length > 0;

  const categories = ['Hamısı', ...Array.from(new Set(MOCK_PRODUCTS.map(p => p.category)))];

  const filteredProducts = products
    .filter(p => activeCat === 'Hamısı' || p.category === activeCat)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) ||
                 p.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sort === 'price_asc'  ? a.sell_price - b.sell_price :
      sort === 'price_desc' ? b.sell_price - a.sell_price : 0
    );

  const cartItems = products.filter(p => purchased.includes(p.name));
  const cartTotal = cartItems.reduce((s, p) => s + p.sell_price, 0);

  function toggleBuy(product: Product) {
    if (purchased.includes(product.name)) {
      removePurchase(product.name);
      setAiResult(null);
    } else {
      addPurchase(product.name);
      setAiResult(null);
    }
  }

  function clearAll() {
    purchased.forEach(name => removePurchase(name));
    setAiResult(null);
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
      setAiResult(localRecommend(products, purchased));
    } finally {
      setAiLoading(false);
      setTimeout(() => aiRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Package size={28} className="text-orange-400" /> Məhsul Kataloqu
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {products.length} məhsul — filtrele, seç, AI tövsiyəsi al
            {fromBackend && <span className="ml-2 text-xs text-green-500">● Backend</span>}
          </p>
        </div>
        {hasPurchases && (
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            disabled={aiLoading} onClick={getAiRecs}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-orange-500/20"
          >
            {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            AI Tövsiyə Al
          </motion.button>
        )}
      </div>

      {/* ── Cart / Selected Items Panel ── */}
      <AnimatePresence>
        {hasPurchases && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6"
          >
            <div className="bg-black/50 border border-orange-500/30 rounded-2xl overflow-hidden">
              {/* Panel header */}
              <button
                onClick={() => setCartOpen(v => !v)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-orange-500/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart size={17} className="text-orange-400" />
                  <span className="text-white font-semibold text-sm">Seçilmiş Məhsullar</span>
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cartItems.length}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-orange-400 font-bold text-sm">{cartTotal.toFixed(2)} ₼</span>
                  <span className="text-gray-500 text-xs">{cartOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Panel body */}
              <AnimatePresence>
                {cartOpen && (
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden border-t border-orange-500/15"
                  >
                    <div className="px-5 py-4 flex flex-col gap-2">
                      <div className="flex flex-wrap gap-2">
                        {cartItems.map(p => (
                          <motion.span
                            key={p.id} layout
                            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/25 text-orange-200 text-xs px-3 py-1.5 rounded-full"
                          >
                            {p.name}
                            <button onClick={() => toggleBuy(p)} className="ml-0.5 hover:text-red-400 transition-colors">
                              <X size={11} />
                            </button>
                          </motion.span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-1 pt-2 border-t border-orange-500/10">
                        <span className="text-gray-500 text-xs">Ümumi: <span className="text-orange-400 font-bold">{cartTotal.toFixed(2)} ₼</span></span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={getAiRecs}
                            disabled={aiLoading}
                            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors"
                          >
                            <Sparkles size={12} /> AI Tövsiyə
                          </button>
                          <button
                            onClick={clearAll}
                            className="flex items-center gap-1.5 text-gray-500 hover:text-red-400 text-xs px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
                          >
                            <Trash2 size={12} /> Hamısını Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Məhsul axtar..."
            className="w-full bg-black/40 border border-orange-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <select
            value={sort} onChange={e => setSort(e.target.value)}
            className="bg-black/40 border border-orange-500/20 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-orange-500/50 transition-colors appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-all ${
              activeCat === cat
                ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                : 'border-orange-500/20 text-gray-400 hover:border-orange-500/40 hover:text-orange-300'
            }`}
          >
            {cat}
            {cat !== 'Hamısı' && (
              <span className="ml-1.5 opacity-60">
                {products.filter(p => p.category === cat).length}
              </span>
            )}
          </button>
        ))}
        {(search || activeCat !== 'Hamısı') && (
          <span className="text-xs text-gray-600 self-center ml-1">{filteredProducts.length} nəticə</span>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-orange-400" />
        </div>
      )}

      {aiErr && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-3 text-sm mb-5">{aiErr}</div>
      )}

      {/* ── Products grid ── */}
      {!loading && (
        filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Package size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Heç bir məhsul tapılmadı</p>
            <button onClick={() => { setSearch(''); setActiveCat('Hamısı'); }} className="mt-3 text-orange-400 text-xs hover:underline">
              Filtri sıfırla
            </button>
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {filteredProducts.map(p => {
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
                  <span className={`self-start text-xs px-2.5 py-1 rounded-full font-medium border ${catColor(p.category)}`}>
                    {p.category}
                  </span>
                  <h3 className="text-white font-bold text-base pr-8">{p.name}</h3>
                  <p className="text-gray-500 text-xs flex-1 line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1 text-orange-400 font-extrabold text-sm">
                      <Tag size={13} /> {p.sell_price.toFixed(2)} ₼
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.94 }} onClick={() => toggleBuy(p)}
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
        )
      )}

      {/* ── AI Banner (first purchase, no result yet) ── */}
      <AnimatePresence>
        {hasPurchases && !aiResult && !aiLoading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} className="mb-8"
          >
            <div className="bg-orange-500/8 border border-orange-500/25 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Bot size={22} className="text-orange-400 shrink-0" />
                <p className="text-gray-300 text-sm">
                  <span className="text-orange-300 font-semibold">{purchased.length} məhsul</span> seçdiniz —
                  AI fərdi tövsiyələr hazırlaya bilər.
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

      {/* ── AI Results ── */}
      <div ref={aiRef}>
        <AnimatePresence>
          {(aiLoading || aiResult) && (
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
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
    </div>
  );
}
