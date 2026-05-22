import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, Package, Briefcase, Calculator, Bot, Code2,
  Users, ShieldCheck, ArrowRight, CheckCircle, Layers,
  Cpu, Globe, BookOpen, Zap, Info,
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa6';

// ── Animation helpers ─────────────────────────────────────────────────────────
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: 'easeOut' as const } },
};

// ── Static data ───────────────────────────────────────────────────────────────
const TECH_STACK = [
  { label: 'Python 3.12',      color: 'border-sky-500/30    text-sky-400',    icon: <Code2 size={14} /> },
  { label: 'FastAPI',          color: 'border-green-500/30  text-green-400',  icon: <Zap size={14} /> },
  { label: 'Groq LLaMA 3.3',   color: 'border-orange-500/30 text-orange-400', icon: <Bot size={14} /> },
  { label: 'React 19',         color: 'border-sky-500/30    text-sky-400',    icon: <Globe size={14} /> },
  { label: 'TypeScript',       color: 'border-blue-500/30   text-blue-400',   icon: <Code2 size={14} /> },
  { label: 'Tailwind CSS 4',   color: 'border-teal-500/30   text-teal-400',   icon: <Layers size={14} /> },
  { label: 'Framer Motion',    color: 'border-pink-500/30   text-pink-400',   icon: <Cpu size={14} /> },
  { label: 'Vite',             color: 'border-purple-500/30 text-purple-400', icon: <Zap size={14} /> },
];

const USER_STEPS = [
  { n: '01', title: 'Qeydiyyatdan Keç',     desc: '/register səhifəsinə get, adın, e-poçt, şifrəni daxil et. Rol olaraq "İstifadəçi" seç.' },
  { n: '02', title: 'Məhsullar Səhifəsi',   desc: 'Navbar-dan "Məhsullar" seç. 30+ məhsul siyahısını filtr et (kateqoriya, axtarış, qiymət). İstədiklərini seçimə əlavə et.' },
  { n: '03', title: 'AI Tövsiyə Al',         desc: 'Seçilmiş məhsullar panelindəki "AI Tövsiyə Al" düyməsinə bas. Groq LLaMA 3.3 sənin üçün fərdi tövsiyə hazırlayır.' },
  { n: '04', title: 'İş Elanları Səhifəsi', desc: '"İş Elanları" bölməsinə keç. 22+ vakansiya arasında CV-ni doldur (ad, bacarıqlar, təhsil, layihələr).' },
  { n: '05', title: 'CV Analizi',            desc: 'AI hər vakansiya üçün uyğunluq faizini hesablayır, çatışmayan bacarıqları göstərir, hansı kursu öyrənməli olduğunu deyir.' },
];

const ADMIN_STEPS = [
  { n: '01', title: 'Elan İdarəsi',          desc: 'Navbar → "Elan İdarəsi". Yeni iş elanı yarat (şirkət, maaş, bacarıq tələbləri). Mövcud elanları redaktə et və ya sil.' },
  { n: '02', title: 'Müraciətlərə Bax',      desc: 'Hər elanın altında müraciət edənlərin siyahısı var. Qəbul et (✓) və ya Rədd et (✗) düymələri ilə statusu dəyiş.' },
  { n: '03', title: 'Maliyyə Analizi',       desc: '"Maliyyə Analizi" səhifəsindən "Maliyyə Analizini Başlat" düyməsini sıx. AI məhsul gəlirliliyini, maaş örtüm faizini hesablayır.' },
  { n: '04', title: '«Nə olar əgər» Ssenari', desc: 'İşçi qəbulu, reklam xərci, qiymət/həcm dəyişikliyi ssenarilərini seç, parametrləri daxil et, nəticəyə bax.' },
];

const AI_AGENTS = [
  {
    icon: <Package size={24} className="text-orange-400" />,
    name: 'Satış AI Agenti',
    tag: '/api/sales/recommend',
    desc: 'Müştərinin alış tarixçəsi və maraqları əsasında ən uyğun məhsulları tövsiyə edir. Cross-sell imkanlarını aşkar edir.',
    color: 'border-orange-500/30 bg-orange-500/5',
  },
  {
    icon: <Briefcase size={24} className="text-sky-400" />,
    name: 'HR AI Agenti',
    tag: '/api/hr/analyze',
    desc: 'CV-ni normallaşdırır, hər vakansiya ilə uyğunluq skoru (0–100) hesablayır, çatışan bacarıqları və öyrənmə yollarını bildirir.',
    color: 'border-sky-500/30 bg-sky-500/5',
  },
  {
    icon: <Calculator size={24} className="text-green-400" />,
    name: 'Maliyyə AI Agenti',
    tag: '/api/finance/analyze',
    desc: 'Məhsulların marja, markup, xalis mənfəət göstəricilərini hesablayır. "Nə olar əgər" ssenarilərini simulyasiya edir.',
    color: 'border-green-500/30 bg-green-500/5',
  },
];

