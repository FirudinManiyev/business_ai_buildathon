import { useState } from 'react';
import { TrendingUp, TrendingDown, Bot, Calculator, Loader2, AlertCircle, ArrowUp } from 'lucide-react';
import { analyzeFinance, type FinanceResult } from '../services/api';

export default function Finance() {
  const [whatif, setWhatif] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<FinanceResult | null>(null);

  const submit = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await analyzeFinance(whatif || undefined);
      setResult(data);
    } catch {
      setError('Backend ilə əlaqə qurulamadı. Backend-in işlədiyini yoxlayın.');
    } finally {
      setLoading(false);
    }
  };

  const totalProfit = result?.product_analysis?.reduce((s, p) => s + p.net_profit, 0) ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
          <Calculator className="text-orange-400" size={36} /> Maliyyə Analizi
        </h1>
        <p className="text-gray-400">Şirkətin məhsul gəlirliliyini AI ilə analiz et, tövsiyələr al.</p>
      </div>

      {/* Trigger form */}
      <div className="bg-black/50 backdrop-blur-md border border-orange-500/20 rounded-2xl p-6 mb-6 flex flex-col gap-4">
        <div>
          <label className="text-gray-400 text-sm mb-1 block">What-if ssenari (isteğe bağlı)</label>
          <input
            value={whatif}
            onChange={(e) => setWhatif(e.target.value)}
            placeholder="Məs: Əgər qiymətlər 20% artsa nə olar?"
            className="w-full bg-black/40 border border-orange-500/20 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
          />
        </div>
        <button onClick={submit} disabled={loading}
          className="self-start flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Calculator size={18} />}
          {loading ? 'AI analiz edir...' : 'Maliyyəni Analiz Et'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-300 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-6">
          {/* Summary card */}
          <div className={`rounded-2xl p-5 border flex items-center gap-4 ${totalProfit >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            {totalProfit >= 0
              ? <TrendingUp className="text-green-400 shrink-0" size={28} />
              : <TrendingDown className="text-red-400 shrink-0" size={28} />}
            <div>
              <p className="text-gray-400 text-sm">Ümumi Xalis Mənfəət (bütün məhsullar)</p>
              <p className={`text-3xl font-extrabold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} USD
              </p>
            </div>
          </div>

          {/* Product analysis */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Məhsul Analizi</h2>
            <div className="overflow-x-auto rounded-2xl border border-orange-500/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-orange-500/20 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-4 py-3">Məhsul</th>
                    <th className="text-right px-4 py-3">Maya</th>
                    <th className="text-right px-4 py-3">Satış</th>
                    <th className="text-right px-4 py-3">Mənfəət</th>
                    <th className="text-right px-4 py-3">Marja %</th>
                    <th className="text-right px-4 py-3">Markup %</th>
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
                <span className="text-gray-400">Hədəf maaş: <span className="text-white font-semibold">{result.salary_coverage.target_salary} USD</span></span>
                <span className="text-gray-400">Örtülən: <span className={`font-semibold ${result.salary_coverage.salary_coverage_pct >= 100 ? 'text-green-400' : 'text-orange-400'}`}>{result.salary_coverage.salary_coverage_pct?.toFixed(1)}%</span></span>
              </div>
              <p className="text-gray-300 text-sm">{result.salary_coverage.interpretation}</p>
            </div>
          )}

          {/* AI Recommendations */}
          {result.recommendations?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ArrowUp size={20} className="text-orange-400" /> AI Tövsiyələri
              </h2>
              <div className="flex flex-col gap-3">
                {result.recommendations.map((r, i) => (
                  <div key={i} className="bg-black/50 border border-orange-500/20 rounded-xl p-4 flex items-start gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full border shrink-0 mt-0.5 ${r.priority === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-400' : r.priority === 'medium' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-gray-500/10 border-gray-500/30 text-gray-400'}`}>
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
        </div>
      )}
    </div>
  );
}
