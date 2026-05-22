import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Bot, Calculator, Loader2,
  AlertCircle, Sparkles, BarChart3, X,
} from 'lucide-react';
import { analyzeFinance, postWhatIf, getFinanceSummary, type FinanceResult } from '../services/api';

// ── Mock fallback (backend olmadan) ──────────────────────────────────────────
const MOCK_RESULT: FinanceResult = {
  product_analysis: [
    { product_id: 1,  product_name: 'MacBook Pro 14"',        cost_price: 1200, sell_price: 1599, net_profit: 399,  profit_margin_pct: 24.9, markup_pct: 33.3, interpretation: 'Yüksək marja — premium məhsul' },
    { product_id: 2,  product_name: 'iPhone 15 Pro',           cost_price: 800,  sell_price: 1099, net_profit: 299,  profit_margin_pct: 27.2, markup_pct: 37.4, interpretation: 'Gəlirli məhsul, sabit tələbat' },
    { product_id: 3,  product_name: 'AirPods Pro 2',           cost_price: 150,  sell_price: 249,  net_profit: 99,   profit_margin_pct: 39.8, markup_pct: 66.0, interpretation: 'Ən yüksək marja — aksesuarlar' },
    { product_id: 6,  product_name: 'Monitor 27" 4K',          cost_price: 400,  sell_price: 649,  net_profit: 249,  profit_margin_pct: 38.4, markup_pct: 62.3, interpretation: 'Yaxşı gəlirli iş avadanlığı' },
    { product_id: 13, product_name: 'Python Proqramlaşdırma',  cost_price: 15,   sell_price: 35,   net_profit: 20,   profit_margin_pct: 57.1, markup_pct: 133,  interpretation: 'Rəqəmsal məhsul — çox yüksək marja' },
    { product_id: 17, product_name: 'Machine Learning A-Z',    cost_price: 25,   sell_price: 69,   net_profit: 44,   profit_margin_pct: 63.8, markup_pct: 176,  interpretation: 'Ən gəlirli kateqoriya: kurslar' },
    { product_id: 23, product_name: 'Ergonomik Ofis Kreslоsu', cost_price: 180,  sell_price: 299,  net_profit: 119,  profit_margin_pct: 39.8, markup_pct: 66.1, interpretation: 'Ofis avadanlığı — stabil gəlir' },
  ],
  salary_coverage: {
    target_salary: 3000,
    covered_by_net_profit: 4200,
    salary_coverage_pct: 140,
    interpretation: 'Cari xalis mənfəət hədəf maaşı 140% örtür. Maliyyə vəziyyəti sabitdir.',
  },
  recommendations: [
    { action: 'Kurs və rəqəmsal məhsulları genişləndirin',    reason: 'Ən yüksək marja (57–64%) kateqoriyasıdır, əlavə istehsal xərci yoxdur.',     priority: 'high'   },
    { action: 'Premium elektronika ehtiyatını artırın',       reason: 'MacBook, iPhone, AirPods 25–40% marja göstərir, tələbat sabitdir.',           priority: 'high'   },
    { action: 'Orta qiymətli ofis məhsulları tanıtın',        reason: 'Kreslo və masa məhsulları sabit 40% marja verir, rəqabət azdır.',             priority: 'medium' },
    { action: 'Çarpaz satış (cross-sell) strategiyası qurun', reason: 'Elektonika alan müştərilər kurslara da maraq göstərir.',                       priority: 'medium' },
    { action: 'Aşağı marja məhsulları üçün toplu alış razılaşması', reason: 'Maya xərcini 10-15% azaltmaq mümkündür.',                              priority: 'low'    },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtCurrency(v: number | null | undefined) {
  if (v == null) return '—';
  return Number(v).toLocaleString('az-AZ', { maximumFractionDigits: 2 }) + ' ₼';
}

const WF_SCENARIOS = [
  { value: 'hire',          label: 'İşçi Qəbulu' },
  { value: 'ad_spend',      label: 'Reklam Xərci' },
  { value: 'price_change',  label: 'Qiymət Dəyişikliyi (%)' },
  { value: 'volume_change', label: 'Satış Həcmi Dəyişikliyi' },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function Finance() {
  const [loading, setLoading]       = useState(false);
  const [wfLoading, setWfLoading]   = useState(false);
  const [error, setError]           = useState('');
  const [wfError, setWfError]       = useState('');
  const [result, setResult]         = useState<FinanceResult | null>(null);
  const [whatIfResult, setWhatIfResult] = useState<any | null>(null);
  const [summary, setSummary]       = useState<any | null>(null);
  const [fromBackend, setFromBackend] = useState(false);

  const [wfAction, setWfAction]         = useState('');
  const [wfCount, setWfCount]           = useState('');
  const [wfSalaryPerHire, setWfSalaryPerHire] = useState('');
  const [wfDelta, setWfDelta]           = useState('');
  const [wfRoi, setWfRoi]               = useState('');
  const [wfDeltaPct, setWfDeltaPct]     = useState('');
  const [wfDeltaUnits, setWfDeltaUnits] = useState('');

  useEffect(() => {
    getFinanceSummary()
      .then(s => { setSummary(s); setFromBackend(true); })
      .catch(() => {});
  }, []);

  async function runAnalysis() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await analyzeFinance();
      setResult(data);
      setFromBackend(true);
    } catch {
      setResult(MOCK_RESULT);
    } finally {
      setLoading(false);
    }
  }

  async function submitWhatIf() {
    if (!wfAction) { setWfError('Zəhmət olmasa ssenari seçin.'); return; }
    setWfLoading(true);
    setWfError('');
    setWhatIfResult(null);
    try {
      const base: any = { sales: 10000, other_costs: 5000 };
      const whatif: any = { action: wfAction };
      if (wfAction === 'hire')         { whatif.count = Number(wfCount || 0); whatif.salary_per_hire = Number(wfSalaryPerHire || 0); }
      else if (wfAction === 'ad_spend')     { whatif.delta = Number(wfDelta || 0); whatif.roi = Number(wfRoi || 0); }
      else if (wfAction === 'price_change') { whatif.delta_pct = Number(wfDeltaPct || 0); }
      else if (wfAction === 'volume_change'){ whatif.delta_units = Number(wfDeltaUnits || 0); }
      const data = await postWhatIf({ base, whatif });
      setWhatIfResult(data);
    } catch {
      setWfError('Ssenari sorğusu uğursuz oldu. Backend işləyirmi?');
    } finally {
      setWfLoading(false);
    }
  }

  const totalProfit = result?.product_analysis?.reduce((s, p) => s + p.net_profit, 0) ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
            <Calculator className="text-orange-400" size={34} /> Maliyyə Analizi
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Məhsul gəlirliliyini AI ilə analiz et, tövsiyələr al
            {fromBackend && <span className="ml-2 text-xs text-green-500">● Backend</span>}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={runAnalysis} disabled={loading}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-orange-500/20"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Maliyyə Analizini Başlat
        </motion.button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* ── Summary cards (backend) ── */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Ümumi Gəlir',       value: fmtCurrency(summary.total_revenue) },
            { label: 'Ümumi Xərc (COGS)', value: fmtCurrency(summary.cogs) },
            { label: 'Xalis Mənfəət',     value: fmtCurrency(summary.gross_profit) },
          ].map(c => (
            <div key={c.label} className="bg-black/50 border border-orange-500/20 rounded-2xl p-5">
              <div className="text-xs text-gray-500 mb-1">{c.label}</div>
              <div className="text-2xl font-bold text-white">{c.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── What-If Ssenari ── */}
      <div className="bg-black/50 backdrop-blur-md border border-orange-500/20 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-orange-400" /> «Nə olar əgər» Ssenari
        </h3>
        <div className="flex gap-3 flex-wrap items-end">
          <select
            value={wfAction} onChange={e => { setWfAction(e.target.value); setWhatIfResult(null); setWfError(''); }}
            className="bg-black/40 border border-orange-500/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
          >
            <option value="" disabled>Ssenari seçin...</option>
            {WF_SCENARIOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {wfAction === 'hire' && (
            <>
              <input type="number" min="0" value={wfCount} onChange={e => setWfCount(e.target.value)}
                placeholder="İşçi sayı" className="w-32 bg-black/40 border border-orange-500/20 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50" />
              <input type="number" min="0" value={wfSalaryPerHire} onChange={e => setWfSalaryPerHire(e.target.value)}
                placeholder="Maaş (₼)" className="w-36 bg-black/40 border border-orange-500/20 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50" />
            </>
          )}
          {wfAction === 'ad_spend' && (
            <>
              <input type="number" min="0" value={wfDelta} onChange={e => setWfDelta(e.target.value)}
                placeholder="Məbləğ (₼)" className="w-36 bg-black/40 border border-orange-500/20 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50" />
              <input type="number" min="0" step="0.01" value={wfRoi} onChange={e => setWfRoi(e.target.value)}
                placeholder="Gəlirlilik (ROI, məs: 0.5)" className="w-48 bg-black/40 border border-orange-500/20 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50" />
            </>
          )}
          {wfAction === 'price_change' && (
            <input type="number" step="0.01" value={wfDeltaPct} onChange={e => setWfDeltaPct(e.target.value)}
              placeholder="Dəyişiklik %" className="w-40 bg-black/40 border border-orange-500/20 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50" />
          )}
          {wfAction === 'volume_change' && (
            <input type="number" value={wfDeltaUnits} onChange={e => setWfDeltaUnits(e.target.value)}
              placeholder="Ədəd dəyişikliyi" className="w-44 bg-black/40 border border-orange-500/20 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50" />
          )}

          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={submitWhatIf} disabled={wfLoading || !wfAction}
            className="ml-auto flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            {wfLoading ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} />}
            Ssenarinə bax
          </motion.button>
        </div>

        {wfError && (
          <p className="mt-3 text-red-400 text-xs flex items-center gap-1.5">
            <AlertCircle size={13} /> {wfError}
          </p>
        )}

        <AnimatePresence>
          {whatIfResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-4 bg-black/40 border border-orange-500/15 rounded-xl p-4 text-sm space-y-2"
            >
              <div className="flex justify-between">
                <span className="text-gray-400 font-semibold text-xs uppercase tracking-widest">Nəticə</span>
                <button onClick={() => setWhatIfResult(null)} className="text-gray-600 hover:text-gray-400"><X size={14} /></button>
              </div>
              {whatIfResult.explanation && (
                <p className="text-gray-300 italic border-l-2 border-orange-500/40 pl-3">{whatIfResult.explanation}</p>
              )}
              <div className="grid sm:grid-cols-2 gap-2 mt-2">
                {whatIfResult.deltas?.profit != null && (
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-xs text-gray-500">Mənfəət dəyişikliyi</div>
                    <div className="text-white font-bold">{whatIfResult.deltas.profit} ({whatIfResult.deltas.profit_pct}%)</div>
                  </div>
                )}
                {whatIfResult.classification && (
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-xs text-gray-500">Qiymətləndirmə</div>
                    <div className="text-white font-bold">{whatIfResult.classification} — {whatIfResult.risk}</div>
                  </div>
                )}
              </div>
              {whatIfResult.recommendation && (
                <p className="text-orange-300 text-xs mt-1">💡 {whatIfResult.recommendation}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Analysis Results ── */}
      <AnimatePresence>
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-orange-400" />
            <span className="ml-3 text-gray-400">Maliyyə məlumatları analiz edilir...</span>
          </div>
        )}
      </AnimatePresence>

      {result && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6"
        >
          {/* Total profit banner */}
          <div className={`rounded-2xl p-5 border flex items-center gap-4 ${totalProfit >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            {totalProfit >= 0
              ? <TrendingUp className="text-green-400 shrink-0" size={28} />
              : <TrendingDown className="text-red-400 shrink-0" size={28} />}
            <div>
              <p className="text-gray-400 text-sm">Ümumi Xalis Mənfəət (bütün məhsullar)</p>
              <p className={`text-3xl font-extrabold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} ₼
              </p>
            </div>
          </div>

          {/* Product analysis table */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Məhsul Gəlirlilik Cədvəli</h2>
            <div className="overflow-x-auto rounded-2xl border border-orange-500/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-orange-500/20 text-gray-500 text-xs uppercase tracking-wide bg-black/30">
                    <th className="text-left px-4 py-3">Məhsul</th>
                    <th className="text-right px-4 py-3">Maya ₼</th>
                    <th className="text-right px-4 py-3">Satış ₼</th>
                    <th className="text-right px-4 py-3">Mənfəət</th>
                    <th className="text-right px-4 py-3">Marja %</th>
                    <th className="text-right px-4 py-3">Artım %</th>
                  </tr>
                </thead>
                <tbody>
                  {result.product_analysis?.map((p, i) => (
                    <tr key={i} className="border-b border-orange-500/10 hover:bg-orange-500/5 transition-colors">
                      <td className="px-4 py-3 text-white font-medium">
                        <div>{p.product_name}</div>
                        <div className="text-gray-500 text-xs font-normal mt-0.5">{p.interpretation}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">{p.cost_price}</td>
                      <td className="px-4 py-3 text-right text-gray-400">{p.sell_price}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${p.net_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {p.net_profit >= 0 ? '+' : ''}{p.net_profit}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${p.profit_margin_pct >= 20 ? 'text-green-400' : p.profit_margin_pct >= 0 ? 'text-orange-400' : 'text-red-400'}`}>
                        {p.profit_margin_pct?.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">{p.markup_pct?.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Salary coverage */}
          {result.salary_coverage && (
            <div className="bg-black/50 border border-orange-500/20 rounded-2xl p-5">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Bot size={20} className="text-orange-400" /> Maaş Örtüm Analizi
              </h2>
              <div className="flex flex-wrap gap-6 text-sm mb-3">
                <span className="text-gray-400">Hədəf maaş:
                  <span className="text-white font-semibold ml-1">{result.salary_coverage.target_salary} ₼</span>
                </span>
                <span className="text-gray-400">Örtülmə faizi:
                  <span className={`font-semibold ml-1 ${result.salary_coverage.salary_coverage_pct >= 100 ? 'text-green-400' : 'text-orange-400'}`}>
                    {result.salary_coverage.salary_coverage_pct?.toFixed(1)}%
                  </span>
                </span>
              </div>
              <p className="text-gray-300 text-sm">{result.salary_coverage.interpretation}</p>
            </div>
          )}

          {/* AI recommendations */}
          {result.recommendations?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-orange-400" /> AI Tövsiyələri
              </h2>
              <div className="flex flex-col gap-3">
                {result.recommendations.map((r, i) => (
                  <div key={i} className="bg-black/50 border border-orange-500/20 rounded-xl p-4 flex items-start gap-3 hover:border-orange-500/35 transition-colors">
                    <span className={`text-xs px-2 py-1 rounded-full border shrink-0 mt-0.5 font-medium ${
                      r.priority === 'high'   ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                      r.priority === 'medium' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                      'bg-gray-500/10 border-gray-500/30 text-gray-400'
                    }`}>
                      {r.priority === 'high' ? 'Yüksək' : r.priority === 'medium' ? 'Orta' : 'Aşağı'}
                    </span>
                    <div>
                      <p className="text-white font-semibold text-sm">{r.action}</p>
                      <p className="text-gray-400 text-xs mt-1">{r.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="text-center py-16 text-gray-600">
          <Calculator size={44} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm">Analizi başlatmaq üçün yuxarıdakı düyməni sıxın</p>
        </div>
      )}
    </div>
  );
}
