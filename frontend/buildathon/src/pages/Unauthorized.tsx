import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldOff } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 gap-5">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center"
      >
        <ShieldOff size={36} className="text-red-400" />
      </motion.div>
      <h1 className="text-3xl font-extrabold text-white">İcazə Yoxdur</h1>
      <p className="text-gray-500 max-w-sm">Bu səhifəyə daxil olmaq üçün lazımi səlahiyyətiniz yoxdur.</p>
      <Link to="/" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
        Ana Səhifəyə Qayıt
      </Link>
    </div>
  );
}
