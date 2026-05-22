import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Mail, Lock, AlertCircle, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const DEMO_ACCOUNTS = {
    admin: { email: 'admin@biznesbayt.az', password: 'admin123' },
    user: { email: 'user@test.az', password: 'user123' },
  } as const;

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  if (user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    }
  }

  function fillDemoAccount(account: keyof typeof DEMO_ACCOUNTS) {
    setError('');
    setForm(DEMO_ACCOUNTS[account]);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-orange-400 font-extrabold text-2xl mb-2">
            <ShoppingBag size={28} /> BiznesBayt
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-4">Xoş Gəldiniz</h1>
          <p className="text-gray-500 mt-1 text-sm">Hesabınıza daxil olun</p>
        </div>

        {/* Card */}
        <div className="bg-black/50 backdrop-blur-md border border-orange-500/20 rounded-2xl p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-orange-500/20 rounded-xl px-4 py-3 pl-9 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Şifrə</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-orange-500/20 rounded-xl px-4 py-3 pl-9 pr-11 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors mt-1"
            >
              <LogIn size={18} /> Daxil Ol
            </motion.button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-5">
            Hesabınız yoxdur?{' '}
            <Link to="/register" className="text-orange-400 hover:text-orange-300 transition-colors font-medium">
              Qeydiyyat
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 bg-black/30 border border-orange-500/10 rounded-xl p-4">
          <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-2">Demo Hesablar</p>
          <div className="flex flex-col gap-3 text-xs text-gray-500">
            <div className="flex items-center justify-between gap-3">
              <span className="text-orange-400 font-medium">Admin hesabı</span>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin')}
                className="px-3 py-1.5 rounded-lg bg-orange-500/15 text-orange-300 hover:bg-orange-500/25 transition-colors"
              >
                Autofill
              </button>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sky-400 font-medium">User hesabı</span>
              <button
                type="button"
                onClick={() => fillDemoAccount('user')}
                className="px-3 py-1.5 rounded-lg bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 transition-colors"
              >
                Autofill
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
