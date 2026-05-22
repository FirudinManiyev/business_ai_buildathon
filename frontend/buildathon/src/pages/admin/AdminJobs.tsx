import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Plus, Trash2, MapPin, DollarSign, Building, Loader2, CheckCircle, Eye, Mail, Phone, FileText, BadgeCheck, XCircle } from 'lucide-react';
import { actionHRApplication, createJob, deleteJob, getHRApplications, getJobs, updateJob, type ApplicationRecord, type Job } from '../../services/api';

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
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | number | null>(null);
  const [selectedJob, setSelectedJob] = useState<(Job | AdminJob) | null>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appError, setAppError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    getJobs()
      .then(setBackendJobs)
      .catch(() => {})
      .finally(() => setLoadingJobs(false));
  }, []);

  const allJobs = useMemo(() => backendJobs.map(j => ({ ...j, isAdmin: false })), [backendJobs]);

  async function loadApplicationsForJob(job: Job | AdminJob) {
    const jobId = Number(job.id);
    setSelectedJob(job);
    setSelectedJobId(job.id);
    setActionMsg('');
    setAppError('');
    if (Number.isNaN(jobId)) {
      setApplications([]);
      return;
    }
    setLoadingApps(true);
    try {
      const data = await getHRApplications(jobId);
      setApplications(data);
    } catch {
      setAppError('Müraciətlər yüklənmədi.');
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  }

  async function saveJob(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title,
      company_name: form.company_name,
      required_skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      experience_years: form.experience_years,
      salary_min: Number(form.salary_min) || 0,
      salary_max: Number(form.salary_max) || 0,
      location: form.location,
    };

    if (editingJobId) {
      const backendId = Number(editingJobId);
      if (!Number.isNaN(backendId)) {
        const updated = await updateJob(backendId, payload);
        setBackendJobs(prev => prev.map(b => b.id === backendId ? updated : b));
      }
      setForm(empty);
      setEditingJobId(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setActiveTab('list');
      return;
    }

    const created = await createJob(payload);
    setBackendJobs(prev => [created, ...prev]);
    setForm(empty);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setActiveTab('list');
  }

  async function deleteBackendJob(id: number) {
    await deleteJob(id);
    setBackendJobs(prev => prev.filter(b => b.id !== id));
    if (selectedJobId === id) {
      setSelectedJobId(null);
      setSelectedJob(null);
      setApplications([]);
    }
  }

  function handleDeleteJob(job: Job | AdminJob) {
    const name = job?.title || 'elan';
    const confirmed = window.confirm(`"${name}" elanını silmək istədiyinizə əminsiniz?`);
    if (!confirmed) return;
    deleteBackendJob((job as Job).id);
  }

  async function handleApplicationAction(applicationId: number, status: 'accepted' | 'rejected') {
    try {
      await actionHRApplication(applicationId, status, status === 'accepted' ? 'Müraciət təsdiqləndi.' : 'Müraciət rədd edildi.');
      setActionMsg(status === 'accepted' ? 'Müraciət təsdiqləndi.' : 'Müraciət rədd edildi.');
      if (selectedJob) {
        await loadApplicationsForJob(selectedJob);
      }
    } catch {
      setAppError('Müraciət yenilənmədi.');
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <Briefcase size={28} className="text-orange-400" /> İş Elanlarını İdarə Et
        </h1>
        <p className="text-gray-500 text-sm mt-1">Elanı seç, müraciətləri və CV-ləri gör, sonra qərar ver</p>
      </div>

      <div className="flex gap-1 bg-black/40 border border-orange-500/15 rounded-xl p-1 w-fit mb-8">
        {([['add', 'Yeni Elan'], ['list', `Bütün Elanlar (${allJobs.length})`]] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-orange-400'}`}
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
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="submit" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                  <Plus size={18} /> {editingJobId ? 'Elanı Yenilə' : 'Elan Yerləşdir'}
                </motion.button>
                <AnimatePresence>
                  {saved && (
                    <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
                      <CheckCircle size={16} /> Elan əlavə edildi!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === 'list' && (
          <motion.div key="list" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
            {loadingJobs ? (
              <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-orange-400" /></div>
            ) : (
              <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  {allJobs.map(job => (
                    <motion.div
                      key={`${'isAdmin' in job ? 'a' : 'b'}-${job.id}`}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => loadApplicationsForJob(job)}
                      className={`cursor-pointer bg-black/50 border rounded-2xl p-5 relative transition-colors ${selectedJobId === job.id ? 'border-orange-500/60' : 'border-orange-500/15 hover:border-orange-500/35'}`}
                    >
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        {'isAdmin' in job ? (
                          <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">Sizin</span>
                        ) : (
                          <span className="text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full">Backend</span>
                        )}
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteJob(job); }} className="text-gray-600 hover:text-red-400 transition-colors ml-2">
                          <Trash2 size={15} />
                        </button>
                        <button type="button" onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setForm({
                            title: job.title,
                            company_name: job.company_name,
                            skills: (job.required_skills || []).join(', '),
                            experience_years: job.experience_years || '',
                            salary_min: String(job.salary_min || ''),
                            salary_max: String(job.salary_max || ''),
                            location: job.location || '',
                          });
                          setEditingJobId(String(job.id));
                          setActiveTab('add');
                        }} className="text-gray-600 hover:text-green-400 transition-colors ml-2 text-sm px-2 py-1">
                          Redaktə
                        </button>
                      </div>

                      <div className="pr-28">
                        <h3 className="text-white font-bold text-base mb-1">{job.title}</h3>
                        <div className="flex items-center gap-1.5 text-orange-400 text-sm font-medium mb-3"><Building size={13} /> {job.company_name}</div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1"><MapPin size={11} /> {job.location}</span>
                          <span className="flex items-center gap-1"><DollarSign size={11} /> {job.salary_min}–{job.salary_max} ₼</span>
                          <span className="flex items-center gap-1"><Briefcase size={11} /> {job.experience_years}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(job.required_skills ?? []).slice(0, 5).map(s => (
                            <span key={s} className="text-xs bg-orange-500/10 text-orange-400/80 border border-orange-500/15 px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-black/50 border border-orange-500/15 rounded-2xl p-5 h-fit sticky top-6">
                  {selectedJob ? (
                    <>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-white font-bold text-lg">Müraciətlər</h3>
                          <p className="text-gray-400 text-sm">{selectedJob.title} · {selectedJob.company_name}</p>
                        </div>
                        <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-full flex items-center gap-1">
                          <Eye size={12} /> {applications.length} müraciət
                        </span>
                      </div>

                      {loadingApps && (
                        <div className="flex items-center justify-center py-10"><Loader2 size={24} className="animate-spin text-orange-400" /></div>
                      )}
                      {appError && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-3">{appError}</div>}
                      {actionMsg && <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-3">{actionMsg}</div>}

                      {!loadingApps && !appError && applications.length === 0 && (
                        <div className="text-sm text-gray-500 bg-white/5 border border-white/10 rounded-xl px-4 py-4">
                          Bu elan üçün müraciət yoxdur.
                        </div>
                      )}

                      <div className="flex flex-col gap-4">
                        {applications.map(app => (
                          <div key={app.id} className="bg-black/40 border border-orange-500/10 rounded-xl p-4">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div>
                                <p className="text-white font-semibold">{app.applicant_name}</p>
                                <p className="text-gray-400 text-xs flex items-center gap-2 mt-1"><Mail size={12} /> {app.applicant_email}</p>
                                {app.applicant_phone && <p className="text-gray-400 text-xs flex items-center gap-2 mt-1"><Phone size={12} /> {app.applicant_phone}</p>}
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full border ${app.status === 'accepted' ? 'bg-green-500/10 text-green-400 border-green-500/30' : app.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                {app.status}
                              </span>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-300">
                              <div className="bg-white/5 rounded-lg p-3">
                                <p className="text-gray-500 text-xs mb-1 flex items-center gap-1"><FileText size={12} /> Təhsil</p>
                                <p>{app.cv?.education || '-'}</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3">
                                <p className="text-gray-500 text-xs mb-1 flex items-center gap-1"><BadgeCheck size={12} /> Təcrübə</p>
                                <p>{app.cv?.experience_years || app.cv?.experience || '-'}</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3 sm:col-span-2">
                                <p className="text-gray-500 text-xs mb-1">Bacarıqlar</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {(app.cv?.skills || []).map((s: string) => <span key={s} className="text-xs bg-orange-500/10 text-orange-300 border border-orange-500/20 px-2 py-0.5 rounded-full">{s}</span>)}
                                </div>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3 sm:col-span-2">
                                <p className="text-gray-500 text-xs mb-1">Layihələr</p>
                                <p>{(app.cv?.projects || []).join(', ') || '-'}</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3 sm:col-span-2">
                                <p className="text-gray-500 text-xs mb-1">Dillər</p>
                                <p>{(app.cv?.languages || []).join(', ') || '-'}</p>
                              </div>
                            </div>

                            {app.admin_message && (
                              <div className="mt-3 text-sm text-gray-300 bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                <p className="text-gray-500 text-xs mb-1">Admin mesajı</p>
                                {app.admin_message}
                              </div>
                            )}

                            <div className="mt-3 flex flex-wrap gap-2">
                              <button type="button" onClick={() => handleApplicationAction(app.id, 'accepted')} className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors">
                                <BadgeCheck size={12} /> Accept
                              </button>
                              <button type="button" onClick={() => handleApplicationAction(app.id, 'rejected')} className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                                <XCircle size={12} /> Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Bir elan seçin. Seçdiyiniz elan üçün müraciət və CV detalları burada görünəcək.
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
