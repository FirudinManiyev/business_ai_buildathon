import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Mail, Lock, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  if (user) { navigate('/dashboard', { replace: true }); return null; }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    }
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
                  type="password"
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-orange-500/20 rounded-xl px-4 py-3 pl-9 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 transition-colors text-sm"
                />
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
          <div className="flex flex-col gap-1.5 text-xs text-gray-500">
            <div className="flex justify-between">
              <span className="text-orange-400 font-medium">Admin:</span>
              <span>admin@biznesbayt.az / admin123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sky-400 font-medium">User:</span>
              <span>user@test.az / user123</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
