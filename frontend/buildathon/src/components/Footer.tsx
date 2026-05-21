import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Mail, Sparkles, Briefcase, TrendingUp, House } from 'lucide-react'; // House = ana səhifə ikonu
import { FaGithub, FaXTwitter } from 'react-icons/fa6';

const navLinks = [
  { to: '/', label: 'Ana Səhifə', icon: <House size={13} /> },
  { to: '/recommendations', label: 'AI Tövsiyələr', icon: <Sparkles size={13} /> },
  { to: '/jobs', label: 'İş Elanları', icon: <Briefcase size={13} /> },
  { to: '/finance', label: 'Maliyyə', icon: <TrendingUp size={13} /> },
];

const socials = [
  { icon: <FaGithub size={15} />, href: '#', label: 'GitHub' },
  { icon: <FaXTwitter size={15} />, href: '#', label: 'Twitter' },
  { icon: <Mail size={15} />, href: 'mailto:info@biznesbayt.az', label: 'Email' },
];

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-orange-500/15 bg-black/50 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="inline-flex items-center gap-2 text-orange-400 font-extrabold text-xl w-fit"
            >
              <ShoppingBag size={22} />
              BiznesBayt
            </motion.div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Süni intellekt ilə gücləndirilmiş biznes platformu. Tövsiyələr, iş analizi və maliyyə hesabatı — hamısı bir yerdə.
            </p>
            <div className="flex gap-2 mt-1">
              {socials.map(({ icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 hover:bg-orange-500/25 hover:border-orange-500/40 transition-colors"
                >
                  {icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-5 opacity-60">Keçidlər</h4>
            <ul className="flex flex-col gap-2.5">
              {navLinks.map(({ to, label, icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="group flex items-center gap-2 text-gray-500 hover:text-orange-400 text-sm transition-colors duration-200"
                  >
                    <span className="text-orange-500/40 group-hover:text-orange-400 transition-colors">{icon}</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Features */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-5 opacity-60">AI Xüsusiyyətlər</h4>
            <ul className="flex flex-col gap-2.5 text-sm text-gray-500">
              {[
                'Satış Agent – məhsul tövsiyəsi',
                'HR Agent – CV uyğunluq analizi',
                'Maliyyə Agent – mənfəət hesabatı',
                'Orchestrator – çoxlu agent idarəsi',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-orange-500/50 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-orange-500/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            © 2025 BiznesBayt. Bütün hüquqlar qorunur.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Groq LLaMA 3.3 ilə işləyir
          </div>
        </div>
      </div>
    </footer>
  );
}