const DEMO_CREDS = [
  { role: 'Normal İstifadəçi', email: 'user@test.az',          password: 'user123',  color: 'border-orange-500/30 text-orange-400 bg-orange-500/5' },
  { role: 'Admin',             email: 'admin@supertraders.az', password: 'admin123', color: 'border-purple-500/30 text-purple-400 bg-purple-500/5' },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-20">

      {/* ── Hero ── */}
      <section className="text-center space-y-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-sm font-medium"
        >
          <Info size={13} /> Layihə Haqqında
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold text-white leading-tight"
        >
          <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-amber-400">SuperTraders</span>{' '}nədir?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed"
        >
          SuperTraders — Holberton Azərbaycan tərəfindən hazırlanmış <strong className="text-white">AI-destəkli ticarət platformasıdır</strong>.
          Satış tövsiyəsi, iş bazarı analizi və maliyyə planlaması üçün üç müstəqil AI agenti bir araya gətirir.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="flex gap-3 justify-center flex-wrap"
        >
          <Link to="/register"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-orange-500/20">
            Başla <ArrowRight size={15} />
          </Link>
          <a href="https://github.com/FirudinManiyev/business_ai_buildathon" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 border border-white/15 text-gray-400 hover:text-white hover:border-white/30 px-6 py-2.5 rounded-xl text-sm transition-colors">
            <FaGithub size={15} /> GitHub
          </a>
        </motion.div>
      </section>

      {/* ── AI Agents ── */}
      <section>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">Əsas Modullar</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">3 AI Agenti</h2>
          <p className="text-gray-500 text-sm mt-2 max-w-lg mx-auto">Hər agent müstəqil işləyir, lakin eyni Groq LLaMA 3.3 modeli ilə gücləndirilir.</p>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-5">
          {AI_AGENTS.map(a => (
            <motion.div key={a.name} variants={fadeUp} whileHover={{ y: -4 }}
              className={`border ${a.color} rounded-2xl p-6 space-y-3`}
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">{a.icon}</div>
              <div>
                <h3 className="text-white font-bold text-base">{a.name}</h3>
                <code className="text-xs text-gray-600 font-mono">{a.tag}</code>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{a.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── User Usage Guide ── */}
      <section>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Users size={20} className="text-orange-400" />
          </div>
          <div>
            <span className="text-orange-400 text-xs font-bold uppercase tracking-widest block">İstifadəçi Rəhbəri</span>
            <h2 className="text-2xl font-extrabold text-white">Normal İstifadəçi Üçün</h2>
          </div>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-4">
          {USER_STEPS.map(s => (
            <motion.div key={s.n} variants={fadeUp}
              className="flex gap-5 bg-black/40 border border-orange-500/15 rounded-2xl p-5 hover:border-orange-500/30 transition-colors"
            >
              <span className="shrink-0 text-3xl font-extrabold text-orange-500/20 leading-none w-10 text-right">{s.n}</span>
              <div>
                <h3 className="text-white font-bold text-sm mb-1">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Admin Usage Guide ── */}
      <section>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <ShieldCheck size={20} className="text-purple-400" />
          </div>
          <div>
            <span className="text-purple-400 text-xs font-bold uppercase tracking-widest block">Admin Rəhbəri</span>
            <h2 className="text-2xl font-extrabold text-white">Admin Üçün</h2>
          </div>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-4">
          {ADMIN_STEPS.map(s => (
            <motion.div key={s.n} variants={fadeUp}
              className="flex gap-5 bg-black/40 border border-purple-500/15 rounded-2xl p-5 hover:border-purple-500/30 transition-colors"
            >
              <span className="shrink-0 text-3xl font-extrabold text-purple-500/20 leading-none w-10 text-right">{s.n}</span>
              <div>
                <h3 className="text-white font-bold text-sm mb-1">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Demo Credentials ── */}
      <section>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">Demo</span>
          <h2 className="text-2xl font-extrabold text-white mt-2">Hazır Giriş Məlumatları</h2>
          <p className="text-gray-500 text-sm mt-1">Qeydiyyat olmadan aşağıdakı hesablarla daxil ola bilərsiniz</p>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid sm:grid-cols-2 gap-5"
        >
          {DEMO_CREDS.map(c => (
            <motion.div key={c.role} variants={fadeUp}
              className={`border ${c.color} rounded-2xl p-6 space-y-3`}
            >
              <div className="flex items-center gap-2">
                {c.role === 'Admin' ? <ShieldCheck size={16} className="text-purple-400" /> : <Users size={16} className="text-orange-400" />}
                <span className={`font-bold text-sm ${c.color.split(' ')[1]}`}>{c.role}</span>
              </div>
              <div className="space-y-1.5 font-mono text-sm">
                <div className="flex gap-2">
                  <span className="text-gray-600 w-16 shrink-0">E-poçt:</span>
                  <span className="text-white">{c.email}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-600 w-16 shrink-0">Şifrə:</span>
                  <span className="text-white">{c.password}</span>
                </div>
              </div>
              <Link to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors mt-1">
                Daxil ol <ArrowRight size={12} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Tech Stack ── */}
      <section>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">Stack</span>
          <h2 className="text-2xl font-extrabold text-white mt-2">Texnologiyalar</h2>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3"
        >
          {TECH_STACK.map(t => (
            <motion.span key={t.label} variants={fadeUp} whileHover={{ scale: 1.08, y: -2 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${t.color} text-sm font-medium bg-black/40 cursor-default`}
            >
              {t.icon} {t.label}
            </motion.span>
          ))}
        </motion.div>
      </section>

      {/* ── Architecture ── */}
      <section>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="bg-black/50 border border-orange-500/20 rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">Arxitektura</span>
            <h2 className="text-2xl font-extrabold text-white mt-2">Sistem Sxemi</h2>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
            {/* Frontend */}
            <div className="bg-black/60 border border-sky-500/30 rounded-xl p-4 text-center w-40">
              <Globe size={20} className="text-sky-400 mx-auto mb-2" />
              <div className="text-white font-semibold text-xs">Frontend</div>
              <div className="text-gray-600 text-xs mt-1">React + Vite</div>
            </div>
            <span className="text-orange-500/40 text-xl hidden md:block">→</span>
            {/* API */}
            <div className="bg-black/60 border border-orange-500/30 rounded-xl p-4 text-center w-40">
              <Zap size={20} className="text-orange-400 mx-auto mb-2" />
              <div className="text-white font-semibold text-xs">REST API</div>
              <div className="text-gray-600 text-xs mt-1">FastAPI / Python</div>
            </div>
            <span className="text-orange-500/40 text-xl hidden md:block">→</span>
            {/* AI */}
            <div className="bg-black/60 border border-green-500/30 rounded-xl p-4 text-center w-40">
              <Bot size={20} className="text-green-400 mx-auto mb-2" />
              <div className="text-white font-semibold text-xs">AI Agentlər</div>
              <div className="text-gray-600 text-xs mt-1">Groq LLaMA 3.3</div>
            </div>
            <span className="text-orange-500/40 text-xl hidden md:block">→</span>
            {/* Auth */}
            <div className="bg-black/60 border border-purple-500/30 rounded-xl p-4 text-center w-40">
              <ShieldCheck size={20} className="text-purple-400 mx-auto mb-2" />
              <div className="text-white font-semibold text-xs">RBAC Auth</div>
              <div className="text-gray-600 text-xs mt-1">localStorage</div>
            </div>
          </div>
          <p className="text-center text-gray-600 text-xs mt-6">
            Frontend RBAC: istifadəçi/admin rollları localStorage-da saxlanılır. Backend olmadan mock data ilə tam işləyir.
          </p>
        </motion.div>
      </section>

      {/* ── Features list ── */}
      <section>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">Xüsusiyyətlər</span>
          <h2 className="text-2xl font-extrabold text-white mt-2">Platformanın İmkanları</h2>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid sm:grid-cols-2 gap-3"
        >
          {[
            '30+ məhsul, kateqoriya filteri, axtarış, qiymət sıralama',
            'Seçilmiş məhsulları idarə etmə paneli (tək/hamı sil)',
            'Satın alındıqdan sonra AI tövsiyəsi, auto-scroll',
            '22+ iş elanı — müxtəlif rol, şirkət, maaş aralığı',
            'CV analizi: uyğunluq skoru, çatışmayan bacarıqlar',
            'Maliyyə analizi: marja, markup, xalis mənfəət cədvəli',
            '«Nə olar əgər» ssenari: işçi, reklam, qiymət, həcm',
            'Admin: elan yarat/redaktə/sil, müraciətlərə bax',
            'Rol əsaslı giriş nəzarəti (RBAC)',
            'Azərbaycan dilində tam interfeys',
            'Framer Motion animasiyaları, responsive dizayn',
          ].map((f, i) => (
            <motion.div key={i} variants={fadeUp}
              className="flex items-start gap-3 bg-black/30 border border-orange-500/10 rounded-xl p-4 hover:border-orange-500/25 transition-colors"
            >
              <CheckCircle size={15} className="text-orange-400 shrink-0 mt-0.5" />
              <span className="text-gray-300 text-sm">{f}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>
      {/* ── Author / Links ── */}
      <section className="pb-8">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <TrendingUp size={16} className="text-orange-400" />
            <span>SuperTraders — Holberton Azərbaycan, 2026</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <a href="https://github.com/FirudinManiyev/business_ai_buildathon" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-500 hover:text-white text-sm transition-colors">
              <FaGithub size={16} /> GitHub
            </a>
            <span className="text-gray-700">·</span>
            <a href="https://www.linkedin.com/in/firudin-maniyev-4843242b7" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-500 hover:text-blue-400 text-sm transition-colors">
              <FaLinkedin size={16} /> LinkedIn
            </a>
            <span className="text-gray-700">·</span>
            <a href="mailto:firudinmaniyev@gmail.com"
              className="flex items-center gap-2 text-gray-500 hover:text-orange-400 text-sm transition-colors">
              <BookOpen size={14} /> E-poçt
            </a>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
