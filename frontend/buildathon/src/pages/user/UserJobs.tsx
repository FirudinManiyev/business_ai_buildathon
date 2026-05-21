import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, MapPin, DollarSign, ChevronDown, ChevronUp,
  Loader2, Sparkles, X, CheckCircle, AlertCircle, Users
} from 'lucide-react';
import { getJobs, analyzeCV, type Job, type HRResult, type CVProfile } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ADMIN_JOBS_KEY = 'bb_admin_jobs';

// ── Mock jobs ─────────────────────────────────────────────────────────────────
const MOCK_JOBS: Job[] = [
  { id: 1,  title: 'Frontend Developer',        company_name: 'TechAz MMC',         required_skills: ['React', 'TypeScript', 'CSS', 'HTML'],              experience_years: '1-2 il',  salary_min: 800,  salary_max: 1500, location: 'Bakı' },
  { id: 2,  title: 'Backend Developer',          company_name: 'DataSoft LLC',        required_skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],        experience_years: '2-3 il',  salary_min: 1000, salary_max: 2000, location: 'Bakı / Remote' },
  { id: 3,  title: 'Full Stack Developer',       company_name: 'StartupHub AZ',       required_skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],        experience_years: '2-4 il',  salary_min: 1200, salary_max: 2500, location: 'Remote' },
  { id: 4,  title: 'Data Scientist',             company_name: 'Analytics Pro',       required_skills: ['Python', 'Machine Learning', 'SQL', 'Pandas'],       experience_years: '1-3 il',  salary_min: 1500, salary_max: 3000, location: 'Bakı' },
  { id: 5,  title: 'DevOps Engineer',            company_name: 'CloudBase AZ',        required_skills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux'],           experience_years: '2-4 il',  salary_min: 1200, salary_max: 2800, location: 'Bakı / Hybrid' },
  { id: 6,  title: 'UI/UX Designer',             company_name: 'Creative Studio',     required_skills: ['Figma', 'Adobe XD', 'CSS', 'Prototyping'],           experience_years: '1-2 il',  salary_min: 700,  salary_max: 1400, location: 'Bakı' },
  { id: 7,  title: 'Mobile Developer (React Native)', company_name: 'AppFactory',    required_skills: ['React Native', 'TypeScript', 'Redux', 'iOS/Android'], experience_years: '2-3 il',  salary_min: 1000, salary_max: 2200, location: 'Remote' },
  { id: 8,  title: 'QA Engineer',                company_name: 'Quality First MMC',   required_skills: ['Selenium', 'Jest', 'Postman', 'SQL'],               experience_years: '1-2 il',  salary_min: 600,  salary_max: 1200, location: 'Bakı' },
];

// ── Local skill-matching AI (backend olmadan) ─────────────────────────────────
function localMatchCV(jobs: Job[], cvSkills: string[]): HRResult {
  const lowerSkills = cvSkills.map(s => s.toLowerCase().trim());

  const matches = jobs
    .map(job => {
      const matched  = job.required_skills.filter(s => lowerSkills.includes(s.toLowerCase()));
      const missing  = job.required_skills.filter(s => !lowerSkills.includes(s.toLowerCase()));
      const score    = job.required_skills.length > 0 ? Math.round((matched.length / job.required_skills.length) * 100) : 0;
      return {
        job_id:         job.id,
        job_title:      job.title,
        match_score:    score,
        matched_skills: matched,
        missing_skills: missing,
        reason:         score >= 70
          ? `Güclü uyğunluq — ${matched.length} bacarıq üst-üstə düşür`
          : score >= 40
            ? `Orta uyğunluq — ${missing.length} bacarıq inkişaf etdirilə bilər`
            : `Zəif uyğunluq — əsas bacarıqlar çatışmır`,
      };
    })
    .sort((a, b) => b.match_score - a.match_score);

  const allMissing = [...new Set(matches.flatMap(m => m.missing_skills))];
  const topMissing = allMissing.slice(0, 4);

  return {
    matches,
    skill_gap_products: topMissing.map((s, i) => ({
      product_id:   i + 1,
      product_name: `${s} Kursu`,
      reason:       `${s} bacarığını inkişaf etdirmək üçün`,
    })),
    finance_signal: {
      level:           matches[0]?.match_score >= 70 ? 'high' : 'medium',
      reason:          matches[0]?.match_score >= 70 ? 'Yüksək tələbat olan bacarıqlarınız var' : 'Bacarıqlarınızı inkişaf etdirin',
      salary_pressure: matches[0]?.match_score >= 70 ? 'Yüksək maaş potensialı' : 'Orta maaş gözlənilir',
    },
  };
}

