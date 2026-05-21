import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Plus, Trash2, MapPin, DollarSign, Building, Loader2, CheckCircle } from 'lucide-react';
import { getJobs, type Job } from '../../services/api';

const ADMIN_JOBS_KEY = 'bb_admin_jobs';

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

const empty = {
  title: '', company_name: '', skills: '',
  experience_years: '', salary_min: '', salary_max: '', location: '',
};

export default function AdminJobs() {
  const [form, setForm] = useState(empty);
  const [backendJobs, setBackendJobs] = useState<Job[]>([]);
  const [adminJobs, setAdminJobs] = useState<AdminJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  useEffect(() => {
    getJobs()
      .then(setBackendJobs)
      .catch(() => {})
      .finally(() => setLoadingJobs(false));
    const stored = localStorage.getItem(ADMIN_JOBS_KEY);
    if (stored) setAdminJobs(JSON.parse(stored));
  }, []);

  function saveJob(e: React.FormEvent) {
    e.preventDefault();
    const job: AdminJob = {
      id: `aj-${Date.now()}`,
      title: form.title,
      company_name: form.company_name,
      required_skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      experience_years: form.experience_years,
      salary_min: Number(form.salary_min) || 0,
      salary_max: Number(form.salary_max) || 0,
      location: form.location,
      isAdmin: true,
    };
    // If editing an existing job, update the corresponding list
    if (editingJobId) {
      // If it's an admin job id (starts with aj- or exists in adminJobs), update adminJobs
      const isAdminEdit = adminJobs.some(j => j.id === editingJobId);
      if (isAdminEdit) {
        const updated = adminJobs.map(j => j.id === editingJobId ? { ...j, title: job.title, company_name: job.company_name, required_skills: job.required_skills, experience_years: job.experience_years, salary_min: job.salary_min, salary_max: job.salary_max, location: job.location } : j);
        setAdminJobs(updated);
        localStorage.setItem(ADMIN_JOBS_KEY, JSON.stringify(updated));
        setForm(empty);
        setEditingJobId(null);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        setActiveTab('list');
        return;
      }

      // Otherwise attempt to update a backend/mock job locally
      const backendId = Number(editingJobId);
      if (!Number.isNaN(backendId)) {
        const updatedBackend = backendJobs.map(b => b.id === backendId ? { ...b, title: form.title, company_name: form.company_name, required_skills: form.skills.split(',').map(s => s.trim()).filter(Boolean), experience_years: form.experience_years, salary_min: Number(form.salary_min) || 0, salary_max: Number(form.salary_max) || 0, location: form.location } : b);
        setBackendJobs(updatedBackend);
        setForm(empty);
        setEditingJobId(null);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        setActiveTab('list');
        return;
      }
    }

    // Default: create new admin job
    const updated = [...adminJobs, job];
    setAdminJobs(updated);
    localStorage.setItem(ADMIN_JOBS_KEY, JSON.stringify(updated));
    setForm(empty);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setActiveTab('list');
  }

  function deleteJob(id: string) {
    const updated = adminJobs.filter(j => j.id !== id);
    setAdminJobs(updated);
    localStorage.setItem(ADMIN_JOBS_KEY, JSON.stringify(updated));
  }

  function deleteBackendJob(id: number) {
    const updated = backendJobs.filter(b => b.id !== id);
    setBackendJobs(updated);
  }

  function handleDeleteJob(job: any) {
    const name = job?.title || 'elan';
    const confirmed = window.confirm(`"${name}" elanını silmək istədiyinizə əminsiniz?`);
    if (!confirmed) return;
    if (job.isAdmin) {
      deleteJob((job as AdminJob).id);
    } else {
      deleteBackendJob((job as any).id);
    }
  }

  const allJobs = [...backendJobs.map(j => ({ ...j, isAdmin: false })), ...adminJobs];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <Briefcase size={28} className="text-orange-400" /> İş Elanlarını İdarə Et
        </h1>
        <p className="text-gray-500 text-sm mt-1">Yeni vakansiya əlavə edin, mövcud elanları idarə edin</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-black/40 border border-orange-500/15 rounded-xl p-1 w-fit mb-8">
        {([['add', 'Yeni Elan'], ['list', `Bütün Elanlar (${allJobs.length})`]] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-orange-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'add' && (
          <motion.div
            key="add"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.25 }}
          >
            <form onSubmit={saveJob} className="bg-black/50 border border-orange-500/20 rounded-2xl p-7 grid sm:grid-cols-2 gap-5 max-w-2xl">
              <h2 className="sm:col-span-2 text-white font-bold text-lg">{editingJobId ? 'Vakansiyanı Redaktə Et' : 'Yeni Vakansiya'}</h2>

              {[
                { label: 'Vəzifə adı *', key: 'title', placeholder: 'Məs: Senior React Developer', full: true },
                { label: 'Şirkət adı *', key: 'company_name', placeholder: 'Şirkət adı' },
                { label: 'Yer *', key: 'location', placeholder: 'Bakı, Remote...' },
                { label: 'Təcrübə *', key: 'experience_years', placeholder: 'Məs: 2-3 il' },
                { label: 'Min. Maaş (₼) *', key: 'salary_min', placeholder: '800' },
                { label: 'Max. Maaş (₼) *', key: 'salary_max', placeholder: '1500' },
                { label: 'Tələb olunan bacarıqlar (vergüllə) *', key: 'skills', placeholder: 'React, TypeScript, Node.js', full: true },
              ].map(({ label, key, placeholder, full }) => (
                <div key={key} className={full ? 'sm:col-span-2' : ''}>
                  <label className="text-gray-400 text-xs mb-1.5 block">{label}</label>
                  <input
                    required
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-white/5 border border-orange-500/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 text-sm transition-colors"
                  />
                </div>
              ))}

              <div className="sm:col-span-2 flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  <Plus size={18} /> {editingJobId ? 'Elanı Yenilə' : 'Elan Yerləşdir'}
                </motion.button>
                <AnimatePresence>
                  {saved && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-green-400 text-sm font-medium"
                    >
                      <CheckCircle size={16} /> Elan əlavə edildi!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            {loadingJobs ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin text-orange-400" />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {allJobs.map(job => (
                  <motion.div
                    key={`${job.isAdmin ? 'a' : 'b'}-${job.id}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/50 border border-orange-500/15 rounded-2xl p-5 relative hover:border-orange-500/35 transition-colors"
                  >
                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      {job.isAdmin ? (
                        <>
                          <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">Sizin</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteJob(job); }}
                            className="text-gray-600 hover:text-red-400 transition-colors ml-2"
                          >
                            <Trash2 size={15} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // populate form for editing
                              setForm({
                                title: job.title,
                                company_name: job.company_name,
                                skills: (job.required_skills || []).join(', '),
                                experience_years: job.experience_years || '',
                                salary_min: String(job.salary_min || ''),
                                salary_max: String(job.salary_max || ''),
                                location: job.location || '',
                              });
                              setEditingJobId((job as AdminJob).id);
                              setActiveTab('add');
                            }}
                            className="text-gray-600 hover:text-green-400 transition-colors ml-2 text-sm px-2 py-1"
                          >
                            Redaktə
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full">Backend</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // populate form for editing backend/mock job
                              setForm({
                                title: job.title,
                                company_name: job.company_name,
                                skills: (job.required_skills || []).join(', '),
                                experience_years: job.experience_years || '',
                                salary_min: String(job.salary_min || ''),
                                salary_max: String(job.salary_max || ''),
                                location: job.location || '',
                              });
                              setEditingJobId(String((job as any).id));
                              setActiveTab('add');
                            }}
                            className="text-gray-600 hover:text-green-400 transition-colors ml-2 text-sm px-2 py-1"
                          >
                            Redaktə
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteJob(job); }}
                            className="text-gray-600 hover:text-red-400 transition-colors ml-2"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>

                    <h3 className="text-white font-bold text-base pr-20 mb-1">{job.title}</h3>

                    <div className="flex items-center gap-1.5 text-orange-400 text-sm font-medium mb-3">
                      <Building size={13} /> {job.company_name}
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><MapPin size={11} /> {job.location}</span>
                      <span className="flex items-center gap-1"><DollarSign size={11} /> {job.salary_min}–{job.salary_max} ₼</span>
                      <span className="flex items-center gap-1"><Briefcase size={11} /> {job.experience_years}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {(job.required_skills ?? []).slice(0, 5).map(s => (
                        <span key={s} className="text-xs bg-orange-500/10 text-orange-400/80 border border-orange-500/15 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
