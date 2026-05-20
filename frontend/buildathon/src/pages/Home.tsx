import { Link } from 'react-router-dom';
import { Sparkles, Briefcase, TrendingUp, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: <Sparkles size={32} className="text-orange-400" />,
    title: 'AI Tövsiyələri',
    desc: 'Müştərilərin alışlarına və maraqlarına uyğun ən yaxşı məhsulları tövsiyə edirik.',
    to: '/recommendations',
    btn: 'Tövsiyə Al',
  },
  {
    icon: <Briefcase size={32} className="text-orange-400" />,
    title: 'İş Elanları',
    desc: 'Açıq vakansiyaları kəşf et, müraciətin zəif tərəflərini AI ilə gücləndir.',
    to: '/jobs',
    btn: 'Elanları Gör',
  },
  {
    icon: <TrendingUp size={32} className="text-orange-400" />,
    title: 'Maliyyə Analizi',
    desc: 'Gəlir–xərc hesabla, AI sənə nə etmək lazım olduğunu deysin.',
    to: '/finance',
    btn: 'Hesabla',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 gap-6">
        <span className="px-4 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm font-medium">
          AI ilə Gücləndirilmiş Biznes Platformu
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
          Biznesinizi{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-orange-600">
            Böyüdün
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl">
          Tövsiyələr, iş elanları və maliyyə analizi — hamısı bir yerdə. Süni intellekt hər addımda yanınızda.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            to="/recommendations"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Başla <ArrowRight size={18} />
          </Link>
          <Link
            to="/finance"
            className="flex items-center gap-2 border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Maliyyəni Hesabla
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-6xl mx-auto px-4 pb-24 w-full grid md:grid-cols-3 gap-6">
        {features.map(({ icon, title, desc, to, btn }) => (
          <div
            key={title}
            className="bg-black/50 backdrop-blur-md border border-orange-500/20 rounded-2xl p-6 flex flex-col gap-4 hover:border-orange-500/50 transition-colors"
          >
            <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center">
              {icon}
            </div>
            <h3 className="text-white text-xl font-bold">{title}</h3>
            <p className="text-gray-400 text-sm flex-1">{desc}</p>
            <Link
              to={to}
              className="flex items-center gap-2 text-orange-400 hover:text-orange-300 font-medium text-sm transition-colors"
            >
              {btn} <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}