interface AdminJob {
  id: string;
  title: string;
  company_name: string;
  required_skills: string[];
  experience_years: string;
  salary_min: number;
  salary_max: number;
  location: string;
  isAdmin: true;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function UserJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<(Job | AdminJob)[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr] = useState('');
  const [cvOpen, setCvOpen] = useState(false);
  const [cv, setCv] = useState<CVProfile>({
    name: user?.name ?? '',
    education: '',
    skills: [],
    experience_years: '',
    projects: [],
    languages: [],
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [projectsInput, setProjectsInput] = useState('');
  const [langsInput, setLangsInput] = useState('');
  const [result, setResult] = useState<HRResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeErr, setAnalyzeErr] = useState('');

  useEffect(() => {
    const adminJobs: AdminJob[] = JSON.parse(localStorage.getItem(ADMIN_JOBS_KEY) || '[]');
    getJobs()
      .then(backendJobs => setJobs([...backendJobs, ...adminJobs]))
      .catch(() => setJobs([...MOCK_JOBS, ...adminJobs]))  // mock fallback
      .finally(() => setLoading(false));
  }, []);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setAnalyzing(true);
    setAnalyzeErr('');
    setResult(null);
    const skills   = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    const projects = projectsInput.split(',').map(s => s.trim()).filter(Boolean);
    const languages = langsInput.split(',').map(s => s.trim()).filter(Boolean);
    try {
      const res = await analyzeCV({ ...cv, skills, projects, languages });
      setResult(res);
    } catch {
      // Backend yoxdursa local skill-matching
      const backendJobs = jobs.filter(j => !('isAdmin' in j)) as Job[];
      const allJobs = backendJobs.length > 0 ? backendJobs : MOCK_JOBS;
      setResult(localMatchCV(allJobs, skills));
    } finally {
      setAnalyzing(false);
      setCvOpen(false);
    }
  }

