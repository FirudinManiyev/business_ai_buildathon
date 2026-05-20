import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
        <Link to="/" className="flex items-center gap-2 text-orange-400 font-bold text-xl">
          <ShoppingBag size={24} />
          BiznesBayt
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === to
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-300 hover:text-orange-400 hover:bg-orange-500/10'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-orange-400" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-black/80 border-t border-orange-500/20 px-4 py-2 flex flex-col gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === to ? 'bg-orange-500 text-white' : 'text-gray-300 hover:text-orange-400'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
