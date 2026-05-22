import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Mail, Lock, User, AlertCircle, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth, type Role } from '../contexts/AuthContext';

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  if (user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      // Always register as regular user
      await register(form.name, form.email, form.password, 'user');
      navigate('/dashboard', { replace: true });
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-orange-400 font-extrabold text-2xl mb-2">
            <ShoppingBag size={28} /> BiznesBayt
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-4">Qeydiyyat</h1>
          <p className="text-gray-500 mt-1 text-sm">Yeni hesab yaradın</p>
        </div>

        <div className="bg-black/50 backdrop-blur-md border border-orange-500/20 rounded-2xl p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Role selection */}
              {/* Registration creates regular users only */}

            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Ad Soyad</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Adınız Soyadınız"
                  className="w-full bg-white/5 border border-orange-500/20 rounded-xl px-4 py-3 pl-9 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 transition-colors text-sm"
                />
              </div>
            </div>

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
                  minLength={6}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 6 simvol"
                  className="w-full bg-white/5 border border-orange-500/20 rounded-xl px-4 py-3 pl-9 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 transition-colors text-sm"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors mt-1"
            >
              Qeydiyyatdan Keç
            </motion.button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-5">
            Artıq hesabınız var?{' '}
            <Link to="/login" className="text-orange-400 hover:text-orange-300 transition-colors font-medium">
              Daxil Ol
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