  function getMatchScore(jobId: number | string): number | null {
    if (!result) return null;
    const m = result.matches.find(m => m.job_id === Number(jobId));
    return m?.match_score ?? null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Briefcase size={28} className="text-orange-400" /> İş Elanları
          </h1>
          <p className="text-gray-500 text-sm mt-1">CV-ni daxil et, AI uyğunluğunu hesablasın</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setCvOpen(v => !v)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Users size={16} /> CV Daxil Et {cvOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </motion.button>
      </div>

      {/* CV Form */}
      <AnimatePresence>
        {cvOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-8"
          >
            <form onSubmit={handleAnalyze} className="bg-black/50 border border-orange-500/20 rounded-2xl p-6 grid sm:grid-cols-2 gap-4">
              <h2 className="sm:col-span-2 text-white font-bold text-lg mb-1">CV Məlumatları</h2>

              {[
                { label: 'Ad Soyad', key: 'name', placeholder: 'Adınız Soyadınız' },
                { label: 'Təhsil', key: 'education', placeholder: 'Məs: Bakı Dövlət Universiteti, Kompüter Elmləri' },
                { label: 'Təcrübə', key: 'experience_years', placeholder: 'Məs: 2 il' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-gray-400 text-xs mb-1 block">{label}</label>
                  <input
                    value={(cv as any)[key]}
                    onChange={e => setCv(c => ({ ...c, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-white/5 border border-orange-500/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 text-sm transition-colors"
                  />
                </div>
              ))}

              {[
                { label: 'Bacarıqlar (vergüllə)', val: skillsInput, set: setSkillsInput, placeholder: 'Python, React, SQL...' },
                { label: 'Layihələr (vergüllə)', val: projectsInput, set: setProjectsInput, placeholder: 'E-commerce sayt, API...' },
                { label: 'Dillər (vergüllə)', val: langsInput, set: setLangsInput, placeholder: 'Azərbaycan, İngilis, Rus' },
              ].map(({ label, val, set, placeholder }) => (
                <div key={label}>
                  <label className="text-gray-400 text-xs mb-1 block">{label}</label>
                  <input
                    value={val}
                    onChange={e => set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-white/5 border border-orange-500/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 text-sm transition-colors"
                  />
                </div>
              ))}

              {analyzeErr && (
                <div className="sm:col-span-2 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle size={15} /> {analyzeErr}
                </div>
              )}

              <div className="sm:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setCvOpen(false)} className="text-gray-500 hover:text-gray-300 text-sm px-4 py-2 transition-colors">
                  Bağla
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  type="submit" disabled={analyzing}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  {analyzing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  {analyzing ? 'Analiz edilir...' : 'AI Analiz Et'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI analysis summary removed — results shown inline on job cards only */}

      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-orange-400" />
        </div>
      )}
      {fetchErr && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-4 text-sm">{fetchErr}</div>
      )}

      {/* Job listings */}
      {!loading && !fetchErr && (
        <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 gap-5">
          {jobs.map(job => {
            const score = getMatchScore(job.id);
            return (
              <motion.div
                key={`${('isAdmin' in job) ? 'a' : 'b'}-${job.id}`}
                variants={item}
                whileHover={{ y: -4 }}
                className={`relative bg-black/50 backdrop-blur-md border rounded-2xl p-5 flex flex-col gap-3 transition-colors ${
                  score !== null
                    ? score >= 70 ? 'border-green-500/40' : score >= 40 ? 'border-yellow-500/40' : 'border-orange-500/20'
                    : 'border-orange-500/15 hover:border-orange-500/35'
                }`}
              >
                {/* Admin badge */}
                {'isAdmin' in job && (
                  <span className="absolute top-3 right-3 text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">Admin</span>
                )}
                {/* Match score */}
                {score !== null && (
                  <span className={`absolute top-3 ${('isAdmin' in job) ? 'right-16' : 'right-3'} text-xs font-bold px-2 py-0.5 rounded-full ${
                    score >= 70 ? 'bg-green-500/20 text-green-400' : score >= 40 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {score}% uyğun
                  </span>
                )}

                <h3 className="text-white font-bold text-base pr-16">{job.title}</h3>
                <p className="text-gray-400 text-sm font-medium">{job.company_name}</p>

                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                  <span className="flex items-center gap-1"><DollarSign size={12} /> {job.salary_min}–{job.salary_max} ₼</span>
                  <span className="flex items-center gap-1"><Briefcase size={12} /> {job.experience_years}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-1">
                  {job.required_skills.slice(0, 5).map(s => (
                    <span key={s} className={`text-xs px-2.5 py-1 rounded-full border ${
                      result?.matches.find(m => m.matched_skills.includes(s))
                        ? 'bg-green-500/15 text-green-400 border-green-500/30'
                        : 'bg-orange-500/10 text-orange-400/80 border-orange-500/15'
                    }`}>
                      {result?.matches.find(m => m.matched_skills.includes(s)) && (
                        <CheckCircle size={10} className="inline mr-1" />
                      )}
                      {s}
                    </span>
                  ))}
                  {job.required_skills.length > 5 && (
                    <span className="text-xs text-gray-600">+{job.required_skills.length - 5}</span>
                  )}
                </div>

                {/* Match detail */}
                {result?.matches.find(m => m.job_id === Number(job.id))?.reason && (
                  <p className="text-gray-500 text-xs italic border-t border-orange-500/10 pt-2 mt-1">
                    {result.matches.find(m => m.job_id === Number(job.id))?.reason}
                  </p>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
