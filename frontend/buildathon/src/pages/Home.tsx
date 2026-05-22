import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Briefcase, ArrowRight, Bot, Cpu,
  CheckCircle, Users, BarChart2, Zap, ShieldCheck, Package,
  Calculator, Info, Star, Code2, Layers,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// ── Animation variants ────────────────────────────────────────────────────────
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.11 } } };
const fadeUp  = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.44, ease: 'easeOut' as const } } };

// ── Data ──────────────────────────────────────────────────────────────────────
const USER_FEATURES = [
  {
    icon: <Package size={28} className="text-orange-400" />,
    badge: 'Satış AI',
    title: 'Ağıllı Məhsul Kataloqu',
    desc: '30+ məhsul arasında kateqoriya filteri, axtarış. Seçdiklərin əsasında AI fərdi tövsiyə verir — tam personalizasiya.',
    to: '/products',
    btn: 'Məhsullara Bax',
    grad: 'from-orange-500/15 via-transparent to-transparent',
    border: 'group-hover:border-orange-500/50',
  },
  {
    icon: <Briefcase size={28} className="text-sky-400" />,
    badge: 'HR AI',
    title: 'İş Elanları & CV Analizi',
    desc: '22+ aktiv vakansiya. CV-ni doldur, AI hər elan üçün uyğunluq skoru hesabla, çatışmayan bacarıqları göstərir.',
    to: '/jobs',
    btn: 'Elanları Kəşf Et',
    grad: 'from-sky-500/15 via-transparent to-transparent',
    border: 'group-hover:border-sky-500/40',
  },
];

const ADMIN_FEATURES = [
  {
    icon: <Briefcase size={28} className="text-purple-400" />,
    badge: 'Admin Panel',
    title: 'Elan İdarəsi',
    desc: 'İş elanlarını əlavə et, redaktə et, sil. Müraciətlərə bax, qəbul/rədd et, şərh yaz.',
    to: '/admin/jobs',
    btn: 'İdarə Et',
    grad: 'from-purple-500/15 via-transparent to-transparent',
    border: 'group-hover:border-purple-500/40',
  },
  {
    icon: <Calculator size={28} className="text-green-400" />,
    badge: 'Maliyyə AI',
    title: 'Maliyyə Analizi',
    desc: 'Məhsul gəlirliliyini cədvəldə gör. «Nə olar əgər» ssenarisi ilə müxtəlif biznes qərarlarını simulyasiya et.',
    to: '/finance',
    btn: 'Analiz Et',
    grad: 'from-green-500/15 via-transparent to-transparent',
    border: 'group-hover:border-green-500/40',
  },
];

const STATS = [
  { icon: <Bot size={22} className="text-orange-400" />,  value: '3',         label: 'AI Agent',    sub: 'Satış · HR · Maliyyə' },
  { icon: <Package size={22} className="text-sky-400" />, value: '30+',       label: 'Məhsul',      sub: 'Filterlənə bilən kataloq' },
  { icon: <Briefcase size={22} className="text-purple-400" />, value: '22+',  label: 'Vakansiya',   sub: 'Aktiv iş elanı' },
  { icon: <Zap size={22} className="text-yellow-400" />,  value: 'Groq',      label: 'LLaMA 3.3',   sub: 'Real-time analiz' },
];

const STEPS = [
  { icon: <Users size={26} className="text-orange-400" />,    step: '01', title: 'Qeydiyyat / Giriş', desc: 'E-poçt və şifrə ilə qeydiyyat keç. İstər normal istifadəçi, istərsə admin kimi daxil ol.' },
  { icon: <Cpu size={26} className="text-orange-400" />,      step: '02', title: 'Funksiyaları Seç',  desc: 'Məhsul al, CV göndər, maliyyəni analiz et — hər hərəkətin əsasında AI işə düşür.' },
  { icon: <CheckCircle size={26} className="text-orange-400" />, step: '03', title: 'Nəticəni Al', desc: 'Fərdi tövsiyələr, uyğunluq skorları, maliyyə hesabatı — hamısı Azərbaycan dilində.' },
];

