import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`w-full min-h-[calc(100vh-4rem)] ${className}`}
    >
      {children}
    </motion.div>
  );
};
