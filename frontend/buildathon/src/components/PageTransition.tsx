import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const variants = {
  initial: { opacity: 0, y: 28, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.38, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    y: -18,
    filter: 'blur(2px)',
    transition: { duration: 0.22, ease: 'easeIn' as const },
  },
};

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}