const TECH = ['Python 3.12', 'FastAPI', 'Groq LLaMA 3.3', 'React 19', 'TypeScript', 'Tailwind CSS 4', 'Framer Motion', 'Vite'];

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isUser  = user?.role === 'user';

  const heroCTA = isAdmin
    ? [{ to: '/admin/jobs', label: 'Elan İdarəsi', primary: true }, { to: '/finance', label: 'Maliyyə Analizi', primary: false }]
    : isUser
    ? [{ to: '/products',  label: 'Məhsullara Bax', primary: true }, { to: '/jobs', label: 'İş Elanları', primary: false }]
    : [{ to: '/register',  label: 'Pulsuz Başla', primary: true }, { to: '/about', label: 'Haqqında Öyrən', primary: false }];

  const featureCards = isAdmin ? ADMIN_FEATURES : USER_FEATURES;

  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-24 pb-20 gap-7 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 bg-orange-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-sm font-medium"
        >
          <Star size={13} className="fill-orange-400 text-orange-400" />
          AI ilə Gücləndirilmiş Ticarət Platformu
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight max-w-3xl"
        >
          Ticarəti{' '}
          <span className="relative inline-block">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 via-orange-500 to-amber-400">
              SuperTraders
            </span>
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-linear-to-r from-orange-400 to-amber-400 rounded-full opacity-60" />
          </span>
          {' '}ilə Gücləndirin
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-400 text-lg max-w-2xl leading-relaxed"
        >
          Satış tövsiyəsi, CV analizi, maliyyə hesabatı — üç güclü AI agenti bir platformada.
          Groq LLaMA 3.3 ilə real vaxtda ağıllı qərarlar qəbul edin.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex gap-3 flex-wrap justify-center"
        >
          {heroCTA.map(({ to, label, primary }) => (
            <motion.div key={to} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                to={to}
                className={`flex items-center gap-2 font-semibold px-7 py-3 rounded-xl transition-colors text-sm ${
                  primary
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25'
                    : 'border border-orange-500/40 text-orange-400 hover:bg-orange-500/10'
                }`}
              >
                {label} {primary && <ArrowRight size={16} />}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Tech stack badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mt-2"
        >
          {TECH.map(t => (
            <span key={t} className="px-3 py-1 text-xs rounded-full bg-white/5 border border-white/10 text-gray-500 font-mono">
              {t}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="max-w-6xl mx-auto px-4 pb-16 w-full">
        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {STATS.map(({ icon, value, label, sub }) => (
            <motion.div key={label} variants={fadeUp} whileHover={{ y: -5, scale: 1.02 }}
              className="bg-black/50 backdrop-blur-md border border-orange-500/15 rounded-2xl p-5 flex flex-col gap-2 hover:border-orange-500/35 transition-all cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-1">{icon}</div>
              <span className="text-white text-2xl font-extrabold">{value}</span>
              <span className="text-white text-sm font-semibold">{label}</span>
              <span className="text-gray-500 text-xs">{sub}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Feature cards (role-aware) ── */}
      <section className="max-w-6xl mx-auto px-4 pb-20 w-full">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">Funksiyalar</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2 mb-3">
            {isAdmin ? 'Admin Paneli' : 'Nə edə bilərsiniz?'}
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm">
            {isAdmin
              ? 'İş elanlarını idarə edin, maliyyə analizini izləyin.'
              : 'Məhsul seçin, AI tövsiyəsi alın. CV-ni analiz etdirin, uyğun vakansiyaları tapın.'}
          </p>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }}
          className="grid md:grid-cols-2 gap-6"
        >
          {featureCards.map(({ icon, badge, title, desc, to, btn, grad, border }) => (
            <motion.div key={title} variants={fadeUp} whileHover={{ y: -6, scale: 1.012 }}
              className={`group relative bg-black/50 backdrop-blur-md border border-orange-500/20 rounded-2xl p-7 flex flex-col gap-5 transition-all overflow-hidden ${border}`}
            >
              <div className={`absolute inset-0 bg-linear-to-br ${grad} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative flex items-start justify-between">
                <div className="w-14 h-14 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors flex items-center justify-center">
                  {icon}
                </div>
                <span className="px-2.5 py-1 text-xs rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-semibold">{badge}</span>
              </div>
              <div className="relative">
                <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
              <motion.div whileHover={{ x: 5 }} className="relative mt-auto">
                <Link to={to} className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-semibold text-sm transition-colors">
                  {btn} <ArrowRight size={15} />
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Show both sections for logged-in users */}
        {isUser && (
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-6 bg-black/30 border border-orange-500/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4"
          >
            <Sparkles size={22} className="text-orange-400 shrink-0" />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-white font-semibold text-sm">AI Tövsiyə sistemi haqqında daha çox öyrənin</p>
              <p className="text-gray-500 text-xs mt-0.5">Platformanın bütün imkanlarını kəşf edin</p>
            </div>
            <Link to="/about" className="shrink-0 flex items-center gap-2 border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              <Info size={14} /> Haqqında
            </Link>
          </motion.div>
        )}
      </section>

      {/* ── How it works ── */}
      <section className="max-w-6xl mx-auto px-4 pb-20 w-full">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">Proses</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">3 Addımda Nəticə</h2>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }}
          className="grid md:grid-cols-3 gap-6 relative"
        >
          <div className="hidden md:block absolute top-10 left-[calc(33%+2rem)] right-[calc(33%+2rem)] h-px bg-linear-to-r from-transparent via-orange-500/30 to-transparent z-0" />
          {STEPS.map(({ icon, step, title, desc }) => (
            <motion.div key={step} variants={fadeUp} whileHover={{ y: -5 }}
              className="relative bg-black/50 backdrop-blur-md border border-orange-500/15 rounded-2xl p-6 flex flex-col gap-4 hover:border-orange-500/40 transition-all z-10"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">{icon}</div>
                <span className="text-5xl font-extrabold text-orange-500/10 select-none leading-none">{step}</span>
              </div>
              <h3 className="text-white font-bold text-lg">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Architecture overview ── */}
      <section className="max-w-6xl mx-auto px-4 pb-20 w-full">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="bg-black/50 backdrop-blur-md border border-orange-500/20 rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">Arxitektura</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-2">AI Pipeline</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: <Package size={22} className="text-orange-400" />, label: 'Satış AI Agent', tech: 'Məhsul analizi + müştəri profili → fərdi tövsiyə', color: 'border-orange-500/30' },
              { icon: <Briefcase size={22} className="text-sky-400" />,  label: 'HR AI Agent',   tech: 'CV analizi + iş tələbləri → uyğunluq skoru + bacarıq boşluğu', color: 'border-sky-500/30' },
              { icon: <BarChart2 size={22} className="text-green-400" />, label: 'Maliyyə AI Agent', tech: 'Məhsul gəlirliliyi + «nə olar əgər» ssenarisi → biznes tövsiyəsi', color: 'border-green-500/30' },
            ].map(a => (
              <div key={a.label} className={`bg-black/40 border ${a.color} rounded-xl p-5`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">{a.icon}</div>
                  <span className="text-white font-semibold text-sm">{a.label}</span>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">{a.tech}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-center gap-3 text-gray-600 text-xs">
            <Code2 size={14} /> <span>FastAPI backend</span>
            <span>·</span>
            <Layers size={14} /> <span>Groq LLaMA 3.3-70b</span>
            <span>·</span>
            <ShieldCheck size={14} /> <span>Frontend RBAC</span>
          </div>
        </motion.div>
      </section>

      {/* ── Bottom CTA ── */}
      {!user && (
        <section className="max-w-6xl mx-auto px-4 pb-24 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="relative bg-linear-to-br from-orange-500/15 via-black/60 to-black/80 border border-orange-500/30 rounded-3xl p-10 text-center overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-orange-500/8 rounded-full blur-3xl" />
            </div>
            <Bot size={40} className="text-orange-400 mx-auto mb-4 relative" />
            <h2 className="text-3xl font-extrabold text-white mb-3 relative">Hər şey pulsuz</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-7 text-sm leading-relaxed relative">
              Qeydiyyat keç, məhsulları kəşf et, AI ilə CV-ni analiz etdir, maliyyəni idarə et. Heç bir ödəniş yoxdur.
            </p>
            <div className="flex gap-3 justify-center flex-wrap relative">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link to="/register" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-orange-500/25 text-sm">
                  İndi Başla <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link to="/about" className="flex items-center gap-2 border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 font-semibold px-8 py-3 rounded-xl transition-colors text-sm">
                  <Info size={15} /> Ətraflı Məlumat
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
}
