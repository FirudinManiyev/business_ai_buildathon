import { useState } from 'react';
import { Sparkles, ShoppingCart, Star } from 'lucide-react';

const CATEGORIES = ['Elektronika', 'Geyim', 'Ərzaq', 'İdman', 'Ev əşyaları', 'Kosmetika'];

const PRODUCTS: Record<string, { name: string; price: string; rating: number; reason: string }[]> = {
  Elektronika: [
    { name: 'Simsiz Qulaqlıq', price: '129 AZN', rating: 4.8, reason: 'Elektronika alıcıları tez-tez seçir' },
    { name: 'Smartfon Şarj Aleti', price: '35 AZN', rating: 4.6, reason: 'Yüksək tələbat, sürətli satış' },
    { name: 'USB-C Hub', price: '55 AZN', rating: 4.5, reason: 'Laptop istifadəçiləri üçün ideal' },
  ],
  Geyim: [
    { name: 'Oversize Köynək', price: '45 AZN', rating: 4.7, reason: 'Bu mövsümün ən çox satılanı' },
    { name: 'Krossovka', price: '120 AZN', rating: 4.9, reason: 'Yüksək reytinqli məhsul' },
    { name: 'Kepka', price: '25 AZN', rating: 4.4, reason: 'Geyim sevənlər üçün tamamlayıcı' },
  ],
  Ərzaq: [
    { name: 'Üzvi Bal (500q)', price: '18 AZN', rating: 4.9, reason: 'Ən çox satılan ərzaq məhsulu' },
    { name: 'Quru Meyvə Dəsti', price: '22 AZN', rating: 4.7, reason: 'Sağlıqlı həyat seçimi' },
    { name: 'Zeytun Yağı', price: '30 AZN', rating: 4.8, reason: 'Premium keyfiyyət, daim tələb' },
  ],
  İdman: [
    { name: 'Rezin Kəmər', price: '40 AZN', rating: 4.6, reason: 'Ev idmanı üçün əsas vasitə' },
    { name: 'İdman Çantası', price: '65 AZN', rating: 4.5, reason: 'İdmançılar tərəfindən sevilir' },
    { name: 'Su Şüşəsi (1L)', price: '20 AZN', rating: 4.7, reason: 'Hər idmançıya lazım' },
  ],
  'Ev əşyaları': [
    { name: 'Dekorativ Yastıq', price: '35 AZN', rating: 4.5, reason: 'Ev dekorunu tamamlayır' },
    { name: 'Aromaterapi Şam', price: '28 AZN', rating: 4.8, reason: 'Çox alınan hədiyyəlik məhsul' },
    { name: 'Rəf Sistemi', price: '75 AZN', rating: 4.6, reason: 'Ev təşkilatı üçün ideal' },
  ],
  Kosmetika: [
    { name: 'Üz Kremi SPF50', price: '55 AZN', rating: 4.9, reason: 'Dermatologlar tövsiyə edir' },
    { name: 'Saç Maskası', price: '40 AZN', rating: 4.7, reason: 'Ən çok satılan saç məhsulu' },
    { name: 'Serum (Vitamin C)', price: '70 AZN', rating: 4.8, reason: 'Premium seqment lideri' },
  ],
};

export default function Recommendations() {
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<typeof PRODUCTS[string]>([]);
  const [asked, setAsked] = useState(false);

  const toggle = (cat: string) =>
    setSelected((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));

  const generate = () => {
    const all = selected.flatMap((cat) => PRODUCTS[cat] ?? []);
    setResults(all.sort(() => Math.random() - 0.5).slice(0, 6));
    setAsked(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
          <Sparkles className="text-orange-400" size={36} /> AI Tövsiyələri
        </h1>
        <p className="text-gray-400">Maraqlarınızı seçin, AI sizin üçün ən uyğun məhsulları tövsiyə etsin.</p>
      </div>

      {/* Category selector */}
      <div className="bg-black/50 backdrop-blur-md border border-orange-500/20 rounded-2xl p-6 mb-8">
        <p className="text-white font-semibold mb-4">Hansı kateqoriyalar sizi maraqlandırır?</p>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => toggle(cat)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                selected.includes(cat)
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'border-orange-500/30 text-gray-400 hover:border-orange-500/60 hover:text-orange-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          onClick={generate}
          disabled={selected.length === 0}
          className="mt-6 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          <Sparkles size={18} /> Tövsiyə Al
        </button>
      </div>

      {/* Results */}
      {asked && results.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Sizin üçün tövsiyə edilən məhsullar</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {results.map((p, i) => (
              <div
                key={i}
                className="bg-black/50 backdrop-blur-md border border-orange-500/20 rounded-2xl p-5 flex flex-col gap-3 hover:border-orange-500/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <ShoppingCart size={20} className="text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">{p.name}</h3>
                  <p className="text-orange-400 font-semibold text-sm">{p.price}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-orange-400 fill-orange-400" />
                  <span className="text-gray-400 text-xs">{p.rating}</span>
                </div>
                <p className="text-gray-500 text-xs italic">"{p.reason}"</p>
                <button className="mt-auto w-full py-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-medium hover:bg-orange-500/20 transition-colors">
                  Səbətə Əlavə Et
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
