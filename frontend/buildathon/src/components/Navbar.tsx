import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X } from 'lucide-react';

const links = [
  { to: '/', label: 'Ana Səhifə' },
  { to: '/recommendations', label: 'Tövsiyələr' },
  { to: '/jobs', label: 'İş Elanları' },
  { to: '/finance', label: 'Maliyyə' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-orange-500/20">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Link to="/" className="flex items-center gap-2 text-orange-400 font-bold text-xl">
            <ShoppingBag size={24} />
            BiznesBayt
          </Link>
        </motion.div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to} className="relative px-4 py-2 rounded-lg text-sm font-medium transition-colors group">
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-orange-500 rounded-lg"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className={`relative z-10 transition-colors duration-200 ${active ? 'text-white' : 'text-gray-300 group-hover:text-orange-400'}`}>
                  {label}
                </span>
                {!active && (
                  <span className="absolute inset-0 rounded-lg bg-orange-500/0 group-hover:bg-orange-500/10 transition-colors duration-200" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
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
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-black/80 border-t border-orange-500/20"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {links.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    pathname === to
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:text-orange-400 hover:bg-orange-500/10'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
