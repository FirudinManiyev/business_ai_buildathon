import { useState, useEffect } from 'react';
import { Briefcase, MapPin, Banknote, Bot, Loader2, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';
import { getJobs, analyzeCV, type Job, type HRResult } from '../services/api';

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsError, setJobsError] = useState('');

  // CV form state
  const [cvName, setCvName] = useState('');
  const [cvEducation, setCvEducation] = useState('');
  const [cvSkills, setCvSkills] = useState('');
  const [cvExp, setCvExp] = useState('');
  const [cvProjects, setCvProjects] = useState('');
  const [cvLanguages, setCvLanguages] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<HRResult | null>(null);

  useEffect(() => {
    getJobs().then(setJobs).catch(() => setJobsError('İş elanları yüklənmədi'));
  }, []);

  const submit = async () => {
    if (!cvName.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await analyzeCV({
        name: cvName.trim(),
        education: cvEducation || undefined,
        skills: cvSkills.split(',').map((s) => s.trim()).filter(Boolean),
        experience_years: cvExp || undefined,
        projects: cvProjects.split(',').map((s) => s.trim()).filter(Boolean),
        languages: cvLanguages.split(',').map((s) => s.trim()).filter(Boolean),
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
          <Briefcase className="text-orange-400" size={36} /> İş Elanları
        </h1>
        <p className="text-gray-400">Açıq vakansiyaları gör, CV-ni AI ilə analiz etdir.</p>
      </div>

      {/* Job listings */}
      {jobsError && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 text-red-300 text-sm">
          <AlertCircle size={16} /> {jobsError}
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {jobs.map((job) => (
          <div key={job.id} className="bg-black/50 backdrop-blur-md border border-orange-500/20 rounded-2xl p-5 flex flex-col gap-3 hover:border-orange-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Briefcase size={20} className="text-orange-400" />
            </div>
            <div>
              <h3 className="text-white font-bold">{job.title}</h3>
              <p className="text-orange-400 text-sm">{job.company_name}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>
              <span className="flex items-center gap-1"><Banknote size={11} />{job.salary_min}–{job.salary_max} USD</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {job.required_skills.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-300 text-xs">{s}</span>
              ))}
            </div>
            <span className="text-gray-500 text-xs">{job.experience_years} il təcrübə</span>
          </div>
        ))}
      </div>

      {/* CV Analysis form */}
      <div className="bg-black/50 backdrop-blur-md border border-orange-500/20 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Bot size={22} className="text-orange-400" /> CV Analizi
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Ad Soyad *', value: cvName, set: setCvName, placeholder: 'Əli Kərimov' },
            { label: 'Təhsil', value: cvEducation, set: setCvEducation, placeholder: 'Kompüter Mühəndisliyi' },
            { label: 'Bacarıqlar (vergüllə)', value: cvSkills, set: setCvSkills, placeholder: 'Python, SQL, Excel' },
            { label: 'Təcrübə (il)', value: cvExp, set: setCvExp, placeholder: '3' },
            { label: 'Layihələr (vergüllə)', value: cvProjects, set: setCvProjects, placeholder: 'KPI dashboard, CRM sistemi' },
            { label: 'Dillər (vergüllə)', value: cvLanguages, set: setCvLanguages, placeholder: 'Azərbaycan, İngilis' },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label}>
              <label className="text-gray-400 text-sm mb-1 block">{label}</label>
              <input
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-black/40 border border-orange-500/20 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
              />
            </div>
          ))}
        </div>
        <button onClick={submit} disabled={loading || !cvName.trim()}
          className="mt-5 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Bot size={18} />}
          {loading ? 'AI analiz edir...' : 'CV-ni Analiz Et'}
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
          {/* Job matches */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Vəzifə Uyğunluğu</h2>
            <div className="flex flex-col gap-3">
              {result.matches?.map((m, i) => (
                <div key={i} className="bg-black/50 border border-orange-500/20 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h3 className="text-white font-bold">{m.job_title}</h3>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full border ${m.match_score >= 70 ? 'bg-green-500/10 border-green-500/30 text-green-400' : m.match_score >= 40 ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                      {m.match_score}/100
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{m.reason}</p>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {m.matched_skills?.length > 0 && (
                      <div>
                        <span className="text-green-400 font-semibold mb-1 flex items-center gap-1"><CheckCircle size={12} /> Uyğun bacarıqlar</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {m.matched_skills.map((s) => <span key={s} className="px-2 py-0.5 rounded bg-green-500/10 text-green-300">{s}</span>)}
                        </div>
                      </div>
                    )}
                    {m.missing_skills?.length > 0 && (
                      <div>
                        <span className="text-red-400 font-semibold mb-1 flex items-center gap-1"><AlertCircle size={12} /> Çatışmayan bacarıqlar</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {m.missing_skills.map((s) => <span key={s} className="px-2 py-0.5 rounded bg-red-500/10 text-red-300">{s}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill gap products */}
          {result.skill_gap_products?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen size={20} className="text-orange-400" /> Tövsiyə olunan kurslar
              </h2>
              <div className="flex flex-wrap gap-3">
                {result.skill_gap_products.map((p, i) => (
                  <div key={i} className="bg-black/40 border border-orange-500/15 rounded-xl px-4 py-3 max-w-xs">
                    <span className="text-white text-sm font-semibold block mb-1">{p.product_name}</span>
                    <span className="text-gray-400 text-xs">{p.reason}</span>
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
