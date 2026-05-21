import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Briefcase, TrendingUp, ArrowRight, Bot, Cpu, CheckCircle, Users, BarChart2, Zap, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: <Sparkles size={30} className="text-orange-400" />,
    title: 'AI Tövsiyələri',
    desc: 'Müştərilərin alışlarına və maraqlarına uyğun ən yaxşı məhsulları tövsiyə edirik.',
    to: '/recommendations',
    btn: 'Tövsiyə Al',
    color: 'from-orange-500/20 to-transparent',
  },
  {
    icon: <Briefcase size={30} className="text-sky-400" />,
    title: 'İş Elanları',
    desc: 'Açıq vakansiyaları kəşf et, müraciətin zəif tərəflərini AI ilə gücləndir.',
    to: '/jobs',
    btn: 'Elanları Gör',
    color: 'from-sky-500/20 to-transparent',
  },
  {
    icon: <TrendingUp size={30} className="text-green-400" />,
    title: 'Maliyyə Analizi',
    desc: 'Gəlir–xərc hesabla, AI sənə nə etmək lazım olduğunu deysin.',
    to: '/finance',
    btn: 'Hesabla',
    color: 'from-green-500/20 to-transparent',
  },
];

const stats = [
  { icon: <Bot size={22} className="text-orange-400" />, value: '3', label: 'AI Agent', sub: 'Satış · HR · Maliyyə' },
  { icon: <Zap size={22} className="text-yellow-400" />, value: 'Real-time', label: 'Analiz', sub: 'Anlıq nəticə' },
  { icon: <BarChart2 size={22} className="text-green-400" />, value: '100%', label: 'Dəqiqlik', sub: 'Groq LLaMA 3.3' },
  { icon: <ShieldCheck size={22} className="text-sky-400" />, value: 'Açıq', label: 'Platforma', sub: 'Pulsuz istifadə' },
];

const steps = [
  {
    icon: <Users size={28} className="text-orange-400" />,
    step: '01',
    title: 'Profil Daxil Et',
    desc: 'Müştəri profili, CV məlumatları və ya maliyyə datasını daxil edin.',
  },
  {
    icon: <Cpu size={28} className="text-orange-400" />,
    step: '02',
    title: 'AI Analiz Edir',
    desc: 'Groq LLaMA 3.3 modeli real vaxtda məlumatları dərin analiz edir.',
  },
  {
    icon: <CheckCircle size={28} className="text-orange-400" />,
    step: '03',
    title: 'Nəticəni Al',
    desc: 'Fərdi tövsiyələr, uyğunluq skorları və maliyyə hesabatı əldə edin.',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 gap-7">
        <motion.span
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="px-4 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm font-medium"
        >
          ✦ AI ilə Gücləndirilmiş Biznes Platformu
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight"
        >
          Biznesinizi{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-orange-600">
            Böyüdün
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-400 text-lg max-w-xl"
        >
          Tövsiyələr, iş elanları və maliyyə analizi — hamısı bir yerdə. Süni intellekt hər addımda yanınızda.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex gap-3 flex-wrap justify-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/recommendations"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-7 py-3 rounded-xl transition-colors shadow-lg shadow-orange-500/25"
            >
              Başla <ArrowRight size={18} />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/finance"
              className="flex items-center gap-2 border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 font-semibold px-7 py-3 rounded-xl transition-colors"
            >
              Maliyyəni Hesabla
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="max-w-6xl mx-auto px-4 pb-16 w-full">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map(({ icon, value, label, sub }) => (
            <motion.div
              key={label}
              variants={item}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-black/50 backdrop-blur-md border border-orange-500/15 rounded-2xl p-5 flex flex-col gap-2 hover:border-orange-500/35 transition-colors cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-1">
                {icon}
              </div>
              <span className="text-white text-2xl font-extrabold">{value}</span>
              <span className="text-white text-sm font-semibold">{label}</span>
              <span className="text-gray-500 text-xs">{sub}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Feature cards ── */}
      <section className="max-w-6xl mx-auto px-4 pb-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Nə edə bilərsiniz?</h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm">Üç güclü AI modulu ilə satış, iş bazarı və maliyyəni idarə edin.</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="grid md:grid-cols-3 gap-6"
        >
          {features.map(({ icon, title, desc, to, btn, color }) => (
            <motion.div
              key={title}
              variants={item}
              whileHover={{ y: -6, scale: 1.015 }}
              className="group relative bg-black/50 backdrop-blur-md border border-orange-500/20 rounded-2xl p-6 flex flex-col gap-4 hover:border-orange-500/50 transition-colors overflow-hidden cursor-default"
            >
              <div className={`absolute inset-0 bg-linear-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative">
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.12 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="w-14 h-14 rounded-xl bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors flex items-center justify-center"
                >
                  {icon}
                </motion.div>
              </div>
              <h3 className="relative text-white text-xl font-bold">{title}</h3>
              <p className="relative text-gray-400 text-sm flex-1">{desc}</p>
              <motion.div whileHover={{ x: 4 }} className="relative">
                <Link
                  to={to}
                  className="flex items-center gap-2 text-orange-400 hover:text-orange-300 font-medium text-sm transition-colors"
                >
                  {btn} <ArrowRight size={16} />
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-6xl mx-auto px-4 pb-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Necə işləyir?</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">3 Addımda Nəticə</h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="grid md:grid-cols-3 gap-6 relative"
        >
          {/* Connector line — desktop only */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px bg-orange-500/20 z-0" />

          {steps.map(({ icon, step, title, desc }) => (
            <motion.div
              key={step}
              variants={item}
              whileHover={{ y: -4 }}
              className="relative bg-black/50 backdrop-blur-md border border-orange-500/15 rounded-2xl p-6 flex flex-col gap-4 hover:border-orange-500/40 transition-colors z-10"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  {icon}
                </div>
                <span className="text-4xl font-extrabold text-orange-500/15 select-none">{step}</span>
              </div>
              <h3 className="text-white font-bold text-lg">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
