import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Menu, X, LogOut, Package, Briefcase, User, ShieldCheck } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa6';
import { useAuth } from '../contexts/AuthContext';

const SOCIALS = [
  { icon: <FaGithub size={14} />, href: 'https://github.com/FirudinManiyev/business_ai_buildathon', label: 'GitHub' },
  { icon: <FaLinkedin size={14} />, href: 'https://www.linkedin.com/in/firudin-maniyev-4843242b7', label: 'LinkedIn' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const guestLinks = [{ to: '/', label: 'Ana Səhifə' }];
  const userLinks  = [
    { to: '/products', label: 'Məhsullar', icon: <Package size={14} /> },
    { to: '/jobs',     label: 'İş Elanları', icon: <Briefcase size={14} /> },
  ];
  const adminLinks = [
    { to: '/admin/jobs', label: 'Elan İdarəsi', icon: <Briefcase size={14} /> },
    { to: '/finance',    label: 'Maliyyə',      icon: <TrendingUp size={14} /> },
  ];
  const links = user ? (user.role === 'admin' ? adminLinks : userLinks) : guestLinks;

  function handleLogout() { logout(); navigate('/'); setOpen(false); }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-xl border-b border-orange-500/20 shadow-[0_1px_30px_rgba(249,115,22,0.06)]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Brand */}
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
              <TrendingUp size={16} className="text-orange-400" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">
              <span className="text-white">Super</span><span className="text-orange-400">Traders</span>
            </span>
          </Link>
        </motion.div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {links.map(({ to, label }) => {
            const active = pathname === to || (to !== '/' && pathname.startsWith(to));
            return (
              <Link key={to} to={to} className="relative px-4 py-2 rounded-lg text-sm font-medium group">
                {active && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 bg-orange-500 rounded-lg"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
                )}
                <span className={`relative z-10 transition-colors duration-200 ${active ? 'text-white' : 'text-gray-400 group-hover:text-orange-300'}`}>
                  {label}
                </span>
                {!active && <span className="absolute inset-0 rounded-lg bg-orange-500/0 group-hover:bg-orange-500/10 transition-colors duration-200" />}
              </Link>
            );
          })}
        </div>

        {/* Right side: social icons + auth */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Social icons */}
          <div className="flex items-center gap-1 mr-1 border-r border-orange-500/15 pr-3">
            {SOCIALS.map(({ icon, href, label }) => (
              <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.15, y: -1 }} whileTap={{ scale: 0.9 }}
                aria-label={label}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
              >
                {icon}
              </motion.a>
            ))}
          </div>

          {user ? (
            <>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                user.role === 'admin'
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                  : 'bg-orange-500/10 border-orange-500/25 text-orange-300'
              }`}>
                {user.role === 'admin' ? <ShieldCheck size={12} /> : <User size={12} />}
                {user.name}
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout}
                className="flex items-center gap-1.5 text-gray-500 hover:text-red-400 text-xs px-3 py-1.5 rounded-xl hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
              >
                <LogOut size={13} /> Çıxış
              </motion.button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-400 hover:text-orange-300 text-sm px-3 py-1.5 rounded-lg transition-colors">
                Daxil Ol
              </Link>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link to="/register"
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-md shadow-orange-500/20">
                  Qeydiyyat
                </Link>
              </motion.div>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <motion.button whileTap={{ scale: 0.9 }}
          className="md:hidden text-orange-400 p-1.5 rounded-lg hover:bg-orange-500/10 transition-colors"
          onClick={() => setOpen(!open)}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open
              ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={22} /></motion.span>
              : <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu size={22} /></motion.span>
            }
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-black/90 border-t border-orange-500/15"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {links.map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    pathname === to ? 'bg-orange-500 text-white' : 'text-gray-300 hover:text-orange-400 hover:bg-orange-500/10'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div className="border-t border-orange-500/10 mt-2 pt-2 flex flex-col gap-1">
                {user ? (
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                    Çıxış — {user.name}
                  </button>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-orange-400 hover:bg-orange-500/10 rounded-xl transition-colors">Daxil Ol</Link>
                    <Link to="/register" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors text-center">Qeydiyyat</Link>
                  </>
                )}
                <div className="flex items-center gap-2 px-4 pt-1">
                  {SOCIALS.map(({ icon, href, label }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                      className="text-gray-500 hover:text-orange-400 transition-colors" aria-label={label}>
                      {icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
